import type { Region } from '../../generated/prisma/client.js';

/** Prisma `include` fragment loading an organisation's regions through the join table. */
export const includeOrganisationRegions = { regions: { include: { region: true } } } as const;

export function uniqueRegionIds(regionIds: string[]) {
  return Array.from(new Set(regionIds));
}

/** Replaces the nested `regions: [{ region }]` join rows with a flat `regions: Region[]`. */
export function flattenRegions<T extends { regions: { region: Region }[] }>(
  org: T,
): Omit<T, 'regions'> & { regions: Region[] } {
  const { regions, ...rest } = org;
  return {
    ...rest,
    regions: regions.map((row) => row.region).sort((a, b) => a.name.localeCompare(b.name)),
  };
}
