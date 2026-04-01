# Backend Foundation Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a production-grade clean-break backend upgrade for Group 1 + Group 2 (except analytics expansion), including schema, infra modules, lifecycle APIs, and verification gates.

**Architecture:** Keep the existing NestJS layering (`api -> usecases -> modules -> infrastructure`) and implement in vertical slices that are independently testable. Multi-entity write flows must run inside Prisma transactions, with email side-effects executed after successful DB commits. Public/admin/org API contracts must be explicit and consistent with new status-driven visibility rules.

**Tech Stack:** NestJS 11, Prisma 7.5, PostgreSQL, JWT (passport-jwt), bcrypt, MinIO/S3 presigned uploads, SMTP (mailcatcher), Jest unit + e2e tests

---

## File Structure Map

### Core schema and seed
- Modify: `prisma/schema.prisma`
- Modify/Create: `prisma/migrations/*`
- Modify: `prisma/seed.ts`

### New shared enums/contracts
- Create: `src/common/enums/user-status.enum.ts`
- Create: `src/common/enums/organisation-status.enum.ts`
- Create: `src/common/enums/service-status.enum.ts`
- Create: `src/common/enums/topic-status.enum.ts`
- Create: `src/common/enums/entity-status.enum.ts`
- Create: `src/common/enums/need-report-event-type.enum.ts`
- Create: `src/common/enums/notification-type.enum.ts`

### Infra modules
- Create: `src/modules/upload/*`
- Create: `src/modules/email/*`
- Create: `src/modules/notifications/*`

### API/controllers/DTOs
- Modify: `src/api/api.module.ts`
- Create/Modify: `src/api/upload/*`
- Modify: `src/api/auth/*`
- Modify: `src/api/users/*`
- Modify: `src/api/organisations/*`
- Modify: `src/api/services/*`
- Modify: `src/api/org/*`
- Modify: `src/api/public/public.controller.ts`
- Modify: `src/api/taxonomy/*`
- Modify: `src/api/needs/*`
- Create: `src/api/notifications/notifications.controller.ts`

### Usecases and module services
- Modify/Create: `src/usecases/**/*`
- Modify/Create: `src/modules/**/*`
- Modify: `src/usecases/use-case.module.ts`
- Modify: `src/app.module.ts`

### Tests
- Create: `src/modules/auth/auth.service.spec.ts`
- Create: `src/modules/services/services.service.spec.ts`
- Create: `src/modules/taxonomy/taxonomy.service.spec.ts`
- Create: `src/modules/needs/needs.service.spec.ts`
- Create: `src/modules/notifications/notifications.service.spec.ts`
- Create: `test/schema-foundation.e2e-spec.ts`
- Create: `test/auth-status.e2e-spec.ts`
- Create: `test/org-onboarding.e2e-spec.ts`
- Create: `test/needs-timeline-notifications.e2e-spec.ts`

### Documentation
- Modify: `.env.example`
- Modify: `.env`
- Modify/Create: `README.md` (backend section for reset/migrate/seed and new env vars)

Execution references: use `@superpowers/test-driven-development` and `@superpowers/verification-before-completion` while implementing this plan.

---

### Task 1: Rewrite Prisma Schema for Clean-Break Foundation

**Files:**
- Modify: `prisma/schema.prisma`
- Modify/Create: `prisma/migrations/*`
- Create: `src/common/enums/user-status.enum.ts`
- Create: `src/common/enums/organisation-status.enum.ts`
- Create: `src/common/enums/service-status.enum.ts`
- Create: `src/common/enums/topic-status.enum.ts`
- Create: `src/common/enums/entity-status.enum.ts`
- Create: `src/common/enums/need-report-event-type.enum.ts`
- Create: `src/common/enums/notification-type.enum.ts`
- Test: `test/schema-foundation.e2e-spec.ts`

- [ ] **Step 1: Write the failing schema foundation test**

