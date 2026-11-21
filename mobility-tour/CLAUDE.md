@AGENTS.md

# 프로젝트 규칙 (Autonomous Mobility Tour)

## 디자인 시스템 — 한국어 조판 규칙
공통 규칙은 저장소 루트 `CLAUDE.md` 참고. 이 앱에서는 `src/app/globals.css` 맨 앞의 "한국어 조판 규칙" 블록이 모든 화면에 자동 적용됩니다.

- 제목 역할을 하는 새 클래스를 만들면 그 규칙의 `:is(...)` 목록에 추가
- 방문객 앱은 `.tour` 에 현재 언어, 관리자는 `.admin` 에 `lang="ko"` 가 걸려 있음 — 새 영역도 `lang` 을 유지할 것
- 별도 HTML 문서(이메일·보고서·내보내기 등)를 새로 만들 때도 같은 세 속성을 넣을 것

## 내장 콘텐츠를 고칠 때 (발행본과의 우선순위)
`src/content/exhibits.ts` 의 기본 콘텐츠를 고친 경우, 관리자가 이미 발행한 콘텐츠에도 반영되어야 하면
`src/content/patches.ts` 에 패치를 추가합니다 (`date` = 머지 시각).
- 패치보다 먼저 발행·저장된 콘텐츠 → 패치가 우선
- 패치 이후에 발행된 콘텐츠 → 관리자 발행본이 우선

## 버전·업데이트 내역
변경을 머지하기 전에 `npm run release:new -- patch|minor|major` 로 버전을 올리고 `src/data/releases.json` 을 작성합니다 (README 참고).
