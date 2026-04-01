import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';
import { ServiceStatus } from '../../common/enums/service-status.enum.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(private readonly servicesService: ServicesService) {}
  async execute(data: {
    title: string;
    shortDescription: string;
    description: string;
    organisationId: string;
    regionId?: string;
    isAvailable?: boolean;
    status?: ServiceStatus;
    availabilityStart?: Date;
    availabilityEnd?: Date;
    targetGroupIds?: string[];
    topicIds?: string[];
  }) {
    return this.servicesService.create(data);
  }
}
