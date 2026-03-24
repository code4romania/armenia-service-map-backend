import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Role } from '../../../common/enums/role.enum.js';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
