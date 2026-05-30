ALTER TABLE "forms" ADD COLUMN "notify_email" varchar(200);--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "webhook_url" varchar(500);--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "closed_message" text;--> statement-breakpoint
ALTER TABLE "forms_fields" ADD COLUMN "validation" jsonb;
