CREATE TABLE "system_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_status_key_unique" UNIQUE("key")
);
