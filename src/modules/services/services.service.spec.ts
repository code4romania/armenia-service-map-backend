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

  it('filters to effectively-available services when availableOn is set', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = { service: { findMany, count } };
    const service = new ServicesService(prisma as never, new DomainExceptionService());

    const availableOn = new Date('2026-06-08T00:00:00.000Z');
    await service.findMany({ availableOn });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isAvailable: true,
          AND: [
            { OR: [{ availabilityStart: null }, { availabilityStart: { lte: availableOn } }] },
            { OR: [{ availabilityEnd: null }, { availabilityEnd: { gte: availableOn } }] },
          ],
        }),
      }),
    );
  });

  it('does not add the availability AND clause when availableOn is absent', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = { service: { findMany, count } };
    const service = new ServicesService(prisma as never, new DomainExceptionService());

    await service.findMany({});

    const callArg = findMany.mock.calls[0][0];
    expect(callArg.where.AND).toBeUndefined();
  });

  it('creates a service with an external organisation name and null organisationId', async () => {
    const create = jest.fn().mockResolvedValue({ id: 's1' });
    const prisma = { service: { create } };
    const service = new ServicesService(prisma as never, new DomainExceptionService());

    await service.create({
      title: 'T',
      shortDescription: 'S',
      description: 'D',
      howToAccess: '<p>x</p>',
      externalOrganisationName: 'Helping Hands',
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          externalOrganisationName: 'Helping Hands',
          organisationId: null,
        }),
      }),
    );
  });

  it('rejects creating a service with neither organisationId nor externalOrganisationName', async () => {
    const create = jest.fn();
    const prisma = { service: { create } };
    const service = new ServicesService(prisma as never, new DomainExceptionService());

    await expect(
      service.create({ title: 'T', shortDescription: 'S', description: 'D', howToAccess: 'x' }),
    ).rejects.toThrow('must have an organisation or an external organisation name');
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects creating a service with both organisationId and externalOrganisationName', async () => {
    const create = jest.fn();
    const prisma = { service: { create } };
    const service = new ServicesService(prisma as never, new DomainExceptionService());

    await expect(
      service.create({
        title: 'T',
        shortDescription: 'S',
        description: 'D',
        howToAccess: 'x',
        organisationId: 'o1',
        externalOrganisationName: 'Helping Hands',
      }),
    ).rejects.toThrow('not both');
    expect(create).not.toHaveBeenCalled();
  });

  it('switches a service to an external organisation, clearing organisationId', async () => {
    const update = jest.fn().mockResolvedValue({ id: 's1' });
    const findUnique = jest.fn().mockResolvedValue({ id: 's1', organisationId: 'o1' });
    const prisma = { service: { findUnique, update } };
    const service = new ServicesService(prisma as never, new DomainExceptionService());

    await service.update('s1', { externalOrganisationName: 'Helping Hands' });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 's1' },
        data: expect.objectContaining({
          externalOrganisationName: 'Helping Hands',
          organisationId: null,
        }),
      }),
    );
  });

  it('switches a service back to a network organisation, clearing external name', async () => {
    const update = jest.fn().mockResolvedValue({ id: 's1' });
    const findUnique = jest.fn().mockResolvedValue({ id: 's1', organisationId: null });
    const prisma = { service: { findUnique, update } };
    const service = new ServicesService(prisma as never, new DomainExceptionService());

    await service.update('s1', { organisationId: 'o2' });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organisationId: 'o2',
          externalOrganisationName: null,
        }),
      }),
    );
  });

  it('rejects an update setting both organisationId and externalOrganisationName', async () => {
    const update = jest.fn();
    const findUnique = jest.fn().mockResolvedValue({ id: 's1', organisationId: 'o1' });
    const prisma = { service: { findUnique, update } };
    const service = new ServicesService(prisma as never, new DomainExceptionService());

    await expect(
      service.update('s1', { organisationId: 'o2', externalOrganisationName: 'X' }),
    ).rejects.toThrow('not both');
    expect(update).not.toHaveBeenCalled();
  });

  it('leaves organisation fields untouched when neither is provided on update', async () => {
    const update = jest.fn().mockResolvedValue({ id: 's1' });
    const findUnique = jest.fn().mockResolvedValue({ id: 's1', organisationId: 'o1' });
    const prisma = { service: { findUnique, update } };
    const service = new ServicesService(prisma as never, new DomainExceptionService());

    await service.update('s1', { title: 'New title' });

    const callArg = update.mock.calls[0][0];
    expect(callArg.data).not.toHaveProperty('organisationId');
    expect(callArg.data).not.toHaveProperty('externalOrganisationName');
  });
});
