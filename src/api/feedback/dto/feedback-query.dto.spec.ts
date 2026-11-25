import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  FeedbackFilterQueryDto,
  FeedbackListQueryDto,
} from './feedback-query.dto.js';

async function errorsFor<T extends object>(cls: new () => T, plain: object) {
  const errs = await validate(plainToInstance(cls, plain), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errs.map((e) => e.property);
}

describe.each([
  ['FeedbackFilterQueryDto', FeedbackFilterQueryDto],
  ['FeedbackListQueryDto', FeedbackListQueryDto],
])('%s', (_name, cls) => {
  it('accepts valid filters', async () => {
    expect(
      await errorsFor(cls, {
        from: '2026-11-01',
        to: '2026-11-25',
        found: 'YES',
        fromKarabakh: 'PREFER_NOT_TO_SAY',
      }),
    ).toEqual([]);
  });
  it('accepts empty query', async () => {
    expect(await errorsFor(cls, {})).toEqual([]);
  });
  it.each(['01.11.2026', '2026-1-1', '2026-11-01T00:00:00Z', 'x'])(
    'rejects malformed from %s',
    async (from) => {
      expect(await errorsFor(cls, { from })).toContain('from');
    },
  );
  it('rejects malformed to', async () => {
    expect(await errorsFor(cls, { to: '25/11/2026' })).toContain('to');
  });
  it('rejects unknown found / fromKarabakh', async () => {
    expect(await errorsFor(cls, { found: 'MAYBE' })).toContain('found');
    expect(await errorsFor(cls, { fromKarabakh: 'MAYBE' })).toContain(
      'fromKarabakh',
    );
  });
});

describe('FeedbackListQueryDto', () => {
  it('extends pagination', async () => {
    const dto = plainToInstance(FeedbackListQueryDto, {
      page: '2',
      perPage: '5',
    });
    expect(dto.page).toBe(2);
    expect(dto.perPage).toBe(5);
    expect(await errorsFor(FeedbackListQueryDto, { page: '0' })).toContain(
      'page',
    );
  });
});
