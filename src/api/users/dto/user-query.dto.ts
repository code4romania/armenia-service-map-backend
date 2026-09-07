import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { SortableQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { Role } from '../../../common/enums/role.enum.js';
import { UserStatus } from '../../../common/enums/user-status.enum.js';

export const USER_SORT_FIELDS = [
  'id',
  'email',
  'firstName',
  'lastName',
  'phone',
  'status',
  'role',
  'lastAccessAt',
  'createdAt',
  'updatedAt',
] as const;

export class UserQueryDto extends SortableQueryDto(
  USER_SORT_FIELDS,
  'firstName',
) {
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  /** `deleted=true` lists soft-deleted users (for the restore view). */
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  deleted?: boolean;
}
