import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class GetOrgOverviewUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}
  async execute(organisationId: string) {
    return this.analyticsService.getOrgOverview(organisationId);
  }
}
