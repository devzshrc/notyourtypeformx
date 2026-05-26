CREATE TYPE "public"."form_event_type_enum" AS ENUM('VIEW', 'START');--> statement-breakpoint
CREATE TABLE "form_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"type" "form_event_type_enum" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "forms_fields" ADD COLUMN "scores" jsonb;--> statement-breakpoint
ALTER TABLE "form_events" ADD CONSTRAINT "form_events_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;