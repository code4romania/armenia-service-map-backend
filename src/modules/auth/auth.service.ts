import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { JwtPayload } from '../../common/interfaces/authenticated-request.interface.js';
import { Role } from '../../common/enums/role.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import { EmailService } from '../../infrastructure/email/email.service.js';
import { buildSetupPasswordUrl, SETUP_PASSWORD_TOKEN_TYPE } from './helpers/setup-password-link.js';

/**
 * bcrypt only looks at the first 72 bytes of its input. Refresh JWTs for one user share a
 * far longer common prefix (header + sub claim), so hashing them directly lets any token
 * issued to that user pass the comparison. Digest first so the whole token is covered.
 */
function digestRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

const RESET_PASSWORD_TOKEN_TTL = '2h' as const;

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    this.assertUserIsActive(user.status as UserStatus);

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      organisationId: user.organisationId ?? undefined,
    });

    await Promise.all([
      this.updateRefreshToken(user.id, tokens.refreshToken),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastAccessAt: new Date() },
      }),
    ]);

    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }
    this.assertUserIsActive(user.status as UserStatus);

    const refreshTokenMatches = await bcrypt.compare(digestRefreshToken(refreshToken), user.refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      organisationId: user.organisationId ?? undefined,
    });

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: { organisation: { select: { id: true, name: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, refreshToken, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    await this.prisma.user.update({
      where: { id: userId },
      data: input,
    });
    return this.getProfile(userId);
  }

  /**
   * Self-service password reset. Always resolves, even for unknown emails, so the
   * endpoint cannot be used to enumerate accounts. Unlike the admin-triggered reset
   * this does not revoke the user's session: an anonymous caller must not be able to
   * log someone out just by knowing their email.
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
    if (!user) return;

    const resetUrl = await buildSetupPasswordUrl({
      userId: user.id,
      expiresIn: RESET_PASSWORD_TOKEN_TTL,
      jwt: this.jwt,
      config: this.config,
    });
    await this.emailService.sendResetPassword({
      to: user.email,
      recipientName: `${user.firstName} ${user.lastName}`.trim(),
      resetUrl,
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Fresh pair for this session; hashing the new refresh token invalidates every other device.
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      organisationId: user.organisationId ?? undefined,
    });
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async setupPassword(token: string, password: string) {
    let payload: JwtPayload & { type?: string };
    try {
      payload = await this.jwt.verifyAsync<JwtPayload & { type?: string }>(token, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new BadRequestException('Invalid or expired setup token');
    }
    if (payload.type !== SETUP_PASSWORD_TOKEN_TYPE) {
      throw new BadRequestException('Invalid or expired setup token');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: {
        passwordHash,
        status: UserStatus.ACTIVE,
        refreshToken: null,
      },
    });
  }

  private async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRATION', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(digestRefreshToken(refreshToken), 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  private assertUserIsActive(status: UserStatus) {
    if (status === UserStatus.PENDING) {
      throw new UnauthorizedException('Your account is pending activation');
    }
    if (status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account is suspended');
    }
  }
}
