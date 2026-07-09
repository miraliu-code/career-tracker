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
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  name: text("name").notNull(),
  role: text("role"),
  connectionType: text("connection_type", {
    enum: ["alum", "recruiter", "mentor", "other"],
  }),
  lastContactDate: date("last_contact_date"),
  nextFollowupDate: date("next_followup_date"),
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

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type FundingProgram = typeof fundingPrograms.$inferSelect;
export type NewFundingProgram = typeof fundingPrograms.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
