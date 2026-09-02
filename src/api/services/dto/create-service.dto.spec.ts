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

describe('CreateServiceDto regionId', () => {
  it('accepts regionId: null (service available in all regions)', () => {
    expect(failedProps({ ...validHy, regionId: null })).toHaveLength(0);
  });

  it('still rejects a non-UUID regionId', () => {
    expect(failedProps({ ...validHy, regionId: 'all' })).toContain('regionId');
  });
});
