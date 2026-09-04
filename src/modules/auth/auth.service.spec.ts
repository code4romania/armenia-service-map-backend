import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserStatus } from '../../common/enums/user-status.enum';

function buildService(
  overrides: {
    prisma?: Record<string, unknown>;
    jwt?: Record<string, unknown>;
    email?: Record<string, unknown>;
  } = {},
) {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    ...overrides.prisma,
  };
  const jwt = {
    signAsync: jest.fn().mockResolvedValue('token'),
    verifyAsync: jest.fn(),
    ...overrides.jwt,
  };
  const config = {
    getOrThrow: jest.fn().mockReturnValue('secret'),
    get: jest.fn((_key: string, fallback?: string) => fallback ?? '15m'),
  };
  const email = {
    sendResetPassword: jest.fn().mockResolvedValue(undefined),
    ...overrides.email,
  };
  const service = new AuthService(
    prisma as never,
    jwt as never,
    config as never,
    email as never,
  );
  return { service, prisma, jwt, config, email };
}

describe('AuthService', () => {
  it('denies login for pending user', async () => {
    const passwordHash = await bcrypt.hash('pass123', 10);
    const { service } = buildService({
      prisma: {
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'u1',
            email: 'pending@example.com',
            passwordHash,
            role: 'ORG_ADMIN',
            organisationId: null,
            status: UserStatus.PENDING,
          }),
          update: jest.fn(),
        },
      },
    });

    await expect(
      service.login('pending@example.com', 'pass123'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  describe('setupPassword', () => {
    it('rejects a token that is not a setup-password token', async () => {
      const { service, prisma } = buildService({
        jwt: {
          verifyAsync: jest.fn().mockResolvedValue({
            sub: 'u1',
            email: 'a@b.c',
            role: 'ORG_ADMIN',
          }),
        },
      });

      await expect(
        service.setupPassword('access-token', 'newpassword1'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('sets the password for a valid setup-password token', async () => {
      const { service, prisma } = buildService({
        jwt: {
          verifyAsync: jest
            .fn()
            .mockResolvedValue({ sub: 'u1', type: 'setup-password' }),
        },
      });

      await service.setupPassword('setup-token', 'newpassword1');

      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      const [[updateArgs]] = prisma.user.update.mock.calls as [
        [
          {
            where: { id: string };
            data: { status: string; refreshToken: null };
          },
        ],
      ];
      expect(updateArgs.where).toEqual({ id: 'u1' });
      expect(updateArgs.data).toEqual(
        expect.objectContaining({
          status: UserStatus.ACTIVE,
          refreshToken: null,
        }),
      );
    });
  });

  describe('forgotPassword', () => {
    it('emails a reset link to a known user without touching their session', async () => {
      const { service, prisma, jwt, email } = buildService({
        prisma: {
          user: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'u1',
              email: 'a@b.c',
              firstName: 'Ann',
              lastName: 'Lee',
            }),
            update: jest.fn(),
          },
        },
      });

      await service.forgotPassword('a@b.c');

      expect(jwt.signAsync).toHaveBeenCalledWith(
        { sub: 'u1', type: 'setup-password' },
        expect.objectContaining({ expiresIn: '2h' }),
      );
      expect(email.sendResetPassword).toHaveBeenCalledWith({
        to: 'a@b.c',
        recipientName: 'Ann Lee',
        resetUrl: 'http://localhost:3001/setup-password?token=token',
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('silently succeeds for an unknown email', async () => {
      const { service, email } = buildService();

      await expect(
        service.forgotPassword('nobody@b.c'),
      ).resolves.toBeUndefined();
      expect(email.sendResetPassword).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('updates name and phone and returns the profile', async () => {
      const { service, prisma } = buildService({
        prisma: {
          user: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'u1',
              email: 'a@b.c',
              firstName: 'New',
              lastName: 'Name',
              phone: '+374',
              passwordHash: 'h',
              refreshToken: 'r',
              organisation: null,
            }),
            update: jest.fn().mockResolvedValue({}),
          },
        },
      });

      const profile = await service.updateProfile('u1', {
        firstName: 'New',
        lastName: 'Name',
        phone: '+374',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { firstName: 'New', lastName: 'Name', phone: '+374' },
      });
      expect(profile).toEqual(
        expect.objectContaining({ firstName: 'New', phone: '+374' }),
      );
      expect(profile).not.toHaveProperty('passwordHash');
      expect(profile).not.toHaveProperty('refreshToken');
    });
  });

  describe('changePassword', () => {
    async function activeUser() {
      return {
        id: 'u1',
        email: 'a@b.c',
        role: 'ORG_ADMIN',
        organisationId: 'o1',
        status: UserStatus.ACTIVE,
        passwordHash: await bcrypt.hash('oldpass123', 10),
      };
    }

    it('rejects when the current password is wrong', async () => {
      const { service, prisma } = buildService({
        prisma: {
          user: {
            findUnique: jest.fn().mockResolvedValue(await activeUser()),
            update: jest.fn(),
          },
        },
      });

      await expect(
        service.changePassword('u1', 'wrong', 'newpass123'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('stores the new hash, rotates the refresh token and returns fresh tokens', async () => {
      const { service, prisma } = buildService({
        prisma: {
          user: {
            findUnique: jest.fn().mockResolvedValue(await activeUser()),
            update: jest.fn().mockResolvedValue({}),
          },
        },
      });

      const tokens = await service.changePassword(
        'u1',
        'oldpass123',
        'newpass123',
      );

      expect(tokens).toEqual({ accessToken: 'token', refreshToken: 'token' });
      type UpdateArgs = {
        data: { passwordHash?: string; refreshToken?: string | null };
      };
      const updates = (prisma.user.update.mock.calls as [UpdateArgs][]).map(
        ([arg]) => arg.data,
      );
      const passwordUpdate = updates.find((data) => data.passwordHash);
      expect(passwordUpdate).toBeDefined();
      expect(
        await bcrypt.compare('newpass123', passwordUpdate!.passwordHash!),
      ).toBe(true);
      expect(
        updates.some((data) => typeof data.refreshToken === 'string'),
      ).toBe(true);
    });
  });
});
