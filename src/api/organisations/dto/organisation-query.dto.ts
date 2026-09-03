import { IsEnum, IsOptional } from 'class-validator';
import { SortableQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { OrganisationStatus } from '../../../common/enums/organisation-status.enum.js';

export const ORGANISATION_SORT_FIELDS = [
  'id',
  'name',
  'legalName',
  'country',
  'organisationType',
  'category',
  'status',
  'submissionSource',
  'reviewedAt',
  'createdAt',
  'updatedAt',
] as const;

export class OrganisationQueryDto extends SortableQueryDto(ORGANISATION_SORT_FIELDS, 'name') {
  @IsOptional()
  @IsEnum(OrganisationStatus)
  status?: OrganisationStatus;
}
