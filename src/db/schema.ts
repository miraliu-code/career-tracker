import {
  boolean,
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
  resumeUrl: text("resume_url"),
  resumeFilename: text("resume_filename"),
  // Push an estimated-opening reminder out into the future without deleting
  // it; the dashboard hides it until this date passes.
  snoozedUntil: date("snoozed_until"),
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

// Per-application requirements (recommendations, exams, essays, etc.). Rows
// are kept even when a requirement is unchecked in the form (marked inactive)
// so re-checking restores the data.
export const applicationRequirements = pgTable("application_requirements", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  requirementType: text("requirement_type", {
    enum: [
      "recommendation",
      "pymetrics_exam",
      "screening_test",
      "case_interview",
      "essay",
      "relocation",
      "visa",
    ],
  }).notNull(),
  slotIndex: integer("slot_index").default(1).notNull(),
  active: boolean("active").default(true).notNull(),
  status: text("status"),
  contactName: text("contact_name"),
  contactInfo: text("contact_info"),
  notes: text("notes"),
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

// Simple key-value store for app-level state (e.g. Gmail connection health,
// action counters like "mark contacted today").
export const systemStatus = pgTable("system_status", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Earned achievement badges. Only earned badges get a row; unearned badges
// simply have no row here.
export const badgesEarned = pgTable("badges_earned", {
  id: serial("id").primaryKey(),
  badgeKey: text("badge_key").notNull().unique(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Skill development tracked on the Learning tab. `skillType` decides which
// fields matter: builds use hours/target_hours, certifications use
// completed_at, habits accumulate hours with no completion state.
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  section: text("section", {
    enum: [
      "financial_modeling",
      "consulting_cases",
      "ai_fluency",
      "marketing_analytics",
      "data_viz_bi",
      "pr_comms",
      "project_management",
      "mandarin",
      "additional",
    ],
  }).notNull(),
  skillType: text("skill_type", {
    enum: ["build", "certification", "habit"],
  }).notNull(),
  learningNotes: text("learning_notes"),
  proof: text("proof"),
  proofUrl: text("proof_url"),
  // Meaning depends on skillType: builds not_started/in_progress/
  // interview_ready/complete; certifications not_started/in_progress/earned;
  // habits active/paused.
  status: text("status"),
  hoursLogged: integer("hours_logged").default(0).notNull(),
  targetHours: integer("target_hours"),
  completedAt: date("completed_at"),
  resources: text("resources"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual time increments logged against a skill, so hours accumulate with
// dates rather than only as a running total on the skill row.
export const skillHoursLog = pgTable("skill_hours_log", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  hours: integer("hours").notNull(),
  loggedOn: date("logged_on").defaultNow(),
  note: text("note"),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
export type ApplicationRequirement =
  typeof applicationRequirements.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type FundingProgram = typeof fundingPrograms.$inferSelect;
export type NewFundingProgram = typeof fundingPrograms.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type AlertFinding = typeof alertFindings.$inferSelect;
export type NewAlertFinding = typeof alertFindings.$inferInsert;
export type SystemStatus = typeof systemStatus.$inferSelect;
export type BadgeEarned = typeof badgesEarned.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type SkillHoursLogEntry = typeof skillHoursLog.$inferSelect;
