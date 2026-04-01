import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class GetOrgDashboardTrendsUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(organisationId: string, months = 12) {
    return this.analyticsService.getOrgDashboardTrends(organisationId, months);
  }
}
