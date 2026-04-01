import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum.js';

export class CreateTargetGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
