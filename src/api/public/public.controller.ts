import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { SearchServicesUseCase } from '../../usecases/services/search-services.usecase.js';
import { GetOneServiceUseCase } from '../../usecases/services/get-one-service.usecase.js';
import { CreateNeedUseCase } from '../../usecases/needs/create-need.usecase.js';
import { ServiceQueryDto } from '../services/dto/service-query.dto.js';
import { CreateNeedDto } from '../needs/dto/create-need.dto.js';

@Controller('public')
@Public()
export class PublicController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchServices: SearchServicesUseCase,
    private readonly getOneService: GetOneServiceUseCase,
    private readonly createNeed: CreateNeedUseCase,
  ) {}

  @Get('regions')
  async listRegions() {
    return this.prisma.region.findMany({
      orderBy: { name: 'asc' },
    });
  }

  @Get('topics')
  async listTopics() {
    return this.prisma.topic.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Get('services')
  async listServices(@Query() query: ServiceQueryDto) {
    return this.searchServices.execute(query);
  }

  @Get('services/:id')
  async getService(@Param('id') id: string) {
    return this.getOneService.execute(id);
  }

  @Post('needs')
  async submitNeed(@Body() dto: CreateNeedDto) {
    return this.createNeed.execute(dto);
  }
}
