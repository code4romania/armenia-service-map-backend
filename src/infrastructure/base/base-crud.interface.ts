import { PaginatedResult, PaginationQuery } from '../../common/interfaces/pagination.interface.js';

export interface ICrudService<TCreate, TUpdate, TResult> {
  create(data: TCreate): Promise<TResult>;
  findOne(id: string): Promise<TResult>;
  findMany(query: PaginationQuery & { search?: string }): Promise<PaginatedResult<TResult>>;
  update(id: string, data: TUpdate): Promise<TResult>;
  remove(id: string): Promise<void>;
}