```ts
// test/schema-foundation.e2e-spec.ts
it('exposes core clean-break tables', async () => {
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  const names = rows.map((r) => r.tablename);
  expect(names).toContain('target_groups');
  expect(names).toContain('need_report_events');
  expect(names).toContain('notifications');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:e2e -- test/schema-foundation.e2e-spec.ts`  
Expected: FAIL because new tables/enums do not exist yet.

- [ ] **Step 3: Implement schema and enum changes**

```prisma
model Service {
  id        String        @id @default(uuid())
  status    ServiceStatus @default(DRAFT)
  // targetGroup removed; relation added
  targetGroups ServiceTargetGroup[]
}
```

- [ ] **Step 4: Run migration, generate client, and rerun test**

Run: `npx prisma migrate dev --name backend_foundation_upgrade`  
Run: `npx prisma generate`  
Run: `npm run test:e2e -- test/schema-foundation.e2e-spec.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations src/common/enums test/schema-foundation.e2e-spec.ts
git commit -m "feat: add clean-break schema foundation and core enums"
```

### Task 2: Add Upload Module with Presigned URL Endpoint

**Files:**
- Modify: `package.json`
- Create: `src/modules/upload/upload.module.ts`
- Create: `src/modules/upload/upload.service.ts`
- Create: `src/usecases/upload/get-presigned-url.usecase.ts`
- Create: `src/api/upload/dto/create-presigned-url.dto.ts`
- Create: `src/api/upload/upload.controller.ts`
- Modify: `src/api/api.module.ts`
- Modify: `src/usecases/use-case.module.ts`
- Test: `src/modules/upload/upload.service.spec.ts`

- [ ] **Step 1: Write failing unit tests for file validation and URL generation**

```ts
it('rejects unsupported mime type', async () => {
  await expect(service.createPresignedUrl({ mimeType: 'text/plain' }))
    .rejects.toThrow('Unsupported file type');
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- modules/upload/upload.service.spec.ts`  
Expected: FAIL with missing module/service implementation.

- [ ] **Step 3: Implement upload service and controller**

```ts
async createPresignedUrl(input: CreatePresignedUrlInput) {
  this.assertAllowedMime(input.mimeType, input.category);
  this.assertSizeLimit(input.sizeBytes, input.category);
  return { uploadUrl, fileUrl };
}
```

- [ ] **Step 4: Verify tests and compile**

Run: `npm test -- modules/upload/upload.service.spec.ts`  
Run: `npm run build`  
Expected: PASS + clean build.

- [ ] **Step 5: Commit**

```bash
git add package.json src/modules/upload src/usecases/upload src/api/upload src/api/api.module.ts src/usecases/use-case.module.ts
git commit -m "feat: add upload module with presigned URL API"
```

### Task 3: Add Email Module for Invitations and Password Flows

**Files:**
- Create: `src/modules/email/email.module.ts`
- Create: `src/modules/email/email.service.ts`
- Create: `src/modules/email/templates/invitation.template.ts`
- Create: `src/modules/email/templates/reset-password.template.ts`
- Modify: `src/infrastructure/config/app.config.ts`
- Modify: `.env.example`
- Modify: `.env`
- Test: `src/modules/email/email.service.spec.ts`

- [ ] **Step 1: Write failing tests for email template payloads**

```ts
it('renders invitation template with setup URL', () => {
  const html = service.renderInvitation({ setupUrl: 'https://x/set' });
  expect(html).toContain('https://x/set');
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- modules/email/email.service.spec.ts`  
Expected: FAIL because service/templates do not exist.

- [ ] **Step 3: Implement SMTP-backed email module**

```ts
await this.transporter.sendMail({
  from: this.config.getOrThrow('MAIL_FROM'),
  to,
  subject,
  html,
});
```

- [ ] **Step 4: Verify tests and app config validation**

Run: `npm test -- modules/email/email.service.spec.ts`  
Run: `npm run build`  
Expected: PASS and no config validation type errors.

- [ ] **Step 5: Commit**

