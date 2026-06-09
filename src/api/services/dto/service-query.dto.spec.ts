import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ServiceQueryDto } from './service-query.dto';

const uuidA = '11111111-1111-4111-8111-111111111111';
const uuidB = '22222222-2222-4222-8222-222222222222';

describe('ServiceQueryDto topicIds', () => {
  it('parses a comma-separated topicIds string into an array', () => {
    const dto = plainToInstance(ServiceQueryDto, { topicIds: `${uuidA},${uuidB}` });
    expect(dto.topicIds).toEqual([uuidA, uuidB]);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('accepts a single id with no comma', () => {
    const dto = plainToInstance(ServiceQueryDto, { topicIds: uuidA });
    expect(dto.topicIds).toEqual([uuidA]);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects topicIds containing a non-uuid value', () => {
    const dto = plainToInstance(ServiceQueryDto, { topicIds: `${uuidA},not-a-uuid` });
    expect(validateSync(dto).map((e) => e.property)).toContain('topicIds');
  });

  it('leaves topicIds undefined when absent', () => {
    const dto = plainToInstance(ServiceQueryDto, {});
    expect(dto.topicIds).toBeUndefined();
    expect(validateSync(dto)).toHaveLength(0);
  });
});
