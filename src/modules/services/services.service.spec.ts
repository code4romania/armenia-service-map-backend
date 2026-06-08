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

  it('forwards howToAccess fields when creating a service', async () => {
    const create = jest.fn().mockResolvedValue({ id: 's1' });
    const prisma = { service: { create } };
    const service = new ServicesService(prisma as never, new DomainExceptionService());

    await service.create({
      title: 'T',
      shortDescription: 'S',
      description: 'D',
      howToAccess: '<p>Call us</p>',
      howToAccessHy: '<p>Զանգեք մեզ</p>',
      organisationId: 'o1',
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          howToAccess: '<p>Call us</p>',
          howToAccessHy: '<p>Զանգեք մեզ</p>',
        }),
      }),
    );
  });
});
