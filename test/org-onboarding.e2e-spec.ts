import { createPgClient } from './helpers/pg-client';
import { randomUUID } from 'crypto';

describe('Organisation onboarding data model (e2e)', () => {
  it('can create a pending organisation with pending users in one transaction', async () => {
    const client = createPgClient();
    await client.connect();

    const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const orgName = `E2E Org ${suffix}`;
    const userOneEmail = `org-one-${suffix}@refugeesupport.am`;
    const userTwoEmail = `org-two-${suffix}@refugeesupport.am`;
    const createdOrganisationId = randomUUID();
    const userOneId = randomUUID();
    const userTwoId = randomUUID();
    let txOpen = false;

    try {
      await client.query('BEGIN');
      txOpen = true;
      const orgInsert = await client.query<{ id: string }>(
        `
          INSERT INTO organisations (id, name, status, created_at, updated_at, tags)
          VALUES ($1, $2, 'PENDING'::"OrganisationStatus", NOW(), NOW(), '{}')
          RETURNING id
        `,
        [createdOrganisationId, orgName],
      );
      const insertedOrganisationId = orgInsert.rows[0].id;

      await client.query(
        `
          INSERT INTO users (
            id, email, password_hash, first_name, last_name, role, status, organisation_id, created_at, updated_at
          ) VALUES
            ($1, $2, 'hash-a', 'Org', 'User One', 'ORG_MEMBER'::"Role", 'PENDING'::"UserStatus", $5, NOW(), NOW()),
            ($3, $4, 'hash-b', 'Org', 'User Two', 'ORG_MEMBER'::"Role", 'PENDING'::"UserStatus", $5, NOW(), NOW())
        `,
        [userOneId, userOneEmail, userTwoId, userTwoEmail, insertedOrganisationId],
      );
      await client.query('COMMIT');
      txOpen = false;

      const org = await client.query<{ status: string }>(
        `SELECT status::text AS status FROM organisations WHERE id = $1`,
        [insertedOrganisationId],
      );
      const users = await client.query<{ status: string }>(
        `SELECT status::text AS status FROM users WHERE organisation_id = $1 ORDER BY email`,
        [insertedOrganisationId],
      );

      expect(org.rows[0].status).toBe('PENDING');
      expect(users.rows).toHaveLength(2);
      expect(users.rows.every((row) => row.status === 'PENDING')).toBe(true);
    } catch (error) {
      if (txOpen) {
        await client.query('ROLLBACK');
      }
      throw error;
    } finally {
      await client.query(
        `
          DELETE FROM users
          WHERE email IN ($1, $2)
        `,
        [userOneEmail, userTwoEmail],
      );
      await client.query('DELETE FROM organisations WHERE id = $1', [createdOrganisationId]);
      await client.end();
    }
  });

  it('retains no partial organisation row when transaction is rolled back', async () => {
    const client = createPgClient();
    await client.connect();

    const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const orgName = `E2E Rollback Org ${suffix}`;
    const orgId = randomUUID();

    try {
      await client.query('BEGIN');
      await client.query(
        `
          INSERT INTO organisations (id, name, status, created_at, updated_at, tags)
          VALUES ($1, $2, 'PENDING'::"OrganisationStatus", NOW(), NOW(), '{}')
        `,
        [orgId, orgName],
      );
      await client.query('ROLLBACK');

      const orgCount = await client.query<{ count: string }>(
        'SELECT COUNT(*)::int AS count FROM organisations WHERE name = $1',
        [orgName],
      );
      expect(Number(orgCount.rows[0].count)).toBe(0);
    } finally {
      await client.end();
    }
  });
});
