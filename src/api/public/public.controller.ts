import { Controller, Get, Post, Param, Query, Body, NotFoundException } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { SearchServicesUseCase } from '../../usecases/services/search-services.usecase.js';
import { GetOneServiceUseCase } from '../../usecases/services/get-one-service.usecase.js';
import { CreateNeedUseCase } from '../../usecases/needs/create-need.usecase.js';
import { LogSearchUseCase } from '../../usecases/analytics/log-search.usecase.js';
import { ServiceQueryDto } from '../services/dto/service-query.dto.js';
import { CreateNeedDto } from '../needs/dto/create-need.dto.js';
import { EntityStatus } from '../../common/enums/entity-status.enum.js';
import { ServiceStatus } from '../../common/enums/service-status.enum.js';

@Controller('public')
@Public()
export class PublicController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchServices: SearchServicesUseCase,
    private readonly getOneService: GetOneServiceUseCase,
    private readonly createNeed: CreateNeedUseCase,
    private readonly logSearch: LogSearchUseCase,
  ) {}

  @Get('regions')
  async listRegions() {
    return this.prisma.region.findMany({
      orderBy: { name: 'asc' },
    });
  }

  @Get('regions/service-counts')
  async regionServiceCounts() {
    const regions = await this.prisma.region.findMany({
      select: { svgPathId: true, _count: { select: { services: true } } },
    });
    return Object.fromEntries(
      regions.map((r) => [r.svgPathId, r._count.services]),
    );
  }

  @Get('topics')
  async listTopics() {
    return this.prisma.topic.findMany({
      where: { parentId: null, status: EntityStatus.ACTIVE },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { status: EntityStatus.ACTIVE },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, slug: true, status: true, sortOrder: true },
        },
      },
    });
  }

  @Get('target-groups')
  async listTargetGroups() {
    return this.prisma.targetGroup.findMany({
      where: { status: EntityStatus.ACTIVE },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, status: true },
    });
  }

  @Get('services')
  async listServices(@Query() query: ServiceQueryDto) {
    const result = await this.searchServices.execute(query);
    if (query.search) {
      this.logSearch.execute({
        query: query.search,
        regionId: query.regionId,
        topicIds: query.topicId ? [query.topicId] : [],
        resultsCount: result.meta.total,
      }).catch(() => {});
    }
    return result;
  }

  @Get('services/:id')
  async getService(@Param('id') id: string) {
    const service = await this.getOneService.execute(id);
    if (service.status !== ServiceStatus.PUBLISHED) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  @Post('needs')
  async submitNeed(@Body() dto: CreateNeedDto) {
    return this.createNeed.execute(dto);
  }
}
