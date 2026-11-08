import { NextResponse } from "next/server";
import { ingestEvents, type IncomingEvent } from "@/lib/server/analytics";
import { getSettings } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

/** 방문객 앱 이용 로그 수신 (navigator.sendBeacon / fetch keepalive) */
export async function POST(req: Request) {
  const text = await req.text();
  if (text.length > 512_000) return NextResponse.json({ error: "too large" }, { status: 413 });
  let body: { deviceId?: string; events?: IncomingEvent[] };
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const events = Array.isArray(body.events) ? body.events.slice(0, 500) : [];
  const settings = await getSettings();
  // 수집이 꺼져 있으면 받은 것으로 처리하고 저장하지 않음 (기기 큐가 쌓이지 않도록)
  if (!settings.analyticsEnabled) return NextResponse.json({ accepted: 0, stored: 0 });
  const stored = await ingestEvents(typeof body.deviceId === "string" ? body.deviceId : null, events);
  return NextResponse.json({ accepted: events.length, stored });
}
