import { createPgClient } from './helpers/pg-client';
import { randomUUID } from 'crypto';

describe('Need timeline and notifications (e2e)', () => {
  it('persists timeline events and unread notification transitions for a need', async () => {
    const client = createPgClient();
    await client.connect();

    let needId: string | null = null;
    const title = `E2E Need ${Date.now()}`;

    try {
      const actor = await client.query<{ id: string; organisation_id: string | null }>(
        `
          SELECT id, organisation_id
          FROM users
          WHERE role = 'ORG_ADMIN'::"Role"
            AND deleted_at IS NULL
          ORDER BY created_at ASC
          LIMIT 1
        `,
      );
      const admin = await client.query<{ id: string }>(
        `
          SELECT id
          FROM users
          WHERE role = 'SUPER_ADMIN'::"Role"
            AND deleted_at IS NULL
          ORDER BY created_at ASC
          LIMIT 1
        `,
      );
      const region = await client.query<{ id: string }>('SELECT id FROM regions ORDER BY created_at ASC LIMIT 1');

      expect(actor.rows[0]?.organisation_id).toBeTruthy();
      expect(admin.rows[0]?.id).toBeTruthy();
      expect(region.rows[0]?.id).toBeTruthy();

      const needInsert = await client.query<{ id: string }>(
        `
          INSERT INTO need_reports (
            id, title, description, full_name, contact_method, contact_value, region_id, status, assigned_organisation_id, created_at, updated_at
          ) VALUES (
            $1, $2, 'Need timeline test', 'E2E Reporter', 'PHONE', '+37410000999', $3, 'NEW'::"NeedStatus", $4, NOW(), NOW()
          )
          RETURNING id
        `,
        [randomUUID(), title, region.rows[0].id, actor.rows[0].organisation_id],
      );
      needId = needInsert.rows[0].id;

      await client.query(
        `
          INSERT INTO need_report_events (id, need_report_id, user_id, event_type, content, created_at)
          VALUES
            ($1, $2, $3, 'COMMENT'::"NeedReportEventType", 'Initial outreach completed', NOW()),
            ($4, $2, $5, 'STATUS_CHANGE'::"NeedReportEventType", 'Status changed from NEW to IN_PROGRESS', NOW())
        `,
        [randomUUID(), needId, actor.rows[0].id, randomUUID(), admin.rows[0].id],
      );

      await client.query(
        `
          INSERT INTO notifications (id, user_id, type, title, message, created_at)
          VALUES ($1, $2, 'NEED_COMMENT_ADDED'::"NotificationType", 'New comment on need report', $3, NOW())
        `,
        [randomUUID(), admin.rows[0].id, title],
      );

      const events = await client.query<{ event_type: string }>(
        `
          SELECT event_type::text AS event_type
          FROM need_report_events
          WHERE need_report_id = $1
        `,
        [needId],
      );
      const unreadBefore = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::int AS count
          FROM notifications
          WHERE user_id = $1
            AND message = $2
            AND read_at IS NULL
        `,
        [admin.rows[0].id, title],
      );

      expect(events.rows.map((row) => row.event_type)).toEqual(
        expect.arrayContaining(['COMMENT', 'STATUS_CHANGE']),
      );
      expect(Number(unreadBefore.rows[0].count)).toBe(1);

      await client.query(
        `
          UPDATE notifications
          SET read_at = NOW()
          WHERE user_id = $1
            AND message = $2
            AND read_at IS NULL
        `,
        [admin.rows[0].id, title],
      );

      const unreadAfter = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::int AS count
          FROM notifications
          WHERE user_id = $1
            AND message = $2
            AND read_at IS NULL
        `,
        [admin.rows[0].id, title],
      );
      expect(Number(unreadAfter.rows[0].count)).toBe(0);
    } finally {
      await client.query('DELETE FROM notifications WHERE message = $1', [title]);
      if (needId) {
        await client.query('DELETE FROM need_reports WHERE id = $1', [needId]);
      }
      await client.end();
    }
  });
});
