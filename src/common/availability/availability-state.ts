export type AvailabilityState = 'AVAILABLE' | 'AVAILABLE_SOON' | 'UNAVAILABLE';

/** Floors a date to UTC midnight, matching how date-only fields are stored. */
export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function computeAvailabilityState(
  service: { isAvailable: boolean; availabilityStart: Date | null; availabilityEnd: Date | null },
  now: Date,
): AvailabilityState {
  const today = startOfUtcDay(now).getTime();

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
