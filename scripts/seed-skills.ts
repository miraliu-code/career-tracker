// One-time seed: pre-load the Learning tab's skills table from the master
// skill-development plan. Idempotent — skips any skill whose name already
// exists, so re-running never duplicates. Run with:
//   npx tsx scripts/seed-skills.ts
//
// learning_notes and proof are intentionally left null (filled in over time);
// builds start "not_started", habits "active", certifications "not_started".

import { neon, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

import { skills, type NewSkill } from "../src/db/schema";

config({ path: ".env.local" });
config();

type Seed = Omit<NewSkill, "learningNotes" | "proof" | "proofUrl">;

// Global sort_order follows the plan's reading order, which also keeps a
// sensible order within each of the three on-page groups (build / cert /
// habit) since the page sorts by sort_order within a type.
const SEEDS: Seed[] = [
  // financial_modeling
  {
    name: "Financial & Business Modeling",
    section: "financial_modeling",
    skillType: "build",
    status: "not_started",
    targetHours: 100,
    sortOrder: 1,
    resources:
      "Wall Street Prep free DCF crash course (anchor), Wall Street Oasis free DCF course, Corporate Finance Institute (CFI) free tier, Bloomberg Market Concepts (check AU access). Phased Jul26-May27. Deliverable: self-built three-statement model + DCF for a real company (Nike/Spotify), plus familiarity with 13-week cash flow and LBO structure.",
  },
  // consulting_cases
  {
    name: "Consulting & Strategic Case Skills",
    section: "consulting_cases",
    skillType: "build",
    status: "not_started",
    targetHours: 30,
    sortOrder: 2,
    resources:
      "Official McKinsey/BCG/Bain practice cases + walkthroughs (highest quality). MBA consulting club casebooks (Wharton/Kellogg/Harvard) for volume. Fit/behavioral prep = half the weight; build 2 STAR stories per theme (led, failed, conflict, influence) from CAPAL/SKDK/WAMU. Deliverable: bank of 6-8 polished STAR stories + comfort running a case cold.",
  },
  // ai_fluency
  {
    name: "AI Fluency & Tools",
    section: "ai_fluency",
    skillType: "habit",
    status: "active",
    sortOrder: 3,
    resources:
      "Anthropic Claude docs & prompting guide (docs.claude.com), OpenAI/Perplexity guides, Microsoft Copilot training (Microsoft Learn, free — named in BlackRock JD). Deliverable: name specific real AI-assisted workflows in interviews.",
  },
  // marketing_analytics
  {
    name: "Google Analytics Certification",
    section: "marketing_analytics",
    skillType: "certification",
    status: "not_started",
    sortOrder: 4,
    resources:
      "Google Analytics Academy — free, close to table-stakes for marketing roles.",
  },
  {
    name: "HubSpot Certifications",
    section: "marketing_analytics",
    skillType: "certification",
    status: "not_started",
    sortOrder: 5,
    resources:
      "HubSpot Academy — free certs in Content Marketing, Social Media, Inbound. HubSpot also a target company.",
  },
  {
    name: "Meta Blueprint",
    section: "marketing_analytics",
    skillType: "certification",
    status: "not_started",
    sortOrder: 6,
    resources:
      "Free Meta courses — credential behind Instagram/Facebook platform tags.",
  },
  {
    name: "Google Skillshop (Google Ads)",
    section: "marketing_analytics",
    skillType: "certification",
    status: "not_started",
    sortOrder: 7,
    resources:
      "Google Ads fundamentals, free — general paid-digital literacy for brand/marketing interviews.",
  },
  // data_viz_bi
  {
    name: "Power BI / Tableau Dashboarding",
    section: "data_viz_bi",
    skillType: "build",
    status: "not_started",
    targetHours: 20,
    sortOrder: 8,
    resources:
      "Microsoft Learn free Power BI path, Tableau Public + free training videos. Deliverable: one self-built Tableau/Power BI dashboard as a portfolio piece.",
  },
  {
    name: "SQL Fundamentals",
    section: "data_viz_bi",
    skillType: "certification",
    status: "not_started",
    sortOrder: 9,
    resources:
      "Mode Analytics SQL tutorial or Khan Academy intro to SQL. Named as a plus in BlackRock/WBG postings — basic querying logic only.",
  },
  // pr_comms
  {
    name: "PR & Communications Tools",
    section: "pr_comms",
    skillType: "habit",
    status: "active",
    sortOrder: 10,
    resources:
      "PRSA student resources/webinars. Meltwater/Muck Rack hands-on exposure — during 2 weeks left at SKDK. Grammarly Business AI-editing fluency. Deliverable: named experience with an industry media-monitoring tool via internship.",
  },
  // project_management
  {
    name: "Project Management Tools (Asana/Monday/Notion)",
    section: "project_management",
    skillType: "habit",
    status: "active",
    sortOrder: 11,
    resources:
      "Asana or Monday free tier — build a real board for CAPAL/Oven & Ivy. Notion free tier. Basic Agile/Scrum literacy via free YouTube crash course (named in WBG Product Analyst posting). Deliverable: one real board actively used + basic Agile terminology.",
  },
  // mandarin
  {
    name: "Mandarin & HSK Progress",
    section: "mandarin",
    skillType: "habit",
    status: "active",
    sortOrder: 12,
    resources:
      "HSK official practice materials (free past papers/vocab), CUHK-Shenzhen conversation practice, HelloChinese/Du Chinese free tiers. Track as ~30 min/week habit. Deliverable: stated HSK level target + actual practice-test score by year end.",
  },
  // additional
  {
    name: "Advanced Excel",
    section: "additional",
    skillType: "build",
    status: "not_started",
    targetHours: 15,
    sortOrder: 13,
    resources:
      "Pivot tables, VLOOKUP/XLOOKUP, basic financial functions. Underpins financial modeling; 'Excel proficiency' named separately in nearly every JD.",
  },
  {
    name: "LinkedIn Optimization",
    section: "additional",
    skillType: "certification",
    status: "not_started",
    sortOrder: 14,
    resources:
      "Project, not a course: fully built-out profile with tightened corporate-facing language matching resume/site. Recruiters at target companies will check it.",
  },
  {
    name: "Adobe Illustrator/Photoshop Refresher",
    section: "additional",
    skillType: "habit",
    status: "active",
    sortOrder: 15,
    resources: "Many youtube tutorials.",
  },
];

async function main() {
  if (process.env.HTTPS_PROXY || process.env.https_proxy) {
    const { fetch: proxiedFetch, EnvHttpProxyAgent } = await import("undici");
    const dispatcher = new EnvHttpProxyAgent();
    neonConfig.fetchFunction = (url: string, init: Record<string, unknown>) =>
      proxiedFetch(url, { ...init, dispatcher });
  }
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error("No POSTGRES_URL / DATABASE_URL set");
  const db = drizzle(neon(connectionString), { schema: { skills } });

  const existing = await db.select({ name: skills.name }).from(skills);
  const existingNames = new Set(existing.map((s) => s.name));

  const toInsert = SEEDS.filter((s) => !existingNames.has(s.name));
  const skipped = SEEDS.length - toInsert.length;

  if (toInsert.length > 0) {
    await db.insert(skills).values(toInsert);
  }

  console.log(
    `Inserted ${toInsert.length} skill(s); skipped ${skipped} already present.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