```bash
git add src/modules/email src/infrastructure/config/app.config.ts .env.example .env
git commit -m "feat: add email module for invitation and reset flows"
```

### Task 4: Add Notifications Domain Module and Core Service

**Files:**
- Create: `src/modules/notifications/notifications.module.ts`
- Create: `src/modules/notifications/notifications.service.ts`
- Create: `src/usecases/notifications/get-notifications.usecase.ts`
- Create: `src/usecases/notifications/get-unread-count.usecase.ts`
- Create: `src/usecases/notifications/mark-notification-read.usecase.ts`
- Create: `src/usecases/notifications/mark-all-notifications-read.usecase.ts`
- Modify: `src/usecases/use-case.module.ts`
- Modify: `src/app.module.ts`
- Test: `src/modules/notifications/notifications.service.spec.ts`

- [ ] **Step 1: Write failing tests for unread/read transitions**

```ts
it('marks all unread notifications as read', async () => {
  await service.markAllAsRead('user-1');
  const count = await service.getUnreadCount('user-1');
  expect(count).toBe(0);
});
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- modules/notifications/notifications.service.spec.ts`  
Expected: FAIL due missing notification service.

- [ ] **Step 3: Implement notification service methods**

```ts
async markAllAsRead(userId: string) {
  await this.prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
```

- [ ] **Step 4: Run tests and build**

Run: `npm test -- modules/notifications/notifications.service.spec.ts`  
Run: `npm run build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/notifications src/usecases/notifications src/usecases/use-case.module.ts src/app.module.ts
git commit -m "feat: add notifications domain service and usecases"
```

### Task 5: Upgrade Auth for Status Gating and Password Setup

**Files:**
- Modify: `src/modules/auth/auth.service.ts`
- Modify: `src/api/auth/auth.controller.ts`
- Create: `src/api/auth/dto/password-setup.dto.ts`
- Create: `src/usecases/auth/password-setup.usecase.ts`
- Modify: `src/modules/auth/auth.module.ts`
- Modify: `src/usecases/use-case.module.ts`
- Test: `src/modules/auth/auth.service.spec.ts`
- Test: `test/auth-status.e2e-spec.ts`

- [ ] **Step 1: Write failing unit/e2e tests for status restrictions**

