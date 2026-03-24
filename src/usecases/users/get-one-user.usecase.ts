import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service.js';

@Injectable()
export class GetOneUserUseCase {
  constructor(private readonly usersService: UsersService) {}
  async execute(id: string) {
    return this.usersService.findOne(id);
  }
}
