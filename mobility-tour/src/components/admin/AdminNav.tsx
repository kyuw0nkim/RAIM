"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU: { href: string; label: string; ready: boolean }[] = [
  { href: "/admin", label: "대시보드", ready: true },
  { href: "/admin/releases", label: "업데이트 내역", ready: true },
  { href: "#exhibits", label: "전시물", ready: false },
  { href: "#content", label: "콘텐츠 편집", ready: false },
  { href: "#faq", label: "FAQ 관리", ready: false },
  { href: "#quiz", label: "퀴즈 관리", ready: false },
  { href: "#settings", label: "설정", ready: false },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin-nav" aria-label="관리자 메뉴">
      {MENU.map((m) =>
        m.ready ? (
          <Link key={m.href} href={m.href} className={path === m.href ? "active" : ""} aria-current={path === m.href ? "page" : undefined}>
            {m.label}
          </Link>
        ) : (
          <span key={m.href} className="disabled" title="다음 버전에서 제공 예정">
            {m.label} <em>예정</em>
          </span>
        ),
      )}
    </nav>
  );
}
