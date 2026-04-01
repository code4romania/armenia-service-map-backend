import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';

type SearchFrequencyPeriod = 'day' | 'week' | 'month';
type SortDirection = 'asc' | 'desc';
type TrendPoint = { month: string; count: number };

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async logSearch(data: {
    query: string;
    regionId?: string;
    topicIds?: string[];
    resultsCount: number;
  }) {
    return this.prisma.searchLog.create({
      data: {
        query: data.query,
        regionId: data.regionId || null,
        topicIds: data.topicIds || [],
        resultsCount: data.resultsCount,
      },
    });
  }

  async getOverview() {
    const [totalServices, totalOrganisations, totalNeedReports, totalSearches, totalZeroResultSearches, uniqueSearchCountRow, newNeeds, resolvedNeeds] = await Promise.all([
      this.prisma.service.count({ where: { deletedAt: null } }),
      this.prisma.organisation.count({ where: { deletedAt: null } }),
      this.prisma.needReport.count(),
      this.prisma.searchLog.count(),
      this.prisma.searchLog.count({ where: { resultsCount: 0 } }),
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT query)::int AS count
        FROM search_logs
      `,
      this.prisma.needReport.count({ where: { status: 'NEW' } }),
      this.prisma.needReport.count({ where: { status: 'SOLVED' } }),
    ]);

    return {
      totalServices,
      totalOrganisations,
      totalNeedReports,
      totalSearches,
      totalZeroResultSearches,
      totalUniqueSearches: Number(uniqueSearchCountRow[0]?.count ?? 0),
      newNeeds,
      resolvedNeeds,
    };
  }

  async getTopQueries(limit = 10) {
    const safeLimit = this.normalizeLimit(limit, 1, 100);
    const topQueries = await this.prisma.searchLog.groupBy({
      by: ['query'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: safeLimit,
    });

    return topQueries.map((q) => ({ query: q.query, count: q._count.id }));
  }

  async getZeroResultQueries(limit = 10) {
    const safeLimit = this.normalizeLimit(limit, 1, 100);
    const zeroResultQueries = await this.prisma.searchLog.groupBy({
      by: ['query'],
      where: { resultsCount: 0 },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: safeLimit,
    });

    return zeroResultQueries.map((q) => ({ query: q.query, count: q._count.id }));
  }

  async getSearchFrequency(period: SearchFrequencyPeriod = 'day', limit = 30) {
    const safeLimit = this.normalizeLimit(limit, 1, 365);
    const safePeriod = period === 'week' || period === 'month' ? period : 'day';

    const frequencyRows = await this.prisma.$queryRawUnsafe<{ bucket: Date; count: number }[]>(`
      SELECT bucket, count
      FROM (
        SELECT DATE_TRUNC('${safePeriod}', created_at) AS bucket, COUNT(*)::int AS count
        FROM search_logs
        GROUP BY 1
        ORDER BY 1 DESC
        LIMIT ${safeLimit}
      ) ranked
      ORDER BY bucket ASC
    `);

    return frequencyRows.map((row) => ({
      period: safePeriod,
      bucketStart: row.bucket,
      count: Number(row.count),
    }));
  }

  async getAllSearches(query: PaginationQuery & { search?: string }) {
    const { page = 1, perPage = 20, sortBy = 'createdAt', sortOrder = 'desc', search } = query;
    const safeSortBy = this.normalizeSearchSortBy(sortBy);
    const safeSortOrder: SortDirection = sortOrder === 'asc' ? 'asc' : 'desc';
    const where = search
      ? {
          query: { contains: search, mode: 'insensitive' as const },
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.searchLog.findMany({
        where,
        orderBy: { [safeSortBy]: safeSortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.searchLog.count({ where }),
    ]);

    return paginatedResult(data, total, page, perPage);
  }

  async getMostUsedFilters(limit = 10) {
    return this.getFilterUsage(limit, 'desc');
  }

  async getLeastUsedFilters(limit = 10) {
    return this.getFilterUsage(limit, 'asc');
  }

  async getFilterHeatmap() {
    const [regions, topics, matrixRows] = await Promise.all([
      this.prisma.region.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.topic.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.$queryRaw<{ topicId: string; regionId: string; count: bigint }[]>`
        SELECT
          unnest(topic_ids) AS "topicId",
          region_id AS "regionId",
          COUNT(*)::int AS count
        FROM search_logs
        WHERE region_id IS NOT NULL
          AND array_length(topic_ids, 1) > 0
        GROUP BY unnest(topic_ids), region_id
      `,
    ]);

    return {
      regions,
      topics,
      matrix: matrixRows.map((row) => ({
        topicId: row.topicId,
        regionId: row.regionId,
        count: Number(row.count),
      })),
    };
  }

  async getDashboardTrends(months = 12) {
    const safeMonths = this.normalizeLimit(months, 1, 24);
    const needs = await this.getMonthlyTrend('need_reports', safeMonths);
    const services = await this.getMonthlyTrend('services', safeMonths);

    return {
      months: needs.map((entry) => entry.month),
      needReports: needs,
      services,
    };
  }

  async getSearchStats() {
    const [topQueries, zeroResultQueries, dailyTrend] = await Promise.all([
      this.getTopQueries(20),
      this.getZeroResultQueries(20),
      this.getSearchFrequency('day', 30),
    ]);

    return {
      topQueries,
      zeroResultQueries,
      dailyTrend: dailyTrend.map((item) => ({ date: item.bucketStart, count: item.count })),
    };
  }

  async getFilterStats() {
    return this.getMostUsedFilters(20);
  }

  async getOrgOverview(organisationId: string) {
    const [totalServices, activeServices, assignedNeeds, resolvedNeeds] = await Promise.all([
      this.prisma.service.count({ where: { organisationId, deletedAt: null } }),
      this.prisma.service.count({ where: { organisationId, deletedAt: null, isAvailable: true } }),
      this.prisma.needReport.count({ where: { assignedOrganisationId: organisationId, status: 'IN_PROGRESS' } }),
      this.prisma.needReport.count({ where: { assignedOrganisationId: organisationId, status: 'SOLVED' } }),
    ]);

    return { totalServices, activeServices, assignedNeeds, resolvedNeeds };
  }

  private async getFilterUsage(limit: number, order: SortDirection) {
    const safeLimit = this.normalizeLimit(limit, 1, 100);
    const sqlDirection = order === 'asc' ? 'ASC' : 'DESC';

    const [regionUsage, topicUsage, regions, topics] = await Promise.all([
      this.prisma.searchLog.groupBy({
        by: ['regionId'],
        where: { regionId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: order } },
        take: safeLimit,
      }),
      this.prisma.$queryRawUnsafe<{ topicId: string; count: bigint }[]>(`
        SELECT unnest(topic_ids) AS "topicId", COUNT(*)::int AS count
        FROM search_logs
        WHERE array_length(topic_ids, 1) > 0
        GROUP BY unnest(topic_ids)
        ORDER BY count ${sqlDirection}
        LIMIT ${safeLimit}
      `),
      this.prisma.region.findMany({
        select: { id: true, name: true, svgPathId: true },
      }),
      this.prisma.topic.findMany({
        select: { id: true, name: true },
      }),
    ]);

    return {
      regionUsage: regionUsage.map((entry) => {
        const region = regions.find((item) => item.id === entry.regionId);
        return {
          regionId: entry.regionId!,
          regionName: region?.name ?? 'Unknown',
          svgPathId: region?.svgPathId ?? null,
          count: entry._count.id,
        };
      }),
      topicUsage: topicUsage.map((entry) => {
        const topic = topics.find((item) => item.id === entry.topicId);
        return {
          topicId: entry.topicId,
          topicName: topic?.name ?? 'Unknown',
          count: Number(entry.count),
        };
      }),
    };
  }

  private normalizeLimit(limit: number, min: number, max: number) {
    if (!Number.isFinite(limit)) return min;
    return Math.min(Math.max(Math.floor(limit), min), max);
  }

  private normalizeSearchSortBy(sortBy?: string) {
    const allowed = new Set(['createdAt', 'query', 'resultsCount']);
    return sortBy && allowed.has(sortBy) ? sortBy : 'createdAt';
  }

  private async getMonthlyTrend(table: 'need_reports' | 'services', months: number): Promise<TrendPoint[]> {
    const rows = await this.prisma.$queryRawUnsafe<{ month: Date; count: bigint }[]>(`
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*)::int AS count
      FROM ${table}
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${months - 1} months'
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    const values = new Map(
      rows.map((row) => [
        `${row.month.getUTCFullYear()}-${String(row.month.getUTCMonth() + 1).padStart(2, '0')}`,
        Number(row.count),
      ]),
    );

    const result: TrendPoint[] = [];
    const now = new Date();
    for (let offset = months - 1; offset >= 0; offset -= 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      result.push({
        month: key,
        count: values.get(key) ?? 0,
      });
    }
    return result;
  }
}
