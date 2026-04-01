import { UsersService } from './users.service';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';

describe('UsersService', () => {
  it('deactivates user by setting SUSPENDED status', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'u1', status: 'SUSPENDED' });
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1' }),
        update,
      },
    };
    const service = new UsersService(prisma as never, new DomainExceptionService());

    await service.deactivate('u1');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        data: expect.objectContaining({ status: 'SUSPENDED' }),
      }),
    );
  });
});
