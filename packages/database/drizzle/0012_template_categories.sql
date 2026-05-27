CREATE TABLE "template_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"description" varchar(300),
	"icon" varchar(50),
	"index" numeric NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "template_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "template_categories_slug_unique" UNIQUE("slug")
);--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "is_system_template" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "template_clone_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_category_id_template_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."template_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
INSERT INTO "template_categories" ("name", "slug", "description", "icon", "index") VALUES
('Feedback', 'feedback', 'Customer feedback and satisfaction surveys', 'message-square', '0'),
('Registration', 'registration', 'Event and user registration forms', 'user-plus', '1'),
('Contact', 'contact', 'Contact and inquiry forms', 'mail', '2'),
('Application', 'application', 'Job and program applications', 'briefcase', '3'),
('Quiz', 'quiz', 'Quizzes and assessments', 'brain', '4'),
('Order', 'order', 'Order and booking forms', 'shopping-cart', '5');
