"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { publishAction, saveDraftAction } from "@/app/admin/actions";
import { validateContent } from "@/content/validate";
import type { ContentDoc } from "@/content/types";
import type { RevisionMeta } from "@/lib/server/content";

type Status = { kind: "idle" | "saving" | "saved" | "published" | "error"; msg?: string };

/** 초안 편집 상태: 로컬에서 고치고 → 초안 저장 → 발행 */
export function useDraft(initial: ContentDoc) {
  const [content, setContent] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const router = useRouter();

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (fn: (draft: ContentDoc) => void) => {
    setContent((c) => {
      const next = structuredClone(c);
      fn(next);
      return next;
    });
    setDirty(true);
    setStatus({ kind: "idle" });
  };

  const save = async () => {
    setStatus({ kind: "saving" });
    try {
      await saveDraftAction(content);
      setDirty(false);
      setStatus({ kind: "saved", msg: "초안을 저장했습니다. 방문객 앱에는 발행해야 반영됩니다." });
      router.refresh();
    } catch (e) {
      setStatus({ kind: "error", msg: (e as Error).message });
    }
  };

  const publish = async (note: string) => {
    setStatus({ kind: "saving" });
    try {
      const r = await publishAction(content, note);
      if (!r.ok) {
        setStatus({ kind: "error", msg: r.errors.join("\n") });
        return false;
      }
      setDirty(false);
      setStatus({ kind: "published", msg: `버전 #${r.id}로 발행했습니다. 태블릿은 다음 투어부터 새 문구를 사용합니다.` });
      router.refresh();
      return true;
    } catch (e) {
      setStatus({ kind: "error", msg: (e as Error).message });
      return false;
    }
  };

  return { content, update, dirty, status, save, publish };
}

export function DraftBar({
  draft,
  content,
  dirty,
  status,
  onSave,
  onPublish,
}: {
  draft: RevisionMeta | null;
  content: ContentDoc;
  dirty: boolean;
  status: Status;
  onSave: () => void;
  onPublish: (note: string) => Promise<boolean>;
}) {
  const errors = useMemo(() => validateContent(content), [content]);
  const [publishing, setPublishing] = useState(false);
  const [note, setNote] = useState("");
  const busy = status.kind === "saving";

  return (
    <div className="draft-bar">
      <div className="draft-state">
        {dirty ? (
          <span className="pill warn">저장하지 않은 변경 있음</span>
        ) : draft ? (
          <span className="pill">초안 저장됨 · 미발행</span>
        ) : (
          <span className="pill ok">발행본과 같음</span>
        )}
        {errors.length > 0 && (
          <span className="pill bad" title={errors.join("\n")}>
            필수 문구 누락 {errors.length}건
          </span>
        )}
      </div>
      <div className="draft-actions">
        <button className="btn-admin ghost" onClick={onSave} disabled={busy || !dirty}>
          초안 저장
        </button>
        <button className="btn-admin" onClick={() => setPublishing(true)} disabled={busy || (!dirty && !draft)}>
          발행…
        </button>
      </div>
      {status.msg && <p className={`draft-msg ${status.kind}`}>{status.msg}</p>}

      {publishing && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal>
          <div className="admin-modal">
            <h2>콘텐츠 발행</h2>
            {errors.length ? (
              <>
                <p>한국어·영어 필수 문구가 비어 있어 발행할 수 없습니다.</p>
                <ul className="error-list">
                  {errors.slice(0, 12).map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                  {errors.length > 12 && <li>외 {errors.length - 12}건</li>}
                </ul>
                <div className="modal-row">
                  <button className="btn-admin" onClick={() => setPublishing(false)}>
                    확인
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>현재 편집 내용을 저장하고 새 버전으로 발행합니다. 태블릿에는 다음 투어부터 반영됩니다.</p>
                <label className="field-label">
                  변경 메모 (선택)
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="예: 벽화 영상 설명 수정" />
                </label>
                <div className="modal-row">
                  <button className="btn-admin ghost" onClick={() => setPublishing(false)}>
                    취소
                  </button>
                  <button
                    className="btn-admin"
                    disabled={busy}
                    onClick={async () => {
                      if (await onPublish(note)) {
                        setPublishing(false);
                        setNote("");
                      }
                    }}
                  >
                    발행
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
