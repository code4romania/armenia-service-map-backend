import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min, IsEnum, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum.js';
import { TopicSubtopicDto } from './topic-subtopic.dto.js';

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicSubtopicDto)
  subtopics?: TopicSubtopicDto[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  removedSubtopicIds?: string[];
}
