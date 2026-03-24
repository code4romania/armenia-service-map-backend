import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service.js';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly usersService: UsersService) {}
  async execute(id: string) {
    return this.usersService.softDelete(id);
  }
}
