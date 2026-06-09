import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateServiceDto } from './create-service.dto';

const orgId = '11111111-1111-4111-8111-111111111111';

function failedProps(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateServiceDto, payload);
  return validateSync(dto).map((e) => e.property);
}

describe('CreateServiceDto language requirements', () => {
  it('rejects a payload missing Armenian title', () => {
    const props = failedProps({
      titleHy: '',
      shortDescriptionHy: 'կարճ',
      descriptionHy: 'նկ',
      howToAccessHy: 'հաս',
      organisationId: orgId,
    });
    expect(props).toContain('titleHy');
  });

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
