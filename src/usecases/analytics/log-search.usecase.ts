import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class LogSearchUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}
  async execute(data: { query: string; regionId?: string; topicIds?: string[]; resultsCount: number }) {
    return this.analyticsService.logSearch(data);
  }
}
