// ==UserScript==
// @name         Teachable Machine 자동 클래스 설정 v5
// @namespace    tm-class-auto
// @version      5.0
// @match        https://teachablemachine.withgoogle.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ★ 원하는 클래스 이름
  const CLASS_NAMES = ['배경', '강아지', '고양이'];

  // 이전 버전에서 설정한 이름도 변경 허용
  const MANAGED_NAMES = new Set([
    ...CLASS_NAMES,
    '기타'
  ]);

  const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

  const attempts = new WeakMap();

  let running = false;
  let messageTimer;

  // Shadow DOM 내부까지 탐색
  function deepAll(selector, root) {
    const result = [...root.querySelectorAll(selector)];

    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        result.push(...deepAll(selector, el.shadowRoot));
      }
    }

    return result;
  }

  function cards(app) {
    return deepAll(
      'tm-classifier-drawer',
      app.shadowRoot || app
    ).filter(el =>
      el.isConnected && el.getClientRects().length
    );
  }

  function labelOf(card) {
    return deepAll(
      'tm-editable-label',
      card.shadowRoot || card
    )[0];
  }

  function nameOf(card) {
    return (
      card.getAttribute('label') ||
      labelOf(card)?.getAttribute('label') ||
      ''
    ).trim();
  }

  function isDefault(card, index) {
    return new RegExp(
      '^(?:Class|클래스)\\s*' + (index + 1) + '$',
      'i'
    ).test(nameOf(card));
  }

  function signature(app) {
    return JSON.stringify(cards(app).map(nameOf));
  }

  function status(text, error = false) {
    clearTimeout(messageTimer);

    let box = document.getElementById('tm-auto-message');

    if (!box) {
      box = document.createElement('div');
      box.id = 'tm-auto-message';

      Object.assign(box.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '2147483647',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px'
      });

      document.body.appendChild(box);
    }

    box.style.background = error ? '#b91c1c' : '#2563eb';
    box.textContent = text;

    console.log('[TM Auto]', text);
  }

  // 최대 약 15초 동안 준비 상태 확인
  async function waitFor(find, description) {
    for (let i = 0; i < 150; i++) {
      const result = find();

      if (result) return result;

      await sleep(100);
    }

    throw new Error(description + ' 시간 초과');
  }

  function clickElement(el) {
    if (typeof el.click === 'function') {
      el.click();
    } else {
      el.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window
      }));
    }
  }

  // 클래스 추가 버튼 찾기
  function addClassButton(app) {
    const root = app.shadowRoot;

    const candidates = deepAll(
      'button.add-classes',
      root
    );

    // CSS 클래스가 다르면 버튼 이름으로 탐색
    candidates.push(
      ...deepAll('button,[role="button"]', root)
        .filter(el => {
          const text = (
            el.getAttribute('aria-label') ||
            el.textContent ||
            ''
          ).trim();

          return /^(?:\+\s*)?(?:클래스\s*추가|Add a class)$/i
            .test(text);
        })
    );

    return candidates.find(el =>
      !el.disabled &&
      el.getAttribute('aria-disabled') !== 'true' &&
      el.getClientRects().length
    );
  }

  // 이름 변경 전에 필요한 클래스를 모두 추가
  async function ensureClasses(app) {
    while (cards(app).length < CLASS_NAMES.length) {
      const count = cards(app).length;

      status((count + 1) + '번 클래스 추가 중...');

      const button = await waitFor(
        () => addClassButton(app),
        '클래스 추가 버튼'
      );

      button.scrollIntoView({
        block: 'center'
      });

      clickElement(button);

      // 실제 카드가 추가될 때까지 기다림
      await waitFor(
        () => cards(app).length > count,
        '새 클래스 생성'
      );
    }

    // 새 카드의 입력창과 연필 버튼까지 준비되는지 확인
    await waitFor(() =>
      cards(app)
        .slice(0, CLASS_NAMES.length)
        .every(card => {
          const root = labelOf(card)?.shadowRoot;

          return (
            nameOf(card) &&
            root?.querySelector('svg#edit-icon') &&
            root.querySelector('input#label-input')
          );
        }),
      '클래스 편집창 준비'
    );
  }

  async function rename(card, index, name) {
    const currentName = nameOf(card);

    if (currentName === name) return;

    // 기본 이름과 이전 스크립트가 사용한 이름만 변경
    if (
      !isDefault(card, index) &&
      !MANAGED_NAMES.has(currentName)
    ) {
      console.log(
        '[TM Auto] 사용자 지정 이름 유지:',
        currentName
      );
      return;
    }

    const label = await waitFor(() => {
      const el = labelOf(card);
      const root = el?.shadowRoot;

      return (
        root?.querySelector('svg#edit-icon') &&
        root.querySelector('input#label-input')
      ) ? el : null;
    }, (index + 1) + '번 클래스 편집 요소 준비');

    const root = label.shadowRoot;
    const icon = root.querySelector('svg#edit-icon');

    if (!label.hasAttribute('editing')) {
      clickElement(icon);
    }

    const input = await waitFor(() => {
      const el = root.querySelector('input#label-input');

      return (
        label.hasAttribute('editing') &&
        el &&
        !el.disabled &&
        !el.readOnly
      ) ? el : null;
    }, (index + 1) + '번 클래스 입력창');

    input.focus();

    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    ).set;

    setter.call(input, name);

    input.dispatchEvent(new Event('input', {
      bubbles: true,
      composed: true
    }));

    input.dispatchEvent(new Event('change', {
      bubbles: true,
      composed: true
    }));

    for (const type of ['keydown', 'keyup']) {
      input.dispatchEvent(new KeyboardEvent(type, {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        composed: true
      }));
    }

    input.blur();

    await waitFor(() =>
      nameOf(card) === name &&
      !label.hasAttribute('editing'),
      (index + 1) + '번 클래스 이름 반영'
    );

    console.log('[TM Auto] 변경 확인:', name);
  }

  async function setup() {
    if (
      running ||
      !location.pathname.startsWith('/train/image')
    ) {
      return;
    }

    const app = document.querySelector(
      'tm-teachable-image-app'
    );

    if (!app?.shadowRoot) return;

    const initial = cards(app);

    if (
      initial.length < 2 ||
      attempts.get(app) === signature(app)
    ) {
      return;
    }

    const targets = initial.slice(0, CLASS_NAMES.length);

    // 기본 클래스 또는 스크립트가 사용한 이름이면 실행
    if (
      !targets.some(isDefault) &&
      !targets.every(card =>
        MANAGED_NAMES.has(nameOf(card))
      )
    ) {
      return;
    }

    running = true;
    status('클래스 자동 설정 중...');

    try {
      // 1. 클래스를 먼저 3개까지 추가
      await ensureClasses(app);

      // 2. 준비된 클래스의 이름을 순서대로 변경
      for (let i = 0; i < CLASS_NAMES.length; i++) {
        if (
          !app.isConnected ||
          !location.pathname.startsWith('/train/image')
        ) {
          throw new Error('프로젝트 화면이 변경됨');
        }

        status((i + 1) + '번 클래스 이름 설정 중...');

        await rename(
          cards(app)[i],
          i,
          CLASS_NAMES[i]
        );
      }

      status(
        '자동 설정 완료! 다른 사용자 지정 이름은 유지했습니다.'
      );

      messageTimer = setTimeout(() => {
        document.getElementById('tm-auto-message')
          ?.remove();
      }, 4000);

    } catch (error) {
      console.error('[TM Auto]', error);

      status(
        '자동 설정 실패: ' + error.message +
        ' — 수정 후 새로고침하세요.',
        true
      );

    } finally {
      attempts.set(app, signature(app));
      running = false;
    }
  }

  setInterval(() => {
    void setup();
  }, 1500);

  void setup();

  console.log('[TM Auto] v5 로드 완료');
})();