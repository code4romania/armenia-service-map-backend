export type AvailabilityState = 'AVAILABLE' | 'AVAILABLE_SOON' | 'UNAVAILABLE';

/** Armenia is UTC+4 year-round (no daylight saving). */
const ARMENIA_UTC_OFFSET_MS = 4 * 60 * 60 * 1000;

/** Floors a date to UTC midnight, matching how date-only fields are stored. */
export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * The calendar date in Armenia (UTC+4) for the given instant, expressed as a
 * UTC-midnight timestamp. Availability boundaries flip at Armenian local
 * midnight, not UTC midnight, so a service ends/starts on the day the people
 * using it experience it. Date-only fields are stored as UTC midnight, so this
 * is directly comparable to startOfUtcDay() of those stored values.
 */
export function startOfArmeniaDay(now: Date): Date {
  return startOfUtcDay(new Date(now.getTime() + ARMENIA_UTC_OFFSET_MS));
}

export function computeAvailabilityState(
  service: { isAvailable: boolean; availabilityStart: Date | null; availabilityEnd: Date | null },
  now: Date,
): AvailabilityState {
  const today = startOfArmeniaDay(now).getTime();

  if (!service.isAvailable) return 'UNAVAILABLE';
  if (service.availabilityEnd && startOfUtcDay(service.availabilityEnd).getTime() < today) {
    return 'UNAVAILABLE';
  }
  if (service.availabilityStart && startOfUtcDay(service.availabilityStart).getTime() > today) {
    return 'AVAILABLE_SOON';
  }
  return 'AVAILABLE';
}

export function withAvailabilityState<
  T extends { isAvailable: boolean; availabilityStart: Date | null; availabilityEnd: Date | null },
>(service: T, now: Date): T & { availabilityState: AvailabilityState } {
  return { ...service, availabilityState: computeAvailabilityState(service, now) };
}
