import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { ServiceStatus } from '../../common/enums/service-status.enum.js';
import { startOfUtcDay, withAvailabilityState } from '../../common/availability/availability-state.js';

@Injectable()
export class SearchServicesUseCase {
  constructor(private readonly servicesService: ServicesService) {}
  async execute(
    query: PaginationQuery & { search?: string; regionId?: string; topicId?: string; isAvailable?: boolean },
  ) {
    const { isAvailable, ...rest } = query;
    const now = new Date();
    const result = await this.servicesService.findMany({
      ...rest,
      status: ServiceStatus.PUBLISHED,
      ...(isAvailable ? { availableOn: startOfUtcDay(now) } : {}),
    });
    return { ...result, data: result.data.map((service) => withAvailabilityState(service, now)) };
  }
}
