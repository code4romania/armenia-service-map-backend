import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service.js';
import { Role } from '../../common/enums/role.enum.js';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersService: UsersService) {}
  async execute(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    organisationId?: string;
    password?: string;
  }) {
    return this.usersService.create(data);
  }
}
