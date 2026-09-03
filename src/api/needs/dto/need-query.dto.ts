import { IsOptional, IsUUID, IsEnum, IsArray, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { SortableQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { NeedStatus } from '../../../common/enums/need-status.enum.js';

export const NEED_SORT_FIELDS = ['id', 'title', 'fullName', 'status', 'createdAt', 'updatedAt'] as const;

export class NeedQueryDto extends SortableQueryDto(NEED_SORT_FIELDS, 'createdAt') {
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

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds?: string[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
