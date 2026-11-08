// 이용 로그 수집 (PRD §8.5)
// - 이벤트는 기기(localStorage) 큐에 먼저 쌓고, 주기적으로 /api/events 로 묶어서 보냄
// - 네트워크가 끊겨도 큐에 남아 있다가 복구되면 재전송, event_id로 서버에서 중복 제거
// - 관리자 설정에서 수집을 끄면 기록하지 않음
export type EventType =
  | "session_started" | "visitor_info_submitted" | "exhibit_selected" | "stage_viewed" | "stage_completed"
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

interface QueuedEvent {
  event_id: string;
  session_id: string;
  timestamp: string;
  event_type: EventType;
  language: string;
  app_version?: string;
  content_revision_id: number;
  exhibit_id?: string;
  stage_key?: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
}

const QUEUE_KEY = "amt-event-queue";
const DEVICE_KEY = "amt-device-id";
const MAX_QUEUE = 3000;

// enabled: null = 아직 설정을 받지 못함 → 일단 큐에 쌓고, 꺼져 있으면 그때 비움
const state: { enabled: boolean | null; revisionId: number; flushing: boolean } = { enabled: null, revisionId: 0, flushing: false };

export function configureAnalytics(opts: { enabled: boolean; revisionId: number }) {
  state.enabled = opts.enabled;
  state.revisionId = opts.revisionId;
  if (!opts.enabled) writeQueue([]);
}

/** 기기 ID: 처음 실행 시 생성. 주소에 ?device=교육장-1 처럼 붙여 열면 이름을 지정할 수 있음 */
export function getDeviceId(): string {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("device");
    if (fromUrl) localStorage.setItem(DEVICE_KEY, fromUrl.slice(0, 40));
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = `tab-${crypto.randomUUID().slice(0, 6)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

function readQueue(): QueuedEvent[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeQueue(q: QueuedEvent[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-MAX_QUEUE)));
  } catch {}
}

export function track(sessionId: string, type: EventType, language: string, payload: TrackPayload = {}) {
  const event: QueuedEvent = {
    event_id: crypto.randomUUID(),
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    event_type: type,
    language,
    app_version: process.env.NEXT_PUBLIC_APP_VERSION,
    content_revision_id: state.revisionId,
    exhibit_id: payload.exhibitId,
    stage_key: payload.stageKey,
    target_id: payload.targetId,
    metadata: payload.metadata,
  };
  if (process.env.NODE_ENV !== "production") console.debug("[track]", event);
  if (state.enabled === false) return;
  writeQueue([...readQueue(), event]);
}

/** 큐 전송. beacon=true 는 화면이 닫히거나 숨겨질 때(응답을 기다리지 않음) */
export async function flushEvents(beacon = false) {
  if (state.flushing || !state.enabled) return;
  const queue = readQueue();
  if (!queue.length) return;
  const batch = queue.slice(0, 200);
  const body = JSON.stringify({ deviceId: getDeviceId(), events: batch });
  if (beacon && "sendBeacon" in navigator) {
    if (navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }))) {
      dropSent(batch);
    }
    return;
  }
  state.flushing = true;
  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
    if (res.ok) dropSent(batch);
  } catch {
    // 오프라인: 큐에 남겨 두고 다음에 재시도
  } finally {
    state.flushing = false;
  }
}

function dropSent(batch: QueuedEvent[]) {
  const sent = new Set(batch.map((e) => e.event_id));
  writeQueue(readQueue().filter((e) => !sent.has(e.event_id)));
}
