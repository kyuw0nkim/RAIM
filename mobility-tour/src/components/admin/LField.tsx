"use client";

import type { L } from "@/content/types";

/** 한국어/영어 한 쌍 입력 */
export function LField({
  label,
  value,
  onChange,
  multiline,
  required = true,
  hint,
}: {
  label: string;
  value: L;
  onChange: (v: L) => void;
  multiline?: boolean;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="lfield">
      <div className="lfield-head">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
      <div className="lfield-pair">
        {(["ko", "en"] as const).map((lc) => {
          const missing = required && !value[lc]?.trim();
          const props = {
            value: value[lc] ?? "",
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [lc]: e.target.value }),
            className: missing ? "missing" : "",
            lang: lc,
            "aria-label": `${label} (${lc === "ko" ? "한국어" : "English"})`,
          };
          return (
            <label key={lc} className="lfield-col">
              <span className="lang-tag">{lc === "ko" ? "KO" : "EN"}</span>
              {multiline ? <textarea rows={4} {...props} /> : <input {...props} />}
            </label>
          );
        })}
      </div>
    </div>
  );
}
