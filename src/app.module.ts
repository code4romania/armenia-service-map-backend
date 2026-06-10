import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './infrastructure/prisma/prisma.module.js';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';
import { validate } from './infrastructure/config/app.config.js';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard.js';
import { RolesGuard } from './infrastructure/guards/roles.guard.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module.js';
import { OrganisationsModule } from './modules/organisations/organisations.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { ServicesModule } from './modules/services/services.module.js';
import { NeedsModule } from './modules/needs/needs.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { EmailModule } from './infrastructure/email/email.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
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
    TaxonomyModule,
    OrganisationsModule,
    UsersModule,
    ServicesModule,
    NeedsModule,
    AnalyticsModule,
    UploadModule,
    EmailModule,
    NotificationsModule,
    ApiModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
