import { createPgClient } from './helpers/pg-client';

describe('Auth status rules (e2e)', () => {
  it('stores expected user status enum values', async () => {
    const client = createPgClient();
    await client.connect();

    try {
      const rows = await client.query<{ enumlabel: string }>(
        `
          SELECT e.enumlabel
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'UserStatus'
          ORDER BY e.enumsortorder
        `,
      );
      const values = rows.rows.map((row) => row.enumlabel);
      expect(values).toEqual(['ACTIVE', 'PENDING', 'SUSPENDED']);
    } finally {
      await client.end();
    }
  });

  it('has active and pending users in seed data, with active users tracking access time', async () => {
    const client = createPgClient();
    await client.connect();

    try {
      const counts = await client.query<{ status: string; count: string }>(
        `
          SELECT status::text AS status, COUNT(*)::int AS count
          FROM users
          WHERE deleted_at IS NULL
          GROUP BY status
        `,
      );

      const byStatus = new Map(counts.rows.map((row) => [row.status, Number(row.count)]));
      expect(byStatus.get('ACTIVE') ?? 0).toBeGreaterThan(0);
      expect(byStatus.get('PENDING') ?? 0).toBeGreaterThan(0);

      const activeWithAccess = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::int AS count
          FROM users
          WHERE status = 'ACTIVE'::"UserStatus"
            AND last_access_at IS NOT NULL
            AND deleted_at IS NULL
        `,
      );
      expect(Number(activeWithAccess.rows[0].count)).toBeGreaterThan(0);
    } finally {
      await client.end();
    }
  });
});
