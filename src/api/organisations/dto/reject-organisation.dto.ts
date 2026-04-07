import { IsOptional, IsString } from 'class-validator';

export class RejectOrganisationDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
