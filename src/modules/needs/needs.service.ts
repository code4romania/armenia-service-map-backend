import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';
import { NeedStatus } from '../../common/enums/need-status.enum.js';

const needInclude = {
  region: { select: { id: true, name: true } },
  assignedOrganisation: { select: { id: true, name: true } },
  tags: { include: { needTag: { select: { id: true, name: true, slug: true } } } },
} as const;

@Injectable()
export class NeedsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
  ) {}

  async findMany(query: PaginationQuery & {
    search?: string;
    status?: NeedStatus;
    regionId?: string;
    assignedOrganisationId?: string;
    tagId?: string;
  }) {
    const { page = 1, perPage = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, regionId, assignedOrganisationId, tagId } = query;
    const where = {
      ...(status ? { status } : {}),
      ...(regionId ? { regionId } : {}),
      ...(assignedOrganisationId ? { assignedOrganisationId } : {}),
      ...(tagId ? { tags: { some: { needTagId: tagId } } } : {}),
      ...(search
        ? {
            OR: [
              { description: { contains: search, mode: 'insensitive' as const } },
              { fullName: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.needReport.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
        include: needInclude,
      }),
      this.prisma.needReport.count({ where }),
    ]);

    return paginatedResult(data, total, page, perPage);
  }

  async findOne(id: string) {
    const need = await this.prisma.needReport.findUnique({
      where: { id },
      include: needInclude,
    });
    if (!need) throw this.exceptions.notFound('NeedReport', id);
    return need;
  }

  async create(data: {
    description: string;
    fullName: string;
    contactMethod: string;
    contactValue: string;
    regionId?: string;
    tagIds?: string[];
  }) {
    const { tagIds, ...needData } = data;
    return this.prisma.needReport.create({
      data: {
        ...needData,
        ...(tagIds?.length
          ? { tags: { create: tagIds.map((needTagId) => ({ needTagId })) } }
          : {}),
      },
      include: needInclude,
    });
  }

  async update(id: string, data: {
    status?: NeedStatus;
    assignedOrganisationId?: string | null;
    tagIds?: string[];
  }) {
    await this.findOne(id);
    const { tagIds, ...needData } = data;

    if (tagIds !== undefined) {
      await this.prisma.needReportTag.deleteMany({ where: { needReportId: id } });
    }

    return this.prisma.needReport.update({
      where: { id },
      data: {
        ...needData,
        ...(tagIds !== undefined
          ? { tags: { create: tagIds.map((needTagId) => ({ needTagId })) } }
          : {}),
      },
      include: needInclude,
    });
  }

  async assign(id: string, organisationId: string) {
    await this.findOne(id);
    return this.prisma.needReport.update({
      where: { id },
      data: {
        assignedOrganisationId: organisationId,
        status: NeedStatus.ASSIGNED,
      },
      include: needInclude,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.needReport.delete({ where: { id } });
  }

  async getMapAggregation(assignedOrganisationId?: string) {
    const where = assignedOrganisationId ? { assignedOrganisationId } : {};
    const results = await this.prisma.needReport.groupBy({
      by: ['regionId'],
      where: { ...where, regionId: { not: null } },
      _count: { id: true },
    });

    const regions = await this.prisma.region.findMany({
      select: { id: true, name: true, svgPathId: true },
    });

    return regions.map((region) => {
      const match = results.find((r) => r.regionId === region.id);
      return {
        regionId: region.id,
        regionName: region.name,
        svgPathId: region.svgPathId,
        count: match?._count.id ?? 0,
      };
    });
  }

  async verifyAssignment(needId: string, organisationId: string) {
    const need = await this.findOne(needId);
    if (need.assignedOrganisationId !== organisationId) {
      throw this.exceptions.forbidden('NeedReport', 'This need report is not assigned to your organisation');
    }
    return need;
  }
}
