-- The ORG_MEMBER role is retired: every organisation user is an ORG_ADMIN.
-- Promote existing members first, then rebuild the enum without the value
-- (Postgres cannot drop a single enum value in place).
UPDATE "users" SET "role" = 'ORG_ADMIN' WHERE "role" = 'ORG_MEMBER';

ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ORG_ADMIN');

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ORG_ADMIN';

DROP TYPE "Role_old";
