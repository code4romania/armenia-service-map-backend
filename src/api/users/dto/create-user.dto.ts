import { IsString, IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Role } from '../../../common/enums/role.enum.js';
import { UserStatus } from '../../../common/enums/user-status.enum.js';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
