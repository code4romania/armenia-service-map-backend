import { Module } from '@nestjs/common';
import { TaxonomyModule } from '../modules/taxonomy/taxonomy.module.js';
import { OrganisationsModule } from '../modules/organisations/organisations.module.js';
import { UsersModule } from '../modules/users/users.module.js';
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

@Module({
  imports: [TaxonomyModule, OrganisationsModule, UsersModule],
  providers: [...taxonomyUseCases, ...organisationUseCases, ...userUseCases],
  exports: [...taxonomyUseCases, ...organisationUseCases, ...userUseCases],
})
export class UseCaseModule {}
