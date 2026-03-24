import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';

@Injectable()
export class GetManyServicesUseCase {
  constructor(private readonly servicesService: ServicesService) {}
  async execute(query: PaginationQuery & { search?: string; organisationId?: string; regionId?: string; topicId?: string; isAvailable?: boolean }) {
    return this.servicesService.findMany(query);
  }
}
