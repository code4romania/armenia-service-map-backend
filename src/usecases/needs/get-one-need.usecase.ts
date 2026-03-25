import { Injectable } from '@nestjs/common';
import { NeedsService } from '../../modules/needs/needs.service.js';

@Injectable()
export class GetOneNeedUseCase {
  constructor(private readonly needsService: NeedsService) {}
  async execute(id: string) {
    return this.needsService.findOne(id);
  }
}
