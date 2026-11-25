import { Injectable } from '@nestjs/common';
import { FeedbackService } from '../../modules/feedback/feedback.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import type { FeedbackFound, FeedbackKarabakh, FeedbackUsefulness } from '../../generated/prisma/enums.js';

export type SubmitFeedbackInput = {
  usefulness: FeedbackUsefulness;
  found: FeedbackFound;
  lookingFor?: string;
  fromKarabakh: FeedbackKarabakh;
  locale: 'hy' | 'en';
  pagePath: string;
  serviceId?: string;
};

@Injectable()
export class SubmitFeedbackUseCase {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: SubmitFeedbackInput): Promise<{ id: string }> {
    const trimmed = input.lookingFor?.trim();
    const lookingFor = input.found !== 'YES' && trimmed ? trimmed : null;

    let serviceId: string | null = null;
    if (input.serviceId) {
      const service = await this.prisma.service.findFirst({
        where: { id: input.serviceId, deletedAt: null },
        select: { id: true },
      });
      serviceId = service ? service.id : null;
    }

    return this.feedbackService.create({
      usefulness: input.usefulness,
      found: input.found,
      lookingFor,
      fromKarabakh: input.fromKarabakh,
      locale: input.locale,
      pagePath: input.pagePath,
      serviceId,
    });
  }
}
