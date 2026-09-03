import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NeedQueryDto } from './needs/dto/need-query.dto';
import { OrgUserQueryDto } from './org/dto/org-user-query.dto';
import { OrganisationQueryDto } from './organisations/dto/organisation-query.dto';
import { ServiceQueryDto } from './services/dto/service-query.dto';
import { NeedTagQueryDto } from './taxonomy/dto/need-tag-query.dto';
import { TargetGroupQueryDto } from './taxonomy/dto/target-group-query.dto';
import { TopicQueryDto } from './taxonomy/dto/topic-query.dto';
import { UserQueryDto } from './users/dto/user-query.dto';

type Case = {
  name: string;
  dto: new () => { sortBy?: string };
  defaultSort: string;
  allowed: string[];
};

const cases: Case[] = [
  { name: 'OrganisationQueryDto', dto: OrganisationQueryDto, defaultSort: 'name', allowed: ['name', 'status', 'createdAt', 'updatedAt'] },
  { name: 'UserQueryDto', dto: UserQueryDto, defaultSort: 'firstName', allowed: ['firstName', 'lastName', 'email', 'status', 'lastAccessAt', 'createdAt'] },
  { name: 'OrgUserQueryDto', dto: OrgUserQueryDto, defaultSort: 'firstName', allowed: ['firstName', 'email', 'phone', 'status', 'lastAccessAt'] },
  { name: 'ServiceQueryDto', dto: ServiceQueryDto, defaultSort: 'title', allowed: ['title', 'status', 'isAvailable', 'createdAt', 'updatedAt'] },
  { name: 'NeedQueryDto', dto: NeedQueryDto, defaultSort: 'createdAt', allowed: ['title', 'status', 'createdAt', 'updatedAt'] },
  { name: 'TopicQueryDto', dto: TopicQueryDto, defaultSort: 'sortOrder', allowed: ['name', 'status', 'sortOrder', 'createdAt', 'updatedAt'] },
  { name: 'NeedTagQueryDto', dto: NeedTagQueryDto, defaultSort: 'name', allowed: ['name', 'status', 'createdAt', 'updatedAt'] },
  { name: 'TargetGroupQueryDto', dto: TargetGroupQueryDto, defaultSort: 'name', allowed: ['name', 'status', 'createdAt', 'updatedAt'] },
];

async function check(dto: Case['dto'], plain: Record<string, unknown>) {
  const instance: { sortBy?: string } = plainToInstance(dto, plain);
  const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
  return { instance, errors };
}

describe.each(cases)('$name sortBy allowlist', ({ dto, defaultSort, allowed }) => {
  it(`defaults sortBy to "${defaultSort}"`, async () => {
    const { instance, errors } = await check(dto, {});
    expect(errors).toHaveLength(0);
    expect(instance.sortBy).toBe(defaultSort);
  });

  it.each(allowed)('accepts sortBy=%s', async (field) => {
    const { instance, errors } = await check(dto, { sortBy: field });
    expect(errors).toHaveLength(0);
    expect(instance.sortBy).toBe(field);
  });

  it.each(['passwordHash', 'refreshToken', 'organisation', 'nope', ''])(
    'rejects sortBy=%s',
    async (field) => {
      const { errors } = await check(dto, { sortBy: field });
      expect(errors.map((e) => e.property)).toEqual(['sortBy']);
    },
  );
});
