# Super-admin email on new need report & new join-network request

Date: 2026-06-08
Branch: `feature/admin-submission-emails`

## Problem

Super admins are not emailed when the two key public submissions arrive:

| Event | Endpoint | Today |
|---|---|---|
| New need report | `POST /public/needs` → `CreateNeedUseCase` | No notification at all (no email, no in-app) |
| New join-network request | `POST /public/join-network` → `CreateJoinNetworkRequestUseCase` | In-app notification to super admins only; **no email** |

## Decisions

- **Recipients:** all active `SUPER_ADMIN` users (`role: SUPER_ADMIN, deletedAt: null`). No new env var.
- **Language:** English only (internal staff), matching org approval/rejection emails.
- **Need reports:** also add the missing in-app notification (mirror join-network), not just email.
- **Templates:** dedicated template files per event, rendered through the existing branded
  `renderEmailLayout` (like `subscription-confirmation.template.ts`). The shared layout is left
  untouched — the footer link slot is repurposed as an **"Open admin dashboard"** link
  (`unsubscribeUrl` → admin review URL, `unsubscribeLabel` → "Open admin dashboard").

## Design

### Templates (new files)

- `src/modules/email/templates/new-need-report-admin.template.ts`
  - `renderNewNeedReportAdminTemplate({ needTitle, needDescription, reporterName, regionName?, adminUrl }) → { subject, html }`
  - Subject: `New need report submitted`
- `src/modules/email/templates/new-join-network-admin.template.ts`
  - `renderNewJoinNetworkAdminTemplate({ organisationName, contactName, contactEmail, servicesDescription, regionName?, adminUrl }) → { subject, html }`
  - Subject: `New join-network request submitted`

Both `escapeHtml` every interpolated value and call `renderEmailLayout`.

### EmailService (two new methods)

```ts
async sendNewNeedReportToAdmin(input: { to: string; needTitle: string; needDescription: string;
  reporterName: string; regionName?: string; adminUrl: string }): Promise<void>
async sendNewJoinNetworkRequestToAdmin(input: { to: string; organisationName: string;
  contactName: string; contactEmail: string; servicesDescription: string;
  regionName?: string; adminUrl: string }): Promise<void>
```

Each renders its template and `transport.sendMail({ from, to, subject, html })`.

### Notification enum + migration

Add `NEED_SUBMITTED` to:
- `src/common/enums/notification-type.enum.ts`
- `prisma/schema.prisma` `enum NotificationType`

Run `prisma migrate dev` **then** `prisma generate` (custom client output needs generate separately).

### Wiring

**`CreateJoinNetworkRequestUseCase`** (small change)
- Widen super-admin query to `select: { id: true, email: true }`.
- Inject `EmailService` + `ConfigService`.
- After existing `createMany`, loop admins → `sendNewJoinNetworkRequestToAdmin`. `adminUrl` =
  `${CORS_ORIGIN}/admin/organisations/${organisation.id}`.
- Wrap email loop in try/catch + log; never reject the submission.

**`CreateNeedUseCase`** (new logic; keep `NeedsService.create` a pure data method)
- Inject `PrismaService`, `NotificationsService`, `EmailService`, `ConfigService`.
- After create: query super admins (`id`, `email`), `notifications.createMany` with
  `type: NEED_SUBMITTED`, metadata `{ needReportId: need.id, route: '/admin/needs/${need.id}' }`
  (FE `getNotificationRoute` consumes a `/`-prefixed `route`).
- Loop admins → `sendNewNeedReportToAdmin`. `adminUrl` = `${CORS_ORIGIN}/admin/needs/${need.id}`.
- Wrap notification + email in try/catch + log; never reject the submission.
- `regionName` from `need.region?.name` (already in `needInclude`).

All four deps are already provided in `UseCaseModule`, so no module wiring beyond constructor changes.

## Tests (TDD, Jest)

- **EmailService spec:** each new method renders correct subject + branded HTML, escapes a
  `<script>`-style injection in a text field, and embeds the expected `adminUrl`.
- **`CreateNeedUseCase` spec (new):** on create → `notifications.createMany` called for all super
  admin ids with `NEED_SUBMITTED`; `sendNewNeedReportToAdmin` called once per admin; email
  rejection is swallowed (use case still resolves with the created need).
- **`CreateJoinNetworkRequestUseCase` spec (extend):** existing in-app assertion stays;
  add assertion that `sendNewJoinNetworkRequestToAdmin` is called per admin.

## Out of scope

- Bilingual admin templates.
- Configurable admin email / digest batching.
- Emails on need updates/comments (already in-app only — unchanged).
