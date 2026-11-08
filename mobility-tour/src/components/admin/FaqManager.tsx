"use client";

import { useState } from "react";
import { EXHIBIT_IDS, type ContentDoc, type ExhibitId } from "@/content/types";
import type { RevisionMeta } from "@/lib/server/content";
import { DraftBar, useDraft } from "./useDraft";
import { LField } from "./LField";

export function FaqManager({ initial, draft, startExhibit }: { initial: ContentDoc; draft: RevisionMeta | null; startExhibit: ExhibitId }) {
  const { content, update, dirty, status, save, publish } = useDraft(initial);
  const [ex, setEx] = useState<ExhibitId>(startExhibit);
  const faqs = content.exhibits[ex].faqs;

  const move = (i: number, dir: -1 | 1) =>
    update((d) => {
      const list = d.exhibits[ex].faqs;
      const j = i + dir;
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
    });

  return (
    <div className="editor">
      <DraftBar draft={draft} content={content} dirty={dirty} status={status} onSave={save} onPublish={publish} />
      <nav className="tabs">
        {EXHIBIT_IDS.map((id) => (
          <button key={id} className={id === ex ? "active" : ""} onClick={() => setEx(id)}>
            {content.exhibits[id].name.ko} <small>{content.exhibits[id].faqs.length}</small>
          </button>
        ))}
      </nav>
      <p className="field-help">FAQ는 ‘이해하기’ 단계에서 펼치기/접기로 표시됩니다. 위에 있을수록 먼저 보입니다.</p>

      {faqs.map((f, i) => (
        <fieldset key={f.id} className={`field-group ${f.disabled ? "disabled" : ""}`}>
          <legend>
            FAQ {i + 1} {f.disabled && <span className="pill">숨김</span>}
          </legend>
          <div className="item-tools">
            <button className="btn-admin ghost small" onClick={() => move(i, -1)} disabled={i === 0} aria-label="위로">
              ↑
            </button>
            <button className="btn-admin ghost small" onClick={() => move(i, 1)} disabled={i === faqs.length - 1} aria-label="아래로">
              ↓
            </button>
            <button className="btn-admin ghost small" onClick={() => update((d) => void (d.exhibits[ex].faqs[i].disabled = !f.disabled))}>
              {f.disabled ? "다시 표시" : "숨기기"}
            </button>
            <button
              className="link-danger"
              onClick={() => confirm("이 FAQ를 삭제할까요? (발행 전까지는 방문객 앱에 반영되지 않습니다)") && update((d) => void d.exhibits[ex].faqs.splice(i, 1))}
            >
              삭제
            </button>
          </div>
          <LField label="질문" value={f.q} onChange={(v) => update((d) => void (d.exhibits[ex].faqs[i].q = v))} required={!f.disabled} />
          <LField label="답변" multiline value={f.a} onChange={(v) => update((d) => void (d.exhibits[ex].faqs[i].a = v))} required={!f.disabled} />
        </fieldset>
      ))}
      <button
        className="btn-admin"
        onClick={() =>
          update((d) => void d.exhibits[ex].faqs.push({ id: `${ex}-faq-${Date.now().toString(36)}`, q: { ko: "", en: "" }, a: { ko: "", en: "" } }))
        }
      >
        + FAQ 추가
      </button>
    </div>
  );
}
