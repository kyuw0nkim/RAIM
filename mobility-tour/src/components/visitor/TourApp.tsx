"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EXHIBITS } from "@/content/exhibits";
import { MAP_OBJECTS, ROOM } from "@/content/map";
import { UI } from "@/content/ui";
import type { ExhibitId, Locale } from "@/content/types";
import { track, type EventType, type TrackPayload } from "@/lib/analytics";
import { ExhibitView } from "./ExhibitView";
import { MapScene } from "./MapScene";
import { ApproachCard } from "./ApproachCard";
import { VisitorForm, type VisitorEntry } from "./VisitorForm";
import { applyPendingUpdate } from "./ServiceWorker";

type Screen = "start" | "visitors" | "map" | "exhibit";

// 비활성 시간 기준은 현장 운영 테스트 후 조정 (PRD §10.4)
const IDLE_MS = 2 * 60 * 1000;
const IDLE_COUNTDOWN_S = 30;

export type Tracker = (type: EventType, payload?: TrackPayload) => void;

export function TourApp() {
  const [lang, setLang] = useState<Locale>("ko");
  const [screen, setScreen] = useState<Screen>("start");
  const [sessionId, setSessionId] = useState("");
  const [visitors, setVisitors] = useState<VisitorEntry[]>([]);
  const [exhibitId, setExhibitId] = useState<ExhibitId | null>(null);
  /** 지도 위 Approach(만나기) 카드가 열린 전시물 */
  const [focusId, setFocusId] = useState<ExhibitId | null>(null);
  const approachAt = useRef(0);
  const [visited, setVisited] = useState<Set<ExhibitId>>(new Set());
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [idleLeft, setIdleLeft] = useState<number | null>(null);
  // 세션마다 새로 마운트하여 이전 방문객의 퀴즈 응답·진행 상태가 남지 않게 함
  const [sessionKey, setSessionKey] = useState(0);

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
      setVisited(new Set());
      setConfirmEnd(false);
      setIdleLeft(null);
      setLang("ko");
      setSessionKey((k) => k + 1);
      // 새 버전이 대기 중이면 방문객이 없는 지금 적용
      applyPendingUpdate();
    },
    [sessionId, lang],
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
    track(id, "session_started", lang, { metadata: { app_version: process.env.NEXT_PUBLIC_APP_VERSION } });
    setScreen("visitors");
  };

  /** 1단계 Approach: 지도 위에서 해당 전시물만 밝히고 카드 표시 */
  const showApproach = (id: ExhibitId, viaMap: boolean) => {
    if (viaMap) tr("exhibit_selected", { exhibitId: id });
    tr("stage_viewed", { exhibitId: id, stageKey: "approach" });
    approachAt.current = Date.now();
    setFocusId(id);
    setVisited((v) => new Set(v).add(id));
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
          <p className="version-tag">v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
        </main>
      )}

      {screen === "visitors" && (
        <VisitorForm
          lang={lang}
          visitors={visitors}
          setVisitors={setVisitors}
          langToggle={langToggle}
          onDone={() => setScreen("map")}
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
            lang={lang}
            visited={visited}
            focused={focusId}
            onTapObject={onTapObject}
            onTapEmpty={closeApproach}
          />
          {focusId && (
            <ApproachCard
              key={focusId}
              exhibit={EXHIBITS[focusId]}
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
          exhibit={EXHIBITS[exhibitId]}
          lang={lang}
          langToggle={langToggle}
          track={tr}
          onMap={() => setScreen("map")}
          onApproach={() => showApproach(exhibitId, false)}
          onSelect={(id) => showApproach(id, false)}
          visited={visited}
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
