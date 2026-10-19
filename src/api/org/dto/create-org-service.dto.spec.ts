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

describe('CreateOrgServiceDto regionIds', () => {
  it('accepts an empty list (service available in all regions)', () => {
    expect(failedProps({ ...validHy, regionIds: [] })).toHaveLength(0);
  });

  it('accepts several regions', () => {
    expect(
      failedProps({
        ...validHy,
        regionIds: [
          '0b8e9f6a-3c2d-4e5f-8a9b-1c2d3e4f5a6b',
          '1c9f0a7b-4d3e-4f6a-9b0c-2d3e4f5a6b7c',
        ],
      }),
    ).toHaveLength(0);
  });

  it('rejects a non-UUID entry', () => {
    expect(failedProps({ ...validHy, regionIds: ['all'] })).toContain(
      'regionIds',
    );
  });

  it('rejects a non-array value', () => {
    expect(
      failedProps({
        ...validHy,
        regionIds: '0b8e9f6a-3c2d-4e5f-8a9b-1c2d3e4f5a6b',
      }),
    ).toContain('regionIds');
  });
});
