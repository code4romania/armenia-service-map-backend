-- AlterTable
ALTER TABLE "services" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "short_description" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "how_to_access" DROP NOT NULL,
ALTER COLUMN "how_to_access" DROP DEFAULT;
