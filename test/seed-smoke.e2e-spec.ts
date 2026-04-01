import { createPgClient } from './helpers/pg-client';

describe('Seed smoke (e2e)', () => {
  it('seeds hierarchical topics, target groups, events, and notifications', async () => {
    const client = createPgClient();
    await client.connect();

    try {
      const topLevelTopics = await client.query<{ count: string }>(
        'SELECT COUNT(*)::int AS count FROM topics WHERE parent_id IS NULL',
      );
      const subTopics = await client.query<{ count: string }>(
        'SELECT COUNT(*)::int AS count FROM topics WHERE parent_id IS NOT NULL',
      );
      const targetGroups = await client.query<{ count: string }>('SELECT COUNT(*)::int AS count FROM target_groups');
      const events = await client.query<{ count: string }>('SELECT COUNT(*)::int AS count FROM need_report_events');
      const notifications = await client.query<{ count: string }>('SELECT COUNT(*)::int AS count FROM notifications');
      const activeDetailedOrgs = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::int AS count
          FROM organisations
          WHERE status = 'ACTIVE'::"OrganisationStatus"
            AND legal_name IS NOT NULL
            AND country IS NOT NULL
            AND location IS NOT NULL
        `,
      );

      expect(Number(topLevelTopics.rows[0].count)).toBeGreaterThan(0);
      expect(Number(subTopics.rows[0].count)).toBeGreaterThan(0);
      expect(Number(targetGroups.rows[0].count)).toBeGreaterThan(0);
      expect(Number(events.rows[0].count)).toBeGreaterThan(0);
      expect(Number(notifications.rows[0].count)).toBeGreaterThan(0);
      expect(Number(activeDetailedOrgs.rows[0].count)).toBeGreaterThan(0);
    } finally {
      await client.end();
    }
  });
});
