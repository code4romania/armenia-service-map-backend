import { yerevanDayRange } from './yerevan-day-range.js';

describe('yerevanDayRange', () => {
  it('converts inclusive Yerevan days (UTC+4) to a half-open UTC range', () => {
    expect(yerevanDayRange('2026-11-01', '2026-11-30')).toEqual({
      gte: new Date('2026-10-31T20:00:00Z'),
      lt: new Date('2026-11-30T20:00:00Z'),
    });
  });

  it('returns an empty object when no dates given', () => {
    expect(yerevanDayRange()).toEqual({});
  });

  it('returns only gte when only from is given', () => {
    expect(yerevanDayRange('2026-11-01')).toEqual({ gte: new Date('2026-10-31T20:00:00Z') });
  });

  it('returns only lt when only to is given', () => {
    expect(yerevanDayRange(undefined, '2026-11-30')).toEqual({ lt: new Date('2026-11-30T20:00:00Z') });
  });
});
