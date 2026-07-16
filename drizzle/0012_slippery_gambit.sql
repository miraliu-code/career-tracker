CREATE TABLE "skill_hours_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"hours" integer NOT NULL,
	"logged_on" date DEFAULT now(),
	"note" text
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"section" text NOT NULL,
	"skill_type" text NOT NULL,
	"learning_notes" text,
	"proof" text,
	"proof_url" text,
	"status" text,
	"hours_logged" integer DEFAULT 0 NOT NULL,
	"target_hours" integer,
	"completed_at" date,
	"resources" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "skill_hours_log" ADD CONSTRAINT "skill_hours_log_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;