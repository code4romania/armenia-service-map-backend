import { UsersService } from './users.service';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';

function build(overrides: { user?: Record<string, jest.Mock> } = {}) {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({ id: 'u1', organisation: null, ...data }),
      ),
      update: jest.fn().mockResolvedValue({ id: 'u1' }),
      ...overrides.user,
    },
  };
  const emailService = { sendInvitation: jest.fn().mockResolvedValue(undefined) };
  const jwt = { signAsync: jest.fn().mockResolvedValue('setup-token') };
  const config = {
    getOrThrow: jest.fn().mockReturnValue('secret'),
    get: jest.fn().mockReturnValue('http://front.test'),
  };
  const service = new UsersService(
    prisma as never,
    new DomainExceptionService(),
    emailService as never,
    jwt as never,
    config as never,
  );
  return { service, prisma, emailService, jwt };
}

const BASE = { email: 'ani@example.com', firstName: 'Ani', lastName: 'Petrosyan' };

describe('UsersService', () => {
  it('deactivates user by setting SUSPENDED status', async () => {
    const { service, prisma } = build({
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1' }) },
    });

    await service.deactivate('u1');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        data: expect.objectContaining({ status: 'SUSPENDED' }),
      }),
    );
  });

  describe('create', () => {
    it('creates a pending account and emails a setup-password invitation when no password is given', async () => {
      const { service, prisma, emailService, jwt } = build();

      await service.create({ ...BASE, role: 'SUPER_ADMIN' as never });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PENDING', role: 'SUPER_ADMIN' }),
        }),
      );
      expect(jwt.signAsync).toHaveBeenCalledWith(
        { sub: 'u1', type: 'setup-password' },
        expect.objectContaining({ expiresIn: '7d' }),
      );
      expect(emailService.sendInvitation).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'ani@example.com',
          recipientName: 'Ani Petrosyan',
          setupUrl: 'http://front.test/setup-password?token=setup-token',
        }),
      );
    });

    it('names the organisation in the invitation for an org admin', async () => {
      const { service, emailService } = build({
        user: {
          create: jest.fn().mockImplementation(({ data }) =>
            Promise.resolve({ id: 'u1', organisation: { id: 'org-1', name: 'Red Cross' }, ...data }),
          ),
        },
      });

      await service.create({ ...BASE, role: 'ORG_ADMIN' as never, organisationId: 'org-1' });

      expect(emailService.sendInvitation).toHaveBeenCalledWith(
        expect.objectContaining({ organisationName: 'Red Cross' }),
      );
    });

    it('does not send an invitation when an explicit password is given', async () => {
      const { service, prisma, emailService } = build();

      await service.create({ ...BASE, role: 'SUPER_ADMIN' as never, password: 'Secret123!' });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ status: 'PENDING' }),
        }),
      );
      expect(emailService.sendInvitation).not.toHaveBeenCalled();
    });
  });

  describe('findMany', () => {
    it('filters by role', async () => {
      const { service, prisma } = build();

      await service.findMany({ role: 'SUPER_ADMIN' as never });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ role: 'SUPER_ADMIN' }) }),
      );
    });
  });
});
