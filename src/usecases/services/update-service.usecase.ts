import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';
import { ServiceStatus } from '../../common/enums/service-status.enum.js';

@Injectable()
export class UpdateServiceUseCase {
  constructor(private readonly servicesService: ServicesService) {}
  async execute(id: string, data: {
    title?: string;
    titleHy?: string;
    shortDescription?: string;
    shortDescriptionHy?: string;
    description?: string;
    descriptionHy?: string;
    regionId?: string;
    isAvailable?: boolean;
    status?: ServiceStatus;
    availabilityStart?: Date | null;
    availabilityEnd?: Date | null;
    targetGroupIds?: string[];
    topicIds?: string[];
  }) {
    return this.servicesService.update(id, data);
  }
}
