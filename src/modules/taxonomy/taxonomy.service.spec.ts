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

  it('returns one topic with child rows and usage metadata', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'parent-1',
      name: 'Psychological help',
      status: 'ACTIVE',
      children: [{ id: 'child-1', name: 'Counselling', status: 'ACTIVE', _count: { services: 2 } }],
      _count: { services: 5 },
    });
    const prisma = {
      topic: { findUnique },
    };
    const service = new TaxonomyService(prisma as never, new DomainExceptionService());

    const topic = await service.findOneTopic('parent-1');

    expect(topic.children[0].name).toBe('Counselling');
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'parent-1' } }));
  });

  it('updates a parent topic and synchronizes nested subtopics in one request', async () => {
    const findUnique = jest.fn().mockImplementation(({ where: { id, slug } }: { where: { id?: string; slug?: string } }) => {
      if (typeof id === 'string') {
        return Promise.resolve({ id: 'parent-1', slug: 'psychological-help', children: [] });
      }
      if (typeof slug === 'string') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });
    const findFirst = jest.fn().mockResolvedValue(null);
    const update = jest.fn().mockResolvedValue({ id: 'parent-1' });
    const create = jest.fn().mockResolvedValue({ id: 'child-2' });
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      topic: { findUnique, findFirst, update, create, deleteMany },
      $transaction: jest.fn(async (work: (tx: typeof prisma) => Promise<unknown>) => work(prisma)),
    };
    const service = new TaxonomyService(prisma as never, new DomainExceptionService());

    await service.updateTopic('parent-1', {
      name: 'Psychological help',
      slug: 'psychological-help',
      subtopics: [
        { id: 'child-1', name: 'Counselling', status: 'ACTIVE', sortOrder: 0 },
        { name: 'Support groups', status: 'INACTIVE', sortOrder: 1 },
      ],
      removedSubtopicIds: ['child-9'],
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['child-9'] },
        parentId: 'parent-1',
      },
    });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'child-1' },
      data: expect.objectContaining({ name: 'Counselling', status: 'ACTIVE', sortOrder: 0 }),
    }));
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ name: 'Support groups', parentId: 'parent-1', status: 'INACTIVE', sortOrder: 1 }),
    }));
  });

  it('creates a parent topic and reads it back through the transaction client', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'parent-1' });
    const findUnique = jest.fn().mockImplementation(({ where: { id, slug } }: { where: { id?: string; slug?: string } }) => {
      if (typeof id === 'string') {
        return Promise.resolve({
          id: 'parent-1',
          name: 'Psychological help',
          slug: 'psychological-help',
          status: 'ACTIVE',
          children: [],
          _count: { services: 0 },
        });
      }
      if (typeof slug === 'string') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });
    const prisma = {
      topic: { findUnique: jest.fn().mockResolvedValue(null), create },
      $transaction: jest.fn(async (work: (tx: { topic: { create: typeof create; findUnique: typeof findUnique } }) => Promise<unknown>) =>
        work({ topic: { create, findUnique } })),
    };
    const service = new TaxonomyService(prisma as never, new DomainExceptionService());

    await service.createTopic({
      name: 'Psychological help',
      subtopics: [{ name: 'Counselling', status: 'ACTIVE', sortOrder: 0 }],
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'parent-1' } }));
  });

  it('creates unique slugs automatically for parent topics and subtopics', async () => {
    const takenSlugs = new Map<string, unknown>([
      ['counselling', { id: 'existing-subtopic' }],
      ['psychological-help', null],
      ['counselling-2', null],
      ['parent-1', {
        id: 'parent-1',
        name: 'Psychological help',
        slug: 'psychological-help',
        status: 'ACTIVE',
        children: [],
        _count: { services: 0 },
      }],
    ]);
    const topicFindUnique = jest.fn().mockImplementation(({ where: { slug, id } }: { where: { slug?: string; id?: string } }) => {
      if (typeof id === 'string') return Promise.resolve(takenSlugs.get(id) ?? null);
      if (typeof slug === 'string') return Promise.resolve(takenSlugs.get(slug) ?? null);
      return Promise.resolve(null);
    });
    const create = jest.fn().mockResolvedValue({ id: 'parent-1' });
    const prisma = {
      topic: { findUnique: topicFindUnique, create },
      $transaction: jest.fn(async (work: (tx: { topic: { findUnique: typeof topicFindUnique; create: typeof create } }) => Promise<unknown>) =>
        work({ topic: { findUnique: topicFindUnique, create } })),
    };
    const service = new TaxonomyService(prisma as never, new DomainExceptionService());

    await service.createTopic({
      name: 'Psychological help',
      subtopics: [{ name: 'Counselling', status: 'ACTIVE', sortOrder: 0 }],
    });

    expect(create).toHaveBeenNthCalledWith(1, expect.objectContaining({
      data: expect.objectContaining({ slug: 'psychological-help' }),
    }));
    expect(create).toHaveBeenNthCalledWith(2, expect.objectContaining({
      data: expect.objectContaining({ slug: 'counselling-2' }),
    }));
  });
});
