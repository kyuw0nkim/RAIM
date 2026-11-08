# Autonomous Mobility Tour

서울로봇인공지능과학관 교육장 셀프 가이드 앱 (가로 태블릿용 PWA). PRD v0.4 기반.

- 방문객 앱: `/`
- 관리자: `/admin` (Basic 인증) · 업데이트 내역: `/admin/releases`

## 로컬 실행

```bash
cd mobility-tour
npm install
npm run dev        # http://localhost:3000
```

## Vercel 배포

1. Vercel → **Add New Project** → GitHub 저장소 `RAIM` 선택
2. **Root Directory** 를 `mobility-tour` 로 지정 (Framework: Next.js 자동 인식)
3. **Environment Variables**: `ADMIN_USER`, `ADMIN_PASSWORD` 등록 (없으면 `/admin`이 503으로 잠깁니다)
4. Deploy → 이후 `main` 브랜치에 푸시할 때마다 자동 배포, 다른 브랜치는 Preview 배포

## 데이터베이스 연결 (콘텐츠 편집·이용 기록에 필요)

관리자 페이지의 콘텐츠 편집과 세션 기록은 Postgres에 저장됩니다.

1. Vercel 프로젝트 → **Storage** → **Create Database** → **Neon (Postgres)** → 이 프로젝트에 연결
2. `DATABASE_URL` 환경변수가 자동으로 추가됩니다 (`POSTGRES_URL`도 인식)
3. **Redeploy** — 첫 요청 때 표가 자동으로 만들어집니다

연결하지 않으면 방문객 앱은 앱에 내장된 기본 콘텐츠로 정상 동작하지만, 편집·기록은 저장되지 않습니다.
로컬(`npm run dev`)에서는 `DATABASE_URL`이 없으면 내장 Postgres(PGlite)로 `.data/pglite` 폴더에 저장합니다.

## 태블릿에 설치

1. 갤럭시 태블릿 Chrome(또는 Samsung Internet)에서 배포 주소 접속
2. 메뉴 → **홈 화면에 추가 / 앱 설치**
3. 설치된 아이콘으로 실행하면 주소창 없이 가로 전체화면으로 열립니다
4. 키오스크 운영 시 Android **화면 고정(앱 고정)** 기능으로 다른 앱 이동을 막으세요

## 업데이트할 때 (업데이트 내역 기록)

```bash
npm run release:new -- patch   # 오류·문구 수정 (0.1.0 → 0.1.1)
npm run release:new -- minor   # 기능 추가     (0.1.0 → 0.2.0)
```

1. 위 명령이 `package.json` 버전을 올리고 `src/data/releases.json` 맨 위에 새 항목을 만듭니다.
2. 새 항목의 `title`, `summary`, `changes` 를 작성합니다.
   `type`: `added`(추가) · `changed`(변경) · `fixed`(수정) · `content`(콘텐츠) · `security`(보안) · `removed`(제거)
3. 커밋·푸시 → Vercel이 빌드 전에 `npm run release:check` 를 실행합니다.
   내역이 없거나 `TODO`가 남아 있으면 **빌드가 실패해 배포되지 않습니다.**
4. 배포 후 `/admin/releases` 에서 버전별 변경 사항과 현재 배포 커밋을 확인할 수 있습니다.

태블릿은 백그라운드에서 새 버전을 받아 두었다가 **투어가 끝나 시작 화면으로 돌아갈 때** 적용합니다
(관람 중 화면이 바뀌지 않도록). 시작 화면 오른쪽 아래 버전 번호로 각 태블릿의 반영 여부를 확인하세요.

## 교육장 사진·전시물 이미지

| 파일 | 용도 |
|---|---|
| `public/images/room.webp` | 교육장 전경 (지도 배경, 1585×992) |
| `public/images/diorama.webp` | 자율주행 디오라마 (투명 배경) |
| `public/images/quiz-display.webp` | 퀴즈 디스플레이 (투명 배경) |
| `public/images/mural.webp` | 미래 모빌리티 벽화 (투명 배경, 벽화 핫스팟에도 사용) |

- 전시물 이미지는 배경 사진 속 실제 위치에 겹쳐 그려지고, **이미지의 불투명한 부분을 눌렀을 때만** 해당 전시물이 열립니다.
- 위치·크기는 `src/content/map.ts` (배경 사진 기준 %), 벽화 핫스팟 위치는 `src/content/exhibits.ts` 의 `hotspots` (벽화 이미지 기준 %)에서 조정합니다.
- 이미지를 바꾸면 위 두 파일의 좌표와 `src/app/sw.js/route.ts` 의 캐시 목록도 함께 확인하세요.

## 구조

| 경로 | 내용 |
|---|---|
| `src/content/` | 전시물 KO/EN 콘텐츠(샘플), UI 문구, 지도 배치 |
| `src/components/visitor/` | 방문객 앱 (시작 → 방문객 정보 → 지도 → 5단계 상세) |
| `src/app/admin/` | 관리자 화면 |
| `src/data/releases.json` | 업데이트 내역 데이터 |
| `src/app/sw.js/route.ts` | 서비스 워커 (버전별 캐시) |
| `src/proxy.ts` | `/admin` 인증 |
| `src/lib/analytics.ts` | 이용 로그 큐 (기기에 쌓았다가 `/api/events`로 전송, 오프라인 재전송) |
| `src/lib/server/` | DB 연결, 콘텐츠 버전(초안·발행·복원), 설정, 이용 기록 집계 |
| `src/app/api/` | 방문객 앱용 공개 API: 발행 콘텐츠(`content`), 이용 로그(`events`) |
| `src/app/admin/` | 대시보드·세션 기록·전시물·콘텐츠/FAQ/퀴즈 편집·설정·업데이트 내역 |
