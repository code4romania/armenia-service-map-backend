import { Client } from 'pg';

describe('Schema foundation (e2e)', () => {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://armenia_user:armenia_pass@localhost:5432/armenia_service_map';

  it('exposes clean-break tables', async () => {
    const client = new Client({ connectionString });
    await client.connect();
    try {
      const rows = await client.query<{ tablename: string }>(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
      );
      const tableNames = rows.rows.map((row) => row.tablename);

      expect(tableNames).toContain('target_groups');
      expect(tableNames).toContain('need_report_events');
      expect(tableNames).toContain('notifications');
    } finally {
      await client.end();
    }
  });
});
