import { ServicesService } from './services.service';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';

describe('ServicesService', () => {
  it('publishes a service by setting status to PUBLISHED', async () => {
    const update = jest.fn().mockResolvedValue({ id: 's1', status: 'PUBLISHED' });
    const findUnique = jest.fn().mockResolvedValue({ id: 's1', organisationId: 'o1' });
    const prisma = {
      service: {
        findUnique,
        update,
      },
    };

    const service = new ServicesService(prisma as never, new DomainExceptionService());
    await service.publish('s1');

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 's1' },
        data: { status: 'PUBLISHED' },
      }),
    );
  });
});
