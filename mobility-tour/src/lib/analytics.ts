// 이용 로그 수집 진입점 (PRD §8.5).
// ⚠ 개인정보 처리 근거·보유기간·미성년자 요건 확인 전까지는 서버로 전송하지 않습니다.
// 확인 후 이 함수에서 IndexedDB 큐 → API(Supabase 등) 전송을 구현하면 됩니다.
export type EventType =
  | "session_started" | "exhibit_selected" | "stage_viewed" | "stage_completed"
  | "stage_skipped" | "cta_clicked" | "faq_opened" | "hint_opened"
  | "image_hotspot_selected" | "quiz_answer_selected" | "quiz_submitted"
  | "language_changed" | "session_ended" | "app_backgrounded" | "app_foregrounded"
  | "session_idle_reset";

export interface TrackPayload {
  exhibitId?: string;
  stageKey?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

const ANALYTICS_ENABLED = false;

export function track(sessionId: string, type: EventType, language: string, payload: TrackPayload = {}) {
  const event = {
    event_id: crypto.randomUUID(), // 중복 전송 방지용 고유 ID
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    event_type: type,
    language,
    app_version: process.env.NEXT_PUBLIC_APP_VERSION,
    exhibit_id: payload.exhibitId,
    stage_key: payload.stageKey,
    target_id: payload.targetId,
    metadata: payload.metadata,
  };
  if (process.env.NODE_ENV !== "production") console.debug("[track]", event);
  if (!ANALYTICS_ENABLED) return;
}
