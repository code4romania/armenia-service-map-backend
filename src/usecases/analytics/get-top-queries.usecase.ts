import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class GetTopQueriesUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(limit?: number) {
    return this.analyticsService.getTopQueries(limit);
  }
}
