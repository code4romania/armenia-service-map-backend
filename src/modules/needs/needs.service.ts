import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';
import { NeedStatus } from '../../common/enums/need-status.enum.js';
import { NeedReportEventType } from '../../common/enums/need-report-event-type.enum.js';
import { NotificationType } from '../../common/enums/notification-type.enum.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { Prisma } from '../../generated/prisma/client.js';

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
    private readonly notifications: NotificationsService,
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
    title?: string;
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
        title: needData.title ?? '',
        ...needData,
        ...(tagIds?.length
          ? { tags: { create: tagIds.map((needTagId) => ({ needTagId })) } }
          : {}),
      },
      include: needInclude,
    });
  }

  async update(id: string, data: {
    title?: string;
    status?: NeedStatus;
    assignedOrganisationId?: string | null;
    tagIds?: string[];
  }, actorUserId?: string) {
    const existingNeed = await this.findOne(id);
    const { tagIds, ...needData } = data;
    const effectiveActorId = actorUserId ?? (await this.resolveSystemUserId());
    if (!effectiveActorId) {
      throw this.exceptions.badRequest('No available user to attribute need event');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const previousTagIds = existingNeed.tags.map((tag) => tag.needTag.id);

      if (tagIds !== undefined) {
        await tx.needReportTag.deleteMany({ where: { needReportId: id } });
      }

      const result = await tx.needReport.update({
        where: { id },
        data: {
          ...needData,
          ...(tagIds !== undefined
            ? { tags: { create: tagIds.map((needTagId) => ({ needTagId })) } }
            : {}),
        },
        include: needInclude,
      });

      const events: Array<{ eventType: NeedReportEventType; content?: string; metadata?: Record<string, unknown> }> = [];

      if (data.status && data.status !== existingNeed.status) {
        events.push({
          eventType: NeedReportEventType.STATUS_CHANGE,
          content: `Status changed from ${existingNeed.status} to ${data.status}`,
          metadata: { from: existingNeed.status, to: data.status },
        });
      }

      if (data.title !== undefined && data.title !== existingNeed.title) {
        events.push({
          eventType: NeedReportEventType.TITLE_EDITED,
          content: 'Need title was updated',
          metadata: { from: existingNeed.title, to: data.title },
        });
      }

      if (tagIds !== undefined) {
        const added = tagIds.filter((tagId) => !previousTagIds.includes(tagId));
        const removed = previousTagIds.filter((tagId) => !tagIds.includes(tagId));
        const previousTagMap = new Map(existingNeed.tags.map((tag) => [tag.needTag.id, tag.needTag.name]));
        const nextTagMap = new Map(result.tags.map((tag) => [tag.needTag.id, tag.needTag.name]));
        added.forEach((tagId) => {
          events.push({
            eventType: NeedReportEventType.TAG_ADDED,
            content: `Tag added: ${nextTagMap.get(tagId) ?? tagId}`,
            metadata: { tagId, tagName: nextTagMap.get(tagId) ?? null },
          });
        });
        removed.forEach((tagId) => {
          events.push({
            eventType: NeedReportEventType.TAG_REMOVED,
            content: `Tag removed: ${previousTagMap.get(tagId) ?? tagId}`,
            metadata: { tagId, tagName: previousTagMap.get(tagId) ?? null },
          });
        });
      }

      if (
        data.assignedOrganisationId !== undefined &&
        data.assignedOrganisationId !== existingNeed.assignedOrganisationId
      ) {
        events.push({
          eventType: NeedReportEventType.ASSIGNED,
          content: `Assignee changed from ${existingNeed.assignedOrganisation?.name ?? 'Unassigned'} to ${result.assignedOrganisation?.name ?? 'Unassigned'}`,
          metadata: {
            from: existingNeed.assignedOrganisationId,
            to: data.assignedOrganisationId,
            fromName: existingNeed.assignedOrganisation?.name ?? null,
            toName: result.assignedOrganisation?.name ?? null,
          },
        });
      }

      if (events.length) {
        await tx.needReportEvent.createMany({
          data: events.map((event) => ({
            needReportId: id,
            userId: effectiveActorId,
            eventType: event.eventType,
            content: event.content,
            metadata: (event.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
          })),
        });
      }

      return result;
    });

    await this.notifyNeedWatchers(id, effectiveActorId, NotificationType.NEED_STATUS_CHANGED, 'Need report updated');
    return updated;
  }

  async assign(id: string, organisationId: string, actorUserId?: string) {
    const updated = await this.update(
      id,
      {
        assignedOrganisationId: organisationId,
        status: NeedStatus.IN_PROGRESS,
      },
      actorUserId,
    );
    const effectiveActorId = actorUserId ?? (await this.resolveSystemUserId());
    if (effectiveActorId) {
      await this.notifyNeedWatchers(id, effectiveActorId, NotificationType.NEED_ASSIGNED, 'Need report assigned');
    }
    return updated;
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

  async addComment(needId: string, userId: string, content: string) {
    await this.findOne(needId);

    await this.prisma.needReportEvent.create({
      data: {
        needReportId: needId,
        userId,
        eventType: NeedReportEventType.COMMENT,
        content,
      },
    });

    await this.notifyNeedWatchers(needId, userId, NotificationType.NEED_COMMENT_ADDED, 'New comment on need report');
  }

  async getEvents(needId: string) {
    await this.findOne(needId);
    return this.prisma.needReportEvent.findMany({
      where: { needReportId: needId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  private async resolveSystemUserId() {
    const user = await this.prisma.user.findFirst({
      where: { deletedAt: null },
      select: { id: true },
    });
    return user?.id;
  }

  private async notifyNeedWatchers(
    needId: string,
    actorUserId: string,
    type: NotificationType,
    title: string,
  ) {
    const need = await this.prisma.needReport.findUnique({
      where: { id: needId },
      select: { id: true, title: true, assignedOrganisationId: true },
    });
    if (!need) return;

    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        id: { not: actorUserId },
        OR: [
          { role: 'SUPER_ADMIN' },
          ...(need.assignedOrganisationId ? [{ organisationId: need.assignedOrganisationId }] : []),
        ],
      },
      select: { id: true },
    });
    if (!users.length) return;

    await this.notifications.createMany(
      users.map((user) => user.id),
      {
        type,
        title,
        message: need.title || `Need report ${need.id} updated`,
        metadata: { needReportId: need.id },
      },
    );
  }
}
