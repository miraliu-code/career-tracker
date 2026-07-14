CREATE TABLE "badges_earned" (
	"id" serial PRIMARY KEY NOT NULL,
	"badge_key" text NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	CONSTRAINT "badges_earned_badge_key_unique" UNIQUE("badge_key")
);
