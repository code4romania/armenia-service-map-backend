import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../../modules/taxonomy/taxonomy.service.js';
import { EntityStatus } from '../../common/enums/entity-status.enum.js';

@Injectable()
export class UpdateTopicUseCase {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  async execute(id: string, data: {
    name?: string;
    slug?: string;
    icon?: string;
    parentId?: string | null;
    status?: EntityStatus;
    sortOrder?: number;
    subtopics?: Array<{ id?: string; name: string; status: EntityStatus; sortOrder: number }>;
    removedSubtopicIds?: string[];
  }) {
    return this.taxonomyService.updateTopic(id, data);
  }
}
