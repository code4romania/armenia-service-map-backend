-- Align organisations table with current Prisma schema
ALTER TABLE "organisations"
ADD COLUMN IF NOT EXISTS "submission_source" TEXT,
ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reviewed_by_user_id" TEXT,
ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT;

-- Align enum values used by OrganisationStatus in Prisma schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'OrganisationStatus'
      AND e.enumlabel = 'REJECTED'
  ) THEN
    ALTER TYPE "OrganisationStatus" ADD VALUE 'REJECTED';
  END IF;
END $$;
