// 서비스 워커를 라우트로 생성하여 릴리스 버전을 캐시 이름에 넣습니다.
// → 새 버전을 배포하면 캐시가 자동으로 교체됩니다.
export const dynamic = "force-static";

const VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
const BUILD = process.env.NEXT_PUBLIC_BUILD_TIME ?? "";

const source = /* js */ `
const VERSION = ${JSON.stringify(`${VERSION}-${BUILD}`)};
const CACHE = "amt-" + VERSION;
const CORE = [
  "/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png",
  "/images/room.webp", "/images/diorama.webp", "/images/diorama-car.webp", "/images/diorama-obstacle.webp", "/images/quiz-display.webp", "/images/mural.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    // 시작 페이지가 사용하는 JS/CSS도 미리 저장 → 첫 실행 후 바로 오프라인 사용 가능
    try {
      const html = await (await fetch("/", { cache: "no-store" })).text();
      const assets = [...new Set(html.match(/\\/_next\\/static\\/[^"'\\s)]+/g) || [])];
      await cache.addAll(assets);
    } catch (e) {}
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("amt-") && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // 관리자·API는 항상 네트워크 (캐시하지 않음)
  if (url.pathname.startsWith("/admin") || url.pathname === "/sw.js") return;
  if (url.pathname.startsWith("/api") && url.pathname !== "/api/content") return;

  // 페이지와 발행 콘텐츠: 네트워크 우선, 실패 시 캐시 (오프라인 투어)
  if (req.mode === "navigate" || url.pathname === "/api/content") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch (e) {
        return (await cache.match(req)) || (req.mode === "navigate" ? await cache.match("/") : undefined) || Response.error();
      }
    })());
    return;
  }

  const immutable = url.pathname.startsWith("/_next/static/");
  const media = url.pathname.startsWith("/images/") || url.pathname.startsWith("/icons/");
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (hit && (immutable || media)) return hit;
    const network = fetch(req).then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    });
    if (hit) { event.waitUntil(network.catch(() => {})); return hit; }
    try { return await network; } catch (e) { return Response.error(); }
  })());
});
`;

export function GET() {
  return new Response(source, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
