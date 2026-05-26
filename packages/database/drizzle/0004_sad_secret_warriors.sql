ALTER TYPE "public"."field_type_enum" ADD VALUE 'LONG_TEXT';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'MULTIPLE_CHOICE';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'CHECKBOXES';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'DROPDOWN';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'RATING';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'DATE';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'PHONE';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'WEBSITE';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'STATEMENT';--> statement-breakpoint
CREATE TABLE "form_field_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"label" varchar(200) NOT NULL,
	"index" numeric NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "form_field_options" ADD CONSTRAINT "form_field_options_field_id_forms_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."forms_fields"("id") ON DELETE no action ON UPDATE no action;