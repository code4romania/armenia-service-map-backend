import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum.js';
import { flattenRegions, includeOrganisationRegions, uniqueRegionIds } from './organisation-regions.js';

@Injectable()
export class OrganisationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
  ) {}

  async findMany(query: PaginationQuery & { search?: string; status?: OrganisationStatus }) {
    const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc', search, status } = query;
    const where = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.organisation.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          ...includeOrganisationRegions,
          _count: { select: { users: true, services: true } },
        },
      }),
      this.prisma.organisation.count({ where }),
    ]);

    return paginatedResult(data.map(flattenRegions), total, page, perPage);
  }

  async findOne(id: string) {
    const org = await this.prisma.organisation.findUnique({
      where: { id, deletedAt: null },
      include: {
        ...includeOrganisationRegions,
        users: {
          where: { deletedAt: null },
          select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
        },
        _count: { select: { services: true } },
      },
    });
    if (!org) throw this.exceptions.notFound('Organisation', id);
    return flattenRegions(org);
  }

  async create(data: {
    name: string;
    legalName?: string;
    description?: string;
    website?: string;
    country?: string;
    streetAddress?: string;
    location?: string;
    organisationType?: string;
    uniqueIdentifier?: string;
    category?: string;
    activityDomain?: string;
    legalRepName?: string;
    legalRepEmail?: string;
    legalRepPhone?: string;
    contactPersonName?: string;
    contactPersonEmail?: string;
    contactPersonPhone?: string;
    legalDocumentUrl?: string;
    logoUrl?: string;
    observations?: string;
    tags?: string[];
    status?: OrganisationStatus;
    submissionSource?: string;
    reviewedAt?: Date | null;
    reviewedByUserId?: string;
    rejectionReason?: string | null;
    regionIds?: string[];
  }) {
    const { regionIds, ...rest } = data;
    const org = await this.prisma.organisation.create({
      data: {
        ...rest,
        ...(regionIds ? { regions: { create: uniqueRegionIds(regionIds).map((regionId) => ({ regionId })) } } : {}),
      },
      include: includeOrganisationRegions,
    });
    return flattenRegions(org);
  }

  async update(id: string, data: {
    name?: string;
    legalName?: string;
    description?: string;
    website?: string;
    country?: string;
    streetAddress?: string;
    location?: string;
    organisationType?: string;
    uniqueIdentifier?: string;
    category?: string;
    activityDomain?: string;
    legalRepName?: string;
    legalRepEmail?: string;
    legalRepPhone?: string;
    contactPersonName?: string;
    contactPersonEmail?: string;
    contactPersonPhone?: string;
    legalDocumentUrl?: string;
    logoUrl?: string;
    observations?: string;
    tags?: string[];
    status?: OrganisationStatus;
    submissionSource?: string;
    reviewedAt?: Date | null;
    reviewedByUserId?: string | null;
    rejectionReason?: string | null;
    regionIds?: string[];
  }) {
    await this.findOne(id);
    const { regionIds, ...rest } = data;
    const org = await this.prisma.organisation.update({
      where: { id },
      data: {
        ...rest,
        ...(regionIds
          ? {
              regions: {
                deleteMany: {},
                create: uniqueRegionIds(regionIds).map((regionId) => ({ regionId })),
              },
            }
          : {}),
      },
      include: includeOrganisationRegions,
    });
    return flattenRegions(org);
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.organisation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
