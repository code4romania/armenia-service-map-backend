import { Module } from '@nestjs/common';
import { NeedsService } from './needs.service.js';

@Module({
  providers: [NeedsService],
  exports: [NeedsService],
})
export class NeedsModule {}
