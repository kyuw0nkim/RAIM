// 단일 계열 차트 (색 = 크기만 표현하는 한 가지 색). 각 막대에 값 라벨과 hover 툴팁(title) 제공.

export function HBars({
  rows,
  unit = "",
  empty = "아직 기록이 없습니다.",
}: {
  rows: { label: string; value: number; note?: string }[];
  unit?: string;
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.some((r) => r.value)) return <p className="chart-empty">{empty}</p>;
  return (
    <ul className="hbars">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${r.value.toLocaleString()}${unit}${r.note ? ` (${r.note})` : ""}`}>
          <span className="hbar-label">{r.label}</span>
          <span className="hbar-track">
            <span className="hbar-fill" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="hbar-value">
            {r.value.toLocaleString()}
            {unit}
            {r.note && <small> {r.note}</small>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** 일별 세션 수 — 세로 막대 (빈 날짜도 0으로 채움) */
export function DayBars({ data, days }: { data: { day: string; count: number }[]; days: number }) {
  const map = new Map(data.map((d) => [d.day, d.count]));
  const list: { day: string; count: number }[] = [];
  const today = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date()));
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    list.push({ day: key, count: map.get(key) ?? 0 });
  }
  const max = Math.max(1, ...list.map((d) => d.count));
  const total = list.reduce((a, d) => a + d.count, 0);
  if (!total) return <p className="chart-empty">이 기간에 이용 세션이 없습니다.</p>;
  const labelEvery = Math.ceil(list.length / 8);
  return (
    <div className="daybars" role="img" aria-label={`일별 세션 수, 기간 합계 ${total}`}>
      <div className="daybars-plot">
        {list.map((d) => (
          <div key={d.day} className="daybar" title={`${d.day}: ${d.count}세션`}>
            <span className="daybar-fill" style={{ height: `${(d.count / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="daybars-axis">
        {list.map((d, i) => (
          <span key={d.day}>{i % labelEvery === 0 ? d.day.slice(5).replace("-", "/") : ""}</span>
        ))}
      </div>
      <p className="chart-caption">최대 {max}세션/일</p>
    </div>
  );
}

/** 세션의 전시물 진행 단계 — 점 5개 (도달한 단계까지 채움) */
export function ProgressDots({ reached, labels }: { reached: number; labels: string[] }) {
  return (
    <span className={`pdots ${reached === 5 ? "complete" : ""}`} title={reached ? `${reached}/5 · ${labels[reached - 1]}까지` : "방문 안 함"}>
      {labels.map((l, i) => (
        <i key={l} className={i < reached ? "on" : ""} />
      ))}
      <b>{reached ? `${reached}/5` : "—"}</b>
    </span>
  );
}
