import { IsOptional, IsUUID, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { SortableQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { ServiceStatus } from '../../../common/enums/service-status.enum.js';

export const SERVICE_SORT_FIELDS = [
  'id',
  'title',
  'titleHy',
  'status',
  'isAvailable',
  'availabilityStart',
  'availabilityEnd',
  'createdAt',
  'updatedAt',
] as const;

export class ServiceQueryDto extends SortableQueryDto(SERVICE_SORT_FIELDS, 'title') {
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;

  // Comma-separated topic ids; matches services tagged with ANY of them (union).
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((id) => id.trim()).filter(Boolean)
      : value,
  )
  @IsUUID('4', { each: true })
  topicIds?: string[];

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}
