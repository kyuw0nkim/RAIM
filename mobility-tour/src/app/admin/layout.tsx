import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { buildInfo } from "@/lib/build-info";

export const metadata: Metadata = {
  title: "관리자 · Autonomous Mobility Tour",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin">
      <aside className="admin-side">
        <Link href="/admin" className="admin-brand">
          <span className="brand-mark">AMT</span>
          <span>
            <strong>Mobility Tour</strong>
            <small>관리자</small>
          </span>
        </Link>
        <AdminNav />
        <div className="admin-side-foot">
          <span className={`env-badge env-${buildInfo.env}`}>{buildInfo.env}</span>
          <span>v{buildInfo.version}</span>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
