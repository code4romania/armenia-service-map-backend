import { NotFoundException } from '@nestjs/common';
import { PublicController } from './public.controller';

function makeController(getOneResult: unknown) {
  const getOneService = { execute: jest.fn().mockResolvedValue(getOneResult) };
  // Only getOneService (3rd constructor arg) is exercised here; others are unused.
  const controller = new PublicController(
    null as never,
    null as never,
    getOneService as never,
    null as never,
    null as never,
    null as never,
    null as never,
    null as never,
  );
  return { controller, getOneService };
}

describe('PublicController.getService', () => {
  it('attaches availabilityState to a PUBLISHED service', async () => {
    const { controller } = makeController({
      id: 's1',
      status: 'PUBLISHED',
      isAvailable: true,
      availabilityStart: null,
      availabilityEnd: null,
    });

    const result = await controller.getService('s1');

    expect(result.availabilityState).toBe('AVAILABLE');
  });

  it('throws NotFound for a non-PUBLISHED service', async () => {
    const { controller } = makeController({ id: 's1', status: 'DRAFT' });

    await expect(controller.getService('s1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
