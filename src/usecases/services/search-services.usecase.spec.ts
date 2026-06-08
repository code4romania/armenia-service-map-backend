import { SearchServicesUseCase } from './search-services.usecase';
import { ServiceStatus } from '../../common/enums/service-status.enum';

function makeUseCase(findManyResult: unknown) {
  const findMany = jest.fn().mockResolvedValue(findManyResult);
  const servicesService = { findMany } as never;
  return { useCase: new SearchServicesUseCase(servicesService), findMany };
}

const emptyPage = { data: [], meta: { total: 0, page: 1, perPage: 10, totalPages: 0 } };

describe('SearchServicesUseCase', () => {
  it('queries only PUBLISHED services without forcing isAvailable', async () => {
    const { useCase, findMany } = makeUseCase(emptyPage);

    await useCase.execute({ search: 'food' });

    const arg = findMany.mock.calls[0][0];
    expect(arg.status).toBe(ServiceStatus.PUBLISHED);
    expect(arg.isAvailable).toBeUndefined();
    expect(arg.availableOn).toBeUndefined();
  });

  it('translates an isAvailable=true query into an availableOn date filter', async () => {
    const { useCase, findMany } = makeUseCase(emptyPage);

    await useCase.execute({ isAvailable: true });

    const arg = findMany.mock.calls[0][0];
    expect(arg.isAvailable).toBeUndefined();
    expect(arg.availableOn).toBeInstanceOf(Date);
    // confirm the reference date was floored (Armenia-day start, still a UTC-midnight timestamp)
    expect(arg.availableOn.toISOString()).toMatch(/T00:00:00\.000Z$/);
  });

  it('attaches availabilityState to each returned service', async () => {
    const { useCase } = makeUseCase({
      data: [
        { id: 's1', isAvailable: true, availabilityStart: null, availabilityEnd: null },
        { id: 's2', isAvailable: false, availabilityStart: null, availabilityEnd: null },
      ],
      meta: { total: 2, page: 1, perPage: 10, totalPages: 1 },
    });

    const result = await useCase.execute({});

    expect(result.data.map((s: { availabilityState: string }) => s.availabilityState)).toEqual([
      'AVAILABLE',
      'UNAVAILABLE',
    ]);
  });
});
