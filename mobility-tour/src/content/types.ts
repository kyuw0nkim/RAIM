export type Locale = "ko" | "en";
export type L = Record<Locale, string>;
export type ExhibitId = "car" | "quiz" | "mural";
export const STAGES = ["approach", "engage", "experience", "reflect", "disengage"] as const;
export type StageKey = (typeof STAGES)[number];

export interface StageContent {
  title: L;
  body: L;
  question?: L;
  hint?: L;
  /** 다음 단계로 넘어가는 버튼 문구 */
  cta?: L;
  /** 이 단계에서만 왼쪽에 보여 줄 사진 (없으면 전시물 기본 이미지) */
  image?: StageImage;
}

export interface StageImage {
  src: string;
  width: number;
  height: number;
  /** 힌트를 열면 사진 위에 원으로 표시할 위치 (사진 기준 %, r = 지름 % of width) */
  mark?: { x: number; y: number; r: number };
}

export interface Faq { id: string; q: L; a: L }

export interface QuizQuestion {
  id: string;
  question: L;
  options: { key: string; text: L }[];
  /** 정답은 언어와 독립적으로 관리 */
  answer: string;
  explanation: L;
}

export interface Hotspot {
  id: string;
  /** 원을 표시할 위치들 (벽화 이미지 기준 %) — 여러 곳이면 하나를 눌러도 함께 선택됨 */
  points: { x: number; y: number }[];
  label: L;
  /** 실제 벽에서 무엇을 찾아볼지 (태블릿보다 실물을 보도록 먼저 안내) */
  find: L;
  desc: L;
  /** video: 벽화 속 영상 화면 (노란 원) */
  kind?: "video";
}

export interface Exhibit {
  id: ExhibitId;
  icon: string;
  name: L;
  tagline: L;
  stages: Record<StageKey, StageContent>;
  faqs: Faq[];
  quiz?: QuizQuestion[];
  hotspots?: Hotspot[];
  /** 작품·작가 표기 */
  credit?: L;
  next: ExhibitId[];
}
