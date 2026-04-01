import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../../modules/notifications/notifications.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';

@Injectable()
export class GetNotificationsUseCase {
  constructor(private readonly notificationsService: NotificationsService) {}

  async execute(userId: string, query: PaginationQuery = {}) {
    return this.notificationsService.getMany(userId, query);
  }
}
