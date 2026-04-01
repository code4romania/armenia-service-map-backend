-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MEMBER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OrganisationStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "NeedStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'SOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NeedReportEventType" AS ENUM ('COMMENT', 'STATUS_CHANGE', 'TAG_ADDED', 'TAG_REMOVED', 'ASSIGNED', 'TITLE_EDITED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEED_ASSIGNED', 'NEED_STATUS_CHANGED', 'NEED_COMMENT_ADDED', 'SERVICE_PUBLISHED', 'ORG_ACTIVATED');

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "svg_path_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legal_name" TEXT,
    "description" TEXT,
    "website" TEXT,
    "country" TEXT,
    "street_address" TEXT,
    "location" TEXT,
    "organisation_type" TEXT,
    "unique_identifier" TEXT,
    "category" TEXT,
    "activity_domain" TEXT,
    "legal_rep_name" TEXT,
    "legal_rep_email" TEXT,
    "legal_rep_phone" TEXT,
    "contact_person_name" TEXT,
    "contact_person_email" TEXT,
    "contact_person_phone" TEXT,
    "legal_document_url" TEXT,
    "logo_url" TEXT,
    "observations" TEXT,
    "tags" TEXT[],
    "status" "OrganisationStatus" NOT NULL DEFAULT 'PENDING',
    "region_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_access_at" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'ORG_MEMBER',
    "organisation_id" TEXT,
    "avatar_url" TEXT,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "parent_id" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "region_id" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'DRAFT',
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "availability_start" TIMESTAMP(3),
    "availability_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_topics" (
    "service_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "service_topics_pkey" PRIMARY KEY ("service_id","topic_id")
);

-- CreateTable
CREATE TABLE "target_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_target_groups" (
    "service_id" TEXT NOT NULL,
    "target_group_id" TEXT NOT NULL,

    CONSTRAINT "service_target_groups_pkey" PRIMARY KEY ("service_id","target_group_id")
);

-- CreateTable
CREATE TABLE "need_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "need_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "need_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "contact_method" TEXT NOT NULL,
    "contact_value" TEXT NOT NULL,
    "region_id" TEXT,
    "status" "NeedStatus" NOT NULL DEFAULT 'NEW',
    "assigned_organisation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "need_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "need_report_tags" (
    "need_report_id" TEXT NOT NULL,
    "need_tag_id" TEXT NOT NULL,

    CONSTRAINT "need_report_tags_pkey" PRIMARY KEY ("need_report_id","need_tag_id")
);

-- CreateTable
CREATE TABLE "need_report_events" (
    "id" TEXT NOT NULL,
    "need_report_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" "NeedReportEventType" NOT NULL,
    "content" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "need_report_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "region_id" TEXT,
    "topic_ids" TEXT[],
    "results_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_slug_key" ON "regions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE INDEX "topics_parent_id_idx" ON "topics"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "need_tags_slug_key" ON "need_tags"("slug");

-- CreateIndex
CREATE INDEX "need_report_events_need_report_id_created_at_idx" ON "need_report_events"("need_report_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- AddForeignKey
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_topics" ADD CONSTRAINT "service_topics_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_topics" ADD CONSTRAINT "service_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_target_groups" ADD CONSTRAINT "service_target_groups_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_target_groups" ADD CONSTRAINT "service_target_groups_target_group_id_fkey" FOREIGN KEY ("target_group_id") REFERENCES "target_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "need_reports" ADD CONSTRAINT "need_reports_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "need_reports" ADD CONSTRAINT "need_reports_assigned_organisation_id_fkey" FOREIGN KEY ("assigned_organisation_id") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "need_report_tags" ADD CONSTRAINT "need_report_tags_need_report_id_fkey" FOREIGN KEY ("need_report_id") REFERENCES "need_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "need_report_tags" ADD CONSTRAINT "need_report_tags_need_tag_id_fkey" FOREIGN KEY ("need_tag_id") REFERENCES "need_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "need_report_events" ADD CONSTRAINT "need_report_events_need_report_id_fkey" FOREIGN KEY ("need_report_id") REFERENCES "need_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "need_report_events" ADD CONSTRAINT "need_report_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_logs" ADD CONSTRAINT "search_logs_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

