// Resume storage. In production (Vercel) this uses Vercel Blob, keyed off
// BLOB_READ_WRITE_TOKEN. When that token is absent — local development —
// it falls back to writing under public/uploads so the flow is fully
// exercisable without a Blob account. On Vercel the fallback can never work
// (read-only filesystem), so a missing token fails loudly with a clear
// message instead of a confusing EROFS.

const PLACEHOLDER = "REPLACE_WITH_VERCEL_BLOB_TOKEN";

/** True when a usable Blob token is present (set, non-empty, not the stub). */
function blobConfigured(): boolean {
  const t = (process.env.BLOB_READ_WRITE_TOKEN ?? "").trim();
  return t.length > 0 && t !== PLACEHOLDER;
}

export type StoredResume = { url: string; filename: string };

function safeName(filename: string): string {
  const base = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}`;
}

export async function putResume(
  filename: string,
  bytes: Buffer,
): Promise<StoredResume> {
  const key = `resumes/${safeName(filename)}`;

  if (blobConfigured()) {
    const { put } = await import("@vercel/blob");
    // The store is configured for private access; resumes must not be readable
    // by plain URL. Reading back happens through readResume() (see the
    // /api/resume route), which authenticates with the token.
    const blob = await put(key, bytes, {
      access: "private",
      contentType: "application/pdf",
    });
    return { url: blob.url, filename };
  }

  // No Blob token available. On Vercel the local fallback would try to write
  // to a read-only filesystem and fail with an opaque EROFS — surface an
  // actionable message instead.
  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not available at runtime. Add it in Vercel → " +
        "Project → Settings → Environment Variables (Production scope) and " +
        "redeploy so the running build picks it up.",
    );
  }

  // Local dev fallback: write into public/ and serve as a static file.
  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads", "resumes");
  await mkdir(dir, { recursive: true });
  const name = safeName(filename);
  await writeFile(path.join(dir, name), bytes);
  return { url: `/uploads/resumes/${name}`, filename };
}

export type ResumeContent = {
  body: ReadableStream<Uint8Array>;
  contentType: string;
};

/**
 * Read a stored resume for streaming back to the browser. Private blobs are
 * fetched with the read-write token (they aren't accessible by plain URL);
 * local-dev fallback files are read from disk. Returns null if the resume
 * can't be found.
 */
export async function readResume(url: string): Promise<ResumeContent | null> {
  if (/^https?:\/\//.test(url)) {
    if (!blobConfigured()) return null;
    const { get } = await import("@vercel/blob");
    const result = await get(url, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    return {
      body: result.stream,
      contentType: result.blob.contentType || "application/pdf",
    };
  }

  if (url.startsWith("/uploads/")) {
    const { readFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const abs = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    try {
      const buf = await readFile(abs);
      const bytes = new Uint8Array(buf.length);
      bytes.set(buf);
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(bytes);
          controller.close();
        },
      });
      return { body, contentType: "application/pdf" };
    } catch {
      return null;
    }
  }

  return null;
}

export async function deleteResume(url: string | null): Promise<void> {
  if (!url) return;

  // A real Blob URL is absolute; local fallback URLs start with "/uploads".
  if (/^https?:\/\//.test(url)) {
    if (!blobConfigured()) return;
    const { del } = await import("@vercel/blob");
    await del(url).catch(() => {
      // Deleting an already-gone blob shouldn't break the caller.
    });
    return;
  }

  if (url.startsWith("/uploads/")) {
    const { unlink } = await import("node:fs/promises");
    const path = await import("node:path");
    await unlink(path.join(process.cwd(), "public", url.replace(/^\//, ""))).catch(
      () => {},
    );
  }
}
