import { eq } from "drizzle-orm";

import { db } from "@/db";
import { applications } from "@/db/schema";
import { readResume } from "@/lib/resume-storage";

// Streams private resume PDFs. The blob store uses private access, so the file
// can't be served by a plain URL — this route authenticates (via the blob
// token) and streams it. It only serves URLs that are actually stored as an
// application's resume, so it can't be used to fetch arbitrary blobs.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  const [row] = await db
    .select({ filename: applications.resumeFilename })
    .from(applications)
    .where(eq(applications.resumeUrl, url))
    .limit(1);
  if (!row) return new Response("Not found", { status: 404 });

  const resume = await readResume(url);
  if (!resume) return new Response("Not found", { status: 404 });

  // Sanitize the filename for the Content-Disposition header.
  const filename = (row.filename ?? "resume.pdf").replace(/["\\\r\n]/g, "");

  return new Response(resume.body, {
    headers: {
      "Content-Type": resume.contentType || "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      // Private content — don't let shared caches hold onto it.
      "Cache-Control": "private, no-store",
    },
  });
}
