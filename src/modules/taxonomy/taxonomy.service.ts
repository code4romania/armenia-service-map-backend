import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';
import { EntityStatus } from '../../common/enums/entity-status.enum.js';

@Injectable()
export class TaxonomyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
  ) {}

  private slugifyTopicName(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async ensureUniqueTopicSlug(client: Pick<PrismaService, 'topic'>, baseInput: string) {
    const baseSlug = this.slugifyTopicName(baseInput) || 'topic';
    let candidate = baseSlug;
    let suffix = 2;

    while (await client.topic.findUnique({ where: { slug: candidate } })) {
      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private async ensureUniqueNeedTagSlug(baseInput: string, excludeId?: string) {
    const baseSlug = this.slugifyTopicName(baseInput) || 'need-tag';
    let candidate = baseSlug;
    let suffix = 2;

    while (
      await this.prisma.needTag.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      })
    ) {
      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private async findOneTopicWithClient(
    client: Pick<PrismaService, 'topic'>,
    id: string,
  ) {
    const topic = await client.topic.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true } },
        children: {
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { services: true } } },
        },
        _count: { select: { services: true } },
      },
    });

    if (!topic) throw this.exceptions.notFound('Topic', id);
    return topic;
  }

  // ---- Topics ----

  async findManyTopics(query: PaginationQuery & { search?: string; status?: EntityStatus }) {
    const { page = 1, perPage = 10, sortBy = 'sortOrder', sortOrder = 'asc', search, status } = query;
    const where = search
      ? {
          parentId: null,
          ...(status ? { status } : {}),
          name: { contains: search, mode: 'insensitive' as const },
        }
      : { parentId: null, ...(status ? { status } : {}) };

    const [data, total] = await Promise.all([
      this.prisma.topic.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          parent: { select: { id: true, name: true } },
          children: { select: { id: true, name: true, status: true } },
          _count: { select: { services: true } },
        },
      }),
      this.prisma.topic.count({ where }),
    ]);

    return paginatedResult(data, total, page, perPage);
  }

  async findOneTopic(id: string) {
    return this.findOneTopicWithClient(this.prisma, id);
  }

  async createTopic(data: {
    name: string;
    slug?: string;
    icon?: string;
    parentId?: string;
    status?: EntityStatus;
    sortOrder?: number;
    subtopics?: Array<{ id?: string; name: string; status: EntityStatus; sortOrder: number }>;
  }) {
    const { subtopics, ...topicData } = data;

    return this.prisma.$transaction(async (tx) => {
      const slug = data.slug?.trim() ? await this.ensureUniqueTopicSlug(tx, data.slug) : await this.ensureUniqueTopicSlug(tx, data.name);
      const topic = await tx.topic.create({
        data: {
          ...topicData,
          slug,
          status: data.status ?? EntityStatus.ACTIVE,
        },
      });

      for (const subtopic of subtopics ?? []) {
        await tx.topic.create({
          data: {
            name: subtopic.name,
            slug: await this.ensureUniqueTopicSlug(tx, subtopic.name),
            status: subtopic.status,
            sortOrder: subtopic.sortOrder,
            parentId: topic.id,
          },
        });
      }

      return this.findOneTopicWithClient(tx, topic.id);
    });
  }

  async updateTopic(id: string, data: {
    name?: string;
    slug?: string;
    icon?: string;
    parentId?: string | null;
    status?: EntityStatus;
    sortOrder?: number;
    subtopics?: Array<{ id?: string; name: string; status: EntityStatus; sortOrder: number }>;
    removedSubtopicIds?: string[];
  }) {
    await this.findOneTopic(id);
    if (data.slug) {
      const existing = await this.prisma.topic.findFirst({ where: { slug: data.slug, id: { not: id } } });
      if (existing) throw this.exceptions.conflict('Topic', `Slug "${data.slug}" already exists`);
    }
    const { subtopics, removedSubtopicIds, ...topicData } = data;

    return this.prisma.$transaction(async (tx) => {
      await tx.topic.update({ where: { id }, data: topicData });

      if (removedSubtopicIds?.length) {
        await tx.topic.deleteMany({
          where: {
            id: { in: removedSubtopicIds },
            parentId: id,
          },
        });
      }

      for (const subtopic of subtopics ?? []) {
        if (subtopic.id) {
          await tx.topic.update({
            where: { id: subtopic.id },
            data: {
              name: subtopic.name,
              status: subtopic.status,
              sortOrder: subtopic.sortOrder,
            },
          });
          continue;
        }

        await tx.topic.create({
          data: {
            name: subtopic.name,
            slug: await this.ensureUniqueTopicSlug(tx, subtopic.name),
            status: subtopic.status,
            sortOrder: subtopic.sortOrder,
            parentId: id,
          },
        });
      }

      return this.findOneTopicWithClient(tx, id);
    });
  }

  async deleteTopic(id: string) {
    await this.findOneTopic(id);
    const usage = await this.prisma.serviceTopic.count({ where: { topicId: id } });
    if (usage > 0) {
      return this.prisma.topic.update({
        where: { id },
        data: { status: EntityStatus.INACTIVE },
      });
    }
    await this.prisma.topic.delete({ where: { id } });
  }

  async getTopicTree() {
    return this.prisma.topic.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, slug: true, status: true, sortOrder: true },
        },
        _count: { select: { services: true } },
      },
    });
  }

  // ---- Need Tags ----

  async findManyNeedTags(query: PaginationQuery & { search?: string; status?: EntityStatus }) {
    const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc', search, status } = query;
    const where = search
      ? {
          ...(status ? { status } : {}),
          name: { contains: search, mode: 'insensitive' as const },
        }
      : { ...(status ? { status } : {}) };

    const [data, total] = await Promise.all([
      this.prisma.needTag.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { _count: { select: { needReports: true } } },
      }),
      this.prisma.needTag.count({ where }),
    ]);

    return paginatedResult(data, total, page, perPage);
  }

  async findOneNeedTag(id: string) {
    const tag = await this.prisma.needTag.findUnique({
      where: { id },
      include: { _count: { select: { needReports: true } } },
    });
    if (!tag) throw this.exceptions.notFound('NeedTag', id);
    return tag;
  }

  async createNeedTag(data: { name: string; slug?: string; status?: EntityStatus }) {
    const slug = data.slug?.trim() ? await this.ensureUniqueNeedTagSlug(data.slug) : await this.ensureUniqueNeedTagSlug(data.name);
    return this.prisma.needTag.create({
      data: {
        ...data,
        slug,
        status: data.status ?? EntityStatus.ACTIVE,
      },
    });
  }

  async updateNeedTag(id: string, data: { name?: string; slug?: string; status?: EntityStatus }) {
    await this.findOneNeedTag(id);
    if (data.slug) {
      const existing = await this.prisma.needTag.findFirst({ where: { slug: data.slug, id: { not: id } } });
      if (existing) throw this.exceptions.conflict('NeedTag', `Slug "${data.slug}" already exists`);
    }
    return this.prisma.needTag.update({ where: { id }, data });
  }

  async deleteNeedTag(id: string) {
    await this.findOneNeedTag(id);
    const usage = await this.prisma.needReportTag.count({ where: { needTagId: id } });
    if (usage > 0) {
      return this.prisma.needTag.update({
        where: { id },
        data: { status: EntityStatus.INACTIVE },
      });
    }
    await this.prisma.needTag.delete({ where: { id } });
  }

  // ---- Target Groups ----

  async findManyTargetGroups(query: PaginationQuery & { search?: string; status?: EntityStatus }) {
    const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc', search, status } = query;
    const where = search
      ? {
          ...(status ? { status } : {}),
          name: { contains: search, mode: 'insensitive' as const },
        }
      : { ...(status ? { status } : {}) };

    const [data, total] = await Promise.all([
      this.prisma.targetGroup.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { _count: { select: { services: true } } },
      }),
      this.prisma.targetGroup.count({ where }),
    ]);

    return paginatedResult(data, total, page, perPage);
  }

  async findOneTargetGroup(id: string) {
    const targetGroup = await this.prisma.targetGroup.findUnique({
      where: { id },
      include: { _count: { select: { services: true } } },
    });
    if (!targetGroup) throw this.exceptions.notFound('TargetGroup', id);
    return targetGroup;
  }

  async createTargetGroup(data: { name: string; status?: EntityStatus }) {
    return this.prisma.targetGroup.create({
      data: {
        ...data,
        status: data.status ?? EntityStatus.ACTIVE,
      },
    });
  }

  async updateTargetGroup(id: string, data: { name?: string; status?: EntityStatus }) {
    await this.findOneTargetGroup(id);
    return this.prisma.targetGroup.update({ where: { id }, data });
  }

  async deleteTargetGroup(id: string) {
    await this.findOneTargetGroup(id);
    const usage = await this.prisma.serviceTargetGroup.count({ where: { targetGroupId: id } });
    if (usage > 0) {
      return this.prisma.targetGroup.update({
        where: { id },
        data: { status: EntityStatus.INACTIVE },
      });
    }
    await this.prisma.targetGroup.delete({ where: { id } });
  }
}
