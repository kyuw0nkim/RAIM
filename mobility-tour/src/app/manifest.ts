import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Autonomous Mobility Tour · 서울로봇인공지능과학관",
    short_name: "Mobility Tour",
    description: "서울로봇인공지능과학관 교육장 인터랙티브 셀프 가이드",
    start_url: "/",
    scope: "/",
    display: "fullscreen",
    display_override: ["fullscreen", "standalone"],
    orientation: "landscape",
    background_color: "#EAF4FA",
    theme_color: "#00448B",
    lang: "ko",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
