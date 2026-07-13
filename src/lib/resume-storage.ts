// Resume storage. In production (Vercel) this uses Vercel Blob, keyed off
// BLOB_READ_WRITE_TOKEN. When that token is absent — local development —
// it falls back to writing under public/uploads so the flow is fully
// exercisable without a Blob account. The deployed path always has the
// token, so the fallback never runs in production.

// Real Vercel Blob tokens start with "vercel_blob_rw_". A missing token — or
// the placeholder in .env.local — routes to the local dev fallback instead.
const hasBlobToken = () =>
  (process.env.BLOB_READ_WRITE_TOKEN ?? "").startsWith("vercel_blob_rw_");

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

  if (hasBlobToken()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, bytes, {
      access: "public",
      contentType: "application/pdf",
    });
    return { url: blob.url, filename };
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

export async function deleteResume(url: string | null): Promise<void> {
  if (!url) return;

  // A real Blob URL is absolute; local fallback URLs start with "/uploads".
  if (/^https?:\/\//.test(url)) {
    if (!hasBlobToken()) return;
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
