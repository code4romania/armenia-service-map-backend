DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'NotificationType'
      AND e.enumlabel = 'ORG_PENDING_REVIEW'
  ) THEN
    ALTER TYPE "NotificationType" ADD VALUE 'ORG_PENDING_REVIEW';
  END IF;
END $$;
