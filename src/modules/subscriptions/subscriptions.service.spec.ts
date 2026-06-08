import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsService', () => {
  it('createOrGet upserts subscriber and adds a subscription when none identical exists', async () => {
    const subscriber = {
      upsert: jest.fn().mockResolvedValue({ id: 's1', email: 'a@b.com', locale: 'hy', unsubscribeToken: 'tok' }),
    };
    const subscription = {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'sub1', regionId: 'r1', topicId: 't1' }),
    };
    const prisma = { subscriber, subscription };
    const service = new SubscriptionsService(prisma as never);

    const result = await service.createOrGet({ email: 'a@b.com', locale: 'hy', regionId: 'r1', topicId: 't1' });

    expect(subscriber.upsert).toHaveBeenCalled();
    expect(subscription.findFirst).toHaveBeenCalledWith({
      where: { subscriberId: 's1', regionId: 'r1', topicId: 't1' },
    });
    expect(subscription.create).toHaveBeenCalled();
    expect(result.subscriber.unsubscribeToken).toBe('tok');
    expect(result.subscription.id).toBe('sub1');
  });

  it('createOrGet does NOT create a duplicate identical subscription', async () => {
    const subscriber = { upsert: jest.fn().mockResolvedValue({ id: 's1', email: 'a@b.com', locale: 'en', unsubscribeToken: 'tok' }) };
    const subscription = {
      findFirst: jest.fn().mockResolvedValue({ id: 'existing', regionId: 'r1', topicId: 't1' }),
      create: jest.fn(),
    };
    const prisma = { subscriber, subscription };
    const service = new SubscriptionsService(prisma as never);

    const result = await service.createOrGet({ email: 'a@b.com', regionId: 'r1', topicId: 't1' });

    expect(subscription.create).not.toHaveBeenCalled();
    expect(result.subscription.id).toBe('existing');
  });

  it('findMatching builds region/topic OR-null filter', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: 'sub1', subscriber: { id: 's1', email: 'a@b.com', locale: 'en', unsubscribeToken: 'tok' } },
    ]);
    const prisma = { subscription: { findMany } };
    const service = new SubscriptionsService(prisma as never);

    const matches = await service.findMatching({ regionId: 'r1', topicIds: ['t1', 't2'] });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { OR: [{ regionId: null }, { regionId: 'r1' }] },
          { OR: [{ topicId: null }, { topicId: { in: ['t1', 't2'] } }] },
        ],
      },
      include: { subscriber: true },
    });
    expect(matches).toHaveLength(1);
  });
});
