import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';
import { Role } from '../../common/enums/role.enum.js';

// Fields to never return to API
const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
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
  ) {}

  async findMany(query: PaginationQuery & { search?: string; organisationId?: string }) {
    const { page = 1, perPage = 10, sortBy = 'firstName', sortOrder = 'asc', search, organisationId } = query;
    const where = {
      deletedAt: null,
      ...(organisationId ? { organisationId } : {}),
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
    role: Role;
    organisationId?: string;
    password?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw this.exceptions.conflict('User', `Email "${data.email}" already exists`);

    // Generate a random password if not provided (user will reset via email)
    const password = data.password || Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(password, 10);

    const { password: _, ...createData } = data;

    return this.prisma.user.create({
      data: { ...createData, passwordHash },
      select: userSelect,
    });
  }

  async update(id: string, data: {
    firstName?: string;
    lastName?: string;
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
    await this.findOne(id);
    const newPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash, refreshToken: null },
    });
    // TODO: Send email with new password in Phase 5
    return { temporaryPassword: newPassword };
  }
}
