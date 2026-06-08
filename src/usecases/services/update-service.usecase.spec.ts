import { UpdateServiceUseCase } from './update-service.usecase';

describe('UpdateServiceUseCase publish hook', () => {
  it('notifies when status transitions DRAFT -> PUBLISHED', async () => {
    const servicesService = {
      findOne: jest.fn().mockResolvedValue({ id: 'svc1', status: 'DRAFT' }),
      update: jest.fn().mockResolvedValue({ id: 'svc1', status: 'PUBLISHED' }),
    };
    const notify = { execute: jest.fn().mockResolvedValue(undefined) };
    const useCase = new UpdateServiceUseCase(servicesService as never, notify as never);

    await useCase.execute('svc1', { status: 'PUBLISHED' as never });
    await Promise.resolve(); // let the fire-and-forget microtask run

    expect(notify.execute).toHaveBeenCalledWith('svc1');
  });

  it('does NOT notify when editing an already PUBLISHED service', async () => {
    const servicesService = {
      findOne: jest.fn().mockResolvedValue({ id: 'svc1', status: 'PUBLISHED' }),
      update: jest.fn().mockResolvedValue({ id: 'svc1', status: 'PUBLISHED' }),
    };
    const notify = { execute: jest.fn().mockResolvedValue(undefined) };
    const useCase = new UpdateServiceUseCase(servicesService as never, notify as never);

    await useCase.execute('svc1', { title: 'New title' });
    await Promise.resolve();

    expect(notify.execute).not.toHaveBeenCalled();
  });
});
