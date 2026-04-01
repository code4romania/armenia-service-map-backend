import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service.js';

@Injectable()
export class DeactivateUserUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(id: string) {
    return this.usersService.deactivate(id);
  }
}
