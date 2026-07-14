"use server";

import { deleteResume, putResume } from "@/lib/resume-storage";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export type ResumeUploadResult =
  | { ok: true; url: string; filename: string }
  | { ok: false; error: string };

/** Validate (PDF, ≤5MB) and store a resume file, returning its URL. */
export async function uploadResume(
  formData: FormData,
): Promise<ResumeUploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file selected." };
  }
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return { ok: false, error: "Only PDF files are allowed." };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: "File is too large — the limit is 5MB.",
    };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const stored = await putResume(file.name, bytes);
    return { ok: true, url: stored.url, filename: stored.filename };
  } catch (err) {
    // Surface the real reason: it lands in the Vercel function logs and is
    // returned to the client so the actual failure is visible, not masked.
    const message = err instanceof Error ? err.message : String(err);
    console.error("[resume upload] failed:", err);
    return { ok: false, error: `Upload failed: ${message}` };
  }
}

/**
 * Delete a resume blob that was uploaded but never saved (e.g. the user
 * clicked "remove" on a fresh upload, or replaced it before saving).
 */
export async function discardResume(url: string): Promise<void> {
  await deleteResume(url);
}