```ts
it('denies login for pending user', async () => {
  await expect(service.login('pending@example.com', 'x')).rejects.toThrow('pending');
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- modules/auth/auth.service.spec.ts`  
Run: `npm run test:e2e -- test/auth-status.e2e-spec.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement auth status checks and setup endpoint**

```ts
if (user.status !== UserStatus.ACTIVE) {
  throw new UnauthorizedException('Account is pending or suspended');
}
await this.prisma.user.update({ where: { id: user.id }, data: { lastAccessAt: new Date() } });
```

- [ ] **Step 4: Run tests and build**

Run: `npm test -- modules/auth/auth.service.spec.ts`  
Run: `npm run test:e2e -- test/auth-status.e2e-spec.ts`  
Run: `npm run build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/auth src/api/auth src/usecases/auth src/usecases/use-case.module.ts test/auth-status.e2e-spec.ts
git commit -m "feat: enforce auth status rules and password setup flow"
```

### Task 6: Upgrade Users API with Status and Reset Password Email

**Files:**
- Modify: `src/api/users/dto/create-user.dto.ts`
- Modify: `src/api/users/dto/update-user.dto.ts`
- Modify: `src/api/users/users.controller.ts`
- Modify: `src/modules/users/users.service.ts`
- Create: `src/usecases/users/activate-user.usecase.ts`
- Create: `src/usecases/users/deactivate-user.usecase.ts`
- Create: `src/usecases/users/reset-user-password.usecase.ts`
- Modify: `src/usecases/use-case.module.ts`
- Test: `src/modules/users/users.service.spec.ts`

- [ ] **Step 1: Write failing tests for activate/deactivate/reset flows**

```ts
it('deactivates user by setting SUSPENDED status', async () => {
  const updated = await service.deactivate('user-1');
  expect(updated.status).toBe('SUSPENDED');
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- modules/users/users.service.spec.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement new user lifecycle endpoints and service methods**

```ts
@Post(':id/deactivate')
async deactivate(@Param('id') id: string) {
  return this.deactivateUser.execute(id);
}
```

- [ ] **Step 4: Run tests and compile**

Run: `npm test -- modules/users/users.service.spec.ts`  
Run: `npm run build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api/users src/modules/users src/usecases/users src/usecases/use-case.module.ts
git commit -m "feat: add user status lifecycle and reset-password flow"
```

### Task 7: Upgrade Organisations API with 2-Step Onboarding + Invitations

**Files:**
- Modify: `src/api/organisations/dto/create-organisation.dto.ts`
- Modify: `src/api/organisations/dto/update-organisation.dto.ts`
- Modify: `src/api/organisations/organisations.controller.ts`
- Modify: `src/modules/organisations/organisations.service.ts`
- Create: `src/usecases/organisations/activate-organisation.usecase.ts`
- Create: `src/usecases/organisations/deactivate-organisation.usecase.ts`
- Create: `src/usecases/organisations/create-organisation-with-users.usecase.ts`
- Modify: `src/usecases/use-case.module.ts`
- Test: `test/org-onboarding.e2e-spec.ts`

- [ ] **Step 1: Write failing e2e test for onboarding transaction**

```ts
it('creates pending organisation and pending users atomically', async () => {
  const res = await request(app.getHttpServer()).post('/api/admin/organisations').send(payload);
  expect(res.body.status).toBe('PENDING');
  expect(res.body.users[0].status).toBe('PENDING');
});
```

- [ ] **Step 2: Run test and verify failure**

Run: `npm run test:e2e -- test/org-onboarding.e2e-spec.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement transactional onboarding + invitation email dispatch**

```ts
await this.prisma.$transaction(async (tx) => {
  const organisation = await tx.organisation.create({ data: orgData });
  await tx.user.createMany({ data: usersData });
});
```

- [ ] **Step 4: Rerun test and build**

Run: `npm run test:e2e -- test/org-onboarding.e2e-spec.ts`  
Run: `npm run build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api/organisations src/modules/organisations src/usecases/organisations src/usecases/use-case.module.ts test/org-onboarding.e2e-spec.ts
git commit -m "feat: add organisation onboarding with invited users"
```

### Task 8: Migrate Services to Draft/Publish + Target Group Relations

**Files:**
- Modify: `src/api/services/dto/create-service.dto.ts`
- Modify: `src/api/services/dto/update-service.dto.ts`
- Modify: `src/api/services/services.controller.ts`
- Modify: `src/api/org/org-services.controller.ts`
- Modify: `src/api/public/public.controller.ts`
- Modify: `src/modules/services/services.service.ts`
- Create: `src/usecases/services/publish-service.usecase.ts`
- Create: `src/usecases/services/unpublish-service.usecase.ts`
- Modify: `src/usecases/use-case.module.ts`
- Test: `src/modules/services/services.service.spec.ts`

- [ ] **Step 1: Write failing tests for publish visibility and target group relation writes**

```ts
it('public query excludes DRAFT services', async () => {
  const list = await service.findPublicMany({});
  expect(list.data.every((s) => s.status === 'PUBLISHED')).toBe(true);
});
```

- [ ] **Step 2: Verify failing test**

Run: `npm test -- modules/services/services.service.spec.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement status lifecycle + relation-based target groups**

```ts
await this.prisma.service.update({
  where: { id },
  data: { status: ServiceStatus.PUBLISHED },
});
```

- [ ] **Step 4: Run tests and compile**

Run: `npm test -- modules/services/services.service.spec.ts`  
Run: `npm run build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api/services src/api/org/org-services.controller.ts src/api/public/public.controller.ts src/modules/services src/usecases/services src/usecases/use-case.module.ts
git commit -m "feat: add service publish lifecycle and target group relations"
```

### Task 9: Implement Hierarchical Topics, Need Tag Status, and Target Groups API

**Files:**
- Modify: `src/api/taxonomy/taxonomy.controller.ts`
- Modify: `src/api/taxonomy/dto/create-topic.dto.ts`
- Modify: `src/api/taxonomy/dto/update-topic.dto.ts`
- Modify: `src/api/taxonomy/dto/create-need-tag.dto.ts`
- Modify: `src/api/taxonomy/dto/update-need-tag.dto.ts`
- Create: `src/api/taxonomy/dto/create-target-group.dto.ts`
- Create: `src/api/taxonomy/dto/update-target-group.dto.ts`
- Modify: `src/modules/taxonomy/taxonomy.service.ts`
- Create: `src/usecases/taxonomy/get-many-target-groups.usecase.ts`
- Create: `src/usecases/taxonomy/create-target-group.usecase.ts`
- Create: `src/usecases/taxonomy/update-target-group.usecase.ts`
- Create: `src/usecases/taxonomy/delete-target-group.usecase.ts`
- Modify: `src/usecases/use-case.module.ts`
- Test: `src/modules/taxonomy/taxonomy.service.spec.ts`

- [ ] **Step 1: Write failing tests for hierarchical topic tree and usage-safe deletes**

```ts
it('returns top-level topics with nested active children', async () => {
  const tree = await service.getTopicTree();
  expect(tree[0].children).toBeDefined();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- modules/taxonomy/taxonomy.service.spec.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement topic tree and target group CRUD**

```ts
async getTopicTree() {
  return this.prisma.topic.findMany({
    where: { parentId: null, status: 'ACTIVE' },
    include: { children: { where: { status: 'ACTIVE' } } },
  });
}
```

- [ ] **Step 4: Verify tests/build**

Run: `npm test -- modules/taxonomy/taxonomy.service.spec.ts`  
Run: `npm run build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api/taxonomy src/modules/taxonomy src/usecases/taxonomy src/usecases/use-case.module.ts
git commit -m "feat: add hierarchical taxonomy and target groups API"
```

### Task 10: Add Need Events/Comments Timeline and Trigger Notifications

**Files:**
- Modify: `src/api/needs/needs.controller.ts`
- Modify: `src/api/org/org-needs.controller.ts`
- Create: `src/api/needs/dto/create-need-comment.dto.ts`
- Modify: `src/modules/needs/needs.service.ts`
- Create: `src/usecases/needs/add-need-comment.usecase.ts`
- Create: `src/usecases/needs/get-need-events.usecase.ts`
- Modify: `src/usecases/needs/update-need.usecase.ts`
- Modify: `src/usecases/needs/assign-need.usecase.ts`
- Modify: `src/usecases/use-case.module.ts`
- Test: `src/modules/needs/needs.service.spec.ts`
- Test: `test/needs-timeline-notifications.e2e-spec.ts`

- [ ] **Step 1: Write failing tests for event creation and notification triggering**

```ts
it('creates COMMENT event and notifications when comment is added', async () => {
  await service.addComment({ needReportId: 'need-1', userId: 'u-1', content: 'Update' });
  const events = await service.getEvents('need-1');
  expect(events[0].eventType).toBe('COMMENT');
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- modules/needs/needs.service.spec.ts`  
Run: `npm run test:e2e -- test/needs-timeline-notifications.e2e-spec.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement comments/events timeline and trigger hooks**

```ts
await tx.needReportEvent.create({
  data: { needReportId, userId, eventType: NeedReportEventType.COMMENT, content },
});
await this.notificationsService.createMany(recipients, payload);
```

- [ ] **Step 4: Run tests and build**

Run: `npm test -- modules/needs/needs.service.spec.ts`  
Run: `npm run test:e2e -- test/needs-timeline-notifications.e2e-spec.ts`  
Run: `npm run build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api/needs src/api/org/org-needs.controller.ts src/modules/needs src/usecases/needs src/usecases/use-case.module.ts test/needs-timeline-notifications.e2e-spec.ts
git commit -m "feat: add need events timeline and comment workflows"
```

### Task 11: Expose Notifications API Endpoints

**Files:**
- Create: `src/api/notifications/notifications.controller.ts`
- Modify: `src/api/api.module.ts`
- Modify: `src/common/interfaces/authenticated-request.interface.ts`
- Test: `test/notifications-api.e2e-spec.ts`

- [ ] **Step 1: Write failing e2e tests for list/unread/read/read-all**

```ts
it('returns unread count and marks one as read', async () => {
  const count = await request(app.getHttpServer()).get('/api/notifications/unread-count');
  expect(count.status).toBe(200);
});
```

- [ ] **Step 2: Run test and verify failure**

Run: `npm run test:e2e -- test/notifications-api.e2e-spec.ts`  
Expected: FAIL due missing controller/routes.

- [ ] **Step 3: Implement controller endpoints backed by notification usecases**

```ts
@Patch(':id/read')
async markRead(@Param('id') id: string, @CurrentUser('sub') userId: string) {
  return this.markNotificationRead.execute(id, userId);
}
```

- [ ] **Step 4: Rerun e2e and build**

Run: `npm run test:e2e -- test/notifications-api.e2e-spec.ts`  
Run: `npm run build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api/notifications src/api/api.module.ts test/notifications-api.e2e-spec.ts
git commit -m "feat: add notifications API endpoints"
```

### Task 12: Seed Overhaul, Verification Sweep, and Docs Update

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `README.md`
- Modify: `.env.example`
- Test: `test/seed-smoke.e2e-spec.ts`

- [ ] **Step 1: Write failing seed smoke test**

```ts
it('seeds hierarchical topics, target groups, events, and notifications', async () => {
  const topicCount = await prisma.topic.count();
  expect(topicCount).toBeGreaterThan(1);
});
```

- [ ] **Step 2: Run seed smoke test and verify failure**

Run: `npm run test:e2e -- test/seed-smoke.e2e-spec.ts`  
Expected: FAIL due incomplete seed data.

- [ ] **Step 3: Implement seed overhaul and docs**

```ts
await prisma.targetGroup.createMany({ data: [{ name: 'Women', status: 'ACTIVE' }] });
await prisma.needReportEvent.create({ data: { ... } });
await prisma.notification.create({ data: { ... } });
```

- [ ] **Step 4: Execute production-grade verification bundle**

Run: `npx prisma migrate reset --force --skip-seed && npx prisma migrate deploy && npm run build`  
Run: `npm run test`  
Run: `npm run test:e2e`  
Run: `npx prisma db seed`  
Expected: PASS for build/tests and successful seed completion.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts README.md .env.example test/seed-smoke.e2e-spec.ts
git commit -m "chore: complete seed data and production-grade verification docs"
```

---

## Final Completion Checklist

- [x] Group 1 implemented end-to-end (schema, upload, email, notifications, seed).
- [x] Group 2 implemented end-to-end, including analytics expansion (`2.10`).
- [x] Public/admin/org API status visibility rules verified.
- [x] Destructive reset/migrate/seed workflow reproducible.
- [x] Unit + e2e tests for high-risk flows pass.
- [x] Backend documentation updated for new env vars and lifecycle flows.

### Status Update (2026-04-01)

- Backend foundation upgrade is implemented and verified.
- Analytics expansion endpoints are added:
  - `GET /admin/analytics/top-queries`
  - `GET /admin/analytics/zero-result-queries`
  - `GET /admin/analytics/search-frequency`
  - `GET /admin/analytics/all-searches`
  - `GET /admin/analytics/most-used-filters`
  - `GET /admin/analytics/least-used-filters`
  - `GET /admin/analytics/filter-heatmap`
- Latest verification evidence:
  - `npm run build` passed
  - `npm test` passed
  - `npm run test:e2e` passed
  - `npx prisma migrate status` up to date
