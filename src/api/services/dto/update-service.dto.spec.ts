import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UpdateServiceDto } from './update-service.dto';

function failedProps(payload: Record<string, unknown>) {
  const dto = plainToInstance(UpdateServiceDto, payload);
  return validateSync(dto).map((e) => e.property);
}

describe('UpdateServiceDto regionId', () => {
  it('accepts regionId: null so an edit can switch a service to all regions', () => {
    expect(failedProps({ regionId: null })).toHaveLength(0);
  });

  it('still rejects a non-UUID regionId', () => {
    expect(failedProps({ regionId: 'all' })).toContain('regionId');
  });
});
