import { Injectable } from '@nestjs/common';
import { NeedsService } from '../../modules/needs/needs.service.js';

@Injectable()
export class AssignNeedUseCase {
  constructor(private readonly needsService: NeedsService) {}
  async execute(id: string, organisationId: string, actorUserId?: string) {
    return this.needsService.assign(id, organisationId, actorUserId);
  }
}
