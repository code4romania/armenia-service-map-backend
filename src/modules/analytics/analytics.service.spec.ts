import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  it('normalizes and batches valid search logs together', async () => {
    const createMany = jest.fn().mockResolvedValue({ count: 2 });
    const service = new AnalyticsService({
      searchLog: { createMany },
    } as never);

    const result = await service.logSearchBatch([
      {
        query: '  healthcare  ',
        regionId: 'region-1',
        topicIds: ['topic-1'],
        resultsCount: 3,
      },
      {
        query: '   ',
        regionId: 'region-2',
        topicIds: ['topic-2'],
        resultsCount: 2,
      },
      {
        query: 'housing',
        resultsCount: 0,
      },
    ]);

    expect(createMany).toHaveBeenCalledWith({
      data: [
        {
          query: 'healthcare',
          regionId: 'region-1',
          topicIds: ['topic-1'],
          resultsCount: 3,
        },
        {
          query: 'housing',
          regionId: null,
          topicIds: [],
          resultsCount: 0,
        },
      ],
    });
    expect(result).toEqual({ count: 2 });
  });

  it('skips batch persistence when every search log is invalid', async () => {
    const createMany = jest.fn();
    const service = new AnalyticsService({
      searchLog: { createMany },
    } as never);

    const result = await service.logSearchBatch([
      { query: '   ', resultsCount: 1 },
      { query: '\n\t', resultsCount: 0 },
    ]);

    expect(result).toEqual({ count: 0 });
    expect(createMany).not.toHaveBeenCalled();
  });

  it('trims query text before saving a search log', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'search-1' });
    const service = new AnalyticsService({
      searchLog: { create },
    } as never);

    await service.logSearch({
      query: '  healthcare  ',
      regionId: 'region-1',
      topicIds: ['topic-1'],
      resultsCount: 3,
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        query: 'healthcare',
        regionId: 'region-1',
        topicIds: ['topic-1'],
        resultsCount: 3,
      },
    });
  });

  it('ignores blank queries when saving a search log', async () => {
    const create = jest.fn();
    const service = new AnalyticsService({
      searchLog: { create },
    } as never);

    const result = await service.logSearch({
      query: '   ',
      resultsCount: 0,
    });

    expect(result).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it('returns top queries with requested limit', async () => {
    const groupBy = jest.fn().mockResolvedValue([
      { query: 'legal support', _count: { id: 7 } },
      { query: 'housing', _count: { id: 4 } },
    ]);
    const service = new AnalyticsService({
      searchLog: { groupBy },
    } as never);

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
      {
        id: 's1',
        query: 'legal',
        resultsCount: 2,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
      },
    ]);
    const count = jest.fn().mockResolvedValue(1);
    const service = new AnalyticsService({
      searchLog: { findMany, count },
    } as never);

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
    const currentMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const previousMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    );

    const queryRawUnsafe = jest
      .fn()
      .mockResolvedValueOnce([{ month: currentMonthStart, count: 2n }])
      .mockResolvedValueOnce([{ month: previousMonthStart, count: 5n }]);

    const service = new AnalyticsService({
      $queryRawUnsafe: queryRawUnsafe,
    } as never);

    const result = await service.getDashboardTrends(3);
    expect(queryRawUnsafe).toHaveBeenCalledTimes(2);
    expect(result.needReports).toHaveLength(3);
    expect(result.services).toHaveLength(3);
    expect(result.needReports[2].count).toBe(2);
    expect(result.services[1].count).toBe(5);
  });

  it('returns organisation-scoped dashboard trends', async () => {
    const now = new Date();
    const currentMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const previousMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    );

    const queryRaw = jest
      .fn()
      .mockResolvedValueOnce([{ month: currentMonthStart, count: 3n }])
      .mockResolvedValueOnce([{ month: previousMonthStart, count: 4n }]);

    const service = new AnalyticsService({
      $queryRaw: queryRaw,
    } as never);

    const result = await service.getOrgDashboardTrends('org-1', 3);
    expect(queryRaw).toHaveBeenCalledTimes(2);
    expect(result.needReports[2].count).toBe(3);
    expect(result.services[1].count).toBe(4);
  });
});
