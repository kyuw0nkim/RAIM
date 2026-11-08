"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU: { href: string; label: string }[] = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/sessions", label: "세션 기록" },
  { href: "/admin/exhibits", label: "전시물" },
  { href: "/admin/content", label: "콘텐츠 편집" },
  { href: "/admin/faq", label: "FAQ 관리" },
  { href: "/admin/quiz", label: "퀴즈 관리" },
  { href: "/admin/settings", label: "설정" },
  { href: "/admin/releases", label: "업데이트 내역" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin-nav" aria-label="관리자 메뉴">
      {MENU.map((m) => {
        const active = m.href === "/admin" ? path === "/admin" : path.startsWith(m.href);
        return (
          <Link key={m.href} href={m.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}
