import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  hqLocation: text("hq_location"),
  dreamTier: text("dream_tier", { enum: ["A", "B", "C"] }),
  notes: text("notes"),
  jobBoardType: text("job_board_type", {
    enum: ["greenhouse", "lever", "none"],
  }),
  jobBoardSlug: text("job_board_slug"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  roleTitle: text("role_title").notNull(),
  type: text("type", { enum: ["internship", "new_grad"] }),
  location: text("location"),
  deadline: date("deadline"),
  status: text("status", {
    enum: ["not_started", "applied", "interviewing", "offer", "rejected"],
  }).default("not_started"),
  resumeVersion: text("resume_version"),
  notes: text("notes"),
  // Interview prep notes (collapsible "Prep" section in the form).
  whyInterested: text("why_interested"),
  myPitch: text("my_pitch"),
  questionsToAsk: text("questions_to_ask"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  round: text("round"),
  interviewDate: date("interview_date"),
  interviewerName: text("interviewer_name"),
  interviewerRole: text("interviewer_role"),
  format: text("format", {
    enum: ["behavioral", "case", "technical", "presentation", "other"],
  }),
  outcome: text("outcome", {
    enum: ["pending", "passed", "rejected"],
  }).default("pending"),
  questionsAsked: text("questions_asked"),
  howItWent: text("how_it_went"),
  lessonsLearned: text("lessons_learned"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  name: text("name").notNull(),
  role: text("role"),
  connectionType: text("connection_type", {
    enum: ["alum", "recruiter", "mentor", "colleague", "peer", "other"],
  }),
  lastContactDate: date("last_contact_date"),
  nextFollowupDate: date("next_followup_date"),
  primaryContact: text("primary_contact"),
  secondaryContact: text("secondary_contact"),
  linkedinUrl: text("linkedin_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fundingPrograms = pgTable("funding_programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["scholarship", "fellowship"] }),
  amount: integer("amount"),
  deadline: date("deadline"),
  status: text("status", {
    enum: ["not_started", "applied", "interviewing", "awarded", "rejected"],
  }).default("not_started"),
  eligibilityTags: text("eligibility_tags").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category", {
    enum: ["case_competition", "conference", "pipeline_program"],
  }),
  organization: text("organization"),
  deadline: date("deadline"),
  location: text("location"),
  status: text("status", {
    enum: ["not_started", "applied", "accepted", "attending", "completed"],
  }).default("not_started"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alertFindings = pgTable("alert_findings", {
  id: serial("id").primaryKey(),
  gmailMessageId: text("gmail_message_id").notNull().unique(),
  subject: text("subject"),
  sender: text("sender"),
  receivedAt: timestamp("received_at"),
  companyId: integer("company_id").references(() => companies.id),
  matchedCompany: text("matched_company"),
  signal: text("signal", { enum: ["deadline", "opening"] }),
  excerpt: text("excerpt"),
  status: text("status", { enum: ["new", "reviewed"] }).default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Simple key-value store for app-level state (e.g. Gmail connection health).
export const systemStatus = pgTable("system_status", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type FundingProgram = typeof fundingPrograms.$inferSelect;
export type NewFundingProgram = typeof fundingPrograms.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type AlertFinding = typeof alertFindings.$inferSelect;
export type NewAlertFinding = typeof alertFindings.$inferInsert;
export type SystemStatus = typeof systemStatus.$inferSelect;
