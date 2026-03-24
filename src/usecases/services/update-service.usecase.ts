import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';

@Injectable()
export class UpdateServiceUseCase {
  constructor(private readonly servicesService: ServicesService) {}
  async execute(id: string, data: {
    title?: string;
    shortDescription?: string;
    description?: string;
    regionId?: string;
    isAvailable?: boolean;
    availabilityStart?: Date | null;
    availabilityEnd?: Date | null;
    targetGroup?: string[];
    topicIds?: string[];
  }) {
    return this.servicesService.update(id, data);
  }
}
