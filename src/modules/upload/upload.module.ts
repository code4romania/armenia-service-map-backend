import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service.js';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: UploadService,
      useFactory: (configService: ConfigService) => new UploadService(configService),
      inject: [ConfigService],
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
