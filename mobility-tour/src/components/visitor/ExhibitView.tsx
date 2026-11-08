"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EXHIBITS } from "@/content/exhibits";
import { EXHIBIT_IMAGE } from "@/content/map";
import { STAGE_LABEL, UI } from "@/content/ui";
import { STAGES, type Exhibit, type ExhibitId, type Locale, type StageKey } from "@/content/types";
import type { Tracker } from "./TourApp";

export function ExhibitView({
  exhibit,
  lang,
  langToggle,
  track,
  onMap,
  onApproach,
  onSelect,
  completed,
  onComplete,
}: {
  exhibit: Exhibit;
  lang: Locale;
  langToggle: ReactNode;
  track: Tracker;
  onMap: () => void;
  /** 1단계(만나기)는 지도 위 카드에서 진행 → 상세 화면은 2단계부터 */
  onApproach: () => void;
  onSelect: (id: ExhibitId) => void;
  completed: Set<ExhibitId>;
  /** 5단계(마무리)에 도달하면 완료 처리 */
  onComplete: () => void;
}) {
  const t = (l: Record<Locale, string>) => l[lang];
  const [idx, setIdx] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  const [hintOpen, setHintOpen] = useState(false);
  const [hotspot, setHotspot] = useState<string | null>(null);
  const [seenHotspots, setSeenHotspots] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  const stage: StageKey = STAGES[idx];
  const content = exhibit.stages[stage];
  const ctx = { exhibitId: exhibit.id, stageKey: stage };

  // 단계 진입 기록 (언어 전환으로는 재기록하지 않음)
  const enteredAt = useRef(Date.now());
  useEffect(() => {
    enteredAt.current = Date.now();
    track("stage_viewed", { exhibitId: exhibit.id, stageKey: stage });
    setHintOpen(false);
    if (STAGES[idx] === "disengage") onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const goTo = (next: number, how: "completed" | "skipped" | "back" | "jump") => {
    const duration_ms = Date.now() - enteredAt.current;
    if (next === 0) {
      leave(onApproach);
      return;
    }
    if (how === "completed") {
      track("cta_clicked", { ...ctx, targetId: `${stage}-cta` });
      track("stage_completed", { ...ctx, metadata: { duration_ms } });
    } else if (how === "skipped") {
      track("stage_skipped", { ...ctx, metadata: { duration_ms } });
    }
    setIdx(next);
    setMaxReached((m) => Math.max(m, next));
  };

  const leave = (fn: () => void) => {
    track("stage_completed", { ...ctx, metadata: { duration_ms: Date.now() - enteredAt.current, exit: true } });
    fn();
  };

  const hs = exhibit.hotspots?.find((h) => h.id === hotspot);
  const clearHotspot = () => setHotspot(null);
  const img = EXHIBIT_IMAGE[exhibit.id];
  const muralMode = stage === "experience" && !!exhibit.hotspots;

  return (
    <main className="exhibit">
      <header className="topbar">
        <button className="btn ghost" onClick={() => leave(onMap)}>
          ← {t(UI.map)}
        </button>
        <nav className="progress" aria-label={t(UI.stageLabel)}>
          {STAGES.map((s, i) => (
            <button
              key={s}
              className={`step ${i === idx ? "current" : i <= maxReached ? "done" : ""}`}
              disabled={i > maxReached}
              onClick={() => i !== idx && goTo(i, "jump")}
              aria-current={i === idx ? "step" : undefined}
            >
              <span className="dot">{i < idx || (i <= maxReached && i !== idx) ? "✓" : i + 1}</span>
              <span className="step-label">{t(STAGE_LABEL[s])}</span>
            </button>
          ))}
        </nav>
        <div className="topbar-right">{langToggle}</div>
      </header>

      <div className={`exhibit-body ${muralMode ? "mural-mode" : ""}`}>
        {/* 왼쪽: 딤 처리된 교육장 위에 전시물 이미지만 띄움 (박스 없음) — 벽화 체험 단계에서는 핫스팟 */}
        <section className={`exhibit-visual visual-${exhibit.id}`}>
          {muralMode && exhibit.hotspots ? (
            <div className="mural-wrap">
              <div
                className="hotspot-canvas"
                // 비율을 고정해 핫스팟 좌표가 어긋나지 않게
                style={{ aspectRatio: `${img.width} / ${img.height}` }}
                // 원 바깥(벽화 빈 곳)을 누르면 선택 해제 → 전체 벽화로 복귀
                onClick={clearHotspot}
              >
                <img src={img.src} alt={t(exhibit.name)} draggable={false} />
                {/* 선택한 지점(들)만 또렷하게, 나머지 벽화는 밝은 안개로 흐리게 */}
                <div className={`hotspot-fog ${hs ? "on" : ""}`} style={hs ? fogMask(hs.points) : undefined} aria-hidden />
                {exhibit.hotspots.flatMap((h) =>
                  h.points.map((pt, i) => (
                    <button
                      key={`${h.id}-${i}`}
                      className={`hotspot ${h.kind === "video" ? "video" : ""} ${hotspot === h.id ? "active" : ""} ${
                        seenHotspots.has(h.id) ? "seen" : ""
                      }`}
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      aria-label={t(h.label)}
                      aria-pressed={hotspot === h.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        // 같은 원을 다시 누르면 선택 해제
                        if (hotspot === h.id) return clearHotspot();
                        setHotspot(h.id);
                        setSeenHotspots((s) => new Set(s).add(h.id));
                        track("image_hotspot_selected", { ...ctx, targetId: h.id });
                      }}
                    />
                  )),
                )}
              </div>
              {exhibit.credit && <p className="credit">{t(exhibit.credit)}</p>}
            </div>
          ) : (
            <div className="exhibit-hero">
              <img
                className={`hero-img hero-${exhibit.id}`}
                src={img.src}
                alt=""
                draggable={false}
                style={{ aspectRatio: `${img.width} / ${img.height}` }}
              />
              <p className="hero-name">{t(exhibit.name)}</p>
              {exhibit.credit && <p className="credit">{t(exhibit.credit)}</p>}
            </div>
          )}
        </section>

        {/* 오른쪽: 단계 콘텐츠 */}
        <section className="glass stage-panel" aria-live="polite">
          <div className="stage-scroll">
            <p className="eyebrow">
              {idx + 1}/5 · {t(STAGE_LABEL[stage])}
            </p>
            <h1>{t(content.title)}</h1>
            <p className="body">{t(content.body)}</p>

            {content.question && <p className="question">{t(content.question)}</p>}

            {content.hint && (
              <div className="hint">
                {hintOpen ? (
                  <p>💡 {t(content.hint)}</p>
                ) : (
                  <button
                    className="btn text"
                    onClick={() => {
                      setHintOpen(true);
                      track("hint_opened", { ...ctx, targetId: `${stage}-hint` });
                    }}
                  >
                    💡 {t(UI.hint)}
                  </button>
                )}
              </div>
            )}

            {stage === "experience" && exhibit.quiz && (
              <Quiz exhibit={exhibit} lang={lang} answers={quizAnswers} setAnswers={setQuizAnswers} track={track} />
            )}

            {muralMode && exhibit.hotspots && (
              <>
                <p className="hotspot-progress">
                  🔎 {seenHotspots.size} / {exhibit.hotspots.length}
                </p>
                {/* 선택한 지점의 설명은 그림을 가리지 않도록 오른쪽 패널에 표시 */}
                {hs ? (
                  <div className={`hotspot-info ${hs.kind === "video" ? "video" : ""}`} key={hs.id} role="status">
                    <div className="hotspot-info-head">
                      <strong>{t(hs.label)}</strong>
                      <button className="btn ghost small" onClick={clearHotspot}>
                        ↺ {t(UI.showWhole)}
                      </button>
                    </div>
                    {/* 태블릿이 아니라 실제 벽을 먼저 보도록: 찾을 것 → 설명 순서 */}
                    <p className="hotspot-find">
                      <span>👀 {t(UI.findOnWall)}</span>
                      {t(hs.find)}
                    </p>
                    <p>{t(hs.desc)}</p>
                  </div>
                ) : (
                  <p className="hotspot-empty">👈 {t(UI.tapRing)}</p>
                )}
              </>
            )}


            {stage === "reflect" && exhibit.quiz && (
              <p className="score">
                {t(UI.quizScore)}:{" "}
                <strong>
                  {exhibit.quiz.filter((q) => quizAnswers[q.id] === q.answer).length} / {exhibit.quiz.length}
                </strong>
              </p>
            )}

            {stage === "reflect" && exhibit.faqs.length > 0 && (
              <div className="faqs">
                <h3>{t(UI.faq)}</h3>
                <div className="faq-group">
                  {exhibit.faqs.map((f) => (
                    <details
                      key={f.id}
                      onToggle={(e) => {
                        if ((e.currentTarget as HTMLDetailsElement).open) track("faq_opened", { ...ctx, targetId: f.id });
                      }}
                    >
                      <summary>{t(f.q)}</summary>
                      <p>{t(f.a)}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {stage === "disengage" && (
              <div className="next-exhibits">
                <h3>{t(UI.nextExhibits)}</h3>
                <div className="next-grid">
                  {exhibit.next.map((id) => (
                    <button key={id} className="next-card" onClick={() => leave(() => onSelect(id))}>
                      <span className="next-icon">{EXHIBITS[id].icon}</span>
                      <span>
                        <strong>
                          {completed.has(id) && "✓ "}
                          {t(EXHIBITS[id].name)}
                        </strong>
                        <small>{t(EXHIBITS[id].tagline)}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="stage-actions">
            <button className="btn ghost lg" onClick={() => goTo(idx - 1, "back")}>
              ← {t(UI.back)}
            </button>
            {stage === "disengage" ? (
              <button className="btn primary lg" onClick={() => leave(onMap)}>
                {t(UI.map)}
              </button>
            ) : (
              <button className="btn primary lg" onClick={() => goTo(idx + 1, "completed")}>
                {content.cta ? t(content.cta) : "→"} →
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * 선택한 지점마다 구멍을 낸 안개 마스크.
 * 각 지점의 원형 마스크(안 = 투명, 밖 = 불투명)를 intersect로 합쳐
 * 모든 지점이 동시에 뚫리도록 함.
 */
function fogMask(points: { x: number; y: number }[]): React.CSSProperties {
  const layers = points.map((p) => `radial-gradient(circle 80px at ${p.x}% ${p.y}%, transparent 55%, #000 100%)`);
  const mask = layers.join(", ");
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskComposite: points.map(() => "intersect").join(", "),
    // WebKit: 위 레이어를 아래 레이어 안에서만 남김 = 교집합
    WebkitMaskComposite: points.map(() => "source-in").join(", "),
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };
}

function Quiz({
  exhibit,
  lang,
  answers,
  setAnswers,
  track,
}: {
  exhibit: Exhibit;
  lang: Locale;
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  track: Tracker;
}) {
  const t = (l: Record<Locale, string>) => l[lang];
  const questions = exhibit.quiz ?? [];
  const firstOpen = questions.findIndex((q) => !answers[q.id]);
  const [qi, setQi] = useState(firstOpen === -1 ? questions.length - 1 : firstOpen);
  const [choice, setChoice] = useState<string | null>(null);
  const q = questions[qi];
  if (!q) return null;
  const submitted = answers[q.id];
  const ctx = { exhibitId: exhibit.id, stageKey: "experience" as const };

  return (
    <div className="quiz">
      <p className="quiz-count">
        Q{qi + 1} / {questions.length}
      </p>
      <p className="quiz-q">{t(q.question)}</p>
      <div className="quiz-options">
        {q.options.map((o) => {
          const state = submitted
            ? o.key === q.answer
              ? "correct"
              : o.key === submitted
                ? "wrong"
                : ""
            : choice === o.key
              ? "selected"
              : "";
          return (
            <button
              key={o.key}
              className={`quiz-option ${state}`}
              disabled={!!submitted}
              onClick={() => {
                setChoice(o.key);
                track("quiz_answer_selected", { ...ctx, targetId: q.id, metadata: { option: o.key } });
              }}
            >
              <span className="opt-key">{o.key.toUpperCase()}</span> {t(o.text)}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button
          className="btn secondary"
          disabled={!choice}
          onClick={() => {
            if (!choice) return;
            setAnswers({ ...answers, [q.id]: choice });
            track("quiz_submitted", { ...ctx, targetId: q.id, metadata: { option: choice, correct: choice === q.answer } });
          }}
        >
          {t(UI.submit)}
        </button>
      ) : (
        <div className={`quiz-feedback ${submitted === q.answer ? "ok" : "no"}`}>
          <strong>{submitted === q.answer ? `⭕ ${t(UI.correct)}` : `❌ ${t(UI.wrong)}`}</strong>
          <p>{t(q.explanation)}</p>
          {qi < questions.length - 1 && (
            <button
              className="btn secondary"
              onClick={() => {
                setQi(qi + 1);
                setChoice(null);
              }}
            >
              {t(UI.nextQuestion)} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
