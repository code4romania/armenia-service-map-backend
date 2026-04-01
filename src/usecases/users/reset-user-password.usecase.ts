import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service.js';

@Injectable()
export class ResetUserPasswordUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(id: string) {
    return this.usersService.resetPassword(id);
  }
}
