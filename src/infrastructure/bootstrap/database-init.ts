import { execSync } from 'node:child_process';
import { Client } from 'pg';

export interface DatabaseInitOptions {
  enabled: boolean;
}

export interface DatabaseInitDeps {
  runMigrateDeploy: () => Promise<void>;
  runSeed: () => Promise<void>;
  getUsersCount: () => Promise<number>;
}

export async function initializeDatabaseIfNeeded(
  options: DatabaseInitOptions,
  deps: DatabaseInitDeps,
): Promise<void> {
  if (!options.enabled) return;

  await deps.runMigrateDeploy();
  const usersCount = await deps.getUsersCount();

  if (usersCount === 0) {
    await deps.runSeed();
  }
}

function runPrismaCommand(command: 'migrate' | 'seed'): Promise<void> {
  const args =
    command === 'migrate'
      ? ['prisma', 'migrate', 'deploy']
      : ['prisma', 'db', 'seed'];

  execSync(`npx ${args.join(' ')}`, {
    stdio: 'inherit',
    env: process.env,
  });
  return Promise.resolve();
}

async function getUsersCountFromDb(databaseUrl: string): Promise<number> {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const result = await client.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM users');
    return Number(result.rows[0]?.count ?? 0);
  } finally {
    await client.end();
  }
}

export async function runDatabaseInitFromEnv(): Promise<void> {
  const enabled = process.env.AUTO_DB_INIT !== 'false';
  if (!enabled) return;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('AUTO_DB_INIT requires DATABASE_URL to be set');
  }

  await initializeDatabaseIfNeeded(
    { enabled: true },
    {
      runMigrateDeploy: () => runPrismaCommand('migrate'),
      runSeed: () => runPrismaCommand('seed'),
      getUsersCount: () => getUsersCountFromDb(databaseUrl),
    },
  );
}
