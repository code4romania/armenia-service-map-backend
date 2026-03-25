import { Injectable } from '@nestjs/common';
import { NeedsService } from '../../modules/needs/needs.service.js';

@Injectable()
export class GetNeedsMapUseCase {
  constructor(private readonly needsService: NeedsService) {}
  async execute(assignedOrganisationId?: string) {
    return this.needsService.getMapAggregation(assignedOrganisationId);
  }
}
