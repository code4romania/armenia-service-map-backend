import { CreateJoinNetworkRequestUseCase } from './create-join-network-request.usecase';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum';

describe('CreateJoinNetworkRequestUseCase', () => {
  it('creates pending organisation and notifies super admins', async () => {
    const organisationsService = {
      create: jest.fn().mockResolvedValue({
        id: 'org-1',
        name: 'Bridge to Hope',
        status: OrganisationStatus.PENDING,
      }),
    };
    const prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([{ id: 'super-1' }, { id: 'super-2' }]),
      },
    };
    const notifications = {
      createMany: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new CreateJoinNetworkRequestUseCase(
      organisationsService as never,
      prisma as never,
      notifications as never,
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
    expect(result.status).toBe(OrganisationStatus.PENDING);
  });
});
