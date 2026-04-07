import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class PublicSearchLogEventDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsUUID()
  regionId?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  topicIds?: string[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  resultsCount: number;
}

export class LogPublicSearchBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicSearchLogEventDto)
  events: PublicSearchLogEventDto[];
}
