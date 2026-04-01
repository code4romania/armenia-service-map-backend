import { Injectable } from '@nestjs/common';
import { NeedsService } from '../../modules/needs/needs.service.js';
import { NeedStatus } from '../../common/enums/need-status.enum.js';

@Injectable()
export class UpdateNeedUseCase {
  constructor(private readonly needsService: NeedsService) {}
  async execute(id: string, data: { title?: string; status?: NeedStatus; assignedOrganisationId?: string | null; tagIds?: string[] }, actorUserId?: string) {
    return this.needsService.update(id, data, actorUserId);
  }
}
