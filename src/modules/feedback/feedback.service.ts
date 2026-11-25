import { Injectable } from '@nestjs/common';
import type { Feedback, Prisma } from '../../generated/prisma/client.js';
import type { FeedbackFound, FeedbackKarabakh, FeedbackUsefulness } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { yerevanDayRange } from './yerevan-day-range.js';

export type FeedbackFilters = {
  from?: string;
  to?: string;
  found?: FeedbackFound;
  fromKarabakh?: FeedbackKarabakh;
};

export type FeedbackRow = Feedback & {
  service: { id: string; title: string | null; titleHy: string | null; deletedAt: Date | null } | null;
};

export type FeedbackSummary = {
  total: number;
  withLookingFor: number;
  usefulness: Record<FeedbackUsefulness, number>;
  found: Record<FeedbackFound, number>;
  fromKarabakh: Record<FeedbackKarabakh, number>;
};

export type CreateFeedbackInput = {
  usefulness: FeedbackUsefulness;
  found: FeedbackFound;
  lookingFor: string | null;
  fromKarabakh: FeedbackKarabakh;
  locale: 'hy' | 'en';
  pagePath: string;
  serviceId: string | null;
};

const USEFULNESS_KEYS: FeedbackUsefulness[] = ['NOT_AT_ALL', 'SLIGHTLY', 'MODERATELY', 'VERY', 'EXTREMELY'];
const FOUND_KEYS: FeedbackFound[] = ['YES', 'PARTLY', 'NO'];
const KARABAKH_KEYS: FeedbackKarabakh[] = ['YES', 'NO', 'PREFER_NOT_TO_SAY'];

const SERVICE_INCLUDE = {
  service: { select: { id: true, title: true, titleHy: true, deletedAt: true } },
} as const;

function zeroed<K extends string>(keys: K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateFeedbackInput): Promise<{ id: string }> {
    return this.prisma.feedback.create({ data, select: { id: true } });
  }

  async list(
    filters: FeedbackFilters,
    page: number,
    perPage: number,
  ): Promise<{ rows: FeedbackRow[]; total: number }> {
    const where = this.buildWhere(filters);
    const [rows, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: SERVICE_INCLUDE,
      }),
      this.prisma.feedback.count({ where }),
    ]);
    return { rows, total };
  }

  findAll(filters: FeedbackFilters): Promise<FeedbackRow[]> {
    return this.prisma.feedback.findMany({
      where: this.buildWhere(filters),
      orderBy: { createdAt: 'desc' },
      include: SERVICE_INCLUDE,
    });
  }

  async summary(filters: FeedbackFilters): Promise<FeedbackSummary> {
    const where = this.buildWhere(filters);
    const [total, withLookingFor, usefulnessRows, foundRows, karabakhRows] = await Promise.all([
      this.prisma.feedback.count({ where }),
      this.prisma.feedback.count({ where: { ...where, lookingFor: { not: null } } }),
      this.prisma.feedback.groupBy({ by: ['usefulness'], where, _count: true }),
      this.prisma.feedback.groupBy({ by: ['found'], where, _count: true }),
      this.prisma.feedback.groupBy({ by: ['fromKarabakh'], where, _count: true }),
    ]);

    const usefulness = zeroed(USEFULNESS_KEYS);
    for (const r of usefulnessRows) usefulness[r.usefulness] = r._count;
    const found = zeroed(FOUND_KEYS);
    for (const r of foundRows) found[r.found] = r._count;
    const fromKarabakh = zeroed(KARABAKH_KEYS);
    for (const r of karabakhRows) fromKarabakh[r.fromKarabakh] = r._count;

    return { total, withLookingFor, usefulness, found, fromKarabakh };
  }

  private buildWhere(filters: FeedbackFilters): Prisma.FeedbackWhereInput {
    const where: Prisma.FeedbackWhereInput = {};
    const createdAt = yerevanDayRange(filters.from, filters.to);
    if (createdAt.gte || createdAt.lt) where.createdAt = createdAt;
    if (filters.found) where.found = filters.found;
    if (filters.fromKarabakh) where.fromKarabakh = filters.fromKarabakh;
    return where;
  }
}
