import { Controller, Get, Patch, Param, Body, Query, Req, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { NeedQueryDto } from '../needs/dto/need-query.dto.js';
import { UpdateNeedDto } from '../needs/dto/update-need.dto.js';
import { CreateNeedCommentDto } from '../needs/dto/create-need-comment.dto.js';
import { GetManyNeedsUseCase } from '../../usecases/needs/get-many-needs.usecase.js';
import { GetOneNeedUseCase } from '../../usecases/needs/get-one-need.usecase.js';
import { UpdateNeedUseCase } from '../../usecases/needs/update-need.usecase.js';
import { GetNeedsMapUseCase } from '../../usecases/needs/get-needs-map.usecase.js';
import { AddNeedCommentUseCase } from '../../usecases/needs/add-need-comment.usecase.js';
import { GetNeedEventsUseCase } from '../../usecases/needs/get-need-events.usecase.js';
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
    private readonly addNeedComment: AddNeedCommentUseCase,
    private readonly getNeedEvents: GetNeedEventsUseCase,
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
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateNeedDto, @CurrentUser('sub') userId: string) {
    await this.needsService.verifyAssignment(id, this.getOrgId(req));
    return this.updateNeed.execute(id, dto, userId);
  }

  @Post(':id/comments')
  async addComment(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CreateNeedCommentDto,
    @CurrentUser('sub') userId: string,
  ) {
    await this.needsService.verifyAssignment(id, this.getOrgId(req));
    await this.addNeedComment.execute(id, userId, dto.content);
    return { message: 'Comment added' };
  }

  @Get(':id/events')
  async events(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.needsService.verifyAssignment(id, this.getOrgId(req));
    return this.getNeedEvents.execute(id);
  }
}
