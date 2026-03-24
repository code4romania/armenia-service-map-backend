import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';

@Injectable()
export class DeleteNeedTagUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(id: string) {
    return this.taxonomyService.deleteNeedTag(id);
  }
}
