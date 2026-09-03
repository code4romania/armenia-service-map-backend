import { CreateJoinNetworkRequestUseCase } from './create-join-network-request.usecase';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum';

describe('CreateJoinNetworkRequestUseCase', () => {
  it('creates pending organisation and notifies super admins', async () => {
    const organisationsService = {
      create: jest.fn().mockResolvedValue({
        id: 'org-1',
        name: 'Bridge to Hope',
        status: OrganisationStatus.PENDING,
        regions: [],
      }),
    };
    const prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'super-1', email: 'a1@x.com' },
          { id: 'super-2', email: 'a2@x.com' },
        ]),
      },
    };
    const notifications = {
      createMany: jest.fn().mockResolvedValue(undefined),
    };
    const email = {
      sendNewJoinNetworkRequestToAdmin: jest.fn().mockResolvedValue(undefined),
    };
    const config = { get: jest.fn().mockReturnValue('http://app.test') };

    const useCase = new CreateJoinNetworkRequestUseCase(
      organisationsService as never,
      prisma as never,
      notifications as never,
      email as never,
      config as never,
    );

    const result = await useCase.execute({
      organisationName: 'Bridge to Hope',
      contactName: 'Mariam Hakobyan',
      email: 'mariam@example.com',
      servicesDescription: 'We provide legal aid and psychosocial support.',
    });

    expect(organisationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: OrganisationStatus.PENDING,
        submissionSource: 'JOIN_NETWORK',
      }),
    );
    expect(notifications.createMany).toHaveBeenCalledWith(
      ['super-1', 'super-2'],
      expect.objectContaining({
        type: 'ORG_PENDING_REVIEW',
      }),
    );
    expect(email.sendNewJoinNetworkRequestToAdmin).toHaveBeenCalledTimes(2);
    expect(email.sendNewJoinNetworkRequestToAdmin).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a1@x.com',
        organisationName: 'Bridge to Hope',
        contactName: 'Mariam Hakobyan',
        contactEmail: 'mariam@example.com',
        adminUrl: 'http://app.test/admin/organisations/org-1',
      }),
    );
    expect(result.status).toBe(OrganisationStatus.PENDING);
  });

  it('still resolves when an admin email fails', async () => {
    const organisationsService = {
      create: jest.fn().mockResolvedValue({
        id: 'org-1',
        name: 'Bridge to Hope',
        status: OrganisationStatus.PENDING,
        regions: [],
      }),
    };
    const prisma = {
      user: { findMany: jest.fn().mockResolvedValue([{ id: 'super-1', email: 'a1@x.com' }]) },
    };
    const notifications = { createMany: jest.fn().mockResolvedValue(undefined) };
    const email = {
      sendNewJoinNetworkRequestToAdmin: jest.fn().mockRejectedValue(new Error('smtp down')),
    };
    const config = { get: jest.fn().mockReturnValue('http://app.test') };

    const useCase = new CreateJoinNetworkRequestUseCase(
      organisationsService as never,
      prisma as never,
      notifications as never,
      email as never,
      config as never,
    );

    const result = await useCase.execute({
      organisationName: 'Bridge to Hope',
      contactName: 'Mariam Hakobyan',
      email: 'mariam@example.com',
      servicesDescription: 'Legal aid.',
    });

    expect(result.status).toBe(OrganisationStatus.PENDING);
  });

  it('stores the selected regions and lists their names in the admin email', async () => {
    const organisationsService = {
      create: jest.fn().mockResolvedValue({
        id: 'org-1',
        name: 'Bridge to Hope',
        status: OrganisationStatus.PENDING,
        regions: [
          { id: 'r-yerevan', name: 'Yerevan' },
          { id: 'r-shirak', name: 'Shirak' },
        ],
      }),
    };
    const prisma = {
      user: { findMany: jest.fn().mockResolvedValue([{ id: 'super-1', email: 'a1@x.com' }]) },
    };
    const notifications = { createMany: jest.fn().mockResolvedValue(undefined) };
    const email = {
      sendNewJoinNetworkRequestToAdmin: jest.fn().mockResolvedValue(undefined),
    };
    const config = { get: jest.fn().mockReturnValue('http://app.test') };

    const useCase = new CreateJoinNetworkRequestUseCase(
      organisationsService as never,
      prisma as never,
      notifications as never,
      email as never,
      config as never,
    );

    await useCase.execute({
      organisationName: 'Bridge to Hope',
      regionIds: ['r-yerevan', 'r-shirak'],
      contactName: 'Mariam Hakobyan',
      email: 'mariam@example.com',
      servicesDescription: 'Legal aid.',
    });

    expect(organisationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ regionIds: ['r-yerevan', 'r-shirak'] }),
    );
    expect(email.sendNewJoinNetworkRequestToAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ regionNames: ['Yerevan', 'Shirak'] }),
    );
  });
});
