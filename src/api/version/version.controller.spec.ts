import { VersionController } from './version.controller';

function makeController(rows: unknown[] | Error) {
  const $queryRaw =
    rows instanceof Error
      ? jest.fn().mockRejectedValue(rows)
      : jest.fn().mockResolvedValue(rows);
  return new VersionController({ $queryRaw } as never);
}

describe('VersionController.getVersion', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('reports build version, revision, start time and the latest applied migration', async () => {
    process.env.APP_VERSION = '1.0.1';
    process.env.APP_REVISION = '57d53fb404e04aee38a915706cc0ec2136a7a810';
    const finishedAt = new Date('2026-10-06T19:00:00.000Z');
    const controller = makeController([
      {
        migration_name: '20260902120000_organisation_regions',
        finished_at: finishedAt,
      },
    ]);

    const result = await controller.getVersion();

    expect(result).toMatchObject({
      version: '1.0.1',
      revision: '57d53fb404e04aee38a915706cc0ec2136a7a810',
      lastMigration: {
        name: '20260902120000_organisation_regions',
        appliedAt: finishedAt.toISOString(),
      },
    });
    expect(new Date(result.startedAt).toISOString()).toBe(result.startedAt);
  });

  it('falls back to "dev"/"unknown" when build args were not provided', async () => {
    delete process.env.APP_VERSION;
    delete process.env.APP_REVISION;
    const controller = makeController([]);

    const result = await controller.getVersion();

    expect(result.version).toBe('dev');
    expect(result.revision).toBe('unknown');
    expect(result.lastMigration).toBeNull();
  });

  it('still answers when the migrations table cannot be read', async () => {
    const controller = makeController(
      new Error('relation "_prisma_migrations" does not exist'),
    );

    const result = await controller.getVersion();

    expect(result.lastMigration).toBeNull();
  });
});
