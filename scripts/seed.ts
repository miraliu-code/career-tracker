import { neon, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

import {
  applications,
  companies,
  contacts,
  fundingPrograms,
} from "../src/db/schema";

config({ path: ".env.local" });
config();

/** A date `offset` days from today, as a Postgres-friendly YYYY-MM-DD string. */
function daysFromNow(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

async function main() {
  // Node's built-in fetch ignores HTTPS_PROXY; route Neon's queries through
  // the proxy when one is configured (e.g. sandboxed/corporate environments
  // that only allow proxied egress).
  if (process.env.HTTPS_PROXY || process.env.https_proxy) {
    const { fetch: proxiedFetch, EnvHttpProxyAgent } = await import("undici");
    const dispatcher = new EnvHttpProxyAgent();
    neonConfig.fetchFunction = (url: string, init: Record<string, unknown>) =>
      proxiedFetch(url, { ...init, dispatcher });
  }

  const connectionString =
    process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Neither POSTGRES_URL nor DATABASE_URL environment variable is set",
    );
  }

  const db = drizzle(neon(connectionString));

  // Start from a clean slate so re-running the seed doesn't duplicate rows.
  await db.delete(contacts);
  await db.delete(applications);
  await db.delete(fundingPrograms);
  await db.delete(companies);

  const insertedCompanies = await db
    .insert(companies)
    .values([
      {
        name: "Anthropic",
        industry: "AI",
        hqLocation: "San Francisco, CA",
        dreamTier: "A",
        notes: "Safety-focused AI lab. Referral possible through Maya.",
      },
      {
        name: "Stripe",
        industry: "Fintech",
        hqLocation: "San Francisco, CA",
        dreamTier: "A",
        notes: "Strong new-grad program, deadline usually early fall.",
      },
      {
        name: "Datadog",
        industry: "Observability",
        hqLocation: "New York, NY",
        dreamTier: "B",
        notes: "Big NYC office, fast interview loop.",
      },
      {
        name: "Figma",
        industry: "Design Tools",
        hqLocation: "San Francisco, CA",
        dreamTier: "B",
      },
      {
        name: "Shopify",
        industry: "E-commerce",
        hqLocation: "Ottawa, Canada (remote-first)",
        dreamTier: "C",
        notes: "Remote-friendly; internships posted quarterly.",
      },
    ])
    .returning({ id: companies.id, name: companies.name });

  const companyId = new Map(insertedCompanies.map((c) => [c.name, c.id]));

  await db.insert(applications).values([
    {
      companyId: companyId.get("Anthropic"),
      roleTitle: "Software Engineer, New Grad",
      type: "new_grad",
      location: "San Francisco, CA",
      deadline: daysFromNow(4),
      status: "interviewing",
      resumeVersion: "v3-ai-focus",
      notes: "Phone screen done, onsite scheduled next week.",
    },
    {
      companyId: companyId.get("Stripe"),
      roleTitle: "Backend Engineer Intern",
      type: "internship",
      location: "Seattle, WA",
      deadline: daysFromNow(12),
      status: "applied",
      resumeVersion: "v2-backend",
    },
    {
      companyId: companyId.get("Datadog"),
      roleTitle: "Software Engineer Intern",
      type: "internship",
      location: "New York, NY",
      deadline: daysFromNow(25),
      status: "not_started",
      notes: "Waiting for fall posting to open.",
    },
    {
      companyId: companyId.get("Figma"),
      roleTitle: "Product Engineer, New Grad",
      type: "new_grad",
      location: "San Francisco, CA",
      deadline: daysFromNow(45),
      status: "not_started",
    },
    {
      companyId: companyId.get("Shopify"),
      roleTitle: "Backend Developer Intern",
      type: "internship",
      location: "Remote",
      deadline: daysFromNow(-10),
      status: "rejected",
      resumeVersion: "v1",
      notes: "Rejected after take-home. Reapply next cycle.",
    },
    {
      companyId: companyId.get("Datadog"),
      roleTitle: "Site Reliability Engineer, New Grad",
      type: "new_grad",
      location: "Boston, MA",
      deadline: daysFromNow(-3),
      status: "offer",
      resumeVersion: "v3-ai-focus",
      notes: "Offer received! Decide by end of month.",
    },
  ]);

  await db.insert(fundingPrograms).values([
    {
      name: "NSF Graduate Research Fellowship",
      type: "fellowship",
      amount: 37000,
      deadline: daysFromNow(18),
      status: "applied",
      eligibilityTags: ["us-citizen", "stem", "graduate"],
      notes: "Submitted research statement; waiting on reference letters.",
    },
    {
      name: "Anita Borg Memorial Scholarship",
      type: "scholarship",
      amount: 10000,
      deadline: daysFromNow(6),
      status: "not_started",
      eligibilityTags: ["women-in-tech", "undergraduate"],
      notes: "Essay draft due to mentor for review this week.",
    },
    {
      name: "Thiel Fellowship",
      type: "fellowship",
      amount: 100000,
      deadline: daysFromNow(60),
      status: "not_started",
      eligibilityTags: ["under-23", "founders"],
    },
    {
      name: "Palantir Future Scholarship",
      type: "scholarship",
      amount: 7000,
      deadline: daysFromNow(-20),
      status: "awarded",
      eligibilityTags: ["stem", "undergraduate"],
      notes: "Awarded! Funds disbursed for fall semester.",
    },
    {
      name: "Google Generation Scholarship",
      type: "scholarship",
      amount: 10000,
      deadline: daysFromNow(-45),
      status: "rejected",
      eligibilityTags: ["underrepresented", "cs-major"],
    },
  ]);

  await db.insert(contacts).values([
    {
      companyId: companyId.get("Anthropic"),
      name: "Maya Chen",
      role: "Senior Software Engineer",
      connectionType: "alum",
      lastContactDate: daysFromNow(-21),
      nextFollowupDate: daysFromNow(-7),
      linkedinUrl: "https://linkedin.com/in/maya-chen-example",
      notes: "Met at alumni mixer. Offered to refer me — follow up!",
    },
    {
      companyId: companyId.get("Stripe"),
      name: "James Okafor",
      role: "University Recruiter",
      connectionType: "recruiter",
      lastContactDate: daysFromNow(-14),
      nextFollowupDate: daysFromNow(-2),
      linkedinUrl: "https://linkedin.com/in/james-okafor-example",
      notes: "Asked me to ping him once applications open.",
    },
    {
      companyId: companyId.get("Datadog"),
      name: "Priya Ramanathan",
      role: "Engineering Manager",
      connectionType: "mentor",
      lastContactDate: daysFromNow(-30),
      nextFollowupDate: daysFromNow(0),
      notes: "Monthly mentorship call — send agenda beforehand.",
    },
    {
      companyId: companyId.get("Figma"),
      name: "Alex Wu",
      role: "Product Engineer",
      connectionType: "alum",
      lastContactDate: daysFromNow(-5),
      nextFollowupDate: daysFromNow(5),
      linkedinUrl: "https://linkedin.com/in/alex-wu-example",
      notes: "Coffee chat went well; said to check back after launch week.",
    },
    {
      name: "Sofia Marquez",
      role: "Career Coach",
      connectionType: "other",
      lastContactDate: daysFromNow(-45),
      nextFollowupDate: daysFromNow(20),
      notes: "University career center. Resume review each semester.",
    },
  ]);

  console.log("Seed complete:");
  console.log(`  companies:        ${insertedCompanies.length}`);
  console.log("  applications:     6");
  console.log("  funding_programs: 5");
  console.log("  contacts:         5");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
