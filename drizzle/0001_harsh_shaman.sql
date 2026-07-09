CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"organization" text,
	"deadline" date,
	"location" text,
	"status" text DEFAULT 'not_started',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
