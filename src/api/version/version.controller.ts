import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const startedAt = new Date().toISOString();

/**
 * Deploy check: which build is running (APP_VERSION / APP_REVISION are baked in from the
 * image build args), when this process started, and the newest migration applied to the DB.
 */
@Controller('version')
@Public()
export class VersionController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getVersion() {
    return {
      version: process.env.APP_VERSION || 'dev',
      revision: process.env.APP_REVISION || 'unknown',
      startedAt,
      lastMigration: await this.findLastMigration(),
    };
  }

  private async findLastMigration() {
    try {
      const rows = await this.prisma.$queryRaw<
        { migration_name: string; finished_at: Date }[]
      >`
        SELECT migration_name, finished_at FROM _prisma_migrations
        WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
        ORDER BY finished_at DESC LIMIT 1`;
      const [row] = rows;
      return row
        ? { name: row.migration_name, appliedAt: row.finished_at.toISOString() }
        : null;
    } catch {
      return null;
    }
  }
}
