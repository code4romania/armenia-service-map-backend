import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';
import { EntityStatus } from '../../common/enums/entity-status.enum.js';

@Injectable()
export class CreateTopicUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(data: {
    name: string;
    slug?: string;
    icon?: string;
    parentId?: string;
    status?: EntityStatus;
    sortOrder?: number;
    subtopics?: Array<{ id?: string; name: string; status: EntityStatus; sortOrder: number }>;
  }) {
    return this.taxonomyService.createTopic(data);
  }
}
