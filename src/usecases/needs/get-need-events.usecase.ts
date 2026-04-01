import { Injectable } from '@nestjs/common';
import { NeedsService } from '../../modules/needs/needs.service.js';

@Injectable()
export class GetNeedEventsUseCase {
  constructor(private readonly needsService: NeedsService) {}

  async execute(needId: string) {
    return this.needsService.getEvents(needId);
  }
}
