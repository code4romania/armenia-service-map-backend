# Backend Foundation Upgrade Design (Clean Break)

**Date:** 2026-04-01  
**Project:** Armenia Service Map backend (`armenia-service-map-backend`)  
**Scope Source:** Roadmap `Group 1 + Group 2`, excluding `2.10 Analytics expansion`  
**Execution Mode:** Clean break with destructive reset/reseed (development-only)

## 1. Objective

Implement a production-grade backend upgrade that introduces the new data model, infrastructure modules (upload, email, notifications), and revised API contracts without maintaining backward compatibility with the current frontend/backend contracts.

This slice is done only when:
- all targeted endpoints and workflows are implemented,
- destructive migration + reseed works end-to-end,
- critical tests pass for high-risk flows,
- contracts are stable for the next UI implementation slice.

## 2. Scope

### In Scope
- Full schema rewrite required by roadmap Group 1 and Group 2 (except analytics expansion).
- New infra modules:
  - Upload with presigned URLs and validation.
  - Email service for invitations/password flows.
  - Notifications service + APIs.
- Business lifecycle changes:
  - User/organisation status gating.
  - Service draft/publish lifecycle.
  - Hierarchical topics and target-groups taxonomy.
  - Need report comments/events timeline and notification triggers.
- Seed pipeline update for the new schema.
- Production-grade backend verification for this slice.

### Out of Scope
- Frontend compatibility or adapter layers.
- Analytics expansion endpoints listed in roadmap item `2.10`.
- Public UI/portal redesign.

## 3. Architecture Principles

1. Keep existing layered direction:
   - `api -> usecases -> modules -> infrastructure`.
2. Keep controllers thin:
   - validation, auth context extraction, response orchestration only.
3. Usecases orchestrate workflows:
   - especially multi-entity operations and side effects.
4. Domain services own domain rules/data access.
5. Infra modules remain reusable and feature-agnostic.
6. Multi-entity writes use transactions.
7. External side effects (email) are decoupled from DB state and fail safely.

## 4. Domain Boundaries

### 4.1 Identity & Access
- User statuses: `ACTIVE`, `PENDING`, `SUSPENDED`.
- Login denied for non-active users with explicit error messages.
- Update `last_access_at` on successful login.
- Password setup/reset token lifecycle for invited users.

### 4.2 Organisation Lifecycle
- Expanded organisation profile fields.
- 2-step create flow:
  - create organisation as `PENDING`,
  - create invited users as `PENDING`,
  - send invitation emails.
- Activate/deactivate organisation endpoints.
- Org user management endpoints scoped to organisation.

### 4.3 Service Catalog
- Service status: `DRAFT`, `PUBLISHED`.
- Publish/unpublish endpoints.
- Replace `target_group` array with normalized relation:
  - `target_groups`,
  - `service_target_groups`.
- Visibility rules:
  - public endpoints return only `PUBLISHED` services,
  - admin endpoints can access all statuses,
  - org endpoints return the organisation's own services across both `DRAFT` and `PUBLISHED`.

### 4.4 Taxonomy
- Hierarchical topics:
  - `parent_id` self-reference,
  - topic status `ACTIVE`/`INACTIVE`.
- Need tags gain status field.
- New target groups CRUD with usage-aware delete constraints.

### 4.5 Need Collaboration
- New `need_report_events` timeline model.
- Comment endpoints for admin and org users.
- Automatic event creation for:
  - comments,
  - status changes,
  - tag add/remove,
  - assignment,
  - title edits.
- Notification creation integrated into relevant workflow transitions.

### 4.6 Platform Infrastructure
- Upload module for presigned URL generation and file validation.
- Email module (SMTP dev transport via mailcatcher).
- Notification module for create/read/unread-count/read-all operations.
- Seed/update scripts aligned to final schema.

## 5. Data Model Changes

Core schema actions:
- Expand `users`, `organisations`, `topics`, `services`, `need_tags`.
- Add `target_groups`, `service_target_groups`, `need_report_events`, `notifications`.
- Remove service `target_group` array field and migrate logic to join table.
- Keep clean-break destructive migration:
  - no backward compatibility columns,
  - no runtime dual-read/dual-write.

Reset strategy:
- Drop/reset development DB.
- Apply fresh migration set.
- Run updated seed.
- Smoke-check key queries and endpoint startup.

## 6. API Contract Design

### 6.1 Upload
- `POST /upload/presigned-url`
  - validates file type and size by category.
  - returns upload URL + final file URL.

### 6.2 Auth
- `POST /auth/login`: deny `PENDING/SUSPENDED`.
- `POST /auth/refresh`: allowed only for `ACTIVE` users; suspended/pending users cannot refresh.
- `POST /auth/password-setup` (token-based flow for invited users).

### 6.3 Users (Admin)
- CRUD includes new profile/status fields.
- Activate/deactivate/reset-password endpoints.
- List supports status filtering.

### 6.4 Organisations (Admin)
- Expanded CRUD.
- Creation accepts organisation data + users list.
- Activate/deactivate endpoints.
- Org-scoped member management endpoints.

