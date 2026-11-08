import "server-only";
import { asJson, db } from "./db";
import { EXHIBIT_IDS, STAGES } from "@/content/types";

export interface IncomingEvent {
  event_id: string;
  session_id: string;
  timestamp: string;
  event_type: string;
  exhibit_id?: string;
  stage_key?: string;
  target_id?: string;
  language?: string;
  app_version?: string;
  content_revision_id?: number;
  metadata?: Record<string, unknown>;
}

const str = (v: unknown, max = 80) => (typeof v === "string" && v.length <= max ? v : null);
const STAGE_ARRAY = `ARRAY[${STAGES.map((s) => `'${s}'`).join(",")}]`;

/** 이벤트 일괄 저장 — event_id 기준 중복 무시(재전송 안전) */
export async function ingestEvents(deviceId: string | null, events: IncomingEvent[]) {
  const d = await db();
  let inserted = 0;
  for (const e of events) {
    const id = str(e.event_id, 64);
    const sid = str(e.session_id, 64);
    const type = str(e.event_type, 40);
    const ts = typeof e.timestamp === "string" && !Number.isNaN(Date.parse(e.timestamp)) ? e.timestamp : null;
    if (!id || !sid || !type || !ts) continue;
    const rev = Number.isInteger(e.content_revision_id) ? e.content_revision_id! : null;
    const meta = e.metadata && typeof e.metadata === "object" ? JSON.stringify(e.metadata).slice(0, 4000) : null;

    const rows = await d.query(
      `INSERT INTO interaction_events (event_id, session_id, ts, event_type, exhibit_id, stage_key, target_id, language, content_revision_id, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::text::jsonb) ON CONFLICT (event_id) DO NOTHING RETURNING event_id`,
      [id, sid, ts, type, str(e.exhibit_id, 20), str(e.stage_key, 20), str(e.target_id), str(e.language, 5), rev, meta],
    );
    if (!rows.length) continue;
    inserted++;

    await d.query(
      `INSERT INTO visitor_sessions (session_id, device_id, started_at, last_event_at, initial_language, app_version, content_revision_id)
       VALUES ($1, $2, $3, $3, $4, $5, $6)
       ON CONFLICT (session_id) DO UPDATE SET
         device_id = COALESCE(visitor_sessions.device_id, EXCLUDED.device_id),
         started_at = LEAST(visitor_sessions.started_at, EXCLUDED.started_at),
         last_event_at = GREATEST(visitor_sessions.last_event_at, EXCLUDED.last_event_at),
         initial_language = CASE WHEN $7 THEN EXCLUDED.initial_language ELSE COALESCE(visitor_sessions.initial_language, EXCLUDED.initial_language) END,
         app_version = COALESCE(visitor_sessions.app_version, EXCLUDED.app_version),
         content_revision_id = COALESCE(visitor_sessions.content_revision_id, EXCLUDED.content_revision_id)`,
      [sid, str(deviceId, 64), ts, str(e.language, 5), str(e.app_version, 20), rev, type === "session_started"],
    );

    if (type === "session_ended" || type === "session_idle_reset") {
      await d.query("UPDATE visitor_sessions SET ended_at = $2, end_reason = $3 WHERE session_id = $1", [
        sid,
        ts,
        type === "session_ended" ? "ended" : "idle",
      ]);
    }
    if (type === "visitor_info_submitted") {
      const list = Array.isArray(e.metadata?.visitors) ? (e.metadata!.visitors as Record<string, unknown>[]).slice(0, 30) : [];
      await d.query("DELETE FROM session_visitors WHERE session_id = $1", [sid]);
      for (const v of list) {
        await d.query("INSERT INTO session_visitors (session_id, gender, origin, age_group) VALUES ($1,$2,$3,$4)", [
          sid,
          str(v.gender, 20),
          str(v.origin, 20),
          str(v.age, 20),
        ]);
      }
    }
  }
  return inserted;
}

/* ───────────── 조회 (관리자) ───────────── */

export interface Range {
  since: string; // ISO
}
export function rangeFromDays(days: number | null): Range {
  const since = days ? new Date(Date.now() - days * 86400_000) : new Date(0);
  return { since: since.toISOString() };
}

const n = (v: unknown) => Number(v ?? 0);

