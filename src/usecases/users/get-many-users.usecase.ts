import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';

@Injectable()
export class GetManyUsersUseCase {
  constructor(private readonly usersService: UsersService) {}
  async execute(query: PaginationQuery & { search?: string; organisationId?: string }) {
    return this.usersService.findMany(query);
  }
}
