import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserStatus } from '../../common/enums/user-status.enum';

describe('AuthService', () => {
  it('denies login for pending user', async () => {
    const passwordHash = await bcrypt.hash('pass123', 10);
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1',
          email: 'pending@example.com',
          passwordHash,
          role: 'ORG_ADMIN',
          organisationId: null,
          status: UserStatus.PENDING,
        }),
      },
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('token') };
    const config = { getOrThrow: jest.fn().mockReturnValue('secret'), get: jest.fn().mockReturnValue('15m') };
    const service = new AuthService(prisma as never, jwt as never, config as never);

    await expect(service.login('pending@example.com', 'pass123')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
