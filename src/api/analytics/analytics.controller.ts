import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { GetOverviewUseCase } from '../../usecases/analytics/get-overview.usecase.js';
import { GetSearchStatsUseCase } from '../../usecases/analytics/get-search-stats.usecase.js';
import { GetFilterStatsUseCase } from '../../usecases/analytics/get-filter-stats.usecase.js';

@Controller('admin/analytics')
@Roles(Role.SUPER_ADMIN)
export class AnalyticsController {
  constructor(
    private readonly getOverview: GetOverviewUseCase,
    private readonly getSearchStats: GetSearchStatsUseCase,
    private readonly getFilterStats: GetFilterStatsUseCase,
  ) {}

  @Get('overview')
  async overview() {
    return this.getOverview.execute();
  }

  @Get('searches')
  async searches() {
    return this.getSearchStats.execute();
  }

  @Get('filters')
  async filters() {
    return this.getFilterStats.execute();
  }
}
