import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';

@Injectable()
export class OrganisationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
  ) {}

  async findMany(query: PaginationQuery & { search?: string }) {
    const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc', search } = query;
    const where = {
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.organisation.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          region: true,
          _count: { select: { users: true, services: true } },
        },
      }),
      this.prisma.organisation.count({ where }),
    ]);

    return paginatedResult(data, total, page, perPage);
  }

  async findOne(id: string) {
    const org = await this.prisma.organisation.findUnique({
      where: { id, deletedAt: null },
      include: {
        region: true,
        users: {
          where: { deletedAt: null },
          select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
        },
        _count: { select: { services: true } },
      },
    });
    if (!org) throw this.exceptions.notFound('Organisation', id);
    return org;
  }

  async create(data: {
    name: string;
    description?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    regionId?: string;
  }) {
    return this.prisma.organisation.create({
      data,
      include: { region: true },
    });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    regionId?: string;
    isActive?: boolean;
  }) {
    await this.findOne(id);
    return this.prisma.organisation.update({
      where: { id },
      data,
      include: { region: true },
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.organisation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
