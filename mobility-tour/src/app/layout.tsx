import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Pretendard (OFL) — 자체 호스팅하여 오프라인에서도 동일한 글꼴 사용
const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
});

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
    <html lang="en" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}
