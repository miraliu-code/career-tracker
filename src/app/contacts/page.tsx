import { asc, eq } from "drizzle-orm";

import { HeartIcon } from "@/components/icons";
import { db } from "@/db";
import { companies, contacts } from "@/db/schema";

import { AddContact } from "./add-contact";
import { ContactsList, type ContactRow } from "./contacts-list";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const [rows, companyOptions] = await Promise.all([
    db
      .select({
        contact: contacts,
        companyId: companies.id,
        companyName: companies.name,
        companyIndustry: companies.industry,
      })
      .from(contacts)
      .leftJoin(companies, eq(contacts.companyId, companies.id)),
    db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .orderBy(asc(companies.name)),
  ]);

  const contactRows: ContactRow[] = rows.map((row) => ({
    id: row.contact.id,
    companyId: row.contact.companyId,
    name: row.contact.name,
    role: row.contact.role,
    connectionType: row.contact.connectionType,
    lastContactDate: row.contact.lastContactDate,
    nextFollowupDate: row.contact.nextFollowupDate,
    linkedinUrl: row.contact.linkedinUrl,
    notes: row.contact.notes,
    company:
      row.companyId !== null && row.companyName !== null
        ? {
            id: row.companyId,
            name: row.companyName,
            industry: row.companyIndustry,
          }
        : null,
  }));

  return (
    <div className="flex-1">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-forest">
            <HeartIcon className="size-7 text-rose" />
            Contacts
          </h1>
          <p className="mt-1 text-sm text-sage-deep">
            {contactRows.length}{" "}
            {contactRows.length === 1 ? "contact" : "contacts"} in your
            network.
          </p>
        </header>

        <div className="mb-8">
          <AddContact companies={companyOptions} />
        </div>

        <ContactsList contacts={contactRows} companies={companyOptions} />
      </main>
    </div>
  );
}
