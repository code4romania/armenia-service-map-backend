import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum.js';

export class TopicSubtopicDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  name: string;

  @IsEnum(EntityStatus)
  status: EntityStatus;

  @IsInt()
  @Min(0)
  sortOrder: number;
}
