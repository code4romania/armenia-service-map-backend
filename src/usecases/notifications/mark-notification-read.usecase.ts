import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../../modules/notifications/notifications.service.js';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(private readonly notificationsService: NotificationsService) {}

  async execute(notificationId: string, userId: string) {
    return this.notificationsService.markAsRead(notificationId, userId);
  }
}
