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

export interface Hotspot { id: string; x: number; y: number; label: L; desc: L }

export interface Exhibit {
  id: ExhibitId;
  icon: string;
  name: L;
  tagline: L;
  stages: Record<StageKey, StageContent>;
  faqs: Faq[];
  quiz?: QuizQuestion[];
  hotspots?: Hotspot[];
  next: ExhibitId[];
}
