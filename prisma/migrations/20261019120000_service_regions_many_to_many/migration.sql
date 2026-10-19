-- CreateTable
CREATE TABLE "service_regions" (
    "service_id" TEXT NOT NULL,
    "region_id" TEXT NOT NULL,

    CONSTRAINT "service_regions_pkey" PRIMARY KEY ("service_id","region_id")
);

-- CreateIndex
CREATE INDEX "service_regions_region_id_idx" ON "service_regions"("region_id");

-- AddForeignKey
ALTER TABLE "service_regions" ADD CONSTRAINT "service_regions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_regions" ADD CONSTRAINT "service_regions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing single-region services into the join table (NULL = all regions stays empty)
INSERT INTO "service_regions" ("service_id", "region_id")
SELECT "id", "region_id" FROM "services" WHERE "region_id" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_region_id_fkey";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "region_id";
