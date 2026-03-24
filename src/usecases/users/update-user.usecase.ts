import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service.js';
import { Role } from '../../common/enums/role.enum.js';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly usersService: UsersService) {}
  async execute(id: string, data: {
    firstName?: string;
    lastName?: string;
    role?: Role;
    organisationId?: string;
  }) {
    return this.usersService.update(id, data);
  }
}
