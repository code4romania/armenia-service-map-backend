import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';
import { ServiceStatus } from '../../common/enums/service-status.enum.js';

const serviceInclude = {
  organisation: { select: { id: true, name: true } },
  region: { select: { id: true, name: true } },
  topics: { include: { topic: { select: { id: true, name: true, slug: true } } } },
  targetGroups: { include: { targetGroup: { select: { id: true, name: true, status: true } } } },
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
    topicIds?: string[];
    isAvailable?: boolean;
    status?: ServiceStatus;
    availableOn?: Date;
  }) {
    const { page = 1, perPage = 10, sortBy = 'title', sortOrder = 'asc', search, organisationId, regionId, topicId, topicIds, isAvailable, status, availableOn } = query;
    // Union of any explicit topic ids plus the legacy single topicId — a service matches if tagged with ANY of them.
    const allTopicIds = [...(topicIds ?? []), ...(topicId ? [topicId] : [])];
    // Clauses that each need their own OR go under AND so they don't collide with the
    // free-text search OR below.
    const andClauses: Prisma.ServiceWhereInput[] = [];
    if (regionId) {
      // A service with no region is available nationwide, so it matches every region filter.
      andClauses.push({ OR: [{ regionId }, { regionId: null }] });
    }
    if (availableOn) {
      andClauses.push(
        { OR: [{ availabilityStart: null }, { availabilityStart: { lte: availableOn } }] },
        { OR: [{ availabilityEnd: null }, { availabilityEnd: { gte: availableOn } }] },
      );
    }
    const where = {
      deletedAt: null,
      ...(organisationId ? { organisationId } : {}),
      ...(isAvailable !== undefined ? { isAvailable } : {}),
      // availableOn forces isAvailable: true; callers pass one or the other, never both.
      ...(availableOn ? { isAvailable: true } : {}),
      ...(andClauses.length ? { AND: andClauses } : {}),
      ...(status ? { status } : {}),
      ...(allTopicIds.length ? { topics: { some: { topicId: { in: allTopicIds } } } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { titleHy: { contains: search, mode: 'insensitive' as const } },
              { shortDescription: { contains: search, mode: 'insensitive' as const } },
              { shortDescriptionHy: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
              { descriptionHy: { contains: search, mode: 'insensitive' as const } },
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
    title?: string;
    titleHy: string;
    shortDescription?: string;
    shortDescriptionHy: string;
    description?: string;
    descriptionHy: string;
    howToAccess?: string;
    howToAccessHy: string;
    organisationId?: string;
    externalOrganisationName?: string;
    regionId?: string | null;
    isAvailable?: boolean;
    status?: ServiceStatus;
    availabilityStart?: Date;
    availabilityEnd?: Date;
    targetGroupIds?: string[];
    topicIds?: string[];
  }) {
    this.assertOrganisationXor(data.organisationId, data.externalOrganisationName, true);
    const { topicIds, targetGroupIds, externalOrganisationName, ...rest } = data;
    const serviceData = {
      ...rest,
      organisationId: externalOrganisationName ? null : data.organisationId,
      externalOrganisationName: externalOrganisationName ?? null,
    };
    return this.prisma.service.create({
      data: {
        ...serviceData,
        ...(topicIds?.length
          ? { topics: { create: topicIds.map((topicId) => ({ topicId })) } }
          : {}),
        ...(targetGroupIds?.length
          ? { targetGroups: { create: targetGroupIds.map((targetGroupId) => ({ targetGroupId })) } }
          : {}),
      },
      include: serviceInclude,
    });
  }

  async update(id: string, data: {
    title?: string;
    titleHy?: string;
    shortDescription?: string;
    shortDescriptionHy?: string;
    description?: string;
    descriptionHy?: string;
    howToAccess?: string;
    howToAccessHy?: string;
    organisationId?: string | null;
    externalOrganisationName?: string | null;
    regionId?: string | null;
    isAvailable?: boolean;
    status?: ServiceStatus;
    availabilityStart?: Date | null;
    availabilityEnd?: Date | null;
    targetGroupIds?: string[];
    topicIds?: string[];
  }) {
    await this.findOne(id);
    this.assertOrganisationXor(data.organisationId, data.externalOrganisationName, false);
    const { topicIds, targetGroupIds, organisationId, externalOrganisationName, ...rest } = data;

    if (topicIds !== undefined) {
      await this.prisma.serviceTopic.deleteMany({ where: { serviceId: id } });
    }
    if (targetGroupIds !== undefined) {
      await this.prisma.serviceTargetGroup.deleteMany({ where: { serviceId: id } });
    }

    const orgFields =
      externalOrganisationName && externalOrganisationName.trim()
        ? { externalOrganisationName, organisationId: null }
        : organisationId
          ? { organisationId, externalOrganisationName: null }
          : {};

    return this.prisma.service.update({
      where: { id },
      data: {
        ...rest,
        ...orgFields,
        ...(topicIds !== undefined
          ? { topics: { create: topicIds.map((topicId) => ({ topicId })) } }
          : {}),
        ...(targetGroupIds !== undefined
          ? { targetGroups: { create: targetGroupIds.map((targetGroupId) => ({ targetGroupId })) } }
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

  private assertOrganisationXor(
    organisationId: string | undefined | null,
    externalOrganisationName: string | undefined | null,
    requireOne: boolean,
  ) {
    const hasOrg = Boolean(organisationId);
    const hasExternal = Boolean(externalOrganisationName && externalOrganisationName.trim());
    if (hasOrg && hasExternal) {
      throw this.exceptions.badRequest(
        'Provide either an organisation or an external organisation name, not both',
      );
    }
    if (requireOne && !hasOrg && !hasExternal) {
      throw this.exceptions.badRequest(
        'A service must have an organisation or an external organisation name',
      );
    }
  }

  async verifyOwnership(serviceId: string, organisationId: string) {
    const service = await this.findOne(serviceId);
    if (service.organisationId !== organisationId) {
      throw this.exceptions.forbidden('Service', 'You can only manage your own organisation\'s services');
    }
    return service;
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.service.update({
      where: { id },
      data: { status: ServiceStatus.PUBLISHED },
      include: serviceInclude,
    });
  }

  async unpublish(id: string) {
    await this.findOne(id);
    return this.prisma.service.update({
      where: { id },
      data: { status: ServiceStatus.DRAFT },
      include: serviceInclude,
    });
  }
}
