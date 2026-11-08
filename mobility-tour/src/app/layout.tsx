import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autonomous Mobility Tour",
  description: "서울로봇인공지능과학관 교육장 인터랙티브 셀프 가이드",
  applicationName: "Mobility Tour",
  appleWebApp: { capable: true, title: "Mobility Tour", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 공용 키오스크 태블릿: 실수로 확대되어 화면이 어긋나는 것을 방지
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00448B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
