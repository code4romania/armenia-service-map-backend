import { IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { NeedStatus } from '../../../common/enums/need-status.enum.js';

export class UpdateNeedDto {
  @IsOptional()
  @IsEnum(NeedStatus)
  status?: NeedStatus;

  @IsOptional()
  @IsUUID()
  assignedOrganisationId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];
}
