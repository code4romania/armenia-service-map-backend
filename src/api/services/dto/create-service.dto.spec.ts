import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateServiceDto } from './create-service.dto';

const orgId = '11111111-1111-4111-8111-111111111111';

function failedProps(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateServiceDto, payload);
  return validateSync(dto).map((e) => e.property);
}

const validHy = {
  titleHy: 'Վերնագիր',
  shortDescriptionHy: 'կարճ',
  descriptionHy: 'նկ',
  howToAccessHy: 'հաս',
  organisationId: orgId,
};

describe('CreateServiceDto language requirements', () => {
  it.each(['titleHy', 'shortDescriptionHy', 'descriptionHy', 'howToAccessHy'])(
    'rejects a payload with empty %s',
    (field) => {
      const props = failedProps({ ...validHy, [field]: '' });
      expect(props).toContain(field);
    },
  );

  it('accepts a payload with Armenian content and no English', () => {
    const props = failedProps({
      titleHy: 'Վերնագիր',
      shortDescriptionHy: 'կարճ',
      descriptionHy: 'նկ',
      howToAccessHy: 'հաս',
      organisationId: orgId,
    });
    expect(props).toHaveLength(0);
  });
});

describe('CreateServiceDto regionIds', () => {
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
