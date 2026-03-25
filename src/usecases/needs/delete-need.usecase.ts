import { Injectable } from '@nestjs/common';
import { NeedsService } from '../../modules/needs/needs.service.js';

@Injectable()
export class DeleteNeedUseCase {
  constructor(private readonly needsService: NeedsService) {}
  async execute(id: string) {
    return this.needsService.delete(id);
  }
}
