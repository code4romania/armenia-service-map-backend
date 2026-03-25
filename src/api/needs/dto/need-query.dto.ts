import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { NeedStatus } from '../../../common/enums/need-status.enum.js';

export class NeedQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(NeedStatus)
  status?: NeedStatus;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  assignedOrganisationId?: string;

  @IsOptional()
  @IsUUID()
  tagId?: string;
}
