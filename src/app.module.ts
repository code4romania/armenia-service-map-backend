import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './infrastructure/prisma/prisma.module.js';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';
import { validate } from './infrastructure/config/app.config.js';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard.js';
import { RolesGuard } from './infrastructure/guards/roles.guard.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ApiModule } from './api/api.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    PrismaModule,
    InfrastructureModule,
    AuthModule,
    ApiModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
