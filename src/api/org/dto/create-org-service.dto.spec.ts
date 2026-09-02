import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateOrgServiceDto } from './create-org-service.dto';

function failedProps(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateOrgServiceDto, payload);
  return validateSync(dto).map((e) => e.property);
}

const validHy = {
  titleHy: 'Վերնագիր',
  shortDescriptionHy: 'կարճ',
  descriptionHy: 'նկ',
  howToAccessHy: 'հաս',
};

describe('CreateOrgServiceDto regionId', () => {
  it('accepts regionId: null (service available in all regions)', () => {
    expect(failedProps({ ...validHy, regionId: null })).toHaveLength(0);
  });

  it('still rejects a non-UUID regionId', () => {
    expect(failedProps({ ...validHy, regionId: 'all' })).toContain('regionId');
  });
});
