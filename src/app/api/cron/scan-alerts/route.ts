import { NextResponse } from "next/server";

import { runCareerAlertScan } from "@/lib/scan-alerts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Weekly cron target (see vercel.json). Vercel sends
// "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is configured.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // runCareerAlertScan records Gmail health and never throws, so the weekly
  // cron always completes; the response body carries the outcome.
  const result = await runCareerAlertScan(8);
  return NextResponse.json(result);
}
