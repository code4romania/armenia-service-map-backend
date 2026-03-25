import { Module } from '@nestjs/common';
import { TaxonomyModule } from '../modules/taxonomy/taxonomy.module.js';
import { OrganisationsModule } from '../modules/organisations/organisations.module.js';
import { UsersModule } from '../modules/users/users.module.js';
import { ServicesModule } from '../modules/services/services.module.js';
import { NeedsModule } from '../modules/needs/needs.module.js';
// Taxonomy
import { GetManyTopicsUseCase } from './taxonomy/get-many-topics.usecase.js';
import { CreateTopicUseCase } from './taxonomy/create-topic.usecase.js';
import { UpdateTopicUseCase } from './taxonomy/update-topic.usecase.js';
import { DeleteTopicUseCase } from './taxonomy/delete-topic.usecase.js';
import { GetManyNeedTagsUseCase } from './taxonomy/get-many-need-tags.usecase.js';
import { CreateNeedTagUseCase } from './taxonomy/create-need-tag.usecase.js';
import { UpdateNeedTagUseCase } from './taxonomy/update-need-tag.usecase.js';
import { DeleteNeedTagUseCase } from './taxonomy/delete-need-tag.usecase.js';
// Organisations
import { GetManyOrganisationsUseCase } from './organisations/get-many-organisations.usecase.js';
import { GetOneOrganisationUseCase } from './organisations/get-one-organisation.usecase.js';
import { CreateOrganisationUseCase } from './organisations/create-organisation.usecase.js';
import { UpdateOrganisationUseCase } from './organisations/update-organisation.usecase.js';
import { DeleteOrganisationUseCase } from './organisations/delete-organisation.usecase.js';
// Users
import { GetManyUsersUseCase } from './users/get-many-users.usecase.js';
import { GetOneUserUseCase } from './users/get-one-user.usecase.js';
import { CreateUserUseCase } from './users/create-user.usecase.js';
import { UpdateUserUseCase } from './users/update-user.usecase.js';
import { DeleteUserUseCase } from './users/delete-user.usecase.js';
// Services
import { GetManyServicesUseCase } from './services/get-many-services.usecase.js';
import { GetOneServiceUseCase } from './services/get-one-service.usecase.js';
import { CreateServiceUseCase } from './services/create-service.usecase.js';
import { UpdateServiceUseCase } from './services/update-service.usecase.js';
import { DeleteServiceUseCase } from './services/delete-service.usecase.js';
import { SearchServicesUseCase } from './services/search-services.usecase.js';
// Needs
import { GetManyNeedsUseCase } from './needs/get-many-needs.usecase.js';
import { GetOneNeedUseCase } from './needs/get-one-need.usecase.js';
import { CreateNeedUseCase } from './needs/create-need.usecase.js';
import { UpdateNeedUseCase } from './needs/update-need.usecase.js';
import { AssignNeedUseCase } from './needs/assign-need.usecase.js';
import { DeleteNeedUseCase } from './needs/delete-need.usecase.js';
import { GetNeedsMapUseCase } from './needs/get-needs-map.usecase.js';

const taxonomyUseCases = [
  GetManyTopicsUseCase,
  CreateTopicUseCase,
  UpdateTopicUseCase,
  DeleteTopicUseCase,
  GetManyNeedTagsUseCase,
  CreateNeedTagUseCase,
  UpdateNeedTagUseCase,
  DeleteNeedTagUseCase,
];

const organisationUseCases = [
  GetManyOrganisationsUseCase,
  GetOneOrganisationUseCase,
  CreateOrganisationUseCase,
  UpdateOrganisationUseCase,
  DeleteOrganisationUseCase,
];

const userUseCases = [
  GetManyUsersUseCase,
  GetOneUserUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
];

const serviceUseCases = [
  GetManyServicesUseCase,
  GetOneServiceUseCase,
  CreateServiceUseCase,
  UpdateServiceUseCase,
  DeleteServiceUseCase,
  SearchServicesUseCase,
];

const needUseCases = [
  GetManyNeedsUseCase,
  GetOneNeedUseCase,
  CreateNeedUseCase,
  UpdateNeedUseCase,
  AssignNeedUseCase,
  DeleteNeedUseCase,
  GetNeedsMapUseCase,
];

@Module({
  imports: [TaxonomyModule, OrganisationsModule, UsersModule, ServicesModule, NeedsModule],
  providers: [...taxonomyUseCases, ...organisationUseCases, ...userUseCases, ...serviceUseCases, ...needUseCases],
  exports: [...taxonomyUseCases, ...organisationUseCases, ...userUseCases, ...serviceUseCases, ...needUseCases],
})
export class UseCaseModule {}
