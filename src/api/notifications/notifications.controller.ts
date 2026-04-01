import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { GetNotificationsUseCase } from '../../usecases/notifications/get-notifications.usecase.js';
import { GetUnreadCountUseCase } from '../../usecases/notifications/get-unread-count.usecase.js';
import { MarkNotificationReadUseCase } from '../../usecases/notifications/mark-notification-read.usecase.js';
import { MarkAllNotificationsReadUseCase } from '../../usecases/notifications/mark-all-notifications-read.usecase.js';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly getNotifications: GetNotificationsUseCase,
    private readonly getUnreadCount: GetUnreadCountUseCase,
    private readonly markNotificationRead: MarkNotificationReadUseCase,
    private readonly markAllNotificationsRead: MarkAllNotificationsReadUseCase,
  ) {}

  @Get()
  async list(@CurrentUser('sub') userId: string, @Query() query: PaginationQueryDto) {
    return this.getNotifications.execute(userId, query);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser('sub') userId: string) {
    const unreadCount = await this.getUnreadCount.execute(userId);
    return { unreadCount };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this.markNotificationRead.execute(id, userId);
    return { message: 'Notification marked as read' };
  }

  @Patch('read-all')
  async markReadAll(@CurrentUser('sub') userId: string) {
    await this.markAllNotificationsRead.execute(userId);
    return { message: 'All notifications marked as read' };
  }
}
