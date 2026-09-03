-- CreateTable
CREATE TABLE "organisation_regions" (
    "organisation_id" TEXT NOT NULL,
    "region_id" TEXT NOT NULL,

    CONSTRAINT "organisation_regions_pkey" PRIMARY KEY ("organisation_id","region_id")
);

-- CreateIndex
CREATE INDEX "organisation_regions_region_id_idx" ON "organisation_regions"("region_id");

-- AddForeignKey
ALTER TABLE "organisation_regions" ADD CONSTRAINT "organisation_regions_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_regions" ADD CONSTRAINT "organisation_regions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing single-region organisations into the join table
INSERT INTO "organisation_regions" ("organisation_id", "region_id")
SELECT "id", "region_id" FROM "organisations" WHERE "region_id" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "organisations" DROP CONSTRAINT "organisations_region_id_fkey";

-- AlterTable
ALTER TABLE "organisations" DROP COLUMN "region_id";
