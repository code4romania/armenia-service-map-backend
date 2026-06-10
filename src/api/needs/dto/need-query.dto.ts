import { IsOptional, IsUUID, IsEnum, IsArray, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
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
