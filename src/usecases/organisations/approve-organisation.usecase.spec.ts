import { ApproveOrganisationUseCase } from './approve-organisation.usecase';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';

describe('ApproveOrganisationUseCase', () => {
  it('activates a pending organisation and creates the initial org admin user', async () => {
    const organisationFindUnique = jest.fn().mockResolvedValue({
        id: 'org-1',
        name: 'Bridge to Hope',
        status: OrganisationStatus.PENDING,
        contactPersonName: 'Mariam Hakobyan',
        contactPersonEmail: 'mariam@example.com',
        contactPersonPhone: '+37477111222',
      });
    const userFindUnique = jest.fn().mockResolvedValue(null);
    const userFindMany = jest.fn().mockResolvedValue([{ id: 'super-1' }]);
    const organisationUpdate = jest.fn().mockResolvedValue({
      regions: [],
      id: 'org-1',
      name: 'Bridge to Hope',
      status: OrganisationStatus.ACTIVE,
      reviewedByUserId: 'admin-1',
      users: [],
      _count: { services: 0, users: 1 },
      region: null,
    });
    const userCreate = jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'mariam@example.com',
      firstName: 'Mariam',
      lastName: 'Hakobyan',
    });

    const prisma = {
      organisation: { findUnique: organisationFindUnique },
      user: { findUnique: userFindUnique, findMany: userFindMany },
      $transaction: jest.fn(async (callback: (tx: unknown) => unknown) =>
        callback({
          organisation: { update: organisationUpdate },
          user: { create: userCreate },
        })),
    };
    const emailService = { sendInvitation: jest.fn().mockResolvedValue(undefined) };
    const notifications = { createMany: jest.fn().mockResolvedValue(undefined) };
    const jwt = { signAsync: jest.fn().mockResolvedValue('setup-token') };
    const config = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
      get: jest.fn().mockReturnValue('http://localhost:3001'),
    };
    const useCase = new ApproveOrganisationUseCase(
      prisma as never,
      new DomainExceptionService(),
      emailService as never,
      notifications as never,
      jwt as never,
      config as never,
    );

    const result = await useCase.execute('org-1', 'admin-1');

    expect(organisationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'org-1' },
        data: expect.objectContaining({
          status: OrganisationStatus.ACTIVE,
          reviewedByUserId: 'admin-1',
        }),
      }),
    );
    expect(userCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'mariam@example.com',
          firstName: 'Mariam',
          lastName: 'Hakobyan',
        }),
      }),
    );
    expect(emailService.sendInvitation).toHaveBeenCalled();
    expect(notifications.createMany).toHaveBeenCalledWith(
      ['super-1'],
      expect.objectContaining({
        title: 'Organisation approved',
      }),
    );
    expect(result.status).toBe(OrganisationStatus.ACTIVE);
  });
});
