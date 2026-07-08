import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CONNECTION_LABELS,
  IndustryDot,
  StatusBadge,
  TierBadge,
} from "@/components/badges";
import { db } from "@/db";
import { applications, contacts } from "@/db/schema";
import { formatDate } from "@/lib/dates";

import { DeleteCompany } from "../delete-company";
import { EditCompany } from "../edit-company";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = Number(id);
  if (!Number.isInteger(companyId)) notFound();

  const [company, linkedApplications, linkedContacts] = await Promise.all([
    db.query.companies.findFirst({
      where: (companies, { eq }) => eq(companies.id, companyId),
    }),
    db.select().from(applications).where(eq(applications.companyId, companyId)),
    db.select().from(contacts).where(eq(contacts.companyId, companyId)),
  ]);

  if (!company) notFound();

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/companies"
          className="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← All companies
        </Link>

        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              <IndustryDot industry={company.industry} />
              <span className="truncate">{company.name}</span>
              <TierBadge tier={company.dreamTier} />
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {[company.industry, company.hqLocation]
                .filter(Boolean)
                .join(" · ") || "No details yet"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <DeleteCompany
              companyId={company.id}
              companyName={company.name}
              linkedApplications={linkedApplications.length}
              linkedContacts={linkedContacts.length}
            />
          </div>
        </header>

        <section className="mb-10">
          <EditCompany
            companyId={company.id}
            initial={{
              name: company.name,
              industry: company.industry,
              hqLocation: company.hqLocation,
              dreamTier: company.dreamTier,
              notes: company.notes,
            }}
          />
        </section>

        {company.notes && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Notes
            </h2>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                {company.notes}
              </p>
            </div>
          </section>
        )}

        <section className="mb-10" aria-label="Linked applications">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Applications{" "}
            <span className="font-normal text-zinc-400 dark:text-zinc-500">
              ({linkedApplications.length})
            </span>
          </h2>
          {linkedApplications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                No applications linked to this company yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
              {linkedApplications.map((app) => (
                <li
                  key={app.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {app.roleTitle}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {[
                        app.type === "new_grad"
                          ? "New grad"
                          : app.type === "internship"
                            ? "Internship"
                            : null,
                        app.location,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {app.deadline && (
                      <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
                        Due {formatDate(app.deadline)}
                      </span>
                    )}
                    <StatusBadge status={app.status ?? "not_started"} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Linked contacts">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Contacts{" "}
            <span className="font-normal text-zinc-400 dark:text-zinc-500">
              ({linkedContacts.length})
            </span>
          </h2>
          {linkedContacts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                No contacts linked to this company yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
              {linkedContacts.map((contact) => (
                <li
                  key={contact.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {contact.name}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {[
                        contact.role,
                        contact.connectionType
                          ? CONNECTION_LABELS[contact.connectionType]
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 sm:justify-end dark:text-zinc-300">
                    {contact.lastContactDate && (
                      <span className="tabular-nums">
                        Last contact {formatDate(contact.lastContactDate)}
                      </span>
                    )}
                    {contact.nextFollowupDate && (
                      <span className="tabular-nums">
                        Follow up {formatDate(contact.nextFollowupDate)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
