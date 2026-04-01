import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../../modules/notifications/notifications.service.js';

@Injectable()
export class MarkAllNotificationsReadUseCase {
  constructor(private readonly notificationsService: NotificationsService) {}

  async execute(userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
