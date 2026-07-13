CREATE TABLE "interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"round" text,
	"interview_date" date,
	"interviewer_name" text,
	"interviewer_role" text,
	"format" text,
	"outcome" text DEFAULT 'pending',
	"questions_asked" text,
	"how_it_went" text,
	"lessons_learned" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "why_interested" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "my_pitch" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "questions_to_ask" text;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;