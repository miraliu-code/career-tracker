// Resumes are stored with private access, so they can't be opened by linking
// straight to the blob URL. Every resume link goes through the authenticated
// /api/resume route, which streams the file after checking it's a real stored
// resume. Pure and client-safe (no DB, no node imports).
export function resumeHref(url: string): string {
  return `/api/resume?url=${encodeURIComponent(url)}`;
}
