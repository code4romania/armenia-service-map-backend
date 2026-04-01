import { createPgClient } from './helpers/pg-client';
import { randomUUID } from 'crypto';

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

  it('has active users in seed data, tracks access time, and supports pending status persistence', async () => {
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

      const organisation = await client.query<{ id: string }>(
        `
          SELECT id
          FROM organisations
          WHERE deleted_at IS NULL
          ORDER BY created_at ASC
          LIMIT 1
        `,
      );
      expect(organisation.rows).toHaveLength(1);

      const pendingEmail = `e2e-pending-${Date.now()}-${Math.floor(Math.random() * 100000)}@refugeesupport.am`;
      const pendingUserId = randomUUID();

      try {
        await client.query(
          `
            INSERT INTO users (
              id, email, password_hash, first_name, last_name, role, status, organisation_id, created_at, updated_at
            ) VALUES (
              $1, $2, 'hash', 'Pending', 'User', 'ORG_MEMBER'::"Role", 'PENDING'::"UserStatus", $3, NOW(), NOW()
            )
          `,
          [pendingUserId, pendingEmail, organisation.rows[0].id],
        );

        const pendingRows = await client.query<{ count: string }>(
          `
            SELECT COUNT(*)::int AS count
            FROM users
            WHERE email = $1
              AND status = 'PENDING'::"UserStatus"
              AND deleted_at IS NULL
          `,
          [pendingEmail],
        );
        expect(Number(pendingRows.rows[0].count)).toBe(1);
      } finally {
        await client.query('DELETE FROM users WHERE id = $1', [pendingUserId]);
      }
    } finally {
      await client.end();
    }
  });
});
