import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';

@Injectable()
export class CreateNeedTagUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(data: { name: string; slug: string }) {
    return this.taxonomyService.createNeedTag(data);
  }
}
