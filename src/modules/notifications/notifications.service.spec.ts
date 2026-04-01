import { NotificationsService } from './notifications.service';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';

describe('NotificationsService', () => {
  it('marks all unread notifications as read', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 2 });
    const service = new NotificationsService(
      {
        notification: { updateMany },
      } as never,
      new DomainExceptionService(),
    );

    await service.markAllAsRead('user-1');
    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', readAt: null },
      data: { readAt: expect.any(Date) },
    });
  });
});
