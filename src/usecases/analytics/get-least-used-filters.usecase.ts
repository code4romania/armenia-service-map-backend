import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class GetLeastUsedFiltersUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(limit?: number) {
    return this.analyticsService.getLeastUsedFilters(limit);
  }
}
