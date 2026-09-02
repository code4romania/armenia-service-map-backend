import { initializeDatabaseIfNeeded } from './database-init';

describe('initializeDatabaseIfNeeded', () => {
  it('does nothing when disabled', async () => {
    const runMigrateDeploy = jest.fn();

    await initializeDatabaseIfNeeded({ enabled: false }, { runMigrateDeploy });

    expect(runMigrateDeploy).not.toHaveBeenCalled();
  });

  it('runs migrate deploy when enabled', async () => {
    const runMigrateDeploy = jest.fn().mockResolvedValue(undefined);

    await initializeDatabaseIfNeeded({ enabled: true }, { runMigrateDeploy });

    expect(runMigrateDeploy).toHaveBeenCalledTimes(1);
  });
});
