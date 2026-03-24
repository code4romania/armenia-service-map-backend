import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';

@Injectable()
export class SearchServicesUseCase {
  constructor(private readonly servicesService: ServicesService) {}
  async execute(query: PaginationQuery & { search?: string; regionId?: string; topicId?: string }) {
    return this.servicesService.findMany({ ...query, isAvailable: true });
  }
}
