CREATE TABLE "application_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"requirement_type" text NOT NULL,
	"slot_index" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"status" text,
	"contact_name" text,
	"contact_info" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "application_requirements" ADD CONSTRAINT "application_requirements_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;