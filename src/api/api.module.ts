import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller.js';
import { TaxonomyController } from './taxonomy/taxonomy.controller.js';
import { PublicController } from './public/public.controller.js';
import { OrganisationsController } from './organisations/organisations.controller.js';
import { UsersController } from './users/users.controller.js';
import { ServicesController } from './services/services.controller.js';
import { OrgServicesController } from './org/org-services.controller.js';
import { NeedsController } from './needs/needs.controller.js';
import { OrgNeedsController } from './org/org-needs.controller.js';
import { AnalyticsController } from './analytics/analytics.controller.js';
import { OrgAnalyticsController } from './org/org-analytics.controller.js';
import { OrgProfileController } from './org/org-profile.controller.js';
import { UploadController } from './upload/upload.controller.js';
import { NotificationsController } from './notifications/notifications.controller.js';
import { AuthModule } from '../modules/auth/auth.module.js';
import { UseCaseModule } from '../usecases/use-case.module.js';
import { ServicesModule } from '../modules/services/services.module.js';
import { NeedsModule } from '../modules/needs/needs.module.js';

@Module({
  imports: [AuthModule, UseCaseModule, ServicesModule, NeedsModule],
  controllers: [AuthController, PublicController, TaxonomyController, OrganisationsController, UsersController, ServicesController, OrgServicesController, NeedsController, OrgNeedsController, AnalyticsController, OrgAnalyticsController, OrgProfileController, UploadController, NotificationsController],
})
export class ApiModule {}
