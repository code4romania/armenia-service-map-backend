import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Controller('public')
@Public()
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

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
}
