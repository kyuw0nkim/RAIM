"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_CONTENT } from "@/content/defaults";
import { MAP_OBJECTS, ROOM } from "@/content/map";
import { UI } from "@/content/ui";
import type { ContentDoc, ExhibitId, Locale } from "@/content/types";
import { configureAnalytics, flushEvents, getDeviceId, track, type EventType, type TrackPayload } from "@/lib/analytics";
import { ExhibitView } from "./ExhibitView";
import { MapScene } from "./MapScene";
import { ApproachCard } from "./ApproachCard";
import { VisitorForm, type VisitorEntry } from "./VisitorForm";
import { applyPendingUpdate } from "./ServiceWorker";

type Screen = "start" | "visitors" | "map" | "exhibit";

// 비활성 시간 기준은 현장 운영 테스트 후 조정 (PRD §10.4)
const IDLE_MS = 2 * 60 * 1000;
/** 기본 언어 (투어 종료·초기화 시에도 이 언어로 돌아감) */
const DEFAULT_LOCALE: Locale = "en";
const IDLE_COUNTDOWN_S = 30;

export type Tracker = (type: EventType, payload?: TrackPayload) => void;

interface PublishedResponse {
  revisionId: number;
  content: ContentDoc;
  settings: { analyticsEnabled: boolean; askVisitorInfo: boolean };
}
const CONTENT_CACHE_KEY = "amt-content";

/** 숨김 처리된 FAQ·퀴즈는 방문객 앱에서 제외 */
function prepare(c: ContentDoc): ContentDoc["exhibits"] {
  const out = {} as ContentDoc["exhibits"];
  for (const [id, ex] of Object.entries(c.exhibits) as [ExhibitId, ContentDoc["exhibits"][ExhibitId]][]) {
    out[id] = { ...ex, faqs: ex.faqs.filter((f) => !f.disabled), quiz: ex.quiz?.filter((q) => !q.disabled) };
  }
  return out;
}

