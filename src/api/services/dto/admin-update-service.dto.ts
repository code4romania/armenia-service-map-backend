import { IsString, IsOptional, IsUUID } from 'class-validator';
import { UpdateServiceDto } from './update-service.dto.js';

export class AdminUpdateServiceDto extends UpdateServiceDto {
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @IsOptional()
  @IsString()
  externalOrganisationName?: string;
}
