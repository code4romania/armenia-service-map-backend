import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';

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
    availabilityStart?: Date;
    availabilityEnd?: Date;
    targetGroup?: string[];
    topicIds?: string[];
  }) {
    return this.servicesService.create(data);
  }
}
