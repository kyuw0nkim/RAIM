"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkBasicAuth } from "@/lib/admin-auth";
import { discardDraft, publishDraft, restoreToDraft, saveDraft } from "@/lib/server/content";
import { saveSettings, type AppSettings } from "@/lib/server/settings";
import { purgeOlderThan } from "@/lib/server/analytics";
import type { ContentDoc } from "@/content/types";
import { DEFAULT_CONTENT } from "@/content/defaults";

// 서버 액션은 어떤 경로로도 호출될 수 있으므로 액션마다 인증을 다시 확인
async function requireAdmin() {
  const h = await headers();
  if (checkBasicAuth(h.get("authorization")) !== "ok") throw new Error("관리자 인증이 필요합니다.");
}

export async function saveDraftAction(content: ContentDoc) {
  await requireAdmin();
  const meta = await saveDraft(content);
  revalidatePath("/admin", "layout");
  return meta;
}

export async function publishAction(content: ContentDoc, note: string) {
  await requireAdmin();
  await saveDraft(content);
  const r = await publishDraft(note);
  revalidatePath("/admin", "layout");
  return r;
}

export async function discardDraftAction() {
  await requireAdmin();
  await discardDraft();
  revalidatePath("/admin", "layout");
}

export async function restoreAction(id: number) {
  await requireAdmin();
  await restoreToDraft(id);
  revalidatePath("/admin", "layout");
}

export async function saveSettingsAction(s: AppSettings) {
  await requireAdmin();
  const clean: AppSettings = {
    analyticsEnabled: !!s.analyticsEnabled,
    askVisitorInfo: !!s.askVisitorInfo,
    retentionDays: Math.max(1, Math.min(3650, Math.round(Number(s.retentionDays) || 365))),
  };
  await saveSettings(clean);
  revalidatePath("/admin", "layout");
  return clean;
}

export async function purgeAction(days: number) {
  await requireAdmin();
  const n = await purgeOlderThan(Math.max(1, Math.round(days)));
  revalidatePath("/admin", "layout");
  return n;
}

export async function loadDefaultsAction() {
  await requireAdmin();
  await saveDraft(DEFAULT_CONTENT);
  revalidatePath("/admin", "layout");
}
