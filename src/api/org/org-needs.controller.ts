import { Controller, Get, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { NeedQueryDto } from '../needs/dto/need-query.dto.js';
import { UpdateNeedDto } from '../needs/dto/update-need.dto.js';
import { GetManyNeedsUseCase } from '../../usecases/needs/get-many-needs.usecase.js';
import { GetOneNeedUseCase } from '../../usecases/needs/get-one-need.usecase.js';
import { UpdateNeedUseCase } from '../../usecases/needs/update-need.usecase.js';
import { GetNeedsMapUseCase } from '../../usecases/needs/get-needs-map.usecase.js';
import { NeedsService } from '../../modules/needs/needs.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface.js';

@Controller('org/needs')
@Roles(Role.ORG_ADMIN, Role.ORG_MEMBER)
export class OrgNeedsController {
  constructor(
    private readonly getManyNeeds: GetManyNeedsUseCase,
    private readonly getOneNeed: GetOneNeedUseCase,
    private readonly updateNeed: UpdateNeedUseCase,
    private readonly getNeedsMap: GetNeedsMapUseCase,
    private readonly needsService: NeedsService,
    private readonly exceptions: DomainExceptionService,
  ) {}

  private getOrgId(req: AuthenticatedRequest): string {
    const orgId = req.user.organisationId;
    if (!orgId) throw this.exceptions.forbidden('NeedReport', 'You must belong to an organisation');
    return orgId;
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest, @Query() query: NeedQueryDto) {
    return this.getManyNeeds.execute({ ...query, assignedOrganisationId: this.getOrgId(req) });
  }

  @Get('map')
  async map(@Req() req: AuthenticatedRequest) {
    return this.getNeedsMap.execute(this.getOrgId(req));
  }

  @Get(':id')
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.needsService.verifyAssignment(id, this.getOrgId(req));
    return this.getOneNeed.execute(id);
  }

  @Patch(':id')
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateNeedDto) {
    await this.needsService.verifyAssignment(id, this.getOrgId(req));
    return this.updateNeed.execute(id, dto);
  }
}