### 6.5 Services
- Create/update supports `status` + target-group relation IDs.
- Publish/unpublish endpoints.
- Public visibility constrained to published services.

### 6.6 Topics / Need Tags / Target Groups
- Topics API returns hierarchical tree for admin/public.
- Need tags and target groups support status toggles and usage-aware deletes.

### 6.7 Needs
- Comment endpoints for admin/org.
- Events timeline endpoint.
- Existing need update/assign flows emit timeline events and notifications.

### 6.8 Notifications
- List, unread count, mark single as read, mark all as read.

### 6.9 Notification Trigger Matrix
- `NEED_ASSIGNED`:
  - recipients: users in the assigned organisation (org admins + org members).
- `NEED_STATUS_CHANGED`:
  - recipients: super admins and assigned organisation users, excluding the actor.
- `NEED_COMMENT_ADDED`:
  - recipients: super admins and assigned organisation users, excluding the actor.
- `SERVICE_PUBLISHED`:
  - recipients: super admins (audit/oversight visibility).
- `ORG_ACTIVATED`:
  - recipients: users belonging to the activated organisation.

## 7. Workflow Orchestration Rules

### 7.1 Organisation Creation
1. Validate org payload + user list.
2. Transaction:
   - create org (`PENDING`),
   - create users (`PENDING`).
3. Post-transaction side effects:
   - invitation token generation,
   - invitation email dispatch.
4. Failures in email dispatch do not corrupt core DB writes; errors are surfaced/logged.

### 7.2 Need Update with Events + Notifications
1. Validate update operation.
2. Transaction:
   - apply state/tag/assignment/title change,
   - persist matching event row(s),
   - persist notification rows for affected users.
3. Return updated need aggregate.

### 7.3 Service Publish
1. Validate ownership/permissions and required data readiness.
2. Update status to `PUBLISHED`.
3. Create `SERVICE_PUBLISHED` notifications for all super admins.

## 8. Error Handling

Standardized domain failures:
- `400` validation and malformed transition attempts.
- `401/403` auth and role/ownership violations.
- `404` missing entities.
- `409` conflicts (duplicate identifiers, forbidden state transitions).

Specialized behavior:
- explicit login errors for `PENDING`/`SUSPENDED`,
- explicit upload errors for unsupported type/size limits,
- explicit delete-blocking errors for taxonomy entities with active usage.

## 9. Implementation Strategy (Internal Waves)

### Wave A — Schema & Reset Foundation
- Prisma schema rewrite.
- Migrations reset flow.
- Seed rewrite for new model.
- Compile/type fix pass.

### Wave B — Infra Modules
- Upload module and endpoint.
- Email module + invitation template plumbing.
- Notifications module and service.

### Wave C — Identity + Organisation Lifecycle
- Auth status enforcement and `last_access_at`.
- Password setup flow.
- Users and organisations API contract upgrades.

### Wave D — Service + Taxonomy Contracts
- Services status/publish/unpublish + target group relation migration.
- Hierarchical topics.
- Need tags status + target groups module.

### Wave E — Need Collaboration + Notifications API
- Need comments/events timeline endpoints.
- Event generation on state mutations.
- Notification endpoints and read-state management.

### Wave F — Production-Grade Hardening
- Targeted test suite and integration checks.
- Error-path validation and edge-case coverage.
- Final contract verification and docs updates.

## 10. Verification Plan (Production-Grade Gate)

Required before declaring slice complete:

1. **Migration and seed verification**
- reset DB, migrate, generate client, seed successfully.

2. **Unit tests (critical logic)**
- auth status gating,
- org onboarding orchestration,
- service publish lifecycle rules,
- hierarchical taxonomy constraints,
- need-event and notification trigger mapping.

3. **Integration tests (critical APIs)**
- auth lifecycle,
- org create/invite/activate path,
- need comment + timeline + notification read/unread flow.

4. **Manual smoke checks**
- app boots with strict config validation,
- critical endpoints return expected contract shapes.

## 11. Risks and Mitigations

1. **Risk:** schema breakages cascade into many DTO/usecase/service files.  
   **Mitigation:** wave-based cutovers with compile checks after each wave.

2. **Risk:** side-effect coupling (email/notifications) causes transactional complexity.  
   **Mitigation:** transactional DB core + post-commit side-effect dispatch.

3. **Risk:** endpoint drift between admin/org/public variants.  
   **Mitigation:** shared DTO patterns and contract-level verification checklist.

4. **Risk:** pre-existing workspace changes create merge noise.  
   **Mitigation:** keep this slice scoped to backend modules and isolate commits logically.

## 12. Done Criteria

This backend slice is complete when all are true:
- Group 1 + Group 2 (except 2.10 analytics expansion) are implemented.
- Database reset + migration + seed is reproducible on development setup.
- All required tests for this slice pass.
- API contracts are stable for the next UI implementation slice.
- Backend docs/env notes are updated for new modules and required variables.
