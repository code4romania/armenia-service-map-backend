import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../modules/services/services.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { ServiceStatus } from '../../common/enums/service-status.enum.js';
import { startOfArmeniaDay, withAvailabilityState } from '../../common/availability/availability-state.js';

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
      // Public directory defaults to newest-first (no public sort UI overrides this).
      sortBy: rest.sortBy ?? 'updatedAt',
      sortOrder: rest.sortBy ? rest.sortOrder : 'desc',
      status: ServiceStatus.PUBLISHED,
      ...(isAvailable ? { availableOn: startOfArmeniaDay(now) } : {}),
    });
    return { ...result, data: result.data.map((service) => withAvailabilityState(service, now)) };
  }
}