export async function getDashboard(r: Range) {
  const d = await db();
  const p = [r.since];
  const [overview] = await d.query<Record<string, unknown>>(
    `SELECT COUNT(*)::int AS sessions,
            COALESCE(AVG(EXTRACT(EPOCH FROM (COALESCE(ended_at, last_event_at) - started_at))), 0)::float AS avg_seconds,
            COUNT(*) FILTER (WHERE initial_language = 'ko')::int AS ko,
            COUNT(*) FILTER (WHERE initial_language = 'en')::int AS en
       FROM visitor_sessions WHERE started_at >= $1`,
    p,
  );
  const perDay = await d.query<{ day: string; count: number }>(
    `SELECT to_char((started_at AT TIME ZONE 'Asia/Seoul')::date, 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
       FROM visitor_sessions WHERE started_at >= $1 GROUP BY 1 ORDER BY 1`,
    p,
  );
  const counts = await d.query<{ event_type: string; exhibit_id: string | null; count: number }>(
    `SELECT event_type, exhibit_id, COUNT(*)::int AS count FROM interaction_events
      WHERE ts >= $1 AND event_type IN ('exhibit_selected','cta_clicked','hint_opened','faq_opened','image_hotspot_selected','language_changed','stage_skipped')
      GROUP BY 1, 2`,
    p,
  );
  const funnel = await d.query<{ exhibit_id: string; stage_key: string; sessions: number }>(
    `SELECT exhibit_id, stage_key, COUNT(DISTINCT session_id)::int AS sessions FROM interaction_events
      WHERE ts >= $1 AND event_type = 'stage_viewed' GROUP BY 1, 2`,
    p,
  );
  const durations = await d.query<{ exhibit_id: string; stage_key: string; avg_ms: number }>(
    `SELECT exhibit_id, stage_key, AVG((metadata->>'duration_ms')::float)::float AS avg_ms FROM interaction_events
      WHERE ts >= $1 AND event_type IN ('stage_completed','stage_skipped') AND metadata ? 'duration_ms'
      GROUP BY 1, 2`,
    p,
  );
  // 전시물 페이지 경과 시간: 세션·전시물별 단계 시간 합의 평균
  const elapsed = await d.query<{ exhibit_id: string; avg_ms: number }>(
    `SELECT exhibit_id, AVG(total)::float AS avg_ms FROM (
        SELECT session_id, exhibit_id, SUM((metadata->>'duration_ms')::float) AS total FROM interaction_events
         WHERE ts >= $1 AND event_type IN ('stage_completed','stage_skipped') AND metadata ? 'duration_ms'
         GROUP BY 1, 2) t GROUP BY 1`,
    p,
  );
  const faqs = await d.query<{ exhibit_id: string; target_id: string; count: number }>(
    `SELECT exhibit_id, target_id, COUNT(*)::int AS count FROM interaction_events
      WHERE ts >= $1 AND event_type = 'faq_opened' GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 20`,
    p,
  );
  const hotspots = await d.query<{ target_id: string; count: number }>(
    `SELECT target_id, COUNT(*)::int AS count FROM interaction_events
      WHERE ts >= $1 AND event_type = 'image_hotspot_selected' GROUP BY 1 ORDER BY 2 DESC`,
    p,
  );
  const quiz = await d.query<{ target_id: string; option: string; correct: boolean; count: number }>(
    `SELECT target_id, metadata->>'option' AS option, (metadata->>'correct')::boolean AS correct, COUNT(*)::int AS count
       FROM interaction_events WHERE ts >= $1 AND event_type = 'quiz_submitted' GROUP BY 1, 2, 3`,
    p,
  );
  const composition = await d.query<{ field: string; value: string | null; count: number }>(
    `SELECT 'gender' AS field, gender AS value, COUNT(*)::int AS count FROM session_visitors v JOIN visitor_sessions s USING (session_id) WHERE s.started_at >= $1 GROUP BY 2
     UNION ALL
     SELECT 'origin', origin, COUNT(*)::int FROM session_visitors v JOIN visitor_sessions s USING (session_id) WHERE s.started_at >= $1 GROUP BY 2
     UNION ALL
     SELECT 'age', age_group, COUNT(*)::int FROM session_visitors v JOIN visitor_sessions s USING (session_id) WHERE s.started_at >= $1 GROUP BY 2`,
    p,
  );
  const [groups] = await d.query<{ with_info: number; visitors: number }>(
    `SELECT COUNT(DISTINCT v.session_id)::int AS with_info, COUNT(*)::int AS visitors
       FROM session_visitors v JOIN visitor_sessions s USING (session_id) WHERE s.started_at >= $1`,
    p,
  );

  const count = (type: string, ex?: string) =>
    counts.filter((c) => c.event_type === type && (!ex || c.exhibit_id === ex)).reduce((a, c) => a + n(c.count), 0);

  return {
    sessions: n(overview?.sessions),
    avgSessionSeconds: n(overview?.avg_seconds),
    languages: { ko: n(overview?.ko), en: n(overview?.en) },
    languageChanges: count("language_changed"),
    perDay,
    exhibits: EXHIBIT_IDS.map((id) => ({
      id,
      selected: count("exhibit_selected", id),
      cta: count("cta_clicked", id),
      hints: count("hint_opened", id),
      faqs: count("faq_opened", id),
      skipped: count("stage_skipped", id),
      avgElapsedMs: n(elapsed.find((e) => e.exhibit_id === id)?.avg_ms),
      funnel: STAGES.map((s) => ({
        stage: s,
        sessions: n(funnel.find((f) => f.exhibit_id === id && f.stage_key === s)?.sessions),
        avgMs: n(durations.find((f) => f.exhibit_id === id && f.stage_key === s)?.avg_ms),
      })),
    })),
    faqs,
    hotspots,
    quiz,
    composition,
    groups: { withInfo: n(groups?.with_info), visitors: n(groups?.visitors) },
  };
}
export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;

