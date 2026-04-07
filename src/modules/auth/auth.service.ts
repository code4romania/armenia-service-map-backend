import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { JwtPayload } from '../../common/interfaces/authenticated-request.interface.js';
import { Role } from '../../common/enums/role.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
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

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
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

  async setupPassword(token: string, password: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      });
    } catch {
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
    const hashedToken = await bcrypt.hash(refreshToken, 10);
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
