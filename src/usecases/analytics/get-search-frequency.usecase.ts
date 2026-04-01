import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class GetSearchFrequencyUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(period?: 'day' | 'week' | 'month', limit?: number) {
    return this.analyticsService.getSearchFrequency(period, limit);
  }
}
