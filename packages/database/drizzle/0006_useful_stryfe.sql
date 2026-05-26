ALTER TABLE "forms" ADD COLUMN "hidden_fields" jsonb;--> statement-breakpoint
ALTER TABLE "forms_fields" ADD COLUMN "logic" jsonb;