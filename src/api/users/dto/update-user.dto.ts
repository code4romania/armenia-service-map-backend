import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Role } from '../../../common/enums/role.enum.js';
import { UserStatus } from '../../../common/enums/user-status.enum.js';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
