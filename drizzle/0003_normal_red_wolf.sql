CREATE TABLE "alert_findings" (
	"id" serial PRIMARY KEY NOT NULL,
	"gmail_message_id" text NOT NULL,
	"subject" text,
	"sender" text,
	"received_at" timestamp,
	"company_id" integer,
	"matched_company" text,
	"signal" text,
	"excerpt" text,
	"status" text DEFAULT 'new',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "alert_findings_gmail_message_id_unique" UNIQUE("gmail_message_id")
);
--> statement-breakpoint
ALTER TABLE "alert_findings" ADD CONSTRAINT "alert_findings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;