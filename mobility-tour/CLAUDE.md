@AGENTS.md

# 프로젝트 규칙 (Autonomous Mobility Tour)

## 디자인 시스템 — 한국어 조판 규칙
`src/app/globals.css` 맨 앞의 "한국어 조판 규칙" 블록이 모든 화면에 자동 적용됩니다. 새 화면·컴포넌트·문서를 만들 때도 이 규칙을 따릅니다.

- 본문: `word-break: keep-all` — 줄바꿈은 공백·문장부호에서만 (어절 중간에서 끊지 않음)
- 보조: `overflow-wrap: anywhere` — 긴 영문·URL이 칸을 넘칠 때만 아무 곳에서나 끊음
- 제목: `text-wrap: pretty` — 끝줄에 한 글자만 남지 않게. 제목 역할을 하는 새 클래스를 만들면 규칙의 `:is(...)` 목록에 추가
- 규칙은 `:lang(ko)` 로 걸려 있으므로 한국어가 들어가는 영역에는 반드시 올바른 `lang` 속성을 둘 것
  (방문객 앱은 `.tour` 에 현재 언어, 관리자는 `.admin` 에 `lang="ko"`)
- 예외가 필요하면 전역 규칙을 지우지 말고 해당 요소에서만 덮어쓸 것
- 별도 HTML 문서(이메일·보고서·내보내기 등)를 새로 만들 때도 같은 세 속성을 넣을 것

## 내장 콘텐츠를 고칠 때 (발행본과의 우선순위)
`src/content/exhibits.ts` 의 기본 콘텐츠를 고친 경우, 관리자가 이미 발행한 콘텐츠에도 반영되어야 하면
`src/content/patches.ts` 에 패치를 추가합니다 (`date` = 머지 시각).
- 패치보다 먼저 발행·저장된 콘텐츠 → 패치가 우선
- 패치 이후에 발행된 콘텐츠 → 관리자 발행본이 우선

## 버전·업데이트 내역
변경을 머지하기 전에 `npm run release:new -- patch|minor|major` 로 버전을 올리고 `src/data/releases.json` 을 작성합니다 (README 참고).
