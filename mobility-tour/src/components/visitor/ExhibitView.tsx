"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EXHIBITS } from "@/content/exhibits";
import { STAGE_LABEL, UI } from "@/content/ui";
import { STAGES, type Exhibit, type ExhibitId, type Locale, type StageKey } from "@/content/types";
import type { Tracker } from "./TourApp";

export function ExhibitView({
  exhibit,
  lang,
  langToggle,
  track,
  onMap,
  onSelect,
  visited,
}: {
  exhibit: Exhibit;
  lang: Locale;
  langToggle: ReactNode;
  track: Tracker;
  onMap: () => void;
  onSelect: (id: ExhibitId) => void;
  visited: Set<ExhibitId>;
}) {
  const t = (l: Record<Locale, string>) => l[lang];
  const [idx, setIdx] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [hotspot, setHotspot] = useState<string | null>(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const goTo = (next: number, how: "completed" | "skipped" | "back" | "jump") => {
    const duration_ms = Date.now() - enteredAt.current;
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

      <div className="exhibit-body">
        {/* 왼쪽: 전시물 시각 영역 (벽화 체험 단계에서는 핫스팟 이미지) */}
        <section className="exhibit-visual glass-soft">
          {stage === "experience" && exhibit.hotspots ? (
            <div className="hotspot-canvas">
              <div className="mural-placeholder" aria-hidden>
                🏙️
              </div>
              {exhibit.hotspots.map((h) => (
                <button
                  key={h.id}
                  className={`hotspot ${hotspot === h.id ? "active" : ""}`}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  aria-label={t(h.label)}
                  onClick={() => {
                    setHotspot(h.id);
                    track("image_hotspot_selected", { ...ctx, targetId: h.id });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="exhibit-hero">
              <span className="hero-icon">{exhibit.icon}</span>
              <h2>{t(exhibit.name)}</h2>
              <p>{t(exhibit.tagline)}</p>
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

            {stage === "experience" && hs && (
              <div className="hotspot-info">
                <strong>{t(hs.label)}</strong>
                <p>{t(hs.desc)}</p>
              </div>
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
                          {visited.has(id) && "✓ "}
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
            {idx > 0 ? (
              <button className="btn ghost lg" onClick={() => goTo(idx - 1, "back")}>
                ← {t(UI.back)}
              </button>
            ) : (
              <span />
            )}
            {stage === "experience" && (
              <button className="btn text small" onClick={() => goTo(idx + 1, "skipped")}>
                {t(UI.bypass)}
              </button>
            )}
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
