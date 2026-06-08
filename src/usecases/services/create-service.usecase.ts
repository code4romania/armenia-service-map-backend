import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';
import { ServiceStatus } from '../../common/enums/service-status.enum.js';
import { NotifyMatchingSubscribersUseCase } from '../subscriptions/notify-matching-subscribers.usecase.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly notify: NotifyMatchingSubscribersUseCase,
  ) {}

  async execute(data: {
    title: string;
    titleHy?: string;
    shortDescription: string;
    shortDescriptionHy?: string;
    description: string;
    descriptionHy?: string;
    organisationId: string;
    regionId?: string;
    isAvailable?: boolean;
    status?: ServiceStatus;
    availabilityStart?: Date;
    availabilityEnd?: Date;
    targetGroupIds?: string[];
    topicIds?: string[];
  }) {
    const result = await this.servicesService.create(data);
    if (result.status === ServiceStatus.PUBLISHED) {
      void this.notify.execute(result.id);
    }
    return result;
  }
}
