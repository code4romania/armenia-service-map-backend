import { BadRequestException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.usecase.js';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service.js';
import { Role } from '../../common/enums/role.enum.js';

function build() {
  const create = jest
    .fn()
    .mockImplementation((data: Record<string, unknown>) =>
      Promise.resolve({ id: 'u1', ...data }),
    );
  const useCase = new CreateUserUseCase(
    { create } as never,
    new DomainExceptionService(),
  );
  return { useCase, create };
}

const BASE = {
  email: 'ani@example.com',
  firstName: 'Ani',
  lastName: 'Petrosyan',
};

describe('CreateUserUseCase', () => {
  it('creates an org admin attached to an organisation', async () => {
    const { useCase, create } = build();
    await useCase.execute({
      ...BASE,
      role: Role.ORG_ADMIN,
      organisationId: 'org-1',
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: Role.ORG_ADMIN,
        organisationId: 'org-1',
      }),
    );
  });

  it('rejects an org admin without an organisation', async () => {
    const { useCase, create } = build();
    await expect(
      useCase.execute({ ...BASE, role: Role.ORG_ADMIN }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a super admin without an organisation', async () => {
    const { useCase, create } = build();
    await useCase.execute({ ...BASE, role: Role.SUPER_ADMIN });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ role: Role.SUPER_ADMIN }),
    );
  });
});
