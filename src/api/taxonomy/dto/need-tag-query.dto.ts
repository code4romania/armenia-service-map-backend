import { SortableQueryDto } from '../../../common/dto/pagination-query.dto.js';

export const NEED_TAG_SORT_FIELDS = ['id', 'name', 'slug', 'status', 'createdAt', 'updatedAt'] as const;

export class NeedTagQueryDto extends SortableQueryDto(NEED_TAG_SORT_FIELDS, 'name') {}
