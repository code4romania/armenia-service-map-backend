import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';

@Injectable()
export class UpdateNeedTagUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(id: string, data: { name?: string; slug?: string }) {
    return this.taxonomyService.updateNeedTag(id, data);
  }
}
