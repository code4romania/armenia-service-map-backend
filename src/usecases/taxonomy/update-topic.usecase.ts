import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';

@Injectable()
export class UpdateTopicUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(id: string, data: { name?: string; slug?: string; icon?: string; sortOrder?: number }) {
    return this.taxonomyService.updateTopic(id, data);
  }
}
