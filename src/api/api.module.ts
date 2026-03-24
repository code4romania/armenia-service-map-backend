import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller.js';
import { AuthModule } from '../modules/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AuthController],
})
export class ApiModule {}
