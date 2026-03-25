import { Injectable } from '@nestjs/common';
import { NeedsService } from '../../modules/needs/needs.service.js';

@Injectable()
export class CreateNeedUseCase {
  constructor(private readonly needsService: NeedsService) {}
  async execute(data: {
    description: string;
    fullName: string;
    contactMethod: string;
    contactValue: string;
    regionId?: string;
    tagIds?: string[];
  }) {
    return this.needsService.create(data);
  }
}
