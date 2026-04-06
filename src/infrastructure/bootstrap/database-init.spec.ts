import { initializeDatabaseIfNeeded } from './database-init';

describe('initializeDatabaseIfNeeded', () => {
  it('does nothing when disabled', async () => {
    const runMigrateDeploy = jest.fn();
    const runSeed = jest.fn();
    const getUsersCount = jest.fn();

    await initializeDatabaseIfNeeded(
      { enabled: false },
      { runMigrateDeploy, runSeed, getUsersCount },
    );

    expect(runMigrateDeploy).not.toHaveBeenCalled();
    expect(getUsersCount).not.toHaveBeenCalled();
    expect(runSeed).not.toHaveBeenCalled();
  });

  it('runs migrate then seed when users table is empty', async () => {
    const runMigrateDeploy = jest.fn().mockResolvedValue(undefined);
    const runSeed = jest.fn().mockResolvedValue(undefined);
    const getUsersCount = jest.fn().mockResolvedValue(0);

    await initializeDatabaseIfNeeded(
      { enabled: true },
      { runMigrateDeploy, runSeed, getUsersCount },
    );

    expect(runMigrateDeploy).toHaveBeenCalledTimes(1);
    expect(getUsersCount).toHaveBeenCalledTimes(1);
    expect(runSeed).toHaveBeenCalledTimes(1);
    expect(runMigrateDeploy.mock.invocationCallOrder[0]).toBeLessThan(getUsersCount.mock.invocationCallOrder[0]);
    expect(getUsersCount.mock.invocationCallOrder[0]).toBeLessThan(runSeed.mock.invocationCallOrder[0]);
  });

  it('runs migrate but skips seed when users already exist', async () => {
    const runMigrateDeploy = jest.fn().mockResolvedValue(undefined);
    const runSeed = jest.fn().mockResolvedValue(undefined);
    const getUsersCount = jest.fn().mockResolvedValue(2);

    await initializeDatabaseIfNeeded(
      { enabled: true },
      { runMigrateDeploy, runSeed, getUsersCount },
    );

    expect(runMigrateDeploy).toHaveBeenCalledTimes(1);
    expect(getUsersCount).toHaveBeenCalledTimes(1);
    expect(runSeed).not.toHaveBeenCalled();
  });
});
