import "server-only";
import { asJson, db } from "./db";

export interface AppSettings {
  /** 이용 로그(익명 이벤트) 수집 */
  analyticsEnabled: boolean;
  /** 방문객 구성 정보 입력 화면 표시 */
  askVisitorInfo: boolean;
  /** 이용 기록 보유 기간(일) — 정리 버튼으로 이보다 오래된 기록 삭제 */
  retentionDays: number;
}

export const DEFAULT_SETTINGS: AppSettings = { analyticsEnabled: true, askVisitorInfo: true, retentionDays: 365 };

export async function getSettings(): Promise<AppSettings> {
  const d = await db();
  const rows = await d.query<{ value: Partial<AppSettings> }>("SELECT value FROM app_settings WHERE key = 'app'");
  return { ...DEFAULT_SETTINGS, ...(rows[0] ? asJson<Partial<AppSettings>>(rows[0].value) : {}) };
}

export async function saveSettings(s: AppSettings) {
  const d = await db();
  await d.query(
    "INSERT INTO app_settings (key, value) VALUES ('app', $1::text::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [JSON.stringify(s)],
  );
}
