CREATE TYPE "public"."form_status_enum" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "status" "form_status_enum" DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "slug" varchar(80);--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_slug_unique" UNIQUE("slug");