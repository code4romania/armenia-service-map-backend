import { IsString, IsOptional, IsEnum } from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum.js';

export class CreateNeedTagDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
