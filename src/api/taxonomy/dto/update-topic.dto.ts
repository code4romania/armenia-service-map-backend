import { IsString, IsOptional, IsInt, Min, IsEnum, IsUUID } from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum.js';

export class UpdateTopicDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
