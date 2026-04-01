# Armenia Service Map Backend

NestJS + Prisma backend for the Armenia Service Map project.

## Stack

- NestJS 11
- Prisma 7.5 + PostgreSQL
- JWT auth (access + refresh)
- MinIO/S3 presigned uploads
- SMTP email delivery (Mailcatcher in development)

## Prerequisites

- Node.js 22+
- npm 10+
- PostgreSQL available locally

## Environment Setup

1. Install dependencies:

```bash
npm install
```

2. Copy and edit env values:

```bash
cp .env.example .env
```

Required env variables include:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`
- `UPLOAD_MAX_IMAGE_BYTES`, `UPLOAD_MAX_DOCUMENT_BYTES`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_FROM`
- `PORT`, `CORS_ORIGIN`

## Database Workflow (Development)

Apply the current migration set and seed data:

```bash
npx prisma migrate reset --force
npx prisma db seed
```

Check migration status:

```bash
npx prisma migrate status
```

## Run the API

```bash
npm run start:dev
```

API base URL (default): `http://localhost:3000/api`

## Seeded Credentials (Development)

All seeded users use password `admin123`:

- Super admin: `admin@refugeesupport.am`
- Org admin: `org-admin@refugeesupport.am`
- Org member (pending): `org-member@refugeesupport.am`

## Verification Commands

Build and tests:

```bash
npm run build
npm test
npm run test:e2e
```

Focused e2e suites for the backend foundation upgrade:

```bash
npm run test:e2e -- test/schema-foundation.e2e-spec.ts
npm run test:e2e -- test/auth-status.e2e-spec.ts
npm run test:e2e -- test/org-onboarding.e2e-spec.ts
npm run test:e2e -- test/needs-timeline-notifications.e2e-spec.ts
npm run test:e2e -- test/notifications-api.e2e-spec.ts
npm run test:e2e -- test/seed-smoke.e2e-spec.ts
```

## Notes

- E2E tests in `test/*.e2e-spec.ts` are implemented with `pg` integration queries for stable execution in this Jest environment.
- The backend follows the layered structure: `api -> usecases -> modules -> infrastructure`.
