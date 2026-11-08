// 교육장 지도 배치 (PRD §3.4): 위치·크기는 개발 단계에서 고정하며 DB에 저장하지 않습니다.
// 실제 사진이 준비되면:
//   1) public/images/room.jpg  (교육장 전경, 16:10 가로 비율 권장)
//   2) public/images/car.png, quiz.png, mural.png  (투명 배경 PNG)
// 를 넣고 아래 ROOM_IMAGE / image 값을 채운 뒤 x·y·w(%)를 사진에 맞게 조정하세요.
import type { ExhibitId } from "./types";

export const ROOM_IMAGE: string | null = null; // 예: "/images/room.jpg"

export const MAP_OBJECTS: { id: ExhibitId; x: number; y: number; w: number; image: string | null }[] = [
  { id: "mural", x: 6, y: 6, w: 32, image: null },
  { id: "car", x: 42, y: 56, w: 26, image: null },
  { id: "quiz", x: 74, y: 22, w: 18, image: null },
];
