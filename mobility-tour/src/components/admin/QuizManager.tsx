"use client";

import { useState } from "react";
import { EXHIBIT_IDS, type ContentDoc, type ExhibitId, type QuizQuestion } from "@/content/types";
import type { RevisionMeta } from "@/lib/server/content";
import { DraftBar, useDraft } from "./useDraft";
import { LField } from "./LField";

const KEYS = "abcde";
const OX: QuizQuestion["options"] = [
  { key: "o", text: { ko: "맞아요", en: "True" } },
  { key: "x", text: { ko: "아니에요", en: "False" } },
];

export function QuizManager({ initial, draft }: { initial: ContentDoc; draft: RevisionMeta | null }) {
  const { content, update, dirty, status, save, publish } = useDraft(initial);
  const quizExhibits = EXHIBIT_IDS.filter((id) => content.exhibits[id].quiz);
  const [ex, setEx] = useState<ExhibitId>(quizExhibits[0] ?? "quiz");
  const list = content.exhibits[ex].quiz ?? [];
  const q = (i: number) => (d: ContentDoc) => d.exhibits[ex].quiz![i];

  const move = (i: number, dir: -1 | 1) =>
    update((d) => {
      const l = d.exhibits[ex].quiz!;
      const j = i + dir;
      if (j >= 0 && j < l.length) [l[i], l[j]] = [l[j], l[i]];
    });

  return (
    <div className="editor">
      <DraftBar draft={draft} content={content} dirty={dirty} status={status} onSave={save} onPublish={publish} />
      {quizExhibits.length > 1 && (
        <nav className="tabs">
          {quizExhibits.map((id) => (
            <button key={id} className={id === ex ? "active" : ""} onClick={() => setEx(id)}>
              {content.exhibits[id].name.ko}
            </button>
          ))}
        </nav>
      )}
      <p className="field-help">
        ‘{content.exhibits[ex].name.ko}’의 ‘체험하기’ 단계에 순서대로 표시됩니다. 정답은 언어와 관계없이 선택지 기호(A, B, C…)로 저장됩니다.
        실제 퀴즈 화면의 문항과 맞춰 주세요.
      </p>

      {list.map((item, i) => (
        <fieldset key={item.id} className={`field-group ${item.disabled ? "disabled" : ""}`}>
          <legend>
            문제 {i + 1} {item.disabled && <span className="pill">숨김</span>}
          </legend>
          <div className="item-tools">
            <label className="inline">
              유형
              <select
                value={item.type ?? "choice"}
                onChange={(e) =>
                  update((d) => {
                    const t = e.target.value as "choice" | "ox";
                    q(i)(d).type = t;
                    if (t === "ox") {
                      q(i)(d).options = structuredClone(OX);
                      q(i)(d).answer = "o";
                    } else {
                      q(i)(d).options = [
                        { key: "a", text: { ko: "", en: "" } },
                        { key: "b", text: { ko: "", en: "" } },
                        { key: "c", text: { ko: "", en: "" } },
                      ];
                      q(i)(d).answer = "a";
                    }
                  })
                }
              >
                <option value="choice">객관식</option>
                <option value="ox">O/X</option>
              </select>
            </label>
            <button className="btn-admin ghost small" onClick={() => move(i, -1)} disabled={i === 0} aria-label="위로">
              ↑
            </button>
            <button className="btn-admin ghost small" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="아래로">
              ↓
            </button>
            <button className="btn-admin ghost small" onClick={() => update((d) => void (q(i)(d).disabled = !item.disabled))}>
              {item.disabled ? "다시 표시" : "숨기기"}
            </button>
            <button className="link-danger" onClick={() => confirm("이 문제를 삭제할까요?") && update((d) => void d.exhibits[ex].quiz!.splice(i, 1))}>
              삭제
            </button>
          </div>

          <LField label="문제" value={item.question} onChange={(v) => update((d) => void (q(i)(d).question = v))} required={!item.disabled} />

          <div className="options">
            <span className="options-head">선택지 · 정답에 체크</span>
            {item.options.map((o, oi) => (
              <div key={o.key} className={`option-row ${item.answer === o.key ? "correct" : ""}`}>
                <label className="answer-radio" title="정답으로 지정">
                  <input type="radio" name={`ans-${item.id}`} checked={item.answer === o.key} onChange={() => update((d) => void (q(i)(d).answer = o.key))} />
                  <b>{o.key.toUpperCase()}</b>
                </label>
                <LField
                  label={`선택지 ${o.key.toUpperCase()}${item.answer === o.key ? " (정답)" : ""}`}
                  value={o.text}
                  onChange={(v) => update((d) => void (q(i)(d).options[oi].text = v))}
                  required={!item.disabled}
                />
                {item.type !== "ox" && item.options.length > 2 && (
                  <button
                    className="link-danger"
                    onClick={() =>
                      update((d) => {
                        const qq = q(i)(d);
                        qq.options.splice(oi, 1);
                        // 기호를 a, b, c… 순서로 다시 붙이고 정답 유지
                        const ansIndex = qq.options.findIndex((x) => x.key === qq.answer);
                        qq.options.forEach((x, k) => (x.key = KEYS[k]));
                        qq.answer = KEYS[Math.max(0, ansIndex)];
                      })
                    }
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
            {item.type !== "ox" && item.options.length < KEYS.length && (
              <button
                className="btn-admin ghost small"
                onClick={() => update((d) => void q(i)(d).options.push({ key: KEYS[item.options.length], text: { ko: "", en: "" } }))}
              >
                + 선택지 추가
              </button>
            )}
          </div>

          <LField label="해설" multiline value={item.explanation} onChange={(v) => update((d) => void (q(i)(d).explanation = v))} required={!item.disabled} />
        </fieldset>
      ))}

      <button
        className="btn-admin"
        onClick={() =>
          update((d) => {
            d.exhibits[ex].quiz ??= [];
            d.exhibits[ex].quiz!.push({
              id: `${ex}-q-${Date.now().toString(36)}`,
              type: "choice",
              question: { ko: "", en: "" },
              options: [
                { key: "a", text: { ko: "", en: "" } },
                { key: "b", text: { ko: "", en: "" } },
                { key: "c", text: { ko: "", en: "" } },
              ],
              answer: "a",
              explanation: { ko: "", en: "" },
            });
          })
        }
      >
        + 문제 추가
      </button>
    </div>
  );
}
