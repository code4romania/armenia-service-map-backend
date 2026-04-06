import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';
import { EntityStatus } from '../../common/enums/entity-status.enum.js';

@Injectable()
export class CreateNeedTagUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(data: { name: string; slug?: string; status?: EntityStatus }) {
    return this.taxonomyService.createNeedTag(data);
  }
}
