import { createPgClient } from './helpers/pg-client';
import { randomUUID } from 'crypto';

describe('Notifications API contract (e2e)', () => {
  it('supports unread -> read -> read-all state transitions', async () => {
    const client = createPgClient();
    await client.connect();

    const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const email = `notifications-${suffix}@refugeesupport.am`;
    const userId = randomUUID();
    const firstNotificationId = randomUUID();
    const secondNotificationId = randomUUID();

    try {
      const userInsert = await client.query<{ id: string }>(
        `
          INSERT INTO users (
            id, email, password_hash, first_name, last_name, role, status, created_at, updated_at
          ) VALUES (
            $1, $2, 'hash', 'Notifications', 'Tester', 'ORG_MEMBER'::"Role", 'ACTIVE'::"UserStatus", NOW(), NOW()
          )
          RETURNING id
        `,
        [userId, email],
      );
      const insertedUserId = userInsert.rows[0].id;

      const inserted = await client.query<{ id: string }>(
        `
          INSERT INTO notifications (id, user_id, type, title, message, created_at)
          VALUES
            ($1, $3, 'NEED_ASSIGNED'::"NotificationType", 'Assigned', 'Need assigned', NOW()),
            ($2, $3, 'NEED_COMMENT_ADDED'::"NotificationType", 'Comment', 'Comment added', NOW())
          RETURNING id
        `,
        [firstNotificationId, secondNotificationId, insertedUserId],
      );

      const unreadBefore = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::int AS count
          FROM notifications
          WHERE user_id = $1
            AND read_at IS NULL
        `,
        [insertedUserId],
      );
      expect(Number(unreadBefore.rows[0].count)).toBe(2);

      await client.query(
        `
          UPDATE notifications
          SET read_at = NOW()
          WHERE id = $1
        `,
        [inserted.rows[0].id],
      );

      const unreadAfterOne = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::int AS count
          FROM notifications
          WHERE user_id = $1
            AND read_at IS NULL
        `,
        [insertedUserId],
      );
      expect(Number(unreadAfterOne.rows[0].count)).toBe(1);

      await client.query(
        `
          UPDATE notifications
          SET read_at = NOW()
          WHERE user_id = $1
            AND read_at IS NULL
        `,
        [insertedUserId],
      );
      const unreadAfterAll = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::int AS count
          FROM notifications
          WHERE user_id = $1
            AND read_at IS NULL
        `,
        [insertedUserId],
      );
      expect(Number(unreadAfterAll.rows[0].count)).toBe(0);
    } finally {
      await client.query('DELETE FROM users WHERE id = $1 OR email = $2', [userId, email]);
      await client.end();
    }
  });
});
