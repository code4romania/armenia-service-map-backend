import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { Role } from '../../common/enums/role.enum.js';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly exceptions: DomainExceptionService,
  ) {}
  async execute(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    organisationId?: string;
    password?: string;
  }) {
    if (data.role === Role.ORG_ADMIN && !data.organisationId) {
      throw this.exceptions.badRequest(
        'An organisation is required for an Org Admin user',
      );
    }
    return this.usersService.create(data);
  }
}
