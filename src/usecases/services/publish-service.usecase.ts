import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';
import { NotifyMatchingSubscribersUseCase } from '../subscriptions/notify-matching-subscribers.usecase.js';

@Injectable()
export class PublishServiceUseCase {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly notify: NotifyMatchingSubscribersUseCase,
  ) {}

  async execute(id: string) {
    const result = await this.servicesService.publish(id);
    void this.notify.execute(id);
    return result;
  }
}
