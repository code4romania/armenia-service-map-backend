import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';
import { ServiceStatus } from '../../common/enums/service-status.enum.js';
import { NotifyMatchingSubscribersUseCase } from '../subscriptions/notify-matching-subscribers.usecase.js';

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly notify: NotifyMatchingSubscribersUseCase,
  ) {}

  async execute(id: string, data: {
    title?: string;
    titleHy?: string;
    shortDescription?: string;
    shortDescriptionHy?: string;
    description?: string;
    descriptionHy?: string;
    howToAccess?: string;
    howToAccessHy?: string;
    organisationId?: string;
    externalOrganisationName?: string;
    regionId?: string;
    isAvailable?: boolean;
    status?: ServiceStatus;
    availabilityStart?: Date | null;
    availabilityEnd?: Date | null;
    targetGroupIds?: string[];
    topicIds?: string[];
  }) {
    const previous = await this.servicesService.findOne(id);
    const result = await this.servicesService.update(id, data);
    if (previous.status !== ServiceStatus.PUBLISHED && result.status === ServiceStatus.PUBLISHED) {
      void this.notify.execute(id);
    }
    return result;
  }
}
