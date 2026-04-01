import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class GetFilterHeatmapUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute() {
    return this.analyticsService.getFilterHeatmap();
  }
}
