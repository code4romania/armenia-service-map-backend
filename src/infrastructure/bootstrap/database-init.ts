import { execSync } from 'node:child_process';

export interface DatabaseInitOptions {
  enabled: boolean;
}

export interface DatabaseInitDeps {
  runMigrateDeploy: () => Promise<void>;
}

export async function initializeDatabaseIfNeeded(
  options: DatabaseInitOptions,
  deps: DatabaseInitDeps,
): Promise<void> {
  if (!options.enabled) return;

  await deps.runMigrateDeploy();
}

function runMigrateDeploy(): Promise<void> {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
  });
  return Promise.resolve();
}

export async function runDatabaseInitFromEnv(): Promise<void> {
  const enabled = process.env.AUTO_DB_INIT !== 'false';
  if (!enabled) return;

  if (!process.env.DATABASE_URL) {
    throw new Error('AUTO_DB_INIT requires DATABASE_URL to be set');
  }

  await initializeDatabaseIfNeeded({ enabled: true }, { runMigrateDeploy });
}
