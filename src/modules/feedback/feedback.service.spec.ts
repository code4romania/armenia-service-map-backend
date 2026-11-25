import { FeedbackService } from './feedback.service.js';

describe('FeedbackService', () => {
  it('create persists the feedback and returns its id', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'f1' });
    const service = new FeedbackService({ feedback: { create } } as never);
    const data = {
      usefulness: 'VERY',
      found: 'NO',
      lookingFor: 'housing',
      fromKarabakh: 'PREFER_NOT_TO_SAY',
      locale: 'hy' as const,
      pagePath: '/services',
      serviceId: null,
    };

    const result = await service.create(data as never);

    expect(create).toHaveBeenCalledWith({ data, select: { id: true } });
    expect(result).toEqual({ id: 'f1' });
  });

  it('list applies the Yerevan date range, pagination, ordering and service include', async () => {
    const findMany = jest.fn().mockResolvedValue([{ id: 'f1' }]);
    const count = jest.fn().mockResolvedValue(7);
    const service = new FeedbackService({ feedback: { findMany, count } } as never);

    const result = await service.list(
      { from: '2026-11-01', to: '2026-11-30', found: 'NO' as never, fromKarabakh: 'YES' as never },
      3,
      20,
    );

    const where = {
      createdAt: { gte: new Date('2026-10-31T20:00:00Z'), lt: new Date('2026-11-30T20:00:00Z') },
      found: 'NO',
      fromKarabakh: 'YES',
    };
    expect(findMany).toHaveBeenCalledWith({
      where,
      orderBy: { createdAt: 'desc' },
      skip: 40,
      take: 20,
      include: { service: { select: { id: true, title: true, titleHy: true, deletedAt: true } } },
    });
    expect(count).toHaveBeenCalledWith({ where });
    expect(result).toEqual({ rows: [{ id: 'f1' }], total: 7 });
  });

  it('list omits createdAt when no dates are given', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const service = new FeedbackService({ feedback: { findMany, count } } as never);

    await service.list({}, 1, 10);

    expect(findMany.mock.calls[0][0].where).toEqual({});
    expect(findMany.mock.calls[0][0].skip).toBe(0);
  });

  it('findAll returns every matching row ordered createdAt desc', async () => {
    const findMany = jest.fn().mockResolvedValue([{ id: 'f1' }]);
    const service = new FeedbackService({ feedback: { findMany } } as never);

    const rows = await service.findAll({ from: '2026-11-01' });

    expect(findMany).toHaveBeenCalledWith({
      where: { createdAt: { gte: new Date('2026-10-31T20:00:00Z') } },
      orderBy: { createdAt: 'desc' },
      include: { service: { select: { id: true, title: true, titleHy: true, deletedAt: true } } },
    });
    expect(rows).toEqual([{ id: 'f1' }]);
  });

  it('summary fills zeros for missing enum keys', async () => {
    const groupBy = jest
      .fn()
      .mockResolvedValueOnce([{ usefulness: 'VERY', _count: 2 }])
      .mockResolvedValueOnce([{ found: 'YES', _count: 1 }, { found: 'NO', _count: 1 }])
      .mockResolvedValueOnce([{ fromKarabakh: 'PREFER_NOT_TO_SAY', _count: 2 }]);
    const count = jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(1);
    const service = new FeedbackService({ feedback: { groupBy, count } } as never);

    const summary = await service.summary({ from: '2026-11-01' });

    const dateWhere = { createdAt: { gte: new Date('2026-10-31T20:00:00Z') } };
    expect(count).toHaveBeenNthCalledWith(1, { where: dateWhere });
    expect(count).toHaveBeenNthCalledWith(2, { where: { ...dateWhere, lookingFor: { not: null } } });
    expect(summary).toEqual({
      total: 2,
      withLookingFor: 1,
      usefulness: { NOT_AT_ALL: 0, SLIGHTLY: 0, MODERATELY: 0, VERY: 2, EXTREMELY: 0 },
      found: { YES: 1, PARTLY: 0, NO: 1 },
      fromKarabakh: { YES: 0, NO: 0, PREFER_NOT_TO_SAY: 2 },
    });
  });

  it('summary returns all zeros with no rows', async () => {
    const groupBy = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const service = new FeedbackService({ feedback: { groupBy, count } } as never);

    const summary = await service.summary({});

    expect(summary.total).toBe(0);
    expect(Object.values(summary.usefulness)).toEqual([0, 0, 0, 0, 0]);
    expect(Object.values(summary.found)).toEqual([0, 0, 0]);
    expect(Object.values(summary.fromKarabakh)).toEqual([0, 0, 0]);
  });
});
