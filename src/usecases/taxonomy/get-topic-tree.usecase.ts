import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';

@Injectable()
export class GetTopicTreeUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute() {
    return this.taxonomyService.getTopicTree();
  }
}
