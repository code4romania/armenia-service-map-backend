import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { AnalyticsLimitQueryDto } from './dto/analytics-limit-query.dto.js';
import { SearchFrequencyQueryDto } from './dto/search-frequency-query.dto.js';
import { GetOverviewUseCase } from '../../usecases/analytics/get-overview.usecase.js';
import { GetSearchStatsUseCase } from '../../usecases/analytics/get-search-stats.usecase.js';
import { GetFilterStatsUseCase } from '../../usecases/analytics/get-filter-stats.usecase.js';
import { GetTopQueriesUseCase } from '../../usecases/analytics/get-top-queries.usecase.js';
import { GetZeroResultQueriesUseCase } from '../../usecases/analytics/get-zero-result-queries.usecase.js';
import { GetSearchFrequencyUseCase } from '../../usecases/analytics/get-search-frequency.usecase.js';
import { GetAllSearchesUseCase } from '../../usecases/analytics/get-all-searches.usecase.js';
import { GetMostUsedFiltersUseCase } from '../../usecases/analytics/get-most-used-filters.usecase.js';
import { GetLeastUsedFiltersUseCase } from '../../usecases/analytics/get-least-used-filters.usecase.js';
import { GetFilterHeatmapUseCase } from '../../usecases/analytics/get-filter-heatmap.usecase.js';

@Controller('admin/analytics')
@Roles(Role.SUPER_ADMIN)
export class AnalyticsController {
  constructor(
    private readonly getOverview: GetOverviewUseCase,
    private readonly getSearchStats: GetSearchStatsUseCase,
    private readonly getFilterStats: GetFilterStatsUseCase,
    private readonly getTopQueries: GetTopQueriesUseCase,
    private readonly getZeroResultQueries: GetZeroResultQueriesUseCase,
    private readonly getSearchFrequency: GetSearchFrequencyUseCase,
    private readonly getAllSearches: GetAllSearchesUseCase,
    private readonly getMostUsedFilters: GetMostUsedFiltersUseCase,
    private readonly getLeastUsedFilters: GetLeastUsedFiltersUseCase,
    private readonly getFilterHeatmap: GetFilterHeatmapUseCase,
  ) {}

  @Get('overview')
  async overview() {
    return this.getOverview.execute();
  }

  @Get('searches')
  async searches() {
    return this.getSearchStats.execute();
  }

  @Get('top-queries')
  async topQueries(@Query() query: AnalyticsLimitQueryDto) {
    return this.getTopQueries.execute(query.limit);
  }

  @Get('zero-result-queries')
  async zeroResultQueries(@Query() query: AnalyticsLimitQueryDto) {
    return this.getZeroResultQueries.execute(query.limit);
  }

  @Get('search-frequency')
  async searchFrequency(@Query() query: SearchFrequencyQueryDto) {
    return this.getSearchFrequency.execute(query.period, query.limit);
  }

  @Get('all-searches')
  async allSearches(@Query() query: PaginationQueryDto) {
    return this.getAllSearches.execute({
      page: query.page,
      perPage: query.perPage,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      search: query.search,
    });
  }

  @Get('filters')
  async filters() {
    return this.getFilterStats.execute();
  }

  @Get('most-used-filters')
  async mostUsedFilters(@Query() query: AnalyticsLimitQueryDto) {
    return this.getMostUsedFilters.execute(query.limit);
  }

  @Get('least-used-filters')
  async leastUsedFilters(@Query() query: AnalyticsLimitQueryDto) {
    return this.getLeastUsedFilters.execute(query.limit);
  }

  @Get('filter-heatmap')
  async filterHeatmap() {
    return this.getFilterHeatmap.execute();
  }
}
