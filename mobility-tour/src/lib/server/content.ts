import "server-only";
import { asJson, db } from "./db";
import { DEFAULT_CONTENT } from "@/content/defaults";
import type { ContentDoc } from "@/content/types";
import { validateContent } from "@/content/validate";
import { applyContentPatches } from "@/content/patches";

export interface RevisionMeta {
  id: number;
  status: "draft" | "published" | "archived";
  note: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

const META = "id, status, note, created_at, updated_at, published_at";

/**
 * 발행본 (없으면 앱에 내장된 기본 콘텐츠, revisionId 0).
 * 발행 이후에 코드로 고친 콘텐츠 패치가 있으면 발행본 위에 덧씌움 (src/content/patches.ts)
 */
export async function getPublished(): Promise<{ revisionId: number; content: ContentDoc }> {
  const d = await db();
  const rows = await d.query<{ id: number; data: ContentDoc; published_at: string | Date | null }>(
    "SELECT id, data, published_at FROM content_revisions WHERE status = 'published' ORDER BY published_at DESC LIMIT 1",
  );
  return rows[0]
    ? { revisionId: rows[0].id, content: applyContentPatches(asJson<ContentDoc>(rows[0].data), rows[0].published_at) }
    : { revisionId: 0, content: DEFAULT_CONTENT };
}

/** 편집 중인 초안 (없으면 최신 발행본을 복사해 시작) */
export async function getDraft(): Promise<{ draft: RevisionMeta | null; content: ContentDoc }> {
  const d = await db();
  const rows = await d.query<RevisionMeta & { data: ContentDoc }>(
    `SELECT ${META}, data FROM content_revisions WHERE status = 'draft' ORDER BY id DESC LIMIT 1`,
  );
  if (rows[0]) {
    const { data, ...meta } = rows[0];
    // 패치 이전에 저장된 초안에도 반영 → 그대로 발행해도 예전 문구가 되살아나지 않음
    return { draft: meta, content: applyContentPatches(asJson<ContentDoc>(data), meta.updated_at) };
  }
  return { draft: null, content: (await getPublished()).content };
}

export async function saveDraft(content: ContentDoc): Promise<RevisionMeta> {
  const d = await db();
  const json = JSON.stringify(content);
  const existing = await d.query<{ id: number }>("SELECT id FROM content_revisions WHERE status = 'draft' ORDER BY id DESC LIMIT 1");
  const rows = existing[0]
    ? await d.query<RevisionMeta>(
        `UPDATE content_revisions SET data = $1::text::jsonb, updated_at = now() WHERE id = $2 RETURNING ${META}`,
        [json, existing[0].id],
      )
    : await d.query<RevisionMeta>(
        `INSERT INTO content_revisions (status, data) VALUES ('draft', $1::text::jsonb) RETURNING ${META}`,
        [json],
      );
  return rows[0];
}

export async function discardDraft() {
  const d = await db();
  await d.query("DELETE FROM content_revisions WHERE status = 'draft'");
}

/** 초안 발행: 필수 문구 확인 → 이전 발행본은 보관(archived), 초안이 새 발행본이 됨 (발행본은 이후 수정되지 않음) */
export async function publishDraft(note: string): Promise<{ ok: true; id: number } | { ok: false; errors: string[] }> {
  const { draft, content } = await getDraft();
  if (!draft) return { ok: false, errors: ["저장된 초안이 없습니다. 먼저 초안을 저장하세요."] };
  const errors = validateContent(content);
  if (errors.length) return { ok: false, errors };
  const d = await db();
  await d.query("UPDATE content_revisions SET status = 'archived' WHERE status = 'published'");
  await d.query(
    "UPDATE content_revisions SET status = 'published', published_at = now(), note = $1 WHERE id = $2",
    [note || null, draft.id],
  );
  return { ok: true, id: draft.id };
}

/** 이전 버전을 초안으로 불러오기 (발행은 별도로) */
export async function restoreToDraft(id: number) {
  const d = await db();
  const rows = await d.query<{ data: ContentDoc; updated_at: string | Date }>(
    "SELECT data, updated_at FROM content_revisions WHERE id = $1",
    [id],
  );
  if (!rows[0]) throw new Error("버전을 찾을 수 없습니다.");
  // 예전 버전을 불러와도 그 이후의 콘텐츠 패치는 유지
  await saveDraft(applyContentPatches(asJson<ContentDoc>(rows[0].data), rows[0].updated_at));
}

export async function listRevisions(): Promise<RevisionMeta[]> {
  const d = await db();
  return d.query<RevisionMeta>(`SELECT ${META} FROM content_revisions ORDER BY id DESC LIMIT 50`);
}

