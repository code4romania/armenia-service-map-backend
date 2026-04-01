import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';
import { EntityStatus } from '../../common/enums/entity-status.enum.js';

@Injectable()
export class CreateTargetGroupUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(data: { name: string; status?: EntityStatus }) {
    return this.taxonomyService.createTargetGroup(data);
  }
}
