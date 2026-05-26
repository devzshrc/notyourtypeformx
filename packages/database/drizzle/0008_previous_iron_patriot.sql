ALTER TABLE "forms" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "max_responses" integer;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "password" varchar(100);--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;