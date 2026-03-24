import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service.js';

@Module({
  providers: [OrganisationsService],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
