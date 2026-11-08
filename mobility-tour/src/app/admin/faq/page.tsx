import { FaqManager } from "@/components/admin/FaqManager";
import { getDraft } from "@/lib/server/content";
import { EXHIBIT_IDS, type ExhibitId } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function FaqPage({ searchParams }: { searchParams: Promise<{ exhibit?: string }> }) {
  const sp = await searchParams;
  const { draft, content } = await getDraft();
  const start = (EXHIBIT_IDS as string[]).includes(sp.exhibit ?? "") ? (sp.exhibit as ExhibitId) : "car";
  return (
    <main className="admin-page">
      <header className="admin-header">
        <p className="admin-eyebrow">FAQ 관리</p>
        <h1>자주 묻는 질문</h1>
      </header>
      <FaqManager initial={content} draft={draft} startExhibit={start} />
    </main>
  );
}
