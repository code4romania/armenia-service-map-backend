import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  it('returns top queries with requested limit', async () => {
    const groupBy = jest.fn().mockResolvedValue([
      { query: 'legal support', _count: { id: 7 } },
      { query: 'housing', _count: { id: 4 } },
    ]);
    const service = new AnalyticsService(
      {
        searchLog: { groupBy },
      } as never,
    );

    const result = await service.getTopQueries(2);
    expect(groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['query'],
        take: 2,
      }),
    );
    expect(result).toEqual([
      { query: 'legal support', count: 7 },
      { query: 'housing', count: 4 },
    ]);
  });

  it('paginates all search logs sorted by creation date desc by default', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: 's1', query: 'legal', resultsCount: 2, createdAt: new Date('2026-04-01T00:00:00.000Z') },
    ]);
    const count = jest.fn().mockResolvedValue(1);
    const service = new AnalyticsService(
      {
        searchLog: { findMany, count },
      } as never,
    );

    const result = await service.getAllSearches({ page: 1, perPage: 10 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      }),
    );
    expect(result.meta.total).toBe(1);
    expect(result.data[0].id).toBe('s1');
  });

  it('returns month-aligned dashboard trends for needs and services', async () => {
    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const previousMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

    const queryRawUnsafe = jest
      .fn()
      .mockResolvedValueOnce([{ month: currentMonthStart, count: 2n }])
      .mockResolvedValueOnce([{ month: previousMonthStart, count: 5n }]);

    const service = new AnalyticsService(
      {
        $queryRawUnsafe: queryRawUnsafe,
      } as never,
    );

    const result = await service.getDashboardTrends(3);
    expect(queryRawUnsafe).toHaveBeenCalledTimes(2);
    expect(result.needReports).toHaveLength(3);
    expect(result.services).toHaveLength(3);
    expect(result.needReports[2].count).toBe(2);
    expect(result.services[1].count).toBe(5);
  });
});
