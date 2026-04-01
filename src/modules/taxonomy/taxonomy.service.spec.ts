import { TaxonomyService } from './taxonomy.service';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';

describe('TaxonomyService', () => {
  it('returns top-level topic tree with children', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: 't1', name: 'Parent', children: [{ id: 't2', name: 'Child' }] },
    ]);
    const prisma = {
      topic: { findMany },
    };
    const service = new TaxonomyService(prisma as never, new DomainExceptionService());

    const tree = await service.getTopicTree();
    expect(tree[0].children).toHaveLength(1);
    expect(findMany).toHaveBeenCalled();
  });
});
