import { Controller, Get, Req } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { GetOrgOverviewUseCase } from '../../usecases/analytics/get-org-overview.usecase.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface.js';

@Controller('org/analytics')
@Roles(Role.ORG_ADMIN, Role.ORG_MEMBER)
export class OrgAnalyticsController {
  constructor(
    private readonly getOrgOverview: GetOrgOverviewUseCase,
    private readonly exceptions: DomainExceptionService,
  ) {}

  @Get('overview')
  async overview(@Req() req: AuthenticatedRequest) {
    const orgId = req.user.organisationId;
    if (!orgId) throw this.exceptions.forbidden('Analytics', 'You must belong to an organisation');
    return this.getOrgOverview.execute(orgId);
  }
}
