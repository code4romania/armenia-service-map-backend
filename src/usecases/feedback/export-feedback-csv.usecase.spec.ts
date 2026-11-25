import { ExportFeedbackCsvUseCase } from './export-feedback-csv.usecase';

describe('ExportFeedbackCsvUseCase', () => {
  const row = {
    id: 'f1',
    createdAt: new Date('2026-03-01T20:30:00.000Z'),
    usefulness: 'NOT_AT_ALL',
    found: 'PARTLY',
    lookingFor: 'jobs',
    fromKarabakh: 'PREFER_NOT_TO_SAY',
    locale: 'en',
    pagePath: '/services',
    serviceId: null,
    service: null,
  };

  it('exports English labels, +04:00 timestamps, empty service title', async () => {
    const feedbackService = { findAll: jest.fn().mockResolvedValue([row]) };
    const uc = new ExportFeedbackCsvUseCase(feedbackService as any);
    const { csv, filename } = await uc.execute({});
    expect(filename).toMatch(/^feedback-\d{4}-\d{2}-\d{2}\.csv$/);
    const lines = csv.slice(1).split('\r\n');
    expect(lines[0]).toBe(
      '"created_at","usefulness","found","looking_for","from_karabakh","locale","page","service_title"',
    );
    expect(lines[1]).toBe(
      '"2026-03-02T00:30:00.000+04:00","Not at all useful","Partly","jobs","Prefer not to say","en","/services",""',
    );
  });

  it('uses titleHy then title for the service', async () => {
    const withService = { ...row, service: { id: 's', title: 'En', titleHy: 'Հայ', deletedAt: null } };
    const feedbackService = { findAll: jest.fn().mockResolvedValue([withService]) };
    const { csv } = await new ExportFeedbackCsvUseCase(feedbackService as any).execute({});
    expect(csv).toContain('"Հայ"');
  });
});
