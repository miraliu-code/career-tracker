// Read-only Gmail access for career-alerts monitoring. Uses only the
// gmail.readonly scope: token refresh + message list/get, nothing else.

type GmailMessageMeta = {
  id: string;
  snippet: string;
  internalDate: string;
  payload?: { headers?: { name: string; value: string }[] };
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function proxiedFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  // Node's built-in fetch ignores HTTPS_PROXY; route through the proxy when
  // one is configured (dev sandbox). On Vercel this branch is skipped.
  if (process.env.HTTPS_PROXY || process.env.https_proxy) {
    const { fetch: uFetch, EnvHttpProxyAgent } = await import("undici");
    return uFetch(url, {
      ...(init as Parameters<typeof uFetch>[1]),
      dispatcher: new EnvHttpProxyAgent(),
    }) as unknown as Response;
  }
  return fetch(url, init);
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN must be set",
    );
  }
  const res = await proxiedFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Gmail token refresh failed (${res.status})`);
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function gmailGet<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const res = await proxiedFetch(
    `https://gmail.googleapis.com/gmail/v1/users/me${path}`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    throw new Error(`Gmail API ${path} failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/** IDs of messages in the career-alerts label from the last `days` days. */
export async function listCareerAlertMessageIds(
  days: number,
): Promise<string[]> {
  const q = encodeURIComponent(`label:career-alerts newer_than:${days}d`);
  const ids: string[] = [];
  let pageToken = "";
  for (let page = 0; page < 3; page++) {
    const data = await gmailGet<{
      messages?: { id: string }[];
      nextPageToken?: string;
    }>(
      `/messages?q=${q}&maxResults=100${pageToken ? `&pageToken=${pageToken}` : ""}`,
    );
    ids.push(...(data.messages ?? []).map((m) => m.id));
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return ids;
}

export type CareerAlertMessage = {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  bodyText: string;
  receivedAt: Date;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

type GmailPart = {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
};

function collectText(part: GmailPart | undefined, out: string[]): void {
  if (!part) return;
  if (part.mimeType === "text/plain" && part.body?.data) {
    out.push(Buffer.from(part.body.data, "base64url").toString("utf8"));
  }
  for (const p of part.parts ?? []) collectText(p, out);
}

function collectHtml(part: GmailPart | undefined, out: string[]): void {
  if (!part) return;
  if (part.mimeType === "text/html" && part.body?.data) {
    const html = Buffer.from(part.body.data, "base64url").toString("utf8");
    out.push(html.replace(/<[^>]+>/g, " "));
  }
  for (const p of part.parts ?? []) collectHtml(p, out);
}

/** Subject/from/snippet plus plain body text for one message (read-only). */
export async function getCareerAlertMessage(
  id: string,
): Promise<CareerAlertMessage> {
  const data = await gmailGet<GmailMessageMeta & { payload?: GmailPart }>(
    `/messages/${id}?format=full`,
  );
  const headers =
    (data.payload as { headers?: { name: string; value: string }[] })
      ?.headers ?? [];
  const header = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ??
    "";
  const texts: string[] = [];
  collectText(data.payload, texts);
  if (texts.length === 0) collectHtml(data.payload, texts);
  const bodyText = texts.join(" ").replace(/\s+/g, " ").slice(0, 8000);
  return {
    id: data.id,
    subject: header("Subject"),
    sender: header("From"),
    snippet: decodeEntities(data.snippet ?? ""),
    bodyText: decodeEntities(bodyText),
    receivedAt: new Date(Number(data.internalDate)),
  };
}
