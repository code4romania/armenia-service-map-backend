import { Client } from 'pg';

describe('Database seed smoke (e2e)', () => {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://armenia_user:armenia_pass@localhost:5432/armenia_service_map';

  it('has seeded regions and users', async () => {
    const client = new Client({ connectionString });
    await client.connect();
    try {
      const regions = await client.query<{ count: string }>('SELECT COUNT(*)::int AS count FROM regions');
      const users = await client.query<{ count: string }>('SELECT COUNT(*)::int AS count FROM users');
      expect(Number(regions.rows[0].count)).toBeGreaterThan(0);
      expect(Number(users.rows[0].count)).toBeGreaterThan(0);
    } finally {
      await client.end();
    }
  });
});
