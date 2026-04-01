import { Module } from '@nestjs/common';
import { NeedsService } from './needs.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  providers: [NeedsService],
  exports: [NeedsService],
})
export class NeedsModule {}
