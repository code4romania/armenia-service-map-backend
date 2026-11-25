import 'reflect-metadata';
import { FeedbackController } from './feedback.controller.js';
import { ROLES_KEY } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';

describe('FeedbackController', () => {
  const list = { execute: jest.fn() };
  const summary = { execute: jest.fn() };
  const exporter = { execute: jest.fn() };
  const controller = new FeedbackController(
    list as never,
    summary as never,
    exporter as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('is restricted to SUPER_ADMIN', () => {
    expect(Reflect.getMetadata(ROLES_KEY, FeedbackController)).toEqual([
      Role.SUPER_ADMIN,
    ]);
  });

  it('list passes filters and pagination', async () => {
    list.execute.mockResolvedValue({ data: [] });
    const out = await controller.list({
      page: 2,
      perPage: 5,
      from: '2026-11-01',
      found: 'YES',
    } as never);
    expect(list.execute).toHaveBeenCalledWith(
      {
        from: '2026-11-01',
        to: undefined,
        found: 'YES',
        fromKarabakh: undefined,
      },
      2,
      5,
    );
    expect(out).toEqual({ data: [] });
  });

  it('list defaults page/perPage', async () => {
    list.execute.mockResolvedValue({});
    await controller.list({});
    expect(list.execute).toHaveBeenCalledWith(expect.any(Object), 1, 10);
  });

  it('summary passes filters', async () => {
    summary.execute.mockResolvedValue({ total: 1 });
    await controller.summary({ to: '2026-11-25' });
    expect(summary.execute).toHaveBeenCalledWith({
      from: undefined,
      to: '2026-11-25',
      found: undefined,
      fromKarabakh: undefined,
    });
  });

  it('export sets Content-Disposition and returns csv', async () => {
    exporter.execute.mockResolvedValue({
      filename: 'feedback-2026.csv',
      csv: 'a,b\r\n',
    });
    const res = { setHeader: jest.fn() };
    const out = await controller.export({}, res as never);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="feedback-2026.csv"',
    );
    expect(out).toBe('a,b\r\n');
  });

  it('export declares text/csv Content-Type header metadata', () => {
    const headers: unknown = Reflect.getMetadata(
      '__headers__',
      (FeedbackController.prototype as unknown as Record<string, object>)[
        'export'
      ],
    );
    expect(headers).toEqual(
      expect.arrayContaining([
        { name: 'Content-Type', value: 'text/csv; charset=utf-8' },
      ]),
    );
  });
});
