-- CreateEnum
CREATE TYPE "FeedbackUsefulness" AS ENUM ('NOT_AT_ALL', 'SLIGHTLY', 'MODERATELY', 'VERY', 'EXTREMELY');

-- CreateEnum
CREATE TYPE "FeedbackFound" AS ENUM ('YES', 'PARTLY', 'NO');

-- CreateEnum
CREATE TYPE "FeedbackKarabakh" AS ENUM ('YES', 'NO', 'PREFER_NOT_TO_SAY');

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "usefulness" "FeedbackUsefulness" NOT NULL,
    "found" "FeedbackFound" NOT NULL,
    "looking_for" TEXT,
    "from_karabakh" "FeedbackKarabakh" NOT NULL,
    "locale" TEXT NOT NULL,
    "page_path" TEXT NOT NULL,
    "service_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedback_created_at_idx" ON "feedback"("created_at");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
