import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { EntityStatus } from '../../common/enums/entity-status.enum.js';

@Injectable()
export class GetManyTopicsUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(query: PaginationQuery & { search?: string; status?: EntityStatus }) {
    return this.taxonomyService.findManyTopics(query);
  }
}
