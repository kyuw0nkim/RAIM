import "server-only";

/**
 * 데이터베이스 연결
 * - DATABASE_URL(또는 POSTGRES_URL)이 있으면 Postgres (Vercel → Storage → Neon 연결 시 자동 설정)
 * - 없으면 PGlite(내장 Postgres)로 로컬 폴더에 저장 — 로컬 개발·테스트용
 *   (Vercel에서는 서버 파일이 유지되지 않으므로 반드시 Postgres를 연결해야 기록이 남습니다)
 */
type Row = Record<string, unknown>;
interface Db {
  query<T = Row>(sql: string, params?: unknown[]): Promise<T[]>;
  kind: "postgres" | "pglite";
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS content_revisions (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL,            -- draft | published | archived
  data JSONB NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS visitor_sessions (
  session_id TEXT PRIMARY KEY,
  device_id TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  end_reason TEXT,
  last_event_at TIMESTAMPTZ,
  initial_language TEXT,
  app_version TEXT,
  content_revision_id INTEGER
);
CREATE TABLE IF NOT EXISTS session_visitors (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  gender TEXT,
  origin TEXT,
  age_group TEXT
);
CREATE INDEX IF NOT EXISTS session_visitors_session ON session_visitors(session_id);
CREATE TABLE IF NOT EXISTS interaction_events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL,
  exhibit_id TEXT,
  stage_key TEXT,
  target_id TEXT,
  language TEXT,
  content_revision_id INTEGER,
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS events_session ON interaction_events(session_id);
CREATE INDEX IF NOT EXISTS events_ts ON interaction_events(ts);
CREATE INDEX IF NOT EXISTS events_type ON interaction_events(event_type);
`;

const g = globalThis as unknown as { __amtDb?: Promise<Db> };

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, { max: Number(process.env.DB_POOL_MAX) || 3, idle_timeout: 20, prepare: false, onnotice: () => {} });
    const db: Db = {
      kind: "postgres",
      query: async <T,>(q: string, params: unknown[] = []) =>
        (await sql.unsafe(q, params as never[])) as unknown as T[],
    };
    await sql.unsafe(SCHEMA);
    return db;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? (process.env.VERCEL ? "memory://" : "./.data/pglite");
  if (!dir.startsWith("memory://")) {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(dir, { recursive: true });
  }
  const pg = await PGlite.create(dir);
  await pg.exec(SCHEMA);
  return {
    kind: "pglite",
    query: async <T,>(q: string, params: unknown[] = []) => (await pg.query<T>(q, params)).rows,
  };
}

export function db(): Promise<Db> {
  if (!g.__amtDb) {
    g.__amtDb = connect().catch((e) => {
      g.__amtDb = undefined;
      throw e;
    });
  }
  return g.__amtDb;
}

/** jsonb 값이 문자열로 돌아오는 경우(드라이버 차이) 대비 */
export function asJson<T>(v: unknown): T {
  return (typeof v === "string" ? JSON.parse(v) : v) as T;
}

export function dbStatus() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return {
    connected: !!url,
    kind: url ? "postgres" : "pglite",
    persistent: !!url || !process.env.VERCEL,
  } as const;
}
