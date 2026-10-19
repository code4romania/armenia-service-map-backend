import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UpdateServiceDto } from './update-service.dto';

function failedProps(payload: Record<string, unknown>) {
  const dto = plainToInstance(UpdateServiceDto, payload);
  return validateSync(dto).map((e) => e.property);
}

describe('UpdateServiceDto regionIds', () => {
  it('accepts an empty list so an edit can switch a service to all regions', () => {
    expect(failedProps({ regionIds: [] })).toHaveLength(0);
  });

  it('rejects a non-UUID entry', () => {
    expect(failedProps({ regionIds: ['all'] })).toContain('regionIds');
  });
});
