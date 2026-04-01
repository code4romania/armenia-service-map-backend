import { IsString, IsOptional, IsBoolean, IsUUID, IsArray, IsDateString, IsEnum } from 'class-validator';
import { ServiceStatus } from '../../../common/enums/service-status.enum.js';

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
