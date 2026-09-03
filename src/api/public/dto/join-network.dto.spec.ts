import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { JoinNetworkDto } from './join-network.dto';

function failedProps(payload: Record<string, unknown>) {
  const dto = plainToInstance(JoinNetworkDto, payload);
  return validateSync(dto).map((e) => e.property);
}

const valid = {
  organisationName: 'Bridge to Hope',
  contactName: 'Mariam',
  email: 'mariam@example.com',
  servicesDescription: 'Legal aid and psychosocial support.',
};

const UUID_A = '11111111-1111-4111-8111-111111111111';
const UUID_B = '22222222-2222-4222-8222-222222222222';

describe('JoinNetworkDto regionIds', () => {
  it('accepts a list of region UUIDs', () => {
    expect(failedProps({ ...valid, regionIds: [UUID_A, UUID_B] })).toHaveLength(0);
  });

  it('accepts an omitted regionIds (regions are optional)', () => {
    expect(failedProps(valid)).toHaveLength(0);
  });

  it('accepts an empty regionIds list', () => {
    expect(failedProps({ ...valid, regionIds: [] })).toHaveLength(0);
  });

  it('rejects a non-UUID entry', () => {
    expect(failedProps({ ...valid, regionIds: [UUID_A, 'all'] })).toContain('regionIds');
  });

  it('rejects a plain string instead of an array', () => {
    expect(failedProps({ ...valid, regionIds: UUID_A })).toContain('regionIds');
  });

  it('no longer accepts the legacy single regionId', () => {
    // Mirrors the global ValidationPipe (whitelist + forbidNonWhitelisted).
    const dto = plainToInstance(JoinNetworkDto, { ...valid, regionId: UUID_A });
    const failed = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true }).map((e) => e.property);
    expect(failed).toContain('regionId');
  });
});
