import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { Role } from '../../common/enums/role.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';

@Injectable()
export class GetManyUsersUseCase {
  constructor(private readonly usersService: UsersService) {}
  async execute(
    query: PaginationQuery & {
      search?: string;
      organisationId?: string;
      status?: UserStatus;
      role?: Role;
    },
  ) {
    return this.usersService.findMany(query);
  }
}
