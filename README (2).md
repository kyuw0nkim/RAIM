# [스크립트 이름]

이 프로젝트는 **Tampermonkey**로 실행하는 사용자 스크립트(UserScript)입니다. 별도의 프로그램을 설치하지 않고, 지원하는 웹페이지에서 스크립트의 기능을 사용할 수 있습니다.

> **설치 전 안내:** 아래의 `YOUR_USERNAME`, `YOUR_REPO`, `my-script.user.js`를 실제 GitHub 계정명, 저장소명, 스크립트 파일명으로 바꿔 주세요.

## 1. 처음 설치하기 (사용자용)

### STEP 1. Tampermonkey 설치

스크립트를 사용하려는 **브라우저에** Tampermonkey 확장 프로그램을 설치합니다.

- **Chrome:** [Chrome 웹 스토어에서 설치](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox:** [Firefox 부가 기능에서 설치](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- **Edge 등 다른 브라우저:** [Tampermonkey 공식 홈페이지](https://www.tampermonkey.net/)에서 해당 브라우저를 선택하세요.

설치가 끝나면 브라우저 오른쪽 위 **확장 프로그램 아이콘**에서 Tampermonkey를 확인할 수 있습니다.

**Chrome / Edge에서 추가로 확인할 설정:**

1. Chrome은 주소창에 `chrome://extensions`, Edge는 `edge://extensions`를 입력합니다.
2. **Tampermonkey → 세부정보(Details)**로 이동합니다.
3. **사용자 스크립트 허용(Allow user scripts)** 항목이 보이면 켭니다.
4. 해당 항목이 없거나 Tampermonkey가 개발자 모드를 요구하면 확장 프로그램 페이지의 **개발자 모드(Developer mode)**를 켜세요.

이 권한이 꺼져 있으면 스크립트가 설치되어 있어도 실행되지 않을 수 있습니다.

### STEP 2. 스크립트 설치

다음 링크를 클릭합니다.

**▶ [스크립트 설치하기](https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/my-script.user.js)**

1. Tampermonkey의 스크립트 설치 화면이 열리면 스크립트 이름과 권한을 확인합니다.
2. **설치(Install)**를 클릭합니다.
3. 스크립트를 사용할 웹사이트를 열거나 새로고침합니다.

> 위 링크는 예시입니다. 저장소 관리자가 실제 설치 링크로 교체해야 합니다. GitHub에서 해당 `.user.js` 파일을 열고 **Raw**를 눌러도 설치할 수 있습니다.

### STEP 3. 정상 설치 확인

1. 브라우저의 **Tampermonkey 아이콘 → 대시보드(Dashboard)**를 엽니다.
2. 설치한 스크립트가 목록에 표시되고 **활성화(Enabled)**되어 있는지 확인합니다.
3. 스크립트가 작동하는 웹페이지에 접속해 기능을 확인합니다.

## 2. 스크립트 관리 및 업데이트 (사용자용)

- **켜기/끄기:** Tampermonkey 대시보드에서 스크립트 옆의 활성화 스위치를 사용합니다.
- **업데이트:** 스크립트에 업데이트 주소가 설정되어 있다면 Tampermonkey가 주기적으로 새 버전을 확인합니다. GitHub 코드가 변경됐다고 즉시 적용되는 것은 아닙니다.
- **수동으로 업데이트 확인:** Tampermonkey 대시보드의 **업데이트 확인(Check for userscript updates)** 기능을 사용합니다. 메뉴 이름과 위치는 버전에 따라 다를 수 있습니다.
- **삭제:** 대시보드에서 해당 스크립트를 선택한 다음 삭제합니다.

## 3. GitHub에 처음 배포하기 (관리자용)

### STEP 1. 공개 저장소 생성

GitHub에서 새 저장소(Repository)를 생성하고 공개 범위를 **Public**으로 설정합니다. 예를 들어 다음과 같이 구성합니다.

```text
YOUR_REPO/
├── README.md
└── my-script.user.js
```

스크립트 파일의 확장자는 반드시 **`.user.js`**로 끝나게 해 주세요.

### STEP 2. 스크립트 메타데이터 설정

`my-script.user.js` 파일 맨 위에 다음 설정을 넣습니다. `YOUR_USERNAME`, `YOUR_REPO`, 파일명, `@match` 주소는 실제 환경에 맞게 바꿉니다.

```javascript
// ==UserScript==
// @name         [스크립트 이름]
// @namespace    https://github.com/YOUR_USERNAME/YOUR_REPO
// @version      1.0.0
// @description  [스크립트가 하는 일]
// @match        https://example.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/my-script.user.js
// @downloadURL  https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/my-script.user.js
// ==/UserScript==

(function () {
  'use strict';

  // 여기에 실제 스크립트 코드를 작성합니다.
})();
```

각 항목의 의미는 다음과 같습니다.

| 설정 | 역할 |
| --- | --- |
| `@name` | Tampermonkey에 표시되는 스크립트 이름 |
| `@version` | 현재 버전. **업데이트 배포 시 증가시켜야 함** |
| `@match` | 스크립트가 실행될 웹사이트 주소 패턴 |
| `@grant` | Tampermonkey에서 사용할 특별한 기능의 권한. 위 예시는 별도 API를 사용하지 않는 경우 |
| `@updateURL` | 새 버전이 있는지 확인할 주소 |
| `@downloadURL` | 업데이트된 스크립트를 내려받을 주소 |

### STEP 3. 업로드 및 설치 테스트

1. `my-script.user.js`와 `README.md`를 GitHub 저장소의 `main` 브랜치에 업로드(Commit)합니다.
2. `my-script.user.js` 파일을 열고 **Raw**를 클릭합니다.
3. 주소가 아래 형식인지 확인합니다.

```text
https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/my-script.user.js
```

4. Tampermonkey가 설치된 브라우저에서 링크를 열고 설치를 테스트합니다.
5. 정상 작동하면 README의 **스크립트 설치하기** 링크를 실제 주소로 교체합니다.

## 4. 새 버전 배포하기 (관리자용)

배포된 스크립트를 수정할 때마다 다음 절차를 따릅니다.

1. `my-script.user.js` 파일의 코드를 수정합니다.
2. 파일 맨 위 `@version`을 올립니다. 예: `1.0.0` → `1.0.1`.
3. 변경 사항을 GitHub의 **같은 파일 경로와 `main` 브랜치**에 Commit/Push합니다.
4. GitHub Raw 링크로 새 버전이 표시되는지 확인합니다.
5. 이미 설치한 사용자는 Tampermonkey의 업데이트 확인 주기에 따라 새 버전을 받게 됩니다. 즉시 확인하고 싶다면 대시보드에서 수동으로 업데이트를 확인할 수 있습니다.

**주의:** `@version`을 그대로 두면 수정한 코드가 있더라도 자동 업데이트가 감지되지 않을 수 있습니다. `@updateURL`과 `@downloadURL`은 공개적으로 접근 가능한 실제 파일 주소여야 합니다.

## 5. 문제가 발생할 때

| 문제 | 확인할 사항 |
| --- | --- |
| 설치 링크를 눌러도 설치 화면이 뜨지 않음 | Tampermonkey가 설치·활성화되어 있는지, 링크가 `.user.js`로 끝나는 GitHub **Raw** 주소인지 확인 |
| 스크립트가 설치됐지만 작동하지 않음 | 대시보드에서 활성화 상태, 브라우저의 사용자 스크립트 실행 권한, `@match` 주소를 확인한 뒤 페이지 새로고침 |
| 수정한 내용이 업데이트되지 않음 | `@version`을 증가시켰는지, 변경 사항을 `main`에 올렸는지, 업데이트 URL이 올바른지 확인 |
| 404 페이지가 표시됨 | GitHub 계정명·저장소명·브랜치명·파일 경로와 Public 여부 확인 |

## 6. 보안 및 주의사항

- 설치 전 스크립트가 어떤 사이트에서 실행되고 어떤 권한을 요청하는지 확인하세요.
- 공개 저장소에는 **API 키, 토큰, 비밀번호, 개인정보** 등을 올리지 마세요.
- 스크립트는 `@match`로 지정한 페이지에서 실행됩니다. 웹사이트 구조가 변경되면 일부 기능이 작동하지 않을 수 있습니다.

---

**참고 자료:** [Tampermonkey 공식 홈페이지](https://www.tampermonkey.net/) · [설치 관련 FAQ](https://www.tampermonkey.net/faq.php) · [메타데이터 문서](https://www.tampermonkey.net/documentation.php)
