import { IsOptional, IsUUID, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { ServiceStatus } from '../../../common/enums/service-status.enum.js';

export class ServiceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}
