import { ContentEditor } from "@/components/admin/ContentEditor";
import { getDraft, listRevisions } from "@/lib/server/content";
import { EXHIBIT_IDS, type ExhibitId } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ exhibit?: string }> }) {
  const sp = await searchParams;
  const [{ draft, content }, revisions] = await Promise.all([getDraft(), listRevisions()]);
  const start = (EXHIBIT_IDS as string[]).includes(sp.exhibit ?? "") ? (sp.exhibit as ExhibitId) : "car";
  return (
    <main className="admin-page wide">
      <header className="admin-header">
        <p className="admin-eyebrow">콘텐츠 편집</p>
        <h1>전시물 안내 문구</h1>
        <p className="muted">한국어·영어 문구를 고친 뒤 ‘초안 저장’ → ‘발행’하면 태블릿의 다음 투어부터 반영됩니다.</p>
      </header>
      <ContentEditor initial={content} draft={draft} revisions={revisions} startExhibit={start} />
    </main>
  );
}
