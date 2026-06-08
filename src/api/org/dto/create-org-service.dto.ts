import { IsString, IsOptional, IsBoolean, IsUUID, IsArray, IsDateString, IsEnum } from 'class-validator';
import { ServiceStatus } from '../../../common/enums/service-status.enum.js';

export class CreateOrgServiceDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  titleHy?: string;

  @IsString()
  shortDescription: string;

  @IsOptional()
  @IsString()
  shortDescriptionHy?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  descriptionHy?: string;

  @IsString()
  howToAccess: string;

  @IsOptional()
  @IsString()
  howToAccessHy?: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsDateString()
  availabilityStart?: string;

  @IsOptional()
  @IsDateString()
  availabilityEnd?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  targetGroupIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  topicIds?: string[];
}
