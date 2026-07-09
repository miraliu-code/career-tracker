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
    <div className="flex-1">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/companies"
          className="mb-6 inline-block text-sm text-sage-deep hover:text-rose"
        >
          ← All companies
        </Link>

        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-forest">
              <IndustryDot industry={company.industry} />
              <span className="truncate">{company.name}</span>
              <TierBadge tier={company.dreamTier} />
            </h1>
            <p className="mt-1 text-sm text-sage-deep">
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
            <h2 className="mb-4 text-lg font-semibold text-forest">
              Notes
            </h2>
            <div className="rounded-2xl border border-sage/30 border-l-[3px] border-l-sage-deep bg-white p-6 shadow-soft">
              <p className="whitespace-pre-wrap text-sm text-sage-deep">
                {company.notes}
              </p>
            </div>
          </section>
        )}

        <section className="mb-10" aria-label="Linked applications">
          <h2 className="mb-4 text-lg font-semibold text-forest">
            Applications{" "}
            <span className="font-normal text-sage">
              ({linkedApplications.length})
            </span>
          </h2>
          {linkedApplications.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-sage/50 bg-white p-8 text-center">
          <span aria-hidden className="pointer-events-none absolute -top-8 left-1/2 size-32 -translate-x-1/2 rounded-full bg-blush/60 blur-2xl" />
              <p className="text-sm text-sage-deep">
                No applications linked to this company yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-sage/25 overflow-hidden rounded-2xl border border-sage/30 border-l-[3px] border-l-sage-deep bg-white shadow-soft">
              {linkedApplications.map((app) => (
                <li
                  key={app.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-forest">
                      {app.roleTitle}
                    </p>
                    <p className="mt-0.5 text-sm text-sage-deep">
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
                      <span className="text-sm tabular-nums text-sage-deep">
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
          <h2 className="mb-4 text-lg font-semibold text-forest">
            Contacts{" "}
            <span className="font-normal text-sage">
              ({linkedContacts.length})
            </span>
          </h2>
          {linkedContacts.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-sage/50 bg-white p-8 text-center">
          <span aria-hidden className="pointer-events-none absolute -top-8 left-1/2 size-32 -translate-x-1/2 rounded-full bg-blush/60 blur-2xl" />
              <p className="text-sm text-sage-deep">
                No contacts linked to this company yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-sage/25 overflow-hidden rounded-2xl border border-sage/30 border-l-[3px] border-l-sage-deep bg-white shadow-soft">
              {linkedContacts.map((contact) => (
                <li
                  key={contact.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-forest">
                      {contact.name}
                    </p>
                    <p className="mt-0.5 text-sm text-sage-deep">
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
                  <div className="flex flex-wrap items-center gap-3 text-sm text-sage-deep sm:justify-end">
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
