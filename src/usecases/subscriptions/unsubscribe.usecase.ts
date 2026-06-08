import { Injectable } from '@nestjs/common';
import { SubscriptionsService } from '../../modules/subscriptions/subscriptions.service.js';

@Injectable()
export class UnsubscribeUseCase {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  async execute(token: string) {
    await this.subscriptions.deleteByToken(token);
    return { ok: true as const };
  }
}
