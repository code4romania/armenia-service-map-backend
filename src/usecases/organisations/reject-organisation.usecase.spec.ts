import { RejectOrganisationUseCase } from './reject-organisation.usecase';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';

describe('RejectOrganisationUseCase', () => {
  it('rejects a pending organisation, emails contact, and notifies super admins', async () => {
    const organisationFindUnique = jest.fn().mockResolvedValue({
      id: 'org-1',
      name: 'Bridge to Hope',
      status: OrganisationStatus.PENDING,
      contactPersonName: 'Mariam Hakobyan',
      contactPersonEmail: 'mariam@example.com',
      region: null,
    });
    const organisationUpdate = jest.fn().mockResolvedValue({
      regions: [],
      id: 'org-1',
      name: 'Bridge to Hope',
      status: OrganisationStatus.REJECTED,
      region: null,
    });
    const userFindMany = jest.fn().mockResolvedValue([{ id: 'super-1' }]);

    const prisma = {
      organisation: { findUnique: organisationFindUnique, update: organisationUpdate },
      user: { findMany: userFindMany },
    };
    const emailService = { sendOrganisationReviewOutcome: jest.fn().mockResolvedValue(undefined) };
    const notifications = { createMany: jest.fn().mockResolvedValue(undefined) };

    const useCase = new RejectOrganisationUseCase(
      prisma as never,
      new DomainExceptionService(),
      emailService as never,
      notifications as never,
    );

    const result = await useCase.execute('org-1', 'admin-1', 'Insufficient details');

    expect(organisationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'org-1' },
        data: expect.objectContaining({
          status: OrganisationStatus.REJECTED,
          reviewedByUserId: 'admin-1',
          rejectionReason: 'Insufficient details',
        }),
      }),
    );
    expect(emailService.sendOrganisationReviewOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'mariam@example.com',
        outcome: 'REJECTED',
      }),
    );
    expect(notifications.createMany).toHaveBeenCalledWith(
      ['super-1'],
      expect.objectContaining({
        title: 'Organisation rejected',
      }),
    );
    expect(result.status).toBe(OrganisationStatus.REJECTED);
  });
});
