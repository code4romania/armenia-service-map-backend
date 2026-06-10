import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EmailService,
      useFactory: (configService: ConfigService) => new EmailService(configService),
      inject: [ConfigService],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
