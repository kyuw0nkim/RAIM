"use client";

import { useState } from "react";
import { purgeAction, saveSettingsAction } from "@/app/admin/actions";
import type { AppSettings } from "@/lib/server/settings";

export function SettingsForm({ initial }: { initial: AppSettings }) {
  const [s, setS] = useState(initial);
  const [msg, setMsg] = useState("");
  const dirty = JSON.stringify(s) !== JSON.stringify(initial);

  return (
    <>
      <section className="admin-card">
        <h2>이용 데이터 수집</h2>
        <label className="toggle">
          <input type="checkbox" checked={s.analyticsEnabled} onChange={(e) => setS({ ...s, analyticsEnabled: e.target.checked })} />
          <span>
            <b>이용 로그 수집</b>
            <small>전시물 선택, 단계 이동, FAQ·힌트 열람, 퀴즈 응답 등을 세션 단위로 익명 기록합니다. 끄면 태블릿에서 기록을 보내지 않습니다.</small>
          </span>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={s.askVisitorInfo} onChange={(e) => setS({ ...s, askVisitorInfo: e.target.checked })} />
          <span>
            <b>방문객 구성 정보 화면 표시</b>
            <small>투어 시작 후 성별·내외국인·연령대를 선택 입력받습니다. 끄면 이 화면을 건너뜁니다.</small>
          </span>
        </label>
        <label className="inline-field">
          보유 기간
          <input
            type="number"
            min={1}
            max={3650}
            value={s.retentionDays}
            onChange={(e) => setS({ ...s, retentionDays: Number(e.target.value) })}
          />
          일
        </label>
        <p className="muted">
          ⚠ 실제 운영 전, 수집 목적·법적 근거·보유 기간과 만 14세 미만 아동 관련 요건을 기관 개인정보 담당자와 확인하세요. 이름·연락처 등 직접
          식별정보는 수집하지 않습니다.
        </p>
        <div className="row-actions">
          <button
            className="btn-admin"
            disabled={!dirty}
            onClick={async () => {
              const saved = await saveSettingsAction(s);
              setS(saved);
              setMsg("설정을 저장했습니다. 태블릿은 다음 투어부터 적용됩니다.");
            }}
          >
            설정 저장
          </button>
          {msg && <span className="draft-msg saved">{msg}</span>}
        </div>
      </section>

      <section className="admin-card">
        <h2>데이터 내보내기</h2>
        <p className="muted">비식별 데이터만 내보냅니다. 엑셀에서 바로 열 수 있는 CSV입니다.</p>
        <div className="row-actions">
          <a className="btn-admin ghost" href="/admin/export?kind=sessions&days=all">
            세션 (진행 단계 포함)
          </a>
          <a className="btn-admin ghost" href="/admin/export?kind=events&days=all">
            이벤트 전체
          </a>
          <a className="btn-admin ghost" href="/admin/export?kind=visitors&days=all">
            방문객 구성
          </a>
        </div>
      </section>

      <section className="admin-card">
        <h2>오래된 기록 정리</h2>
        <p>
          보유 기간({initial.retentionDays}일)이 지난 세션과 이벤트를 삭제합니다. 되돌릴 수 없으니 필요하면 먼저 내보내기 하세요.
        </p>
        <button
          className="btn-admin danger"
          onClick={async () => {
            if (!confirm(`${initial.retentionDays}일보다 오래된 이용 기록을 삭제할까요? 되돌릴 수 없습니다.`)) return;
            const n = await purgeAction(initial.retentionDays);
            setMsg(`${n}개 세션의 기록을 삭제했습니다.`);
          }}
        >
          보유 기간 지난 기록 삭제
        </button>
      </section>
    </>
  );
}
