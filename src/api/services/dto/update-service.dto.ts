import { IsString, IsOptional, IsBoolean, IsUUID, IsArray, IsDateString } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsDateString()
  availabilityStart?: string;

  @IsOptional()
  @IsDateString()
  availabilityEnd?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetGroup?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  topicIds?: string[];
}
