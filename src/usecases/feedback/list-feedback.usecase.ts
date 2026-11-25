import { Injectable } from '@nestjs/common';
import { FeedbackService, type FeedbackFilters } from '../../modules/feedback/feedback.service.js';
import { paginatedResult } from '../../infrastructure/base/base-crud.service.js';
import type { FeedbackFound, FeedbackKarabakh, FeedbackUsefulness } from '../../generated/prisma/enums.js';

export type FeedbackListItem = {
  id: string;
  createdAt: Date;
  usefulness: FeedbackUsefulness;
  found: FeedbackFound;
  lookingFor: string | null;
  fromKarabakh: FeedbackKarabakh;
  locale: string;
  pagePath: string;
  service: { id: string; title: string; deleted: boolean } | null;
};

@Injectable()
export class ListFeedbackUseCase {
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(filters: FeedbackFilters, page: number, perPage: number) {
    const { rows, total } = await this.feedbackService.list(filters, page, perPage);
    const items: FeedbackListItem[] = rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      usefulness: r.usefulness,
      found: r.found,
      lookingFor: r.lookingFor,
      fromKarabakh: r.fromKarabakh,
      locale: r.locale,
      pagePath: r.pagePath,
      service: r.service
        ? { id: r.service.id, title: r.service.titleHy ?? r.service.title ?? '', deleted: r.service.deletedAt !== null }
        : null,
    }));
    return paginatedResult(items, total, page, perPage);
  }
}
