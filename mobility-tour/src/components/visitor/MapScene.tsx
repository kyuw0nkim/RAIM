"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { EXHIBIT_IMAGE, MAP_OBJECTS, ROOM, type MapObject } from "@/content/map";
import type { Exhibit, ExhibitId, Locale } from "@/content/types";
import { UI } from "@/content/ui";

/** 터치 판정용 알파 마스크 (축소본) */
interface AlphaMask {
  w: number;
  h: number;
  data: Uint8ClampedArray;
}

const MASK_WIDTH = 320;
const ALPHA_THRESHOLD = 40;
/** 손가락 터치는 부정확하므로 주변을 넓게 함께 검사 (CSS px) */
const TOUCH_SLOP = 24;

function loadMask(src: string): Promise<AlphaMask> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = MASK_WIDTH;
      const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return reject(new Error("no 2d context"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve({ w, h, data: ctx.getImageData(0, 0, w, h).data });
    };
    img.onerror = reject;
    img.src = src;
  });
}

function opaqueAt(mask: AlphaMask | undefined, u: number, v: number) {
  if (u < 0 || v < 0 || u >= 1 || v >= 1) return false;
  if (!mask) return true; // 마스크 로딩 전: 사각형 영역으로 판정
  const px = Math.floor(u * mask.w);
  const py = Math.floor(v * mask.h);
  return mask.data[(py * mask.w + px) * 4 + 3] > ALPHA_THRESHOLD;
}

export function MapScene({
  exhibits,
  lang,
  completed,
  focused,
  onTapObject,
  onTapEmpty,
}: {
  exhibits: Record<ExhibitId, Exhibit>;
  lang: Locale;
  completed: Set<ExhibitId>;
  /** Approach 단계: 선택한 전시물만 밝게, 나머지는 딤 처리 */
  focused: ExhibitId | null;
  onTapObject: (id: ExhibitId) => void;
  onTapEmpty: () => void;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const masks = useRef<Partial<Record<ExhibitId, AlphaMask>>>({});
  const [pressed, setPressed] = useState<ExhibitId | null>(null);

  useEffect(() => {
    MAP_OBJECTS.forEach((o) =>
      loadMask(EXHIBIT_IMAGE[o.id].src)
        .then((m) => {
          masks.current[o.id] = m;
        })
        .catch(() => {}),
    );
  }, []);

  /** 화면 좌표 → 위에 있는 전시물부터 불투명 픽셀 검사 (선택된 전시물이 가장 위) */
  const hitTest = (clientX: number, clientY: number): ExhibitId | null => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const order = [...MAP_OBJECTS].reverse().sort((a, b) => Number(b.id === focused) - Number(a.id === focused));
    const offsets: [number, number][] = [[0, 0]];
    for (const r of [TOUCH_SLOP / 2, TOUCH_SLOP]) {
      for (let a = 0; a < 8; a++) offsets.push([Math.cos((a * Math.PI) / 4) * r, Math.sin((a * Math.PI) / 4) * r]);
    }
    for (const [dx, dy] of offsets) {
      const sx = ((clientX + dx - rect.left) / rect.width) * 100;
      const sy = ((clientY + dy - rect.top) / rect.height) * 100;
      for (const o of order) {
        if (opaqueAt(masks.current[o.id], (sx - o.x) / o.w, (sy - o.y) / o.h)) return o.id;
      }
    }
    return null;
  };

  const select = (id: ExhibitId) => {
    setPressed(id);
    // 짧은 시각 피드백 후 전달
    window.setTimeout(() => {
      setPressed(null);
      onTapObject(id);
    }, 140);
  };

  // pointerup 대신 click 사용: 태블릿에서 손가락이 조금만 움직여도 pointercancel이 나서
  // 터치가 무시되던 문제 방지 (click은 브라우저가 탭 허용 오차를 적용)
  const onSceneClick = (e: MouseEvent<HTMLDivElement>) => {
    if (pressed) return;
    const id = hitTest(e.clientX, e.clientY);
    if (id) select(id);
    else onTapEmpty();
  };

  const box = (o: MapObject) => ({ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, height: `${o.h}%` });

  return (
    <div className="scene-wrap">
      <div
        ref={sceneRef}
        className={`scene ${focused ? "has-focus" : ""}`}
        style={{ aspectRatio: `${ROOM.width} / ${ROOM.height}` }}
        onClick={onSceneClick}
      >
        <img className="scene-bg" src={ROOM.src} alt="" draggable={false} fetchPriority="high" />

        {MAP_OBJECTS.map((o, i) => (
          <div
            key={o.id}
            className={`scene-object ${o.grounded ? "grounded" : ""} ${pressed === o.id ? "pressed" : ""} ${
              focused === o.id ? "focused" : ""
            }`}
            style={box(o)}
          >
            {/* 강조 효과: 윤곽을 따라 빛나는 레이어 (opacity만 애니메이션 → 태블릿 부담 적음) */}
            <img
              className="object-glow"
              src={EXHIBIT_IMAGE[o.id].src}
              alt=""
              draggable={false}
              style={{ animationDelay: `${i * 0.8}s` }}
            />
            <img className="object-img" src={EXHIBIT_IMAGE[o.id].src} alt="" draggable={false} />
          </div>
        ))}

        {/* 선택한 전시물 외에는 어둡게 */}
        <div className="scene-dim" aria-hidden />

        {/* "여기를 누르세요" 표시: 물체 위에 빛나는 원 + 이름 + Tap */}
        {!focused &&
          MAP_OBJECTS.map((o) => (
            <button
              key={`marker-${o.id}`}
              className={`scene-marker ${completed.has(o.id) ? "done" : ""}`}
              style={{ left: `${o.marker.x}%`, top: `${o.marker.y}%` }}
              aria-label={exhibits[o.id].name[lang]}
              onClick={(e) => {
                e.stopPropagation();
                if (!pressed) select(o.id);
              }}
            >
              <span className="marker-dot" aria-hidden>
                {completed.has(o.id) ? "✓" : ""}
              </span>
              <span className="marker-tap">{UI.tap[lang]}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
