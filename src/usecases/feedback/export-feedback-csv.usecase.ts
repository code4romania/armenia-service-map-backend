import { Injectable } from '@nestjs/common';
import { FeedbackService, type FeedbackFilters } from '../../modules/feedback/feedback.service.js';
import { toCsv } from '../../common/csv/to-csv.js';

const YEREVAN_OFFSET_MS = 4 * 60 * 60 * 1000;

const USEFULNESS_LABELS: Record<string, string> = {
  NOT_AT_ALL: 'Not at all useful',
  SLIGHTLY: 'Slightly useful',
  MODERATELY: 'Moderately useful',
  VERY: 'Very useful',
  EXTREMELY: 'Extremely useful',
};
const FOUND_LABELS: Record<string, string> = { YES: 'Yes', PARTLY: 'Partly', NO: 'No' };
const KARABAKH_LABELS: Record<string, string> = {
  YES: 'Yes',
  NO: 'No',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

const HEADER = [
  'created_at',
  'usefulness',
  'found',
  'looking_for',
  'from_karabakh',
  'locale',
  'page',
  'service_title',
];

function toYerevanIso(d: Date): string {
  return new Date(d.getTime() + YEREVAN_OFFSET_MS).toISOString().replace('Z', '+04:00');
}

@Injectable()
export class ExportFeedbackCsvUseCase {
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(filters: FeedbackFilters): Promise<{ filename: string; csv: string }> {
    const rows = await this.feedbackService.findAll(filters);
    const csv = toCsv(
      HEADER,
      rows.map((r) => [
        toYerevanIso(r.createdAt),
        USEFULNESS_LABELS[r.usefulness] ?? r.usefulness,
        FOUND_LABELS[r.found] ?? r.found,
        r.lookingFor,
        KARABAKH_LABELS[r.fromKarabakh] ?? r.fromKarabakh,
        r.locale,
        r.pagePath,
        r.service ? (r.service.titleHy ?? r.service.title ?? '') : '',
      ]),
    );
    const today = toYerevanIso(new Date()).slice(0, 10);
    return { filename: `feedback-${today}.csv`, csv };
  }
}
