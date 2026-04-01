import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';
import { EntityStatus } from '../../common/enums/entity-status.enum.js';

@Injectable()
export class UpdateNeedTagUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(id: string, data: { name?: string; slug?: string; status?: EntityStatus }) {
    return this.taxonomyService.updateNeedTag(id, data);
  }
}
