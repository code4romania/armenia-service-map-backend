import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { UpdateNeedDto } from './dto/update-need.dto.js';
import { NeedQueryDto } from './dto/need-query.dto.js';
import { AssignNeedDto } from './dto/assign-need.dto.js';
import { GetManyNeedsUseCase } from '../../usecases/needs/get-many-needs.usecase.js';
import { GetOneNeedUseCase } from '../../usecases/needs/get-one-need.usecase.js';
import { UpdateNeedUseCase } from '../../usecases/needs/update-need.usecase.js';
import { AssignNeedUseCase } from '../../usecases/needs/assign-need.usecase.js';
import { DeleteNeedUseCase } from '../../usecases/needs/delete-need.usecase.js';
import { GetNeedsMapUseCase } from '../../usecases/needs/get-needs-map.usecase.js';

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
  async update(@Param('id') id: string, @Body() dto: UpdateNeedDto) {
    return this.updateNeed.execute(id, dto);
  }

  @Post(':id/assign')
  async assign(@Param('id') id: string, @Body() dto: AssignNeedDto) {
    return this.assignNeed.execute(id, dto.organisationId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deleteNeed.execute(id);
  }
}
