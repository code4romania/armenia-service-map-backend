import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller.js';
import { TaxonomyController } from './taxonomy/taxonomy.controller.js';
import { PublicController } from './public/public.controller.js';
import { OrganisationsController } from './organisations/organisations.controller.js';
import { UsersController } from './users/users.controller.js';
import { AuthModule } from '../modules/auth/auth.module.js';
import { UseCaseModule } from '../usecases/use-case.module.js';

@Module({
  imports: [AuthModule, UseCaseModule],
  controllers: [AuthController, PublicController, TaxonomyController, OrganisationsController, UsersController],
})
export class ApiModule {}
