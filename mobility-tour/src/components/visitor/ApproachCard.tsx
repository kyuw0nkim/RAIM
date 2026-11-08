"use client";

import { STAGE_LABEL, UI } from "@/content/ui";
import type { Exhibit, Locale } from "@/content/types";

/**
 * 1단계 Approach(만나기): 교육장 지도 위에 뜨는 작은 카드.
 * 화면 전체를 바꾸지 않고, 실제 전시물의 위치를 보여 주는 데 집중합니다.
 */
export function ApproachCard({
  exhibit,
  placement,
  lang,
  onContinue,
  onClose,
}: {
  exhibit: Exhibit;
  placement: "right" | "top" | "bottom";
  lang: Locale;
  onContinue: () => void;
  onClose: () => void;
}) {
  const t = (l: Record<Locale, string>) => l[lang];
  const stage = exhibit.stages.approach;
  return (
    <section className={`glass approach-card at-${placement}`} role="dialog" aria-label={t(exhibit.name)}>
      <button className="approach-close" onClick={onClose} aria-label={t(UI.close)}>
        ✕
      </button>
      <p className="eyebrow">
        1/5 · {t(STAGE_LABEL.approach)}
      </p>
      <h2>{t(stage.title)}</h2>
      <p className="approach-body">{t(stage.body)}</p>
      <div className="approach-actions">
        <button className="btn primary lg" onClick={onContinue}>
          {stage.cta ? t(stage.cta) : t(UI.next)} →
        </button>
      </div>
    </section>
  );
}