export function TourApp() {
  const [lang, setLang] = useState<Locale>(DEFAULT_LOCALE);
  const [screen, setScreen] = useState<Screen>("start");
  const [sessionId, setSessionId] = useState("");
  const [visitors, setVisitors] = useState<VisitorEntry[]>([]);
  const [exhibitId, setExhibitId] = useState<ExhibitId | null>(null);
  /** 지도 위 Approach(만나기) 카드가 열린 전시물 */
  const [focusId, setFocusId] = useState<ExhibitId | null>(null);
  const approachAt = useRef(0);
  /** 5단계(마무리)까지 마친 전시물 — 지도와 다음 전시물 목록에 ✓ 표시 */
  const [completed, setCompleted] = useState<Set<ExhibitId>>(new Set());
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [idleLeft, setIdleLeft] = useState<number | null>(null);
  // 세션마다 새로 마운트하여 이전 방문객의 퀴즈 응답·진행 상태가 남지 않게 함
  const [sessionKey, setSessionKey] = useState(0);
  /** 관리자에서 발행한 콘텐츠 (투어 시작 전에 최신본을 받아 둠, 실패 시 내장 기본값) */
  const [published, setPublished] = useState<PublishedResponse>({
    revisionId: 0,
    content: DEFAULT_CONTENT,
    settings: { analyticsEnabled: false, askVisitorInfo: true },
  });
  const exhibits = prepare(published.content);
  const [deviceId, setDeviceId] = useState("");

  const loadContent = useCallback(async () => {
    const apply = (r: PublishedResponse) => {
      setPublished(r);
      configureAnalytics({ enabled: r.settings.analyticsEnabled, revisionId: r.revisionId });
    };
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const r = (await res.json()) as PublishedResponse;
      apply(r);
      try {
        localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(r));
      } catch {}
    } catch {
      // 오프라인: 마지막으로 받은 콘텐츠 사용
      try {
        const cached = localStorage.getItem(CONTENT_CACHE_KEY);
        if (cached) apply(JSON.parse(cached));
      } catch {}
    }
  }, []);

  useEffect(() => {
    setDeviceId(getDeviceId());
    loadContent();
    // 이용 로그 전송: 주기적으로, 화면이 숨겨질 때, 네트워크가 돌아올 때
    const timer = window.setInterval(() => flushEvents(), 15_000);
    const onHide = () => document.hidden && flushEvents(true);
    const onOnline = () => flushEvents();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("online", onOnline);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("online", onOnline);
    };
  }, [loadContent]);

  const t = useCallback((l: Record<Locale, string>) => l[lang], [lang]);
  const tr: Tracker = useCallback(
    (type, payload) => {
      if (sessionId) track(sessionId, type, lang, payload);
    },
    [sessionId, lang],
  );

  const resetSession = useCallback(
    (reason: "ended" | "idle") => {
      if (sessionId) track(sessionId, reason === "idle" ? "session_idle_reset" : "session_ended", lang);
      setScreen("start");
      setSessionId("");
      setVisitors([]);
      setExhibitId(null);
      setFocusId(null);
      setCompleted(new Set());
      setConfirmEnd(false);
      setIdleLeft(null);
      setLang(DEFAULT_LOCALE);
      setSessionKey((k) => k + 1);
      flushEvents();
      // 다음 방문객을 위해 최신 발행 콘텐츠 받아 두기
      loadContent();
      // 새 버전이 대기 중이면 방문객이 없는 지금 적용
      applyPendingUpdate();
    },
    [sessionId, lang, loadContent],
  );

  // ── 비활성 감지 ──────────────────────────────
  const lastActivity = useRef(Date.now());
  useEffect(() => {
    const bump = () => {
      lastActivity.current = Date.now();
    };
    window.addEventListener("pointerdown", bump);
    window.addEventListener("keydown", bump);
    return () => {
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("keydown", bump);
    };
  }, []);

  useEffect(() => {
    if (screen === "start") return;
    const id = window.setInterval(() => {
      const idle = Date.now() - lastActivity.current;
      if (idle < IDLE_MS) {
        setIdleLeft(null);
        return;
      }
      const left = IDLE_COUNTDOWN_S - Math.floor((idle - IDLE_MS) / 1000);
      if (left <= 0) resetSession("idle");
      else setIdleLeft(left);
    }, 1000);
    return () => window.clearInterval(id);
  }, [screen, resetSession]);

  // ── 전면/백그라운드 전환 기록 (체류 시간 계산용) ──
  useEffect(() => {
    const onVis = () => tr(document.hidden ? "app_backgrounded" : "app_foregrounded");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [tr]);

  const changeLang = (next: Locale) => {
    if (next === lang) return;
    if (sessionId) track(sessionId, "language_changed", next, { metadata: { from: lang } });
    setLang(next);
  };

  const startTour = () => {
    const id = crypto.randomUUID();
    setSessionId(id);
    track(id, "session_started", lang, { metadata: { device_id: deviceId } });
    setScreen(published.settings.askVisitorInfo ? "visitors" : "map");
  };

  /** 1단계 Approach: 지도 위에서 해당 전시물만 밝히고 카드 표시 */
  const showApproach = (id: ExhibitId, viaMap: boolean) => {
    if (viaMap) tr("exhibit_selected", { exhibitId: id });
    tr("stage_viewed", { exhibitId: id, stageKey: "approach" });
    approachAt.current = Date.now();
    setFocusId(id);
    setScreen("map");
  };

  const closeApproach = () => {
    if (!focusId) return;
    tr("stage_completed", {
      exhibitId: focusId,
      stageKey: "approach",
      metadata: { duration_ms: Date.now() - approachAt.current, exit: true },
    });
    setFocusId(null);
  };

  /** Approach → Engage: 상세 화면으로 */
  const enterDetail = (id: ExhibitId) => {
    tr("cta_clicked", { exhibitId: id, stageKey: "approach", targetId: "approach-cta" });
    tr("stage_completed", {
      exhibitId: id,
      stageKey: "approach",
      metadata: { duration_ms: Date.now() - approachAt.current },
    });
    setExhibitId(id);
    setFocusId(null);
    setScreen("exhibit");
  };

  const onTapObject = (id: ExhibitId) => {
    if (id === focusId) enterDetail(id); // 밝혀진 전시물을 다시 누르면 다음 단계로
    else showApproach(id, true);
  };

  const langToggle = (
    <div className="lang-toggle" role="group" aria-label="Language">
      {(["ko", "en"] as const).map((l) => (
        <button key={l} className={l === lang ? "active" : ""} onClick={() => changeLang(l)} aria-pressed={l === lang}>
          {l === "ko" ? "한국어" : "English"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="tour" key={sessionKey} lang={lang}>
      {/* 지도 화면 외에는 교육장 사진을 흐리게 깔아 패널 가독성 확보 */}
      {screen !== "map" && (
        <div className="room-bg" style={{ backgroundImage: `url(${ROOM.src})` }} aria-hidden />
      )}

      {screen === "start" && (
        <main className="start">
          <div className="glass start-card">
            <p className="eyebrow">{t(UI.museum)}</p>
            <h1>{t(UI.appTitle)}</h1>
            <p className="lead">{t(UI.intro)}</p>
            {langToggle}
            <button className="btn primary xl" onClick={startTour}>
              {t(UI.start)} →
            </button>
          </div>
          <p className="version-tag">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
            {deviceId && ` · ${deviceId}`}
          </p>
        </main>
      )}

      {screen === "visitors" && (
        <VisitorForm
          lang={lang}
          visitors={visitors}
          setVisitors={setVisitors}
          langToggle={langToggle}
          onDone={(list) => {
            if (list.length)
              tr("visitor_info_submitted", {
                metadata: { visitors: list.map(({ gender, origin, age }) => ({ gender, origin, age })) },
              });
            setScreen("map");
          }}
        />
      )}

      {screen === "map" && (
        <main className="map">
          {/* 위에서 내려오는 어두운 그라데이션 위에 흰 글씨 안내 */}
          <div className="map-shade" aria-hidden />
          <header className="topbar map-topbar">
            <div className="map-heading">
              <span className="map-title">{t(UI.appTitle)}</span>
              <span className={`map-hint ${focusId ? "hidden" : ""}`}>👆 {t(UI.tapExhibit)}</span>
            </div>
            <div className="topbar-right">
              {langToggle}
              <button className="btn ghost" onClick={() => setConfirmEnd(true)}>
                {t(UI.endTour)}
              </button>
            </div>
          </header>

          <MapScene
            exhibits={exhibits}
            lang={lang}
            completed={completed}
            focused={focusId}
            onTapObject={onTapObject}
            onTapEmpty={closeApproach}
          />
          {focusId && (
            <ApproachCard
              key={focusId}
              exhibit={exhibits[focusId]}
              placement={MAP_OBJECTS.find((o) => o.id === focusId)!.card}
              lang={lang}
              onContinue={() => enterDetail(focusId)}
              onClose={closeApproach}
            />
          )}
        </main>
      )}

      {screen === "exhibit" && exhibitId && (
        <ExhibitView
          key={exhibitId}
          exhibit={exhibits[exhibitId]}
          exhibits={exhibits}
          lang={lang}
          langToggle={langToggle}
          track={tr}
          onMap={() => setScreen("map")}
          onApproach={() => showApproach(exhibitId, false)}
          onSelect={(id) => showApproach(id, false)}
          completed={completed}
          onComplete={() => setCompleted((c) => new Set(c).add(exhibitId))}
        />
      )}

      {confirmEnd && (
        <div className="modal-backdrop" role="dialog" aria-modal>
          <div className="glass modal">
            <p>{t(UI.endConfirm)}</p>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setConfirmEnd(false)}>
                {t(UI.cancel)}
              </button>
              <button className="btn primary" onClick={() => resetSession("ended")}>
                {t(UI.yes)}
              </button>
            </div>
          </div>
        </div>
      )}

      {idleLeft !== null && (
        <div className="modal-backdrop" role="alertdialog" aria-modal>
          <div className="glass modal">
            <h2>{t(UI.idleTitle)}</h2>
            <p>
              <strong className="countdown">{idleLeft}</strong> {t(UI.idleBody)}
            </p>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => resetSession("ended")}>
                {t(UI.endTour)}
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  lastActivity.current = Date.now();
                  setIdleLeft(null);
                }}
              >
                {t(UI.keepGoing)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
