import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';

function buildService() {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  const email = { sendInvitation: jest.fn(), sendResetPassword: jest.fn() };
  const jwt = { signAsync: jest.fn().mockResolvedValue('token') };
  const config = {
    getOrThrow: jest.fn().mockReturnValue('secret'),
    get: jest.fn((_k: string, d?: string) => d),
  };
  const service = new UsersService(
    prisma as never,
    new DomainExceptionService(),
    email as never,
    jwt as never,
    config as never,
  );
  return { service, prisma, email };
}

function findManyWhere(prisma: ReturnType<typeof buildService>['prisma']) {
  const [[args]] = prisma.user.findMany.mock.calls as [
    [{ where: { deletedAt: unknown } }],
  ];
  return args.where;
}

describe('UsersService', () => {
  describe('findMany', () => {
    it('lists only live users by default', async () => {
      const { service, prisma } = buildService();
      await service.findMany({});
      expect(findManyWhere(prisma).deletedAt).toBeNull();
    });

    it('lists only soft-deleted users when deleted=true', async () => {
      const { service, prisma } = buildService();
      await service.findMany({ deleted: true });
      expect(findManyWhere(prisma).deletedAt).toEqual({ not: null });
    });
  });

  describe('restore', () => {
    it('clears deletedAt on a soft-deleted user', async () => {
      const { service, prisma } = buildService();
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        deletedAt: new Date(),
      });
      await service.restore('u1');
      const [[updateArgs]] = prisma.user.update.mock.calls as [
        [{ where: { id: string }; data: object }],
      ];
      expect(updateArgs.where).toEqual({ id: 'u1' });
      expect(updateArgs.data).toEqual({ deletedAt: null, refreshToken: null });
    });

    it('404s when the user is not soft-deleted', async () => {
      const { service, prisma } = buildService();
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', deletedAt: null });
      await expect(service.restore('u1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('explains that a soft-deleted user owns the email', async () => {
      const { service, prisma } = buildService();
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.c',
        deletedAt: new Date(),
      });
      const attempt = service.create({
        email: 'a@b.c',
        firstName: 'A',
        lastName: 'B',
        role: 'SUPER_ADMIN' as never,
      });
      await expect(attempt).rejects.toBeInstanceOf(ConflictException);
      await expect(attempt).rejects.toThrow(/deleted/);
    });
  });
});
