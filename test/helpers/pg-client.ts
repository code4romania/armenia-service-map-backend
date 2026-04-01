import { Client } from 'pg';

export const TEST_DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://armenia_user:armenia_pass@localhost:5432/armenia_service_map';

export function createPgClient() {
  return new Client({ connectionString: TEST_DATABASE_URL });
}
