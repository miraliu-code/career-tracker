"use client";

import { useRef, useState, useTransition } from "react";

import { LABEL_CLASSES } from "@/components/form";
import { PdfIcon } from "@/components/icons";

import { discardResume, uploadResume } from "./resume-actions";

const MAX_BYTES = 5 * 1024 * 1024;

export function ResumeUpload({
  initialUrl,
  initialFilename,
}: {
  initialUrl?: string | null;
  initialFilename?: string | null;
}) {
  // The saved-on-the-server value; a different current url means a fresh,
  // unsaved upload that we should clean up if it's removed or replaced.
  const savedUrl = initialUrl ?? null;

  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [filename, setFilename] = useState<string | null>(
    initialFilename ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function cleanupIfFresh(outgoing: string | null) {
    if (outgoing && outgoing !== savedUrl) {
      // Fire-and-forget; an orphaned blob deletion shouldn't block the UI.
      void discardResume(outgoing);
    }
  }

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Only PDF files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is too large — the limit is 5MB.");
      return;
    }
    const outgoing = url;
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const result = await uploadResume(fd);
      if (!result.ok) {
        console.error("[resume upload]", result.error);
        setError(result.error);
        return;
      }
      cleanupIfFresh(outgoing);
      setUrl(result.url);
      setFilename(result.filename);
    });
  }

  function handleRemove() {
    cleanupIfFresh(url);
    setUrl(null);
    setFilename(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className={LABEL_CLASSES}>Resume (PDF)</label>

      {/* Hidden fields carry the result into the parent application form. */}
      <input type="hidden" name="resumeUrl" value={url ?? ""} />
      <input type="hidden" name="resumeFilename" value={filename ?? ""} />

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {url ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sage/40 bg-white px-3 py-2">
          <PdfIcon className="size-4 shrink-0 text-rose" />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-sm font-medium text-forest hover:text-rose hover:underline"
          >
            {filename ?? "resume.pdf"}
          </a>
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-sage/50 bg-white px-2.5 py-1 text-xs font-medium text-sage-deep hover:bg-blush/30 hover:text-forest disabled:opacity-50"
          >
            {pending ? "Uploading…" : "Replace"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={handleRemove}
            className="rounded-full px-2.5 py-1 text-xs font-medium text-rose hover:bg-blush/40 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sage/50 bg-white px-3 py-3 text-sm font-medium text-sage-deep hover:bg-blush/20 hover:text-forest disabled:opacity-50"
        >
          <PdfIcon className="size-4" />
          {pending ? "Uploading…" : "Upload a PDF"}
        </button>
      )}

      {error ? (
        <p className="mt-1.5 text-sm text-rose">{error}</p>
      ) : (
        <p className="mt-1.5 text-xs text-sage">PDF only, up to 5MB.</p>
      )}
    </div>
  );
}
