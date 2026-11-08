import { NextResponse } from "next/server";
import { getPublished } from "@/lib/server/content";
import { getSettings, DEFAULT_SETTINGS } from "@/lib/server/settings";
import { DEFAULT_CONTENT } from "@/content/defaults";

export const dynamic = "force-dynamic";

/** 방문객 앱: 발행된 콘텐츠 + 수집 설정. DB 오류 시에도 기본 콘텐츠로 투어가 동작하도록 함 */
export async function GET() {
  try {
    const [{ revisionId, content }, settings] = await Promise.all([getPublished(), getSettings()]);
    return NextResponse.json(
      { revisionId, content, settings: { analyticsEnabled: settings.analyticsEnabled, askVisitorInfo: settings.askVisitorInfo } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("content load failed", e);
    return NextResponse.json(
      {
        revisionId: 0,
        content: DEFAULT_CONTENT,
        settings: { analyticsEnabled: false, askVisitorInfo: DEFAULT_SETTINGS.askVisitorInfo },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
