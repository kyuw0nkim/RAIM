"use client";

import type { ReactNode } from "react";
import { UI, VISITOR_OPTIONS } from "@/content/ui";
import type { Locale } from "@/content/types";

export interface VisitorEntry {
  id: string;
  gender?: string;
  origin?: string;
  age?: string;
}

type Field = keyof typeof VISITOR_OPTIONS;

export function VisitorForm({
  lang,
  visitors,
  setVisitors,
  langToggle,
  onDone,
}: {
  lang: Locale;
  visitors: VisitorEntry[];
  setVisitors: (v: VisitorEntry[]) => void;
  langToggle: ReactNode;
  onDone: (visitors: VisitorEntry[]) => void;
}) {
  const t = (l: Record<Locale, string>) => l[lang];
  const list = visitors.length ? visitors : [{ id: "v0" }];

  const update = (id: string, field: Field, value: string) =>
    setVisitors(list.map((v) => (v.id === id ? { ...v, [field]: v[field] === value ? undefined : value } : v)));

  const add = () => setVisitors([...list, { id: crypto.randomUUID() }]);
  const remove = (id: string) => setVisitors(list.filter((v) => v.id !== id));

  // 방문객 정보는 선택 사항: 아무것도 고르지 않은 블록은 저장하지 않음 (임의로 채우지 않음)
  const finish = (skip: boolean) => {
    const kept = skip ? [] : list.filter((v) => v.gender || v.origin || v.age);
    setVisitors(kept);
    onDone(kept);
  };

  return (
    <main className="visitors">
      <header className="topbar">
        <div className="title-chip">
          <strong>{t(UI.visitorsTitle)}</strong>
        </div>
        <div className="topbar-right">{langToggle}</div>
      </header>

      <div className="glass visitors-panel">
        <p className="muted">{t(UI.visitorsNote)}</p>
        <div className="visitor-blocks">
          {list.map((v, i) => (
            <section key={v.id} className="visitor-block">
              <div className="visitor-head">
                <strong>
                  {t(UI.visitor)} {i + 1}
                </strong>
                {list.length > 1 && (
                  <button className="btn text" onClick={() => remove(v.id)}>
                    {t(UI.remove)}
                  </button>
                )}
              </div>
              {(Object.keys(VISITOR_OPTIONS) as Field[]).map((field) => (
                <div key={field} className="field">
                  <span className="field-label">{t(UI[field])}</span>
                  <div className="chips">
                    {VISITOR_OPTIONS[field].map((o) => (
                      <button
                        key={o.v}
                        className={`chip ${v[field] === o.v ? "selected" : ""}`}
                        aria-pressed={v[field] === o.v}
                        onClick={() => update(v.id, field, o.v)}
                      >
                        {t(o.l)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
          <button className="visitor-add" onClick={add}>
            {t(UI.addVisitor)}
          </button>
        </div>
      </div>

      <footer className="visitors-actions">
        <button className="btn ghost lg" onClick={() => finish(true)}>
          {t(UI.skip)}
        </button>
        <button className="btn primary lg" onClick={() => finish(false)}>
          {t(UI.continue)} →
        </button>
      </footer>
    </main>
  );
}
