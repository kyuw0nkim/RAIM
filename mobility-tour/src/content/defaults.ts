import { EXHIBITS } from "./exhibits";
import type { ContentDoc } from "./types";

/** 앱에 내장된 기본 콘텐츠 — DB에 발행본이 없거나 오프라인일 때 사용 */
export const DEFAULT_CONTENT: ContentDoc = { exhibits: EXHIBITS };
