import { computeAvailabilityState, withAvailabilityState } from './availability-state';

const NOW = new Date('2026-06-08T11:00:00.000Z'); // arbitrary time of day

describe('computeAvailabilityState', () => {
  it('returns AVAILABLE when toggle on and no dates', () => {
    expect(
      computeAvailabilityState({ isAvailable: true, availabilityStart: null, availabilityEnd: null }, NOW),
    ).toBe('AVAILABLE');
  });

  it('returns UNAVAILABLE when manual toggle is off, regardless of dates', () => {
    expect(
      computeAvailabilityState(
        { isAvailable: false, availabilityStart: new Date('2026-07-01'), availabilityEnd: null },
        NOW,
      ),
    ).toBe('UNAVAILABLE');
  });

  it('returns UNAVAILABLE the day after the end date', () => {
    expect(
      computeAvailabilityState(
        { isAvailable: true, availabilityStart: null, availabilityEnd: new Date('2026-06-07') },
        NOW,
      ),
    ).toBe('UNAVAILABLE');
  });

  it('stays AVAILABLE on the end-date day (inclusive)', () => {
    expect(
      computeAvailabilityState(
        { isAvailable: true, availabilityStart: null, availabilityEnd: new Date('2026-06-08') },
        NOW,
      ),
    ).toBe('AVAILABLE');
  });

  it('returns AVAILABLE_SOON when start date is in the future', () => {
    expect(
      computeAvailabilityState(
        { isAvailable: true, availabilityStart: new Date('2026-06-09'), availabilityEnd: null },
        NOW,
      ),
    ).toBe('AVAILABLE_SOON');
  });

  it('is AVAILABLE on the start-date day (inclusive)', () => {
    expect(
      computeAvailabilityState(
        { isAvailable: true, availabilityStart: new Date('2026-06-08'), availabilityEnd: null },
        NOW,
      ),
    ).toBe('AVAILABLE');
  });

  it('lets UNAVAILABLE win over AVAILABLE_SOON when toggle is off and start is future', () => {
    expect(
      computeAvailabilityState(
        { isAvailable: false, availabilityStart: new Date('2026-06-09'), availabilityEnd: null },
        NOW,
      ),
    ).toBe('UNAVAILABLE');
  });
});

describe('withAvailabilityState', () => {
  it('attaches availabilityState to the service object', () => {
    const service = { id: 's1', isAvailable: true, availabilityStart: null, availabilityEnd: null };
    expect(withAvailabilityState(service, NOW)).toEqual({ ...service, availabilityState: 'AVAILABLE' });
  });
});
