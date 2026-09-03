import { IsEnum, IsOptional } from 'class-validator';
import { SortableQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { UserStatus } from '../../../common/enums/user-status.enum.js';
import { USER_SORT_FIELDS } from '../../users/dto/user-query.dto.js';

export class OrgUserQueryDto extends SortableQueryDto(USER_SORT_FIELDS, 'firstName') {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
