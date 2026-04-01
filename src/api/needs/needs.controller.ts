import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UpdateNeedDto } from './dto/update-need.dto.js';
import { NeedQueryDto } from './dto/need-query.dto.js';
import { AssignNeedDto } from './dto/assign-need.dto.js';
import { CreateNeedCommentDto } from './dto/create-need-comment.dto.js';
import { GetManyNeedsUseCase } from '../../usecases/needs/get-many-needs.usecase.js';
import { GetOneNeedUseCase } from '../../usecases/needs/get-one-need.usecase.js';
import { UpdateNeedUseCase } from '../../usecases/needs/update-need.usecase.js';
import { AssignNeedUseCase } from '../../usecases/needs/assign-need.usecase.js';
import { DeleteNeedUseCase } from '../../usecases/needs/delete-need.usecase.js';
import { GetNeedsMapUseCase } from '../../usecases/needs/get-needs-map.usecase.js';
import { AddNeedCommentUseCase } from '../../usecases/needs/add-need-comment.usecase.js';
import { GetNeedEventsUseCase } from '../../usecases/needs/get-need-events.usecase.js';

@Controller('admin/needs')
@Roles(Role.SUPER_ADMIN)
export class NeedsController {
  constructor(
    private readonly getManyNeeds: GetManyNeedsUseCase,
    private readonly getOneNeed: GetOneNeedUseCase,
    private readonly updateNeed: UpdateNeedUseCase,
    private readonly assignNeed: AssignNeedUseCase,
    private readonly deleteNeed: DeleteNeedUseCase,
    private readonly getNeedsMap: GetNeedsMapUseCase,
    private readonly addNeedComment: AddNeedCommentUseCase,
    private readonly getNeedEvents: GetNeedEventsUseCase,
  ) {}

  @Get()
  async list(@Query() query: NeedQueryDto) {
    return this.getManyNeeds.execute(query);
  }

  @Get('map')
  async map() {
    return this.getNeedsMap.execute();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.getOneNeed.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateNeedDto, @CurrentUser('sub') userId: string) {
    return this.updateNeed.execute(id, dto, userId);
  }

  @Post(':id/assign')
  async assign(@Param('id') id: string, @Body() dto: AssignNeedDto, @CurrentUser('sub') userId: string) {
    return this.assignNeed.execute(id, dto.organisationId, userId);
  }

  @Post(':id/comments')
  async addComment(@Param('id') id: string, @Body() dto: CreateNeedCommentDto, @CurrentUser('sub') userId: string) {
    await this.addNeedComment.execute(id, userId, dto.content);
    return { message: 'Comment added' };
  }

  @Get(':id/events')
  async listEvents(@Param('id') id: string) {
    return this.getNeedEvents.execute(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deleteNeed.execute(id);
  }
}
