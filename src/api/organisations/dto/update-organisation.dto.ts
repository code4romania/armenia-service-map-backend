import { IsString, IsOptional, IsEmail, IsUUID, IsArray, IsEnum } from 'class-validator';
import { OrganisationStatus } from '../../../common/enums/organisation-status.enum.js';

export class UpdateOrganisationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  organisationType?: string;

  @IsOptional()
  @IsString()
  uniqueIdentifier?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  activityDomain?: string;

  @IsOptional()
  @IsString()
  legalRepName?: string;

  @IsOptional()
  @IsEmail()
  legalRepEmail?: string;

  @IsOptional()
  @IsString()
  legalRepPhone?: string;

  @IsOptional()
  @IsString()
  contactPersonName?: string;

  @IsOptional()
  @IsEmail()
  contactPersonEmail?: string;

  @IsOptional()
  @IsString()
  contactPersonPhone?: string;

  @IsOptional()
  @IsString()
  legalDocumentUrl?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsEnum(OrganisationStatus)
  status?: OrganisationStatus;
}
