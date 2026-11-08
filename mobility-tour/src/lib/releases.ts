import data from "@/data/releases.json";

export type ChangeType = "added" | "changed" | "fixed" | "content" | "removed" | "security";

export interface Release {
  version: string;
  date: string;
  title: string;
  summary?: string;
  changes: { type: ChangeType; text: string }[];
}

export const releases = data.releases as Release[];

export const CHANGE_TYPE_LABEL: Record<ChangeType, string> = {
  added: "추가",
  changed: "변경",
  fixed: "수정",
  content: "콘텐츠",
  removed: "제거",
  security: "보안",
};
