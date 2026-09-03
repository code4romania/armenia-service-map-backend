import { Controller, Get, Query, Req } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { GetOrgOverviewUseCase } from '../../usecases/analytics/get-org-overview.usecase.js';
import { GetOrgDashboardTrendsUseCase } from '../../usecases/analytics/get-org-dashboard-trends.usecase.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { DashboardTrendsQueryDto } from '../analytics/dto/dashboard-trends-query.dto.js';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface.js';

@Controller('org/analytics')
@Roles(Role.ORG_ADMIN)
export class OrgAnalyticsController {
  constructor(
    private readonly getOrgOverview: GetOrgOverviewUseCase,
    private readonly getOrgDashboardTrends: GetOrgDashboardTrendsUseCase,
    private readonly exceptions: DomainExceptionService,
  ) {}

  @Get('overview')
  async overview(@Req() req: AuthenticatedRequest) {
    const orgId = req.user.organisationId;
    if (!orgId) throw this.exceptions.forbidden('Analytics', 'You must belong to an organisation');
    return this.getOrgOverview.execute(orgId);
  }

  @Get('dashboard-trends')
  async dashboardTrends(@Req() req: AuthenticatedRequest, @Query() query: DashboardTrendsQueryDto) {
    const orgId = req.user.organisationId;
    if (!orgId) throw this.exceptions.forbidden('Analytics', 'You must belong to an organisation');
    return this.getOrgDashboardTrends.execute(orgId, query.months);
  }
}
