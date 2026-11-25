import { SubmitFeedbackUseCase } from './submit-feedback.usecase';

function make(service: { id: string } | null = null) {
  const feedbackService = { create: jest.fn().mockResolvedValue({ id: 'f1' }) };
  const prisma = { service: { findFirst: jest.fn().mockResolvedValue(service) } };
  const uc = new SubmitFeedbackUseCase(feedbackService as any, prisma as any);
  return { uc, feedbackService, prisma };
}
const base = {
  usefulness: 'VERY',
  found: 'NO',
  fromKarabakh: 'NO',
  locale: 'hy',
  pagePath: '/services',
} as const;

describe('SubmitFeedbackUseCase', () => {
  it('drops lookingFor when found is YES', async () => {
    const { uc, feedbackService } = make();
    await uc.execute({ ...base, found: 'YES', lookingFor: 'x' });
    expect(feedbackService.create).toHaveBeenCalledWith(expect.objectContaining({ lookingFor: null }));
  });

  it('nulls blank lookingFor', async () => {
    const { uc, feedbackService } = make();
    await uc.execute({ ...base, lookingFor: '  ' });
    expect(feedbackService.create).toHaveBeenCalledWith(expect.objectContaining({ lookingFor: null }));
  });

  it('keeps trimmed lookingFor', async () => {
    const { uc, feedbackService } = make();
    await uc.execute({ ...base, lookingFor: '  housing  ' });
    expect(feedbackService.create).toHaveBeenCalledWith(expect.objectContaining({ lookingFor: 'housing' }));
  });

  it('nulls serviceId when service missing or soft-deleted', async () => {
    const { uc, feedbackService, prisma } = make(null);
    await uc.execute({ ...base, serviceId: 's1' });
    expect(prisma.service.findFirst).toHaveBeenCalledWith({ where: { id: 's1', deletedAt: null }, select: { id: true } });
    expect(feedbackService.create).toHaveBeenCalledWith(expect.objectContaining({ serviceId: null }));
  });

  it('keeps serviceId for a live service and returns id', async () => {
    const { uc, feedbackService } = make({ id: 's1' });
    const res = await uc.execute({ ...base, serviceId: 's1' });
    expect(feedbackService.create).toHaveBeenCalledWith(expect.objectContaining({ serviceId: 's1' }));
    expect(res).toEqual({ id: 'f1' });
  });

  it('skips lookup without serviceId', async () => {
    const { uc, feedbackService, prisma } = make();
    await uc.execute(base);
    expect(prisma.service.findFirst).not.toHaveBeenCalled();
    expect(feedbackService.create).toHaveBeenCalledWith(expect.objectContaining({ serviceId: null }));
  });
});
