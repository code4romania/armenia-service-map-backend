import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';

@Injectable()
export class TaxonomyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exceptions: DomainExceptionService,
  ) {}

  // ---- Topics ----

  async findManyTopics(query: PaginationQuery & { search?: string }) {
    const { page = 1, perPage = 10, sortBy = 'sortOrder', sortOrder = 'asc', search } = query;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.topic.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { _count: { select: { services: true } } },
      }),
      this.prisma.topic.count({ where }),
    ]);

    return paginatedResult(data, total, page, perPage);
  }

  async findOneTopic(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: { _count: { select: { services: true } } },
    });
    if (!topic) throw this.exceptions.notFound('Topic', id);
    return topic;
  }

  async createTopic(data: { name: string; slug: string; icon?: string; sortOrder?: number }) {
    const existing = await this.prisma.topic.findUnique({ where: { slug: data.slug } });
    if (existing) throw this.exceptions.conflict('Topic', `Slug "${data.slug}" already exists`);
    return this.prisma.topic.create({ data });
  }

  async updateTopic(id: string, data: { name?: string; slug?: string; icon?: string; sortOrder?: number }) {
    await this.findOneTopic(id);
    if (data.slug) {
      const existing = await this.prisma.topic.findFirst({ where: { slug: data.slug, id: { not: id } } });
      if (existing) throw this.exceptions.conflict('Topic', `Slug "${data.slug}" already exists`);
    }
    return this.prisma.topic.update({ where: { id }, data });
  }

  async deleteTopic(id: string) {
    await this.findOneTopic(id);
    await this.prisma.topic.delete({ where: { id } });
  }

  // ---- Need Tags ----

  async findManyNeedTags(query: PaginationQuery & { search?: string }) {
    const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc', search } = query;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

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

  async createNeedTag(data: { name: string; slug: string }) {
    const existing = await this.prisma.needTag.findUnique({ where: { slug: data.slug } });
    if (existing) throw this.exceptions.conflict('NeedTag', `Slug "${data.slug}" already exists`);
    return this.prisma.needTag.create({ data });
  }

  async updateNeedTag(id: string, data: { name?: string; slug?: string }) {
    await this.findOneNeedTag(id);
    if (data.slug) {
      const existing = await this.prisma.needTag.findFirst({ where: { slug: data.slug, id: { not: id } } });
      if (existing) throw this.exceptions.conflict('NeedTag', `Slug "${data.slug}" already exists`);
    }
    return this.prisma.needTag.update({ where: { id }, data });
  }

  async deleteNeedTag(id: string) {
    await this.findOneNeedTag(id);
    await this.prisma.needTag.delete({ where: { id } });
  }
}
