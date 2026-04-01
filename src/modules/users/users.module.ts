import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { EmailModule } from '../email/email.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [EmailModule, AuthModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
