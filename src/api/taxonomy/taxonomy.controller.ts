import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { TopicQueryDto } from './dto/topic-query.dto.js';
import { NeedTagQueryDto } from './dto/need-tag-query.dto.js';
import { TargetGroupQueryDto } from './dto/target-group-query.dto.js';
import { CreateTopicDto } from './dto/create-topic.dto.js';
import { UpdateTopicDto } from './dto/update-topic.dto.js';
import { CreateNeedTagDto } from './dto/create-need-tag.dto.js';
import { UpdateNeedTagDto } from './dto/update-need-tag.dto.js';
import { CreateTargetGroupDto } from './dto/create-target-group.dto.js';
import { UpdateTargetGroupDto } from './dto/update-target-group.dto.js';
import { GetManyTopicsUseCase } from '../../usecases/taxonomy/get-many-topics.usecase.js';
import { GetOneTopicUseCase } from '../../usecases/taxonomy/get-one-topic.usecase.js';
import { GetTopicTreeUseCase } from '../../usecases/taxonomy/get-topic-tree.usecase.js';
import { CreateTopicUseCase } from '../../usecases/taxonomy/create-topic.usecase.js';
import { UpdateTopicUseCase } from '../../usecases/taxonomy/update-topic.usecase.js';
import { DeleteTopicUseCase } from '../../usecases/taxonomy/delete-topic.usecase.js';
import { GetManyNeedTagsUseCase } from '../../usecases/taxonomy/get-many-need-tags.usecase.js';
import { GetOneNeedTagUseCase } from '../../usecases/taxonomy/get-one-need-tag.usecase.js';
import { CreateNeedTagUseCase } from '../../usecases/taxonomy/create-need-tag.usecase.js';
import { UpdateNeedTagUseCase } from '../../usecases/taxonomy/update-need-tag.usecase.js';
import { DeleteNeedTagUseCase } from '../../usecases/taxonomy/delete-need-tag.usecase.js';
import { GetManyTargetGroupsUseCase } from '../../usecases/taxonomy/get-many-target-groups.usecase.js';
import { GetOneTargetGroupUseCase } from '../../usecases/taxonomy/get-one-target-group.usecase.js';
import { CreateTargetGroupUseCase } from '../../usecases/taxonomy/create-target-group.usecase.js';
import { UpdateTargetGroupUseCase } from '../../usecases/taxonomy/update-target-group.usecase.js';
import { DeleteTargetGroupUseCase } from '../../usecases/taxonomy/delete-target-group.usecase.js';

@Controller('admin')
@Roles(Role.SUPER_ADMIN)
export class TaxonomyController {
  constructor(
    private readonly getManyTopics: GetManyTopicsUseCase,
    private readonly getOneTopic: GetOneTopicUseCase,
    private readonly getTopicTree: GetTopicTreeUseCase,
    private readonly createTopic: CreateTopicUseCase,
    private readonly updateTopic: UpdateTopicUseCase,
    private readonly deleteTopic: DeleteTopicUseCase,
    private readonly getManyNeedTags: GetManyNeedTagsUseCase,
    private readonly getOneNeedTag: GetOneNeedTagUseCase,
    private readonly createNeedTag: CreateNeedTagUseCase,
    private readonly updateNeedTag: UpdateNeedTagUseCase,
    private readonly deleteNeedTag: DeleteNeedTagUseCase,
    private readonly getManyTargetGroups: GetManyTargetGroupsUseCase,
    private readonly getOneTargetGroup: GetOneTargetGroupUseCase,
    private readonly createTargetGroup: CreateTargetGroupUseCase,
    private readonly updateTargetGroup: UpdateTargetGroupUseCase,
    private readonly deleteTargetGroup: DeleteTargetGroupUseCase,
  ) {}

  // ---- Topics ----

  @Get('topics')
  async listTopics(@Query() query: TopicQueryDto) {
    return this.getManyTopics.execute(query);
  }

  @Get('taxonomy/topics')
  async listTopicTree() {
    return this.getTopicTree.execute();
  }

  @Get('taxonomy/topics/:id')
  async getTaxonomyTopic(@Param('id') id: string) {
    return this.getOneTopic.execute(id);
  }

  @Post('topics')
  async addTopic(@Body() dto: CreateTopicDto) {
    return this.createTopic.execute(dto);
  }

  @Post('taxonomy/topics')
  async addTaxonomyTopic(@Body() dto: CreateTopicDto) {
    return this.createTopic.execute(dto);
  }

  @Patch('topics/:id')
  async editTopic(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.updateTopic.execute(id, dto);
  }

  @Patch('taxonomy/topics/:id')
  async editTaxonomyTopic(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.updateTopic.execute(id, dto);
  }

  @Delete('topics/:id')
  async removeTopic(@Param('id') id: string) {
    return this.deleteTopic.execute(id);
  }

  @Delete('taxonomy/topics/:id')
  async removeTaxonomyTopic(@Param('id') id: string) {
    return this.deleteTopic.execute(id);
  }

  // ---- Need Tags ----

  @Get('need-tags')
  async listNeedTags(@Query() query: NeedTagQueryDto) {
    return this.getManyNeedTags.execute(query);
  }

  @Get('taxonomy/need-tags')
  async listTaxonomyNeedTags(@Query() query: NeedTagQueryDto) {
    return this.getManyNeedTags.execute(query);
  }

  @Get('taxonomy/need-tags/:id')
  async getTaxonomyNeedTag(@Param('id') id: string) {
    return this.getOneNeedTag.execute(id);
  }

  @Post('need-tags')
  async addNeedTag(@Body() dto: CreateNeedTagDto) {
    return this.createNeedTag.execute(dto);
  }

  @Post('taxonomy/need-tags')
  async addTaxonomyNeedTag(@Body() dto: CreateNeedTagDto) {
    return this.createNeedTag.execute(dto);
  }

  @Patch('need-tags/:id')
  async editNeedTag(@Param('id') id: string, @Body() dto: UpdateNeedTagDto) {
    return this.updateNeedTag.execute(id, dto);
  }

  @Patch('taxonomy/need-tags/:id')
  async editTaxonomyNeedTag(@Param('id') id: string, @Body() dto: UpdateNeedTagDto) {
    return this.updateNeedTag.execute(id, dto);
  }

  @Delete('need-tags/:id')
  async removeNeedTag(@Param('id') id: string) {
    return this.deleteNeedTag.execute(id);
  }

  @Delete('taxonomy/need-tags/:id')
  async removeTaxonomyNeedTag(@Param('id') id: string) {
    return this.deleteNeedTag.execute(id);
  }

  // ---- Target Groups ----

  @Get('taxonomy/target-groups')
  async listTargetGroups(@Query() query: TargetGroupQueryDto) {
    return this.getManyTargetGroups.execute(query);
  }

  @Get('taxonomy/target-groups/:id')
  async getTaxonomyTargetGroup(@Param('id') id: string) {
    return this.getOneTargetGroup.execute(id);
  }

  @Post('taxonomy/target-groups')
  async addTargetGroup(@Body() dto: CreateTargetGroupDto) {
    return this.createTargetGroup.execute(dto);
  }

  @Patch('taxonomy/target-groups/:id')
  async editTargetGroup(@Param('id') id: string, @Body() dto: UpdateTargetGroupDto) {
    return this.updateTargetGroup.execute(id, dto);
  }

  @Delete('taxonomy/target-groups/:id')
  async removeTargetGroup(@Param('id') id: string) {
    return this.deleteTargetGroup.execute(id);
  }
}
