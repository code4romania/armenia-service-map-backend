import { NeedsService } from './needs.service';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('NeedsService', () => {
  it('creates COMMENT event and notifies watchers', async () => {
    const needReport = {
      findUnique: jest.fn().mockResolvedValue({ id: 'n1', title: 'Need title', assignedOrganisationId: 'o1' }),
      findMany: jest.fn().mockResolvedValue([]),
    };
    const eventCreate = jest.fn().mockResolvedValue({ id: 'e1' });
    const userFindMany = jest.fn().mockResolvedValue([{ id: 'admin-1' }]);
    const notifications = { createMany: jest.fn().mockResolvedValue(undefined) } as unknown as NotificationsService;

    const prisma = {
      needReport,
      needReportEvent: { create: eventCreate },
      user: { findMany: userFindMany },
    };
    const service = new NeedsService(prisma as never, new DomainExceptionService(), notifications);

    await service.addComment('n1', 'user-1', 'New comment');
    expect(eventCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          needReportId: 'n1',
          userId: 'user-1',
          eventType: 'COMMENT',
        }),
      }),
    );
  });

  it('filters findMany by submission date range (end inclusive) and multiple tags', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = { needReport: { findMany, count } };
    const service = new NeedsService(prisma as never, new DomainExceptionService(), {} as never);

    await service.findMany({
      startDate: '2026-06-01',
      endDate: '2026-06-10',
      tagIds: ['tag-a', 'tag-b'],
    });

    const where = findMany.mock.calls[0][0].where;
    expect(where.createdAt.gte).toEqual(new Date('2026-06-01'));
    // end is inclusive: strictly before the start of the following day (UTC)
    expect(where.createdAt.lt).toEqual(new Date('2026-06-11'));
    expect(where.tags).toEqual({ some: { needTagId: { in: ['tag-a', 'tag-b'] } } });
    expect(count).toHaveBeenCalledWith({ where });
  });
});
