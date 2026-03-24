import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';

const serviceInclude = {
  organisation: { select: { id: true, name: true } },
  region: { select: { id: true, name: true } },
  topics: { include: { topic: { select: { id: true, name: true, slug: true } } } },
} as const;

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
  ) {}

  async findMany(query: PaginationQuery & {
    search?: string;
    organisationId?: string;
    regionId?: string;
    topicId?: string;
    isAvailable?: boolean;
  }) {
    const { page = 1, perPage = 10, sortBy = 'title', sortOrder = 'asc', search, organisationId, regionId, topicId, isAvailable } = query;
    const where = {
      deletedAt: null,
      ...(organisationId ? { organisationId } : {}),
      ...(regionId ? { regionId } : {}),
      ...(isAvailable !== undefined ? { isAvailable } : {}),
      ...(topicId ? { topics: { some: { topicId } } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { shortDescription: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
        include: serviceInclude,
      }),
      this.prisma.service.count({ where }),
    ]);

    return paginatedResult(data, total, page, perPage);
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id, deletedAt: null },
      include: serviceInclude,
    });
    if (!service) throw this.exceptions.notFound('Service', id);
    return service;
  }

  async create(data: {
    title: string;
    shortDescription: string;
    description: string;
    organisationId: string;
    regionId?: string;
    isAvailable?: boolean;
    availabilityStart?: Date;
    availabilityEnd?: Date;
    targetGroup?: string[];
    topicIds?: string[];
  }) {
    const { topicIds, ...serviceData } = data;
    return this.prisma.service.create({
      data: {
        ...serviceData,
        ...(topicIds?.length
          ? { topics: { create: topicIds.map((topicId) => ({ topicId })) } }
          : {}),
      },
      include: serviceInclude,
    });
  }

  async update(id: string, data: {
    title?: string;
    shortDescription?: string;
    description?: string;
    regionId?: string;
    isAvailable?: boolean;
    availabilityStart?: Date | null;
    availabilityEnd?: Date | null;
    targetGroup?: string[];
    topicIds?: string[];
  }) {
    await this.findOne(id);
    const { topicIds, ...serviceData } = data;

    if (topicIds !== undefined) {
      await this.prisma.serviceTopic.deleteMany({ where: { serviceId: id } });
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        ...serviceData,
        ...(topicIds !== undefined
          ? { topics: { create: topicIds.map((topicId) => ({ topicId })) } }
          : {}),
      },
      include: serviceInclude,
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async verifyOwnership(serviceId: string, organisationId: string) {
    const service = await this.findOne(serviceId);
    if (service.organisationId !== organisationId) {
      throw this.exceptions.forbidden('Service', 'You can only manage your own organisation\'s services');
    }
    return service;
  }
}
