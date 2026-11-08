import { QuizManager } from "@/components/admin/QuizManager";
import { getDraft } from "@/lib/server/content";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const { draft, content } = await getDraft();
  return (
    <main className="admin-page">
      <header className="admin-header">
        <p className="admin-eyebrow">퀴즈 관리</p>
        <h1>퀴즈 문항</h1>
      </header>
      <QuizManager initial={content} draft={draft} />
    </main>
  );
}
