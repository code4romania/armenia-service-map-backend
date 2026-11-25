import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SubmitFeedbackDto } from './submit-feedback.dto';

function failedProps(payload: Record<string, unknown>) {
  const dto = plainToInstance(SubmitFeedbackDto, payload);
  return validateSync(dto).map((e) => e.property);
}

const valid = {
  usefulness: 'VERY',
  found: 'YES',
  fromKarabakh: 'NO',
  locale: 'hy',
  pagePath: '/services',
};

describe('SubmitFeedbackDto', () => {
  it('accepts a valid payload', () => {
    expect(failedProps(valid)).toHaveLength(0);
  });

  it.each(['usefulness', 'found', 'fromKarabakh'])(
    'rejects missing %s',
    (key) => {
      const rest: Record<string, unknown> = { ...valid };
      delete rest[key];
      expect(failedProps(rest)).toContain(key);
    },
  );

  it('accepts lookingFor of 500 chars and rejects 501', () => {
    expect(failedProps({ ...valid, lookingFor: 'a'.repeat(500) })).toHaveLength(
      0,
    );
    expect(failedProps({ ...valid, lookingFor: 'a'.repeat(501) })).toContain(
      'lookingFor',
    );
  });

  it('rejects an unsupported locale', () => {
    expect(failedProps({ ...valid, locale: 'ru' })).toContain('locale');
  });

  it('rejects an absolute URL as pagePath', () => {
    expect(failedProps({ ...valid, pagePath: 'http://x' })).toContain(
      'pagePath',
    );
  });

  it('rejects a pagePath longer than 200 chars', () => {
    expect(
      failedProps({ ...valid, pagePath: '/' + 'a'.repeat(200) }),
    ).toContain('pagePath');
    expect(
      failedProps({ ...valid, pagePath: '/' + 'a'.repeat(199) }),
    ).toHaveLength(0);
  });

  it('rejects a non-UUID serviceId and accepts a UUID', () => {
    expect(failedProps({ ...valid, serviceId: 'abc' })).toContain('serviceId');
    expect(
      failedProps({
        ...valid,
        serviceId: '11111111-1111-4111-8111-111111111111',
      }),
    ).toHaveLength(0);
  });
});
