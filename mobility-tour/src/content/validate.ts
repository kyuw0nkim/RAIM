import { STAGES, EXHIBIT_IDS, type ContentDoc, type L } from "./types";

/** 발행 전 한국어·영어 필수 문구 누락 확인 */
export function validateContent(c: ContentDoc): string[] {
  const errors: string[] = [];
  const need = (l: L | undefined, where: string) => {
    if (!l) return;
    if (!l.ko?.trim()) errors.push(`${where} — 한국어 누락`);
    if (!l.en?.trim()) errors.push(`${where} — 영어 누락`);
  };
  for (const id of EXHIBIT_IDS) {
    const ex = c.exhibits[id];
    if (!ex) {
      errors.push(`전시물 ${id} 없음`);
      continue;
    }
    const n = ex.name.ko || id;
    need(ex.name, `[${n}] 이름`);
    for (const s of STAGES) {
      const st = ex.stages[s];
      need(st.title, `[${n}] ${s} 제목`);
      // 퀴즈 풀기처럼 본문이 비어 있어도 되는 단계: 양쪽 다 비었으면 허용
      if (st.body.ko.trim() || st.body.en.trim()) need(st.body, `[${n}] ${s} 본문`);
      need(st.question, `[${n}] ${s} 질문`);
      need(st.hint, `[${n}] ${s} 힌트`);
      need(st.cta, `[${n}] ${s} 버튼 문구`);
    }
    ex.faqs.filter((f) => !f.disabled).forEach((f, i) => {
      need(f.q, `[${n}] FAQ ${i + 1} 질문`);
      need(f.a, `[${n}] FAQ ${i + 1} 답변`);
    });
    (ex.quiz ?? []).filter((q) => !q.disabled).forEach((q, i) => {
      need(q.question, `[${n}] 퀴즈 ${i + 1} 문제`);
      need(q.explanation, `[${n}] 퀴즈 ${i + 1} 해설`);
      q.options.forEach((o) => need(o.text, `[${n}] 퀴즈 ${i + 1} 선택지 ${o.key.toUpperCase()}`));
      if (!q.options.some((o) => o.key === q.answer)) errors.push(`[${n}] 퀴즈 ${i + 1} — 정답이 선택지에 없음`);
    });
    (ex.hotspots ?? []).forEach((h) => {
      need(h.label, `[${n}] 벽화 지점 '${h.label.ko}' 이름`);
      need(h.find, `[${n}] 벽화 지점 '${h.label.ko}' 찾을 것`);
      need(h.desc, `[${n}] 벽화 지점 '${h.label.ko}' 설명`);
    });
  }
  return errors;
}
