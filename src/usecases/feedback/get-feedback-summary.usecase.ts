import { Injectable } from '@nestjs/common';
import {
  FeedbackService,
  type FeedbackFilters,
  type FeedbackSummary,
} from '../../modules/feedback/feedback.service.js';

@Injectable()
export class GetFeedbackSummaryUseCase {
  constructor(private readonly feedbackService: FeedbackService) {}

  execute(filters: FeedbackFilters): Promise<FeedbackSummary> {
    return this.feedbackService.summary(filters);
  }
}
