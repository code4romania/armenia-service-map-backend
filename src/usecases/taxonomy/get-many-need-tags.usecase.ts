import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';

@Injectable()
export class GetManyNeedTagsUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(query: PaginationQuery & { search?: string }) {
    return this.taxonomyService.findManyNeedTags(query);
  }
}
