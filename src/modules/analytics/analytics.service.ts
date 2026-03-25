import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

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
    const [totalServices, totalOrganisations, totalNeedReports, totalSearches, newNeeds, resolvedNeeds] = await Promise.all([
      this.prisma.service.count({ where: { deletedAt: null } }),
      this.prisma.organisation.count({ where: { deletedAt: null } }),
      this.prisma.needReport.count(),
      this.prisma.searchLog.count(),
      this.prisma.needReport.count({ where: { status: 'NEW' } }),
      this.prisma.needReport.count({ where: { status: 'RESOLVED' } }),
    ]);

    return {
      totalServices,
      totalOrganisations,
      totalNeedReports,
      totalSearches,
      newNeeds,
      resolvedNeeds,
    };
  }

  async getSearchStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [topQueries, zeroResultQueries, dailyTrend] = await Promise.all([
      this.prisma.searchLog.groupBy({
        by: ['query'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),
      this.prisma.searchLog.groupBy({
        by: ['query'],
        where: { resultsCount: 0 },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),
      this.prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM search_logs
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    return {
      topQueries: topQueries.map((q) => ({ query: q.query, count: q._count.id })),
      zeroResultQueries: zeroResultQueries.map((q) => ({ query: q.query, count: q._count.id })),
      dailyTrend: dailyTrend.map((d) => ({ date: d.date, count: Number(d.count) })),
    };
  }

  async getFilterStats() {
    const [regionUsage, topicUsage] = await Promise.all([
      this.prisma.searchLog.groupBy({
        by: ['regionId'],
        where: { regionId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.$queryRaw<{ topic_id: string; count: bigint }[]>`
        SELECT unnest(topic_ids) as topic_id, COUNT(*)::int as count
        FROM search_logs
        WHERE array_length(topic_ids, 1) > 0
        GROUP BY topic_id
        ORDER BY count DESC
      `,
    ]);

    const regions = await this.prisma.region.findMany({
      select: { id: true, name: true, svgPathId: true },
    });

    const topics = await this.prisma.topic.findMany({
      select: { id: true, name: true },
    });

    return {
      regionUsage: regions.map((r) => {
        const match = regionUsage.find((ru) => ru.regionId === r.id);
        return { regionId: r.id, regionName: r.name, svgPathId: r.svgPathId, count: match?._count.id ?? 0 };
      }),
      topicUsage: topicUsage.map((tu) => {
        const topic = topics.find((t) => t.id === tu.topic_id);
        return { topicId: tu.topic_id, topicName: topic?.name || 'Unknown', count: Number(tu.count) };
      }),
    };
  }

  async getOrgOverview(organisationId: string) {
    const [totalServices, activeServices, assignedNeeds, resolvedNeeds] = await Promise.all([
      this.prisma.service.count({ where: { organisationId, deletedAt: null } }),
      this.prisma.service.count({ where: { organisationId, deletedAt: null, isAvailable: true } }),
      this.prisma.needReport.count({ where: { assignedOrganisationId: organisationId, status: 'ASSIGNED' } }),
      this.prisma.needReport.count({ where: { assignedOrganisationId: organisationId, status: 'RESOLVED' } }),
    ]);

    return { totalServices, activeServices, assignedNeeds, resolvedNeeds };
  }
}
