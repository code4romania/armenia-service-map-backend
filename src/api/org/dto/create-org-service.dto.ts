import { IsString, IsOptional, IsBoolean, IsUUID, IsArray, IsDateString } from 'class-validator';

export class CreateOrgServiceDto {
  @IsString()
  title: string;

  @IsString()
  shortDescription: string;

  @IsString()
  description: string;

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
