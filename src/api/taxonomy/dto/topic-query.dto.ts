import { SortableQueryDto } from '../../../common/dto/pagination-query.dto.js';

export const TOPIC_SORT_FIELDS = [
  'id',
  'name',
  'slug',
  'status',
  'sortOrder',
  'createdAt',
  'updatedAt',
] as const;

export class TopicQueryDto extends SortableQueryDto(TOPIC_SORT_FIELDS, 'sortOrder') {}
