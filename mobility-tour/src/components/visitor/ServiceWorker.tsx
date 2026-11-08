"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __amtUpdateReady?: boolean;
  }
}

/**
 * 서비스 워커 등록. 새 버전이 배포되면 백그라운드에서 받아 두었다가,
 * 방문객이 투어를 마치고 시작 화면으로 돌아올 때 새로고침하여 적용합니다.
 * (관람 도중 화면이 갑자기 바뀌지 않도록)
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    const hadController = !!navigator.serviceWorker.controller;
    const onChange = () => {
      if (hadController) window.__amtUpdateReady = true;
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);

    let timer: number | undefined;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // 태블릿이 계속 켜져 있으므로 주기적으로 새 버전 확인
        timer = window.setInterval(() => reg.update().catch(() => {}), 15 * 60 * 1000);
      })
      .catch((err) => console.warn("SW registration failed", err));

    return () => {
      window.clearInterval(timer);
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
    };
  }, []);
  return null;
}

export function applyPendingUpdate() {
  if (typeof window !== "undefined" && window.__amtUpdateReady) window.location.reload();
}
