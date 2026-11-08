"use client";

import { useState } from "react";
import { STAGE_LABEL, UI } from "@/content/ui";
import { EXHIBIT_IDS, STAGES, type ContentDoc, type ExhibitId, type L, type Locale, type StageKey } from "@/content/types";
import type { RevisionMeta } from "@/lib/server/content";
import { discardDraftAction, restoreAction } from "@/app/admin/actions";
import { DraftBar, useDraft } from "./useDraft";
import { LField } from "./LField";
import { fmtDateTime } from "@/lib/format";

type Section = "info" | StageKey | "hotspots";
const EMPTY: L = { ko: "", en: "" };

export function ContentEditor({
  initial,
  draft,
  revisions,
  startExhibit,
}: {
  initial: ContentDoc;
  draft: RevisionMeta | null;
  revisions: RevisionMeta[];
  startExhibit: ExhibitId;
}) {
  const { content, update, dirty, status, save, publish } = useDraft(initial);
  const [ex, setEx] = useState<ExhibitId>(startExhibit);
  const [section, setSection] = useState<Section>("engage");
  const [previewLang, setPreviewLang] = useState<Locale>("en");
  const exhibit = content.exhibits[ex];

  const sections: { key: Section; label: string }[] = [
    { key: "info", label: "기본 정보" },
    ...STAGES.map((s, i) => ({ key: s as Section, label: `${i + 1}. ${STAGE_LABEL[s].ko}` })),
    ...(exhibit.hotspots ? [{ key: "hotspots" as Section, label: "벽화 지점" }] : []),
  ];

  /** 선택 입력 항목(질문·힌트·버튼): 없으면 추가 버튼, 있으면 입력 + 삭제 */
  const optional = (stage: StageKey, field: "question" | "hint" | "cta", label: string, multiline = false) => {
    const v = exhibit.stages[stage][field];
    if (!v)
      return (
        <button className="btn-admin ghost small" onClick={() => update((d) => void (d.exhibits[ex].stages[stage][field] = { ...EMPTY }))}>
          + {label} 추가
        </button>
      );
    return (
      <div className="optional-field">
        <LField label={label} value={v} multiline={multiline} onChange={(nv) => update((d) => void (d.exhibits[ex].stages[stage][field] = nv))} />
        <button className="link-danger" onClick={() => update((d) => void delete d.exhibits[ex].stages[stage][field])}>
          {label} 삭제
        </button>
      </div>
    );
  };

  return (
    <div className="editor">
      <DraftBar draft={draft} content={content} dirty={dirty} status={status} onSave={save} onPublish={publish} />

      <div className="editor-grid">
        {/* 왼쪽: 전시물·단계 선택 */}
        <nav className="editor-nav">
          {EXHIBIT_IDS.map((id) => (
            <div key={id} className={`nav-group ${id === ex ? "open" : ""}`}>
              <button className="nav-exhibit" onClick={() => setEx(id)}>
                {content.exhibits[id].name.ko}
              </button>
              {id === ex &&
                sections.map((s) => (
                  <button key={s.key} className={`nav-section ${s.key === section ? "active" : ""}`} onClick={() => setSection(s.key)}>
                    {s.label}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        {/* 가운데: 한국어/영어 입력 */}
        <section className="editor-fields">
          {section === "info" && (
            <>
              <h2>기본 정보</h2>
              <LField label="전시물 이름" value={exhibit.name} onChange={(v) => update((d) => void (d.exhibits[ex].name = v))} />
              <LField label="한 줄 소개" value={exhibit.tagline} onChange={(v) => update((d) => void (d.exhibits[ex].tagline = v))} hint="다음 전시물 추천 카드에 표시" />
              {exhibit.credit ? (
                <LField label="작품·작가 표기" value={exhibit.credit} onChange={(v) => update((d) => void (d.exhibits[ex].credit = v))} />
              ) : (
                <button className="btn-admin ghost small" onClick={() => update((d) => void (d.exhibits[ex].credit = { ...EMPTY }))}>
                  + 작품·작가 표기 추가
                </button>
              )}
            </>
          )}

          {STAGES.includes(section as StageKey) &&
            (() => {
              const stage = section as StageKey;
              const st = exhibit.stages[stage];
              return (
                <>
                  <h2>
                    {STAGES.indexOf(stage) + 1}. {STAGE_LABEL[stage].ko} <small>({STAGE_LABEL[stage].en})</small>
                  </h2>
                  <p className="field-help">{STAGE_HELP[stage]}</p>
                  <LField label="제목" value={st.title} onChange={(v) => update((d) => void (d.exhibits[ex].stages[stage].title = v))} />
                  <LField
                    label="본문"
                    multiline
                    required={false}
                    value={st.body}
                    onChange={(v) => update((d) => void (d.exhibits[ex].stages[stage].body = v))}
                    hint="비워 두면 표시하지 않음"
                  />
                  {stage !== "approach" && stage !== "disengage" && optional(stage, "question", "관찰 질문")}
                  {stage !== "approach" && stage !== "disengage" && optional(stage, "hint", "힌트", true)}
                  {stage !== "disengage" && optional(stage, "cta", "다음 단계 버튼 문구")}
                  {stage === "experience" && exhibit.quiz && <p className="field-help">퀴즈 문항은 ‘퀴즈 관리’에서 편집합니다.</p>}
                  {stage === "reflect" && <p className="field-help">이 단계에 표시되는 FAQ는 ‘FAQ 관리’에서 편집합니다.</p>}
                </>
              );
            })()}

          {section === "hotspots" && exhibit.hotspots && (
            <>
              <h2>벽화 지점</h2>
              <p className="field-help">원 위치는 앱에 고정되어 있고, 문구만 편집합니다. ‘벽에서 찾아보기’는 설명보다 먼저 표시됩니다.</p>
              {exhibit.hotspots.map((h, i) => (
                <fieldset key={h.id} className="field-group">
                  <legend>
                    {h.label.ko || h.id}
                    {h.kind === "video" && <span className="pill warn">영상 화면 · 노란 원</span>}
                  </legend>
                  <LField label="이름" value={h.label} onChange={(v) => update((d) => void (d.exhibits[ex].hotspots![i].label = v))} />
                  <LField label="벽에서 찾아보기" multiline value={h.find} onChange={(v) => update((d) => void (d.exhibits[ex].hotspots![i].find = v))} />
                  <LField label="설명" multiline value={h.desc} onChange={(v) => update((d) => void (d.exhibits[ex].hotspots![i].desc = v))} />
                </fieldset>
              ))}
            </>
          )}
        </section>

        {/* 오른쪽: 태블릿 화면 미리보기 */}
        <aside className="editor-preview">
          <div className="preview-head">
            <span>미리보기</span>
            <div className="seg">
              {(["ko", "en"] as const).map((l) => (
                <button key={l} className={l === previewLang ? "active" : ""} onClick={() => setPreviewLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <Preview content={content} ex={ex} section={section} lang={previewLang} />
        </aside>
      </div>

      <section className="admin-card revisions">
        <h2>버전 이력</h2>
        <p className="muted">발행된 버전은 수정되지 않습니다. 이전 버전을 초안으로 불러온 뒤 다시 발행하면 복원됩니다.</p>
        <table className="data-table compact">
          <thead>
            <tr>
              <th>버전</th>
              <th>상태</th>
              <th>발행/수정</th>
              <th>메모</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {revisions.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  아직 저장된 버전이 없습니다. 현재 방문객 앱은 앱에 내장된 기본 콘텐츠를 사용합니다.
                </td>
              </tr>
            )}
            {revisions.map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>
                  <span className={`pill ${r.status === "published" ? "ok" : r.status === "draft" ? "warn" : ""}`}>
                    {{ draft: "초안", published: "발행 중", archived: "이전 발행본" }[r.status]}
                  </span>
                </td>
                <td>{fmtDateTime(r.published_at ?? r.updated_at)}</td>
                <td>{r.note ?? ""}</td>
                <td className="actions">
                  {r.status === "draft" ? (
                    <button
                      className="link-danger"
                      onClick={async () => {
                        if (confirm("초안을 삭제하고 현재 발행본으로 되돌릴까요?")) {
                          await discardDraftAction();
                          window.location.reload();
                        }
                      }}
                    >
                      초안 삭제
                    </button>
                  ) : (
                    <button
                      className="btn-admin ghost small"
                      onClick={async () => {
                        if (confirm(`버전 #${r.id}을 초안으로 불러올까요? 현재 초안은 덮어씁니다.`)) {
                          await restoreAction(r.id);
                          window.location.reload();
                        }
                      }}
                    >
                      초안으로 불러오기
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const STAGE_HELP: Record<StageKey, string> = {
  approach: "교육장 지도 위 카드에 표시됩니다. 실제 전시물 앞으로 가도록 안내하세요.",
  engage: "정답이나 원리를 먼저 알려 주지 않고, 실물에서 무엇을 볼지 집중시키는 단계입니다.",
  experience: "실제 전시물을 관찰·체험하도록 안내합니다.",
  reflect: "관찰한 것을 개념과 연결합니다. 방문객이 실제로 찾은 것을 다시 언급하면 좋습니다.",
  disengage: "마무리하고 다음 전시물로 걸어가도록 안내합니다.",
};

/** 방문객 화면의 오른쪽 패널을 단순화한 미리보기 */
function Preview({ content, ex, section, lang }: { content: ContentDoc; ex: ExhibitId; section: Section; lang: Locale }) {
  const exhibit = content.exhibits[ex];
  const t = (l?: L) => l?.[lang] ?? "";
  if (section === "info")
    return (
      <div className="preview-panel">
        <p className="pv-eyebrow">{t(STAGE_LABEL.approach)}</p>
        <h3>{t(exhibit.name)}</h3>
        {exhibit.credit && <p className="pv-credit">{t(exhibit.credit)}</p>}
        <p>{t(exhibit.tagline)}</p>
      </div>
    );
  if (section === "hotspots")
    return (
      <div className="preview-panel">
        {exhibit.hotspots?.slice(0, 3).map((h) => (
          <div key={h.id} className="pv-hotspot">
            <strong>{t(h.label)}</strong>
            <p className="pv-find">👀 {t(h.find)}</p>
            <p>{t(h.desc)}</p>
          </div>
        ))}
      </div>
    );
  const stage = section as StageKey;
  const st = exhibit.stages[stage];
  const i = STAGES.indexOf(stage);
  return (
    <div className={`preview-panel ${stage === "approach" ? "card" : ""}`}>
      <p className="pv-eyebrow">
        {i + 1}/5 · {t(STAGE_LABEL[stage])}
      </p>
      <h3>{t(st.title)}</h3>
      {(stage === "engage" || (stage === "experience" && !exhibit.quiz)) && <p className="pv-look">{t(UI.lookReal)}</p>}
      {t(st.body) && <p>{t(st.body)}</p>}
      {st.question && <p className="pv-question">{t(st.question)}</p>}
      {st.hint && <p className="pv-hint">💡 {t(st.hint)}</p>}
      <div className="pv-actions">
        {stage !== "approach" && <span className="pv-btn ghost">← {t(UI.back)}</span>}
        <span className="pv-btn">{stage === "disengage" ? t(UI.map) : `${t(st.cta) || "→"} →`}</span>
      </div>
    </div>
  );
}
