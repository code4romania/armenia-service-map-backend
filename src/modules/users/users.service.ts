import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';
import { Role } from '../../common/enums/role.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import { EmailService } from '../../infrastructure/email/email.service.js';
import { sendInvitationEmail } from '../../usecases/organisations/helpers/join-network-invitation.js';

// Fields to never return to API
const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  status: true,
  lastAccessAt: true,
  role: true,
  organisationId: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
  organisation: { select: { id: true, name: true } },
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
    private readonly emailService: EmailService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async findMany(
    query: PaginationQuery & {
      search?: string;
      organisationId?: string;
      status?: UserStatus;
      role?: Role;
    },
  ) {
    const {
      page = 1,
      perPage = 10,
      sortBy = 'firstName',
      sortOrder = 'asc',
      search,
      organisationId,
      status,
      role,
    } = query;
    const where = {
      deletedAt: null,
      ...(organisationId ? { organisationId } : {}),
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
        select: userSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginatedResult(data, total, page, perPage);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: userSelect,
    });
    if (!user) throw this.exceptions.notFound('User', id);
    return user;
  }

  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    status?: UserStatus;
    role: Role;
    organisationId?: string;
    password?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw this.exceptions.conflict('User', `Email "${data.email}" already exists`);

    // Without an explicit password the account starts PENDING with a throwaway hash;
    // the invitation email lets the user set their own password, which activates them.
    const invited = !data.password;
    const password = data.password || Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(password, 10);

    const { password: _, ...createData } = data;

    const user = await this.prisma.user.create({
      data: {
        ...createData,
        ...(invited ? { status: UserStatus.PENDING } : {}),
        passwordHash,
      },
      select: userSelect,
    });

    if (invited) {
      await sendInvitationEmail({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organisationName: user.organisation?.name,
        jwt: this.jwt,
        config: this.config,
        emailService: this.emailService,
      });
    }

    return user;
  }

  async update(id: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: UserStatus;
    role?: Role;
    organisationId?: string;
  }) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async resetPassword(id: string) {
    const user = await this.findOne(id);
    const token = await this.jwt.signAsync(
      { sub: id, type: 'setup-password' },
      {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: '2h',
      },
    );
    const resetUrl = `${this.config.get('CORS_ORIGIN', 'http://localhost:3001')}/setup-password?token=${token}`;

    await this.prisma.user.update({
      where: { id },
      data: { refreshToken: null },
    });

    await this.emailService.sendResetPassword({
      to: user.email,
      recipientName: `${user.firstName} ${user.lastName}`,
      resetUrl,
    });

    return { message: 'Password reset email sent' };
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.SUSPENDED,
        refreshToken: null,
      },
      select: userSelect,
    });
  }

  async activate(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.ACTIVE,
      },
      select: userSelect,
    });
  }
}
