import { Injectable } from '@nestjs/common';
import { NeedsService } from '../../modules/needs/needs.service.js';
import { PaginationQuery } from '../../common/interfaces/pagination.interface.js';
import { NeedStatus } from '../../common/enums/need-status.enum.js';

@Injectable()
export class GetManyNeedsUseCase {
  constructor(private readonly needsService: NeedsService) {}
  async execute(query: PaginationQuery & { search?: string; status?: NeedStatus; regionId?: string; assignedOrganisationId?: string; tagId?: string }) {
    return this.needsService.findMany(query);
  }
}
