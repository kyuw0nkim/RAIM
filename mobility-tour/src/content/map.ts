// 교육장 지도 배치 (PRD §3.4): 위치·크기는 개발 단계에서 고정하며 DB에 저장하지 않습니다.
// 모든 좌표는 배경 사진(room.webp — 전시물이 없는 빈 교육장, 1585×992) 기준 % 값입니다.
// 사진을 교체하면 x·y·w·h 를 새 사진에 맞게 다시 맞춰 주세요.
import type { ExhibitId, StageImage, StageKey } from "./types";

export const ROOM = { src: "/images/room.webp", width: 1585, height: 992 };

export interface ExhibitAsset {
  src: string;
  width: number;
  height: number;
}

/** 전시물 투명 이미지 (여백을 잘라낸 상태) */
export const EXHIBIT_IMAGE: Record<ExhibitId, ExhibitAsset> = {
  car: { src: "/images/diorama.webp", width: 1936, height: 377 },
  quiz: { src: "/images/quiz-display.webp", width: 815, height: 1451 },
  mural: { src: "/images/mural.webp", width: 1976, height: 642 },
};

export interface MapObject {
  id: ExhibitId;
  /** 이미지 박스 (배경 사진 기준 %) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** "Tap" 표시(빛나는 원)를 놓을 위치 — 물체 위 (배경 사진 기준 %, 원의 가운데) */
  marker: { x: number; y: number };
  /** Approach(만나기) 카드 위치 — 선택한 전시물을 가리지 않는 쪽 (화면 기준) */
  card: "right" | "top" | "bottom";
  /** 바닥에 놓인 전시물은 그림자를 넣어 배경 사진에 자연스럽게 붙임 */
  grounded?: boolean;
}

/**
 * 그리는 순서 = 배열 순서 (뒤에 있을수록 위에 그려짐).
 * 터치는 위에 있는 이미지부터, 불투명한 픽셀에서만 인식합니다
 * → 벽화의 투명 영역이 디오라마 터치를 가로채지 않습니다.
 */
export const MAP_OBJECTS: MapObject[] = [
  { id: "mural", x: 22.71, y: 21.98, w: 76.09, h: 39.52, marker: { x: 60.8, y: 33 }, card: "bottom" },
  { id: "quiz", x: 1.14, y: 25.0, w: 17.79, h: 56.45, marker: { x: 10.0, y: 40 }, card: "right", grounded: true },
  { id: "car", x: 19.68, y: 57.66, w: 78.74, h: 28.23, marker: { x: 59.0, y: 70 }, card: "top", grounded: true },
];

/**
 * 단계별로 왼쪽에 보여 줄 사진 (없으면 전시물 기본 이미지).
 * 이미지·표시 위치는 관리자 편집 대상이 아니므로 콘텐츠 문서가 아닌 코드에 둡니다.
 */
export const STAGE_IMAGES: Partial<Record<ExhibitId, Partial<Record<StageKey, StageImage>>>> = {
  car: {
    engage: { src: "/images/diorama-car.webp", width: 870, height: 575 },
    reflect: {
      src: "/images/diorama-car.webp",
      width: 870,
      height: 575,
      marks: [
        { x: 23, y: 58, r: 8.5, label: { ko: "초음파 센서", en: "Ultrasonic sensor" } },
        // TODO: 바닥 컬러 센서의 실제 위치 확인 (사진에서는 차체 아래 가운데 부근으로 표시)
        { x: 42, y: 89, r: 6.5, label: { ko: "컬러 센서", en: "Color sensor" } },
      ],
    },
  },
};
