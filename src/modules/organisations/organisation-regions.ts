/** Prisma `include` fragment loading an organisation's regions through the join table. */
export const includeOrganisationRegions = { regions: { include: { region: true } } } as const;

export function uniqueRegionIds(regionIds: string[]) {
  return Array.from(new Set(regionIds));
}

/** Replaces the nested `regions: [{ region }]` join rows with a flat, name-sorted `regions` array. */
export function flattenRegions<R extends { name: string }, T extends { regions: { region: R }[] }>(
  entity: T,
): Omit<T, 'regions'> & { regions: R[] } {
  const { regions, ...rest } = entity;
  return {
    ...rest,
    regions: regions.map((row) => row.region).sort((a, b) => a.name.localeCompare(b.name)),
  };
}
