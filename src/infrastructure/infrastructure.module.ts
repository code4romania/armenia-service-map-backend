import { Global, Module } from '@nestjs/common';
import { DomainExceptionService } from './exceptions/domain-exception.service.js';

@Global()
@Module({
  providers: [DomainExceptionService],
  exports: [DomainExceptionService],
})
export class InfrastructureModule {}
