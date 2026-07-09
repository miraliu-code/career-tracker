import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { alertFindings, companies } from "@/db/schema";
import {
  getCareerAlertMessage,
  listCareerAlertMessageIds,
} from "@/lib/gmail";

const DEADLINE_RE =
  /\b(deadline|apply by|due by|due on|closes|closing soon|last (day|chance)|final day|ends (soon|today|tomorrow))\b/i;
const OPENING_RE =
  /\b(now open|applications? (are )?(now )?open|apply (now|for|to|today)|now accepting|accepting applications|now hiring|is hiring|are hiring|open for applications|application window|applications? (opens?|opening)|internship applications?|new (job|jobs|role|roles|position|positions|opening|openings)|just posted|vacanc(y|ies)|recruit(ing|ment))\b/i;

// Words too generic to identify a company on their own. Includes first
// words of tracked companies that are everyday English ("break", "green").
const GENERIC = new Set([
  "the", "and", "of", "for", "in", "a", "an", "one", "group", "company",
  "companies", "co", "inc", "llc", "corporation", "institute", "institution",
  "foundation", "center", "centre", "international", "national", "global",
  "american", "america", "new", "world", "fund", "partners", "development",
  "bank", "capital", "purpose", "care", "impact", "research", "policy",
  "strategies", "strategy", "break", "green", "third", "atlantic", "urban",
]);

// Google Alerts digest boilerplate: strip so the tracked "Google" company
// only matches genuine mentions, not the alert wrapper itself.
function stripAlertBoilerplate(s: string): string {
  return s
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\bgoogle alerts?\b( ?[-–—] ?)?/gi, " ")
    .replace(/\bgoogle\b(?=[^.]{0,80}\b(daily|weekly|as-it-happens) update\b)/gi, " ")
    .replace(/\b(daily|weekly|as-it-happens) update\b/gi, " ")
    .replace(/\bsee more results\b|\bedit this alert\b|\bunsubscribe\b|\bflag as irrelevant\b|\breceive this email because\b/gi, " ");
}

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Name variants that count as a mention of this company. */
function matchForms(name: string): string[] {
  const base = norm(name.replace(/\(.*?\)/g, "")).replace(/^the /, "");
  const words = base.split(" ");
  const forms = new Set<string>([base]);
  // strip trailing generic words: "mckinsey and company" -> "mckinsey"
  const trimmed = [...words];
  while (trimmed.length > 1 && GENERIC.has(trimmed[trimmed.length - 1])) {
    trimmed.pop();
  }
  forms.add(trimmed.join(" "));
  // distinctive first word ("mckinsey", "edelman") — skip short/generic ones
  const first = words[0];
  if (first.length >= 5 && !GENERIC.has(first)) forms.add(first);
  return [...forms].filter((f) => f.length >= 3 && !GENERIC.has(f));
}

export type ScanResult = {
  scanned: number;
  alreadySeen: number;
  newFindings: number;
};

/**
 * Read-only scan of the career-alerts Gmail label (last `days` days).
 * Stores a finding when a message both mentions a tracked company and
 * carries a deadline/opening signal. Dedupes on the Gmail message id.
 */
export async function runCareerAlertScan(days = 8): Promise<ScanResult> {
  const [allCompanies, ids] = await Promise.all([
    db.select({ id: companies.id, name: companies.name }).from(companies),
    listCareerAlertMessageIds(days),
  ]);

  if (ids.length === 0) return { scanned: 0, alreadySeen: 0, newFindings: 0 };

  const seen = await db
    .select({ gmailMessageId: alertFindings.gmailMessageId })
    .from(alertFindings)
    .where(inArray(alertFindings.gmailMessageId, ids));
  const seenIds = new Set(seen.map((s) => s.gmailMessageId));
  const fresh = ids.filter((id) => !seenIds.has(id));

  const matchers = allCompanies.map((c) => ({
    id: c.id,
    name: c.name,
    forms: matchForms(c.name).map(
      (f) => new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`),
    ),
  }));

  let newFindings = 0;

  for (const id of fresh) {
    // gentle pacing for the Gmail API
    await new Promise((r) => setTimeout(r, 60));
    const msg = await getCareerAlertMessage(id);
    const text = stripAlertBoilerplate(
      `${msg.subject} ${msg.bodyText || msg.snippet}`,
    );
    const textNorm = norm(text);

    const signal = DEADLINE_RE.test(text)
      ? ("deadline" as const)
      : OPENING_RE.test(text)
        ? ("opening" as const)
        : null;
    if (!signal) continue;

    const matched = matchers.filter((m) =>
      m.forms.some((re) => re.test(textNorm)),
    );
    if (matched.length === 0) continue;

    await db
      .insert(alertFindings)
      .values({
        gmailMessageId: msg.id,
        subject: msg.subject.slice(0, 500),
        sender: msg.sender.slice(0, 300),
        receivedAt: msg.receivedAt,
        companyId: matched[0].id,
        matchedCompany: matched
          .map((m) => m.name)
          .slice(0, 4)
          .join(", "),
        signal,
        excerpt: msg.snippet.slice(0, 500),
        status: "new",
      })
      .onConflictDoNothing();
    newFindings++;
  }

  return {
    scanned: fresh.length,
    alreadySeen: seenIds.size,
    newFindings,
  };
}
