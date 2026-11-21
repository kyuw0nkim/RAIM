// 코드로 고친 콘텐츠를 이미 발행된 콘텐츠에도 반영하기 위한 패치 목록.
//
// 규칙: 패치 날짜(date)보다 "먼저" 발행·저장된 콘텐츠에만 적용합니다.
//   - 머지(패치)가 발행보다 나중 → 패치가 발행본보다 우선
//   - 발행이 머지보다 나중 → 관리자가 발행한 내용이 우선 (관리자가 직접 고친 것으로 봄)
// 내장 기본 콘텐츠(exhibits.ts)도 같은 내용으로 고쳐 두어야 합니다.
import type { ContentDoc } from "./types";

export interface ContentPatch {
  id: string;
  /** 이 시각 이전에 발행·저장된 콘텐츠에 적용 (ISO 8601) */
  date: string;
  note: string;
  apply: (doc: ContentDoc) => void;
}

export const CONTENT_PATCHES: ContentPatch[] = [
  {
    id: "mural-engage-no-video",
    date: "2026-11-21T04:50:00Z", // v0.10.1
    note: "벽화 생각하기: '영상으로 재현' 안내 문장 제거",
    apply: (doc) => {
      const engage = doc.exhibits.mural?.stages.engage;
      if (engage) engage.body = { ko: "", en: "" };
    },
  },
];

/** savedAt 이후에 추가된 패치를 적용한 사본을 돌려줌 (savedAt 이 없으면 그대로) */
export function applyContentPatches(doc: ContentDoc, savedAt: string | Date | null | undefined): ContentDoc {
  if (!savedAt) return doc;
  const t = new Date(savedAt).getTime();
  const pending = CONTENT_PATCHES.filter((p) => new Date(p.date).getTime() > t);
  if (!pending.length) return doc;
  const out = structuredClone(doc);
  for (const p of pending) p.apply(out);
  return out;
}
