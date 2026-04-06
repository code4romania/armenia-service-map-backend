import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';

@Injectable()
export class GetOneNeedTagUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(id: string) {
    return this.taxonomyService.findOneNeedTag(id);
  }
}