export interface SessionRow {
  session_id: string;
  device_id: string | null;
  started_at: string;
  ended_at: string | null;
  end_reason: string | null;
  last_event_at: string;
  initial_language: string | null;
  app_version: string | null;
  content_revision_id: number | null;
  visitors: number;
  events: number;
  /** 전시물별 도달한 최고 단계 (1~5, 0 = 미방문) */
  progress: Record<string, number>;
}

export async function listSessions(r: Range, limit = 100, offset = 0): Promise<{ rows: SessionRow[]; total: number }> {
  const d = await db();
  const [{ total }] = await d.query<{ total: number }>(
    "SELECT COUNT(*)::int AS total FROM visitor_sessions WHERE started_at >= $1",
    [r.since],
  );
  const rows = await d.query<Omit<SessionRow, "progress">>(
    `SELECT s.*,
            (SELECT COUNT(*)::int FROM session_visitors v WHERE v.session_id = s.session_id) AS visitors,
            (SELECT COUNT(*)::int FROM interaction_events e WHERE e.session_id = s.session_id) AS events
       FROM visitor_sessions s WHERE started_at >= $1 ORDER BY started_at DESC LIMIT $2 OFFSET $3`,
    [r.since, limit, offset],
  );
  const ids = rows.map((x) => x.session_id);
  const prog = ids.length
    ? await d.query<{ session_id: string; exhibit_id: string; max_stage: number }>(
        `SELECT session_id, exhibit_id, MAX(array_position(${STAGE_ARRAY}, stage_key))::int AS max_stage
           FROM interaction_events WHERE session_id = ANY($1) AND event_type = 'stage_viewed' GROUP BY 1, 2`,
        [ids],
      )
    : [];
  return {
    total: n(total),
    rows: rows.map((x) => ({
      ...x,
      progress: Object.fromEntries(
        EXHIBIT_IDS.map((id) => [id, n(prog.find((p) => p.session_id === x.session_id && p.exhibit_id === id)?.max_stage)]),
      ),
    })),
  };
}

export async function getSessionDetail(sessionId: string) {
  const d = await db();
  const [session] = await d.query<Record<string, unknown>>("SELECT * FROM visitor_sessions WHERE session_id = $1", [sessionId]);
  if (!session) return null;
  const visitors = await d.query<{ gender: string | null; origin: string | null; age_group: string | null }>(
    "SELECT gender, origin, age_group FROM session_visitors WHERE session_id = $1 ORDER BY id",
    [sessionId],
  );
  const events = await d.query<{
    event_id: string;
    ts: string;
    event_type: string;
    exhibit_id: string | null;
    stage_key: string | null;
    target_id: string | null;
    language: string | null;
    metadata: Record<string, unknown> | null;
  }>(
    "SELECT event_id, ts, event_type, exhibit_id, stage_key, target_id, language, metadata FROM interaction_events WHERE session_id = $1 ORDER BY ts, event_id",
    [sessionId],
  );
  return { session, visitors, events: events.map((e) => ({ ...e, metadata: e.metadata ? asJson<Record<string, unknown>>(e.metadata) : null })) };
}

/** CSV 내보내기용 원자료 (비식별: 이름·연락처 등 직접 식별정보 없음) */
export async function exportRows(kind: "sessions" | "events" | "visitors", r: Range) {
  const d = await db();
  if (kind === "sessions") {
    const { rows } = await listSessions(r, 100000);
    return rows.map(({ progress, ...s }) => ({
      ...s,
      ...Object.fromEntries(Object.entries(progress).map(([k, v]) => [`max_stage_${k}`, v])),
    }));
  }
  if (kind === "visitors") {
    return d.query(
      `SELECT v.session_id, v.gender, v.origin, v.age_group FROM session_visitors v
         JOIN visitor_sessions s USING (session_id) WHERE s.started_at >= $1 ORDER BY v.session_id, v.id`,
      [r.since],
    );
  }
  return d.query(
    `SELECT event_id, session_id, ts, event_type, exhibit_id, stage_key, target_id, language, content_revision_id, metadata::text AS metadata
       FROM interaction_events WHERE ts >= $1 ORDER BY ts`,
    [r.since],
  );
}

/** 보유 기간이 지난 이용 기록 삭제 */
export async function purgeOlderThan(days: number) {
  const d = await db();
  const cutoff = new Date(Date.now() - days * 86400_000).toISOString();
  const old = await d.query<{ session_id: string }>("SELECT session_id FROM visitor_sessions WHERE started_at < $1", [cutoff]);
  const ids = old.map((o) => o.session_id);
  if (ids.length) {
    await d.query("DELETE FROM interaction_events WHERE session_id = ANY($1)", [ids]);
    await d.query("DELETE FROM session_visitors WHERE session_id = ANY($1)", [ids]);
    await d.query("DELETE FROM visitor_sessions WHERE session_id = ANY($1)", [ids]);
  }
  await d.query("DELETE FROM interaction_events WHERE ts < $1", [cutoff]);
  return ids.length;
}
