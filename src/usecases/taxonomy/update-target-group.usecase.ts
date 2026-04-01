import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';
import { EntityStatus } from '../../common/enums/entity-status.enum.js';

@Injectable()
export class UpdateTargetGroupUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(id: string, data: { name?: string; status?: EntityStatus }) {
    return this.taxonomyService.updateTargetGroup(id, data);
  }
}
