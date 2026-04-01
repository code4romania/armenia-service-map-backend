import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class GetDashboardTrendsUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(months?: number) {
    return this.analyticsService.getDashboardTrends(months);
  }
}
