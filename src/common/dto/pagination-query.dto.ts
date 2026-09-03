import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Pagination query whose `sortBy` is restricted to an explicit allowlist of
 * columns. `sortBy` is forwarded verbatim into a Prisma `orderBy`, so every
 * list endpoint must name the columns it is willing to sort on; anything else
 * is rejected with a 400 instead of reaching the database.
 */
export function SortableQueryDto<const T extends readonly string[]>(
  allowed: T,
  defaultSort: T[number],
) {
  class SortableQuery extends PaginationQueryDto {
    @IsOptional()
    @IsIn(allowed as unknown as string[])
    sortBy?: T[number] = defaultSort;
  }
  return SortableQuery;
}
