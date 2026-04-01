import { Injectable } from '@nestjs/common';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { AnalyticsService } from '../../modules/analytics/analytics.service.js';

@Injectable()
export class GetAllSearchesUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(query: PaginationQuery & { search?: string }) {
    return this.analyticsService.getAllSearches(query);
  }
}
