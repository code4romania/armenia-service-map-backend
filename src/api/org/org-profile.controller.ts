import { Body, Controller, Get, Patch, Query, Req } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { GetOneOrganisationUseCase } from '../../usecases/organisations/get-one-organisation.usecase.js';
import { UpdateOrganisationUseCase } from '../../usecases/organisations/update-organisation.usecase.js';
import { GetManyUsersUseCase } from '../../usecases/users/get-many-users.usecase.js';
import { UpdateOrganisationDto } from '../organisations/dto/update-organisation.dto.js';
import { OrgUserQueryDto } from './dto/org-user-query.dto.js';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface.js';

@Controller('org/profile')
@Roles(Role.ORG_ADMIN)
export class OrgProfileController {
  constructor(
    private readonly getOneOrganisation: GetOneOrganisationUseCase,
    private readonly updateOrganisation: UpdateOrganisationUseCase,
    private readonly getManyUsers: GetManyUsersUseCase,
    private readonly exceptions: DomainExceptionService,
  ) {}

  private getOrgId(req: AuthenticatedRequest): string {
    const orgId = req.user.organisationId;
    if (!orgId) throw this.exceptions.forbidden('Organisation', 'You must belong to an organisation');
    return orgId;
  }

  @Get()
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.getOneOrganisation.execute(this.getOrgId(req));
  }

  @Get('users')
  async listUsers(@Req() req: AuthenticatedRequest, @Query() query: OrgUserQueryDto) {
    return this.getManyUsers.execute({
      ...query,
      organisationId: this.getOrgId(req),
    });
  }

  @Patch()
  @Roles(Role.ORG_ADMIN)
  async updateProfile(@Req() req: AuthenticatedRequest, @Body() dto: UpdateOrganisationDto) {
    const { status: _status, ...allowedData } = dto;
    return this.updateOrganisation.execute(this.getOrgId(req), allowedData);
  }
}
