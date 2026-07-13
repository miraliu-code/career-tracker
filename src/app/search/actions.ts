"use server";

import {
  count,
  eq,
  ilike,
  or,
  sql,
  type Column,
  type SQL,
} from "drizzle-orm";

import { db } from "@/db";
import {
  applications,
  companies,
  contacts,
  events,
  fundingPrograms,
} from "@/db/schema";

const PER_CATEGORY = 5;

export type SearchHit = {
  id: number;
  href: string;
  title: string;
  context: string;
  /** Optional status token so the dropdown can render a badge. */
  badge?: string;
};

export type SearchGroup = {
  type: "companies" | "applications" | "contacts" | "funding" | "events";
  label: string;
  hits: SearchHit[];
  total: number;
};

export type SearchResults = {
  query: string;
  groups: SearchGroup[];
  totalHits: number;
};

/** Build an OR of ILIKE `%term%` across the given columns. */
function anyLike(term: string, columns: (Column | SQL)[]): SQL {
  const pattern = `%${term}%`;
  return or(...columns.map((col) => ilike(col, pattern)))!;
}

export async function globalSearch(rawQuery: string): Promise<SearchResults> {
  const query = rawQuery.trim();
  if (query.length < 2) {
    return { query, groups: [], totalHits: 0 };
  }

  // Match the tag-array column via array_to_string so ILIKE applies.
  const eligibilityText = sql`array_to_string(${fundingPrograms.eligibilityTags}, ' ')` as unknown as SQL;

  const companyWhere = anyLike(query, [
    companies.name,
    companies.industry,
    companies.hqLocation,
    companies.notes,
  ]);
  const applicationWhere = anyLike(query, [
    applications.roleTitle,
    applications.location,
    applications.notes,
    companies.name,
  ]);
  const contactWhere = anyLike(query, [
    contacts.name,
    contacts.role,
    contacts.notes,
    contacts.primaryContact,
    companies.name,
  ]);
  const fundingWhere = anyLike(query, [
    fundingPrograms.name,
    eligibilityText,
    fundingPrograms.notes,
  ]);
  const eventWhere = anyLike(query, [
    events.name,
    events.organization,
    events.location,
    events.notes,
  ]);

  const [
    companyRows,
    companyCount,
    applicationRows,
    applicationCount,
    contactRows,
    contactCount,
    fundingRows,
    fundingCount,
    eventRows,
    eventCount,
  ] = await Promise.all([
    db
      .select({
        id: companies.id,
        name: companies.name,
        industry: companies.industry,
        hq: companies.hqLocation,
      })
      .from(companies)
      .where(companyWhere)
      .limit(PER_CATEGORY),
    db.select({ n: count() }).from(companies).where(companyWhere),
    db
      .select({
        id: applications.id,
        roleTitle: applications.roleTitle,
        status: applications.status,
        companyName: companies.name,
      })
      .from(applications)
      .leftJoin(companies, eq(applications.companyId, companies.id))
      .where(applicationWhere)
      .limit(PER_CATEGORY),
    db
      .select({ n: count() })
      .from(applications)
      .leftJoin(companies, eq(applications.companyId, companies.id))
      .where(applicationWhere),
    db
      .select({
        id: contacts.id,
        name: contacts.name,
        role: contacts.role,
        companyName: companies.name,
      })
      .from(contacts)
      .leftJoin(companies, eq(contacts.companyId, companies.id))
      .where(contactWhere)
      .limit(PER_CATEGORY),
    db
      .select({ n: count() })
      .from(contacts)
      .leftJoin(companies, eq(contacts.companyId, companies.id))
      .where(contactWhere),
    db
      .select({
        id: fundingPrograms.id,
        name: fundingPrograms.name,
        type: fundingPrograms.type,
        status: fundingPrograms.status,
      })
      .from(fundingPrograms)
      .where(fundingWhere)
      .limit(PER_CATEGORY),
    db.select({ n: count() }).from(fundingPrograms).where(fundingWhere),
    db
      .select({
        id: events.id,
        name: events.name,
        organization: events.organization,
        location: events.location,
      })
      .from(events)
      .where(eventWhere)
      .limit(PER_CATEGORY),
    db.select({ n: count() }).from(events).where(eventWhere),
  ]);

  const groups: SearchGroup[] = [];

  if (companyRows.length > 0) {
    groups.push({
      type: "companies",
      label: "Companies",
      total: companyCount[0].n,
      hits: companyRows.map((r) => ({
        id: r.id,
        href: `/companies/${r.id}`,
        title: r.name,
        context: [r.industry, r.hq].filter(Boolean).join(" · ") || "Company",
      })),
    });
  }
  if (applicationRows.length > 0) {
    groups.push({
      type: "applications",
      label: "Applications",
      total: applicationCount[0].n,
      hits: applicationRows.map((r) => ({
        id: r.id,
        href: "/applications",
        title: r.roleTitle,
        context: r.companyName ?? "No company",
        badge: r.status ?? undefined,
      })),
    });
  }
  if (contactRows.length > 0) {
    groups.push({
      type: "contacts",
      label: "Contacts",
      total: contactCount[0].n,
      hits: contactRows.map((r) => ({
        id: r.id,
        href: "/contacts",
        title: r.name,
        context:
          [r.role, r.companyName].filter(Boolean).join(" · ") || "Contact",
      })),
    });
  }
  if (fundingRows.length > 0) {
    groups.push({
      type: "funding",
      label: "Funding",
      total: fundingCount[0].n,
      hits: fundingRows.map((r) => ({
        id: r.id,
        href: "/funding",
        title: r.name,
        context: r.type === "fellowship" ? "Fellowship" : "Scholarship",
        badge: r.status ?? undefined,
      })),
    });
  }
  if (eventRows.length > 0) {
    groups.push({
      type: "events",
      label: "Events",
      total: eventCount[0].n,
      hits: eventRows.map((r) => ({
        id: r.id,
        href: "/events",
        title: r.name,
        context:
          [r.organization, r.location].filter(Boolean).join(" · ") || "Event",
      })),
    });
  }

  const totalHits = groups.reduce((n, g) => n + g.hits.length, 0);
  return { query, groups, totalHits };
}
