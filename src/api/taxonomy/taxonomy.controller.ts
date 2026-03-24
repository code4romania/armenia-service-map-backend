import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CreateTopicDto } from './dto/create-topic.dto.js';
import { UpdateTopicDto } from './dto/update-topic.dto.js';
import { CreateNeedTagDto } from './dto/create-need-tag.dto.js';
import { UpdateNeedTagDto } from './dto/update-need-tag.dto.js';
import { GetManyTopicsUseCase } from '../../usecases/taxonomy/get-many-topics.usecase.js';
import { CreateTopicUseCase } from '../../usecases/taxonomy/create-topic.usecase.js';
import { UpdateTopicUseCase } from '../../usecases/taxonomy/update-topic.usecase.js';
import { DeleteTopicUseCase } from '../../usecases/taxonomy/delete-topic.usecase.js';
import { GetManyNeedTagsUseCase } from '../../usecases/taxonomy/get-many-need-tags.usecase.js';
import { CreateNeedTagUseCase } from '../../usecases/taxonomy/create-need-tag.usecase.js';
import { UpdateNeedTagUseCase } from '../../usecases/taxonomy/update-need-tag.usecase.js';
import { DeleteNeedTagUseCase } from '../../usecases/taxonomy/delete-need-tag.usecase.js';

@Controller('admin')
@Roles(Role.SUPER_ADMIN)
export class TaxonomyController {
  constructor(
    private readonly getManyTopics: GetManyTopicsUseCase,
    private readonly createTopic: CreateTopicUseCase,
    private readonly updateTopic: UpdateTopicUseCase,
    private readonly deleteTopic: DeleteTopicUseCase,
    private readonly getManyNeedTags: GetManyNeedTagsUseCase,
    private readonly createNeedTag: CreateNeedTagUseCase,
    private readonly updateNeedTag: UpdateNeedTagUseCase,
    private readonly deleteNeedTag: DeleteNeedTagUseCase,
  ) {}

  // ---- Topics ----

  @Get('topics')
  async listTopics(@Query() query: PaginationQueryDto) {
    return this.getManyTopics.execute(query);
  }

  @Post('topics')
  async addTopic(@Body() dto: CreateTopicDto) {
    return this.createTopic.execute(dto);
  }

  @Patch('topics/:id')
  async editTopic(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.updateTopic.execute(id, dto);
  }

  @Delete('topics/:id')
  async removeTopic(@Param('id') id: string) {
    return this.deleteTopic.execute(id);
  }

  // ---- Need Tags ----

  @Get('need-tags')
  async listNeedTags(@Query() query: PaginationQueryDto) {
    return this.getManyNeedTags.execute(query);
  }

  @Post('need-tags')
  async addNeedTag(@Body() dto: CreateNeedTagDto) {
    return this.createNeedTag.execute(dto);
  }

  @Patch('need-tags/:id')
  async editNeedTag(@Param('id') id: string, @Body() dto: UpdateNeedTagDto) {
    return this.updateNeedTag.execute(id, dto);
  }

  @Delete('need-tags/:id')
  async removeNeedTag(@Param('id') id: string) {
    return this.deleteNeedTag.execute(id);
  }
}
