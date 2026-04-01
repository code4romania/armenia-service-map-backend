import { Injectable } from '@nestjs/common';
import { NeedsService } from '../../modules/needs/needs.service.js';

@Injectable()
export class AddNeedCommentUseCase {
  constructor(private readonly needsService: NeedsService) {}

  async execute(needId: string, userId: string, content: string) {
    return this.needsService.addComment(needId, userId, content);
  }
}
