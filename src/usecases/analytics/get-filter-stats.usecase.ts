import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class GetFilterStatsUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}
  async execute() {
    return this.analyticsService.getFilterStats();
  }
}
