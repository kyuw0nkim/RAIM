# 저장소 공통 규칙 (RAIM)

이 저장소의 모든 프로젝트에 적용됩니다. 하위 폴더의 CLAUDE.md 는 이 규칙에 더해 프로젝트별 규칙을 둡니다.

## 한국어 조판 규칙
웹 화면·HTML 문서·스타일시트·사용자 스크립트가 주입하는 UI 등 한국어 텍스트를 표시하는 모든 결과물에 적용합니다.

- 본문: `word-break: keep-all` — 줄바꿈은 공백·문장부호에서만 (어절 중간에서 끊지 않음)
- 보조: `overflow-wrap: anywhere` — 긴 영문·URL이 칸을 넘칠 때만 아무 곳에서나 끊음
- 제목: `text-wrap: pretty` — 끝줄에 한 글자만 남지 않게
- 가능하면 `:lang(ko)` 로 걸고, 한국어가 들어가는 요소(또는 `<html>`)에 올바른 `lang` 속성을 둘 것
- 예외가 필요하면 전역 규칙을 지우지 말고 해당 요소에서만 덮어쓸 것

```css
:lang(ko) { word-break: keep-all; overflow-wrap: anywhere; }
:lang(ko) :is(h1, h2, h3, h4, h5, h6) { text-wrap: pretty; }
```
