-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_organisation_id_fkey";

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "external_organisation_name" TEXT,
ALTER COLUMN "organisation_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
