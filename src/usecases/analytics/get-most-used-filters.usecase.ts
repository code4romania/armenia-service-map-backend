import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class GetMostUsedFiltersUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(limit?: number) {
    return this.analyticsService.getMostUsedFilters(limit);
  }
}
