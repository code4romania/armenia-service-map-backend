import { IsString, IsOptional, IsBoolean, IsUUID, IsArray, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { ServiceStatus } from '../../../common/enums/service-status.enum.js';

export class CreateServiceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @IsNotEmpty()
  titleHy: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsString()
  @IsNotEmpty()
  shortDescriptionHy: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  descriptionHy: string;

  @IsOptional()
  @IsString()
  howToAccess?: string;

  @IsString()
  @IsNotEmpty()
  howToAccessHy: string;

  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @IsOptional()
  @IsString()
  externalOrganisationName?: string;

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
