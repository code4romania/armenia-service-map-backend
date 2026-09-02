import { CreateOrganisationUseCase } from './create-organisation.usecase';
import { OrganisationStatus } from '../../common/enums/organisation-status.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { Role } from '../../common/enums/role.enum';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';

function build(overrides: { existingUser?: unknown } = {}) {
  const organisationCreate = jest
    .fn()
    .mockResolvedValue({ id: 'org-1', name: 'Bridge to Hope' });
  const userCreate = jest.fn().mockImplementation(async ({ data }) => ({
    id: `user-${data.email}`,
    ...data,
  }));
  const userFindUnique = jest
    .fn()
    .mockResolvedValue(overrides.existingUser ?? null);
  const organisationFindUnique = jest
    .fn()
    .mockResolvedValue({ id: 'org-1', name: 'Bridge to Hope', users: [] });
  const prisma = {
    organisation: { findUnique: organisationFindUnique },
    user: { findUnique: userFindUnique },
    $transaction: jest.fn(async (callback: (tx: unknown) => unknown) =>
      callback({
        organisation: { create: organisationCreate },
        user: { create: userCreate },
      }),
    ),
  };
  const emailService = {
    sendInvitation: jest.fn().mockResolvedValue(undefined),
  };
  const jwt = { signAsync: jest.fn().mockResolvedValue('setup-token') };
  const config = {
    getOrThrow: jest.fn().mockReturnValue('secret'),
    get: jest.fn().mockReturnValue('http://localhost:3001'),
  };
  const useCase = new CreateOrganisationUseCase(
    prisma as never,
    new DomainExceptionService(),
    emailService as never,
    jwt as never,
    config as never,
  );
  return {
    useCase,
    organisationCreate,
    userCreate,
    userFindUnique,
    emailService,
  };
}

describe('CreateOrganisationUseCase', () => {
  it('creates an ACTIVE organisation submitted via ADMIN, reviewed by the creating admin', async () => {
    const { useCase, organisationCreate } = build();

    await useCase.execute(
      { name: 'Bridge to Hope', contactPersonEmail: 'mariam@example.com' },
      'admin-1',
    );

    expect(organisationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Bridge to Hope',
          status: OrganisationStatus.ACTIVE,
          submissionSource: 'ADMIN',
          reviewedByUserId: 'admin-1',
          reviewedAt: expect.any(Date),
          contactPersonEmail: 'mariam@example.com',
        }),
      }),
    );
  });

  it('provisions an ORG_ADMIN user from the contact email and sends the invitation', async () => {
    const { useCase, userCreate, emailService } = build();

    await useCase.execute(
      {
        name: 'Bridge to Hope',
        contactPersonName: 'Mariam Hakobyan',
        contactPersonEmail: 'Mariam@Example.com ',
        contactPersonPhone: '+37477111222',
      },
      'admin-1',
    );

    expect(userCreate).toHaveBeenCalledTimes(1);
    expect(userCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'mariam@example.com',
        firstName: 'Mariam',
        lastName: 'Hakobyan',
        phone: '+37477111222',
        role: Role.ORG_ADMIN,
        status: UserStatus.PENDING,
        organisationId: 'org-1',
        passwordHash: expect.any(String),
      }),
    });
    expect(emailService.sendInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'mariam@example.com',
        organisationName: 'Bridge to Hope',
      }),
    );
  });

  it('rejects when a user with the contact email already exists', async () => {
    const { useCase, organisationCreate } = build({
      existingUser: { id: 'u-1', email: 'mariam@example.com', deletedAt: null },
    });

    await expect(
      useCase.execute(
        { name: 'Bridge to Hope', contactPersonEmail: 'mariam@example.com' },
        'admin-1',
      ),
    ).rejects.toMatchObject({ status: 409 });
    expect(organisationCreate).not.toHaveBeenCalled();
  });

  it('still creates extra users passed explicitly, without duplicating the contact admin', async () => {
    const { useCase, userCreate } = build();

    await useCase.execute(
      {
        name: 'Bridge to Hope',
        contactPersonEmail: 'mariam@example.com',
        users: [
          { firstName: 'Ani', lastName: 'Petrosyan', email: 'ani@example.com' },
          {
            firstName: 'Mariam',
            lastName: 'H',
            email: 'mariam@example.com',
            role: Role.ORG_MEMBER,
          },
        ],
      },
      'admin-1',
    );

    const emails = userCreate.mock.calls.map(([arg]) => arg.data.email).sort();
    expect(emails).toEqual(['ani@example.com', 'mariam@example.com']);
    const mariam = userCreate.mock.calls.find(
      ([arg]) => arg.data.email === 'mariam@example.com',
    )![0];
    expect(mariam.data.role).toBe(Role.ORG_ADMIN);
  });
});
