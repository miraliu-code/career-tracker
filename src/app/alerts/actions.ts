"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { alertFindings } from "@/db/schema";
import { runCareerAlertScan, type ScanResult } from "@/lib/scan-alerts";

export async function scanInboxNow(): Promise<ScanResult> {
  const result = await runCareerAlertScan(8);
  revalidatePath("/");
  return result;
}

export async function dismissFinding(id: number): Promise<void> {
  await db
    .update(alertFindings)
    .set({ status: "reviewed" })
    .where(eq(alertFindings.id, id));
  revalidatePath("/");
}
