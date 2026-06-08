import { NotifyMatchingSubscribersUseCase } from './notify-matching-subscribers.usecase';

describe('NotifyMatchingSubscribersUseCase', () => {
  it('sends exactly one email per subscriber even when multiple subscriptions match', async () => {
    const prisma = {
      service: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'svc1',
          status: 'PUBLISHED',
          title: 'Clinic',
          titleHy: 'Կլինիկա',
          shortDescription: 'desc',
          shortDescriptionHy: 'նկար',
          regionId: 'r1',
          topics: [{ topicId: 't1' }, { topicId: 't2' }],
        }),
      },
    };
    const subscriptions = {
      findMatching: jest.fn().mockResolvedValue([
        { id: 'sub1', subscriber: { id: 's1', email: 'a@b.com', locale: 'hy', unsubscribeToken: 'tok1' } },
        { id: 'sub2', subscriber: { id: 's1', email: 'a@b.com', locale: 'hy', unsubscribeToken: 'tok1' } },
        { id: 'sub3', subscriber: { id: 's2', email: 'c@d.com', locale: 'en', unsubscribeToken: 'tok2' } },
      ]),
    };
    const email = { sendNewServiceNotification: jest.fn().mockResolvedValue(undefined) };
    const config = { get: jest.fn().mockReturnValue('http://x') };

    const useCase = new NotifyMatchingSubscribersUseCase(
      prisma as never,
      subscriptions as never,
      email as never,
      config as never,
    );

    await useCase.execute('svc1');

    expect(email.sendNewServiceNotification).toHaveBeenCalledTimes(2);
    const firstCall = email.sendNewServiceNotification.mock.calls.find((c) => c[0].to === 'a@b.com')[0];
    expect(firstCall.serviceTitle).toBe('Կլինիկա'); // hy title
    expect(firstCall.serviceUrl).toBe('http://x/services/svc1');
    expect(firstCall.unsubscribeUrl).toBe('http://x/unsubscribe?token=tok1');
  });

  it('does nothing when the service is not PUBLISHED', async () => {
    const prisma = { service: { findUnique: jest.fn().mockResolvedValue({ id: 'svc1', status: 'DRAFT', topics: [] }) } };
    const subscriptions = { findMatching: jest.fn() };
    const email = { sendNewServiceNotification: jest.fn() };
    const config = { get: jest.fn().mockReturnValue('http://x') };
    const useCase = new NotifyMatchingSubscribersUseCase(prisma as never, subscriptions as never, email as never, config as never);

    await useCase.execute('svc1');

    expect(subscriptions.findMatching).not.toHaveBeenCalled();
    expect(email.sendNewServiceNotification).not.toHaveBeenCalled();
  });
});
