import { SortableQueryDto } from '../../../common/dto/pagination-query.dto.js';

export const TARGET_GROUP_SORT_FIELDS = ['id', 'name', 'status', 'createdAt', 'updatedAt'] as const;

export class TargetGroupQueryDto extends SortableQueryDto(TARGET_GROUP_SORT_FIELDS, 'name') {}
