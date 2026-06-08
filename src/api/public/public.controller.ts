import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { SearchServicesUseCase } from '../../usecases/services/search-services.usecase.js';
import { GetOneServiceUseCase } from '../../usecases/services/get-one-service.usecase.js';
import { CreateNeedUseCase } from '../../usecases/needs/create-need.usecase.js';
import { LogSearchUseCase } from '../../usecases/analytics/log-search.usecase.js';
import { CreateJoinNetworkRequestUseCase } from '../../usecases/organisations/create-join-network-request.usecase.js';
import { CreateSubscriptionUseCase } from '../../usecases/subscriptions/create-subscription.usecase.js';
import { UnsubscribeUseCase } from '../../usecases/subscriptions/unsubscribe.usecase.js';
import { ServiceQueryDto } from '../services/dto/service-query.dto.js';
import { CreateNeedDto } from '../needs/dto/create-need.dto.js';
import { JoinNetworkDto } from './dto/join-network.dto.js';
import { LogPublicSearchBatchDto } from './dto/log-public-search-batch.dto.js';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';
import { UnsubscribeDto } from './dto/unsubscribe.dto.js';
import { EntityStatus } from '../../common/enums/entity-status.enum.js';
import { withAvailabilityState } from '../../common/availability/availability-state.js';

@Controller('public')
@Public()
export class PublicController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchServices: SearchServicesUseCase,
    private readonly getOneService: GetOneServiceUseCase,
    private readonly createNeed: CreateNeedUseCase,
    private readonly logSearch: LogSearchUseCase,
    private readonly createJoinNetworkRequest: CreateJoinNetworkRequestUseCase,
    private readonly createSubscription: CreateSubscriptionUseCase,
    private readonly unsubscribe: UnsubscribeUseCase,
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
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            sortOrder: true,
          },
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
    return this.searchServices.execute(query);
  }

  @Post('search-logs/batch')
  async logPublicSearchBatch(@Body() dto: LogPublicSearchBatchDto) {
    await this.logSearch.executeBatch(dto.events);
    return { ok: true };
  }

  @Get('services/:id')
  async getService(@Param('id') id: string) {
    const service = await this.getOneService.execute(id);
    if (service.status !== 'PUBLISHED') {
      throw new NotFoundException('Service not found');
    }
    // availabilityState is decorated here (not in GetOneServiceUseCase) so it stays
    // public-only — that use case is also shared by the admin and org controllers.
    return withAvailabilityState(service, new Date());
  }

  @Post('needs')
  async submitNeed(@Body() dto: CreateNeedDto) {
    return this.createNeed.execute(dto);
  }

  @Post('join-network')
  async submitJoinNetwork(@Body() dto: JoinNetworkDto) {
    return this.createJoinNetworkRequest.execute(dto);
  }

  @Post('subscriptions')
  async subscribe(@Body() dto: CreateSubscriptionDto) {
    return this.createSubscription.execute(dto);
  }

  @Post('subscriptions/unsubscribe')
  async unsubscribeFromServices(@Body() dto: UnsubscribeDto) {
    return this.unsubscribe.execute(dto.token);
  }
}
