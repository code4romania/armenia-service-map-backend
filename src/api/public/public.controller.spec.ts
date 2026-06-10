import { NotFoundException } from '@nestjs/common';
import { PublicController } from './public.controller';
import { ServiceStatus } from '../../common/enums/service-status.enum.js';

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

function makeControllerWithPrisma(regions: unknown[]) {
  const findMany = jest.fn().mockResolvedValue(regions);
  const prisma = { region: { findMany } };
  const controller = new PublicController(
    prisma as never,
    null as never,
    null as never,
    null as never,
    null as never,
    null as never,
    null as never,
    null as never,
  );
  return { controller, findMany };
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

  it('computes availabilityState from the service fields, not a constant', async () => {
    // isAvailable: false is deterministic (clock-independent) and proves real computation
    const { controller } = makeController({
      id: 's1',
      status: 'PUBLISHED',
      isAvailable: false,
      availabilityStart: null,
      availabilityEnd: null,
    });

    const result = await controller.getService('s1');

    expect(result.availabilityState).toBe('UNAVAILABLE');
  });

  it('throws NotFound for a non-PUBLISHED service', async () => {
    const { controller } = makeController({ id: 's1', status: 'DRAFT' });

    await expect(controller.getService('s1')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('PublicController.regionServiceCounts', () => {
  it('counts only PUBLISHED services per region', async () => {
    const { controller, findMany } = makeControllerWithPrisma([
      { svgPathId: 'AM-ER', _count: { services: 2 } },
    ]);

    const result = await controller.regionServiceCounts();

    expect(result).toEqual({ 'AM-ER': 2 });
    expect(findMany).toHaveBeenCalledWith({
      select: {
        svgPathId: true,
        _count: {
          select: {
            services: { where: { status: ServiceStatus.PUBLISHED } },
          },
        },
      },
    });
  });
});
