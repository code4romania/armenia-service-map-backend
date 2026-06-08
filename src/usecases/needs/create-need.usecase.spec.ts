import { CreateNeedUseCase } from './create-need.usecase';

function makeDeps(overrides: { sendNewNeedReportToAdmin?: jest.Mock } = {}) {
  const need = {
    id: 'need-1',
    title: 'Need winter clothing',
    description: 'Family needs warm clothes.',
    fullName: 'Anna',
    region: { name: 'Tavush' },
  };
  const needsService = { create: jest.fn().mockResolvedValue(need) };
  const prisma = {
    user: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'super-1', email: 'a1@x.com' },
        { id: 'super-2', email: 'a2@x.com' },
      ]),
    },
  };
  const notifications = { createMany: jest.fn().mockResolvedValue(undefined) };
  const email = {
    sendNewNeedReportToAdmin:
      overrides.sendNewNeedReportToAdmin ?? jest.fn().mockResolvedValue(undefined),
  };
  const config = { get: jest.fn().mockReturnValue('http://app.test') };

  const useCase = new CreateNeedUseCase(
    needsService as never,
    prisma as never,
    notifications as never,
    email as never,
    config as never,
  );
  return { useCase, need, needsService, prisma, notifications, email, config };
}

const input = {
  description: 'Family needs warm clothes.',
  fullName: 'Anna',
  contactMethod: 'PHONE',
  contactValue: '+37400000000',
};

describe('CreateNeedUseCase', () => {
  it('creates the need report and returns it', async () => {
    const { useCase, need } = makeDeps();
    const result = await useCase.execute(input);
    expect(result).toBe(need);
  });

  it('notifies all super admins in-app with NEED_SUBMITTED and a route to the need', async () => {
    const { useCase, notifications } = makeDeps();
    await useCase.execute(input);
    expect(notifications.createMany).toHaveBeenCalledWith(
      ['super-1', 'super-2'],
      expect.objectContaining({
        type: 'NEED_SUBMITTED',
        metadata: expect.objectContaining({
          needReportId: 'need-1',
          route: '/admin/needs/need-1',
        }),
      }),
    );
  });

  it('emails each super admin with the admin dashboard URL', async () => {
    const { useCase, email } = makeDeps();
    await useCase.execute(input);
    expect(email.sendNewNeedReportToAdmin).toHaveBeenCalledTimes(2);
    expect(email.sendNewNeedReportToAdmin).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a1@x.com',
        needTitle: 'Need winter clothing',
        reporterName: 'Anna',
        regionName: 'Tavush',
        adminUrl: 'http://app.test/admin/needs/need-1',
      }),
    );
  });

  it('still resolves with the need when an admin email fails', async () => {
    const sendNewNeedReportToAdmin = jest
      .fn()
      .mockRejectedValue(new Error('smtp down'));
    const { useCase, need } = makeDeps({ sendNewNeedReportToAdmin });
    await expect(useCase.execute(input)).resolves.toBe(need);
  });
});
