// =============================================
// HAD-Agent — app.js (Core Engine)
// config 읽기 → 테마 적용 → 모듈 로드 → 라우팅
// =============================================

import config from '../client/config.js';
import { initSidebar } from './sidebar.js';
import { initTabBar } from './tabbar.js';
import { initRouter, navigateTo } from './router.js';

// ── 테마 CSS 변수 적용 ──────────────────────
function applyTheme(cfg) {
  const root = document.documentElement;
  root.style.setProperty('--primary',       cfg.brand.themeColor);
  root.style.setProperty('--primary-light', cfg.brand.themeColorLight || cfg.brand.themeColor + '99');
  root.style.setProperty('--dark',          cfg.brand.darkColor);
  root.style.setProperty('--bg',            cfg.brand.bgColor);
}

// ── 브랜딩 적용 ─────────────────────────────
function applyBranding(cfg) {
  // 페이지 타이틀
  document.title = cfg.brand.name;

  // manifest 동적 업데이트
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    const manifest = {
      name: cfg.brand.name,
      short_name: cfg.pwa.shortName,
      theme_color: cfg.pwa.themeColor,
      background_color: cfg.pwa.backgroundColor,
      display: 'standalone',
      start_url: './',
      icons: [
        { src: 'client/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'client/assets/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    manifestLink.href = URL.createObjectURL(blob);
  }

  // 헤더 로고
  document.getElementById('headerLogo').src      = cfg.brand.logo;
  document.getElementById('headerLogoText').src  = cfg.brand.logoText;

  // 사이드바 브랜드
  document.getElementById('sidebarLogo').src     = cfg.brand.logo;
  document.getElementById('sidebarBrand').textContent = cfg.brand.name;

  // theme-color 메타
  document.querySelector('meta[name="theme-color"]').content = cfg.pwa.themeColor;
  document.querySelector('meta[name="apple-mobile-web-app-title"]').content = cfg.pwa.shortName || cfg.brand.name;
}

// ── 활성 모듈 목록 ───────────────────────────
function getActiveModules(cfg) {
  return cfg.modules.filter(m => m.enabled);
}

// ── 모듈 동적 import ─────────────────────────
async function loadModule(moduleId) {
  try {
    const mod = await import(`../modules/${moduleId}/${moduleId}.js`);
    return mod.default;
  } catch (e) {
    console.warn(`[HAD] 모듈 로드 실패: ${moduleId}`, e);
    return null;
  }
}

// ── 앱 초기화 ────────────────────────────────
async function init() {
  // 1. 테마 + 브랜딩
  applyTheme(config);
  applyBranding(config);

  // 2. 활성 모듈 로드
  const activeModules = getActiveModules(config);
  const loadedModules = {};

  await Promise.all(activeModules.map(async (modCfg) => {
    const mod = await loadModule(modCfg.id);
    if (mod) {
      loadedModules[modCfg.id] = { ...mod, ...modCfg };
      if (mod.init) await mod.init(config);
    }
  }));

  // 3. 사이드바 + 탭바 초기화
  initSidebar(activeModules, loadedModules, config);
  initTabBar(activeModules, loadedModules);

  // 4. 라우터 초기화
  initRouter(loadedModules, config);

  // 5. 첫 화면으로
  const hash = window.location.hash.replace('#', '') || 'home';
  navigateTo(hash);

  // 6. 로딩 화면 제거
  document.getElementById('loadingScreen')?.remove();

  // 7. Service Worker 등록
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ── 설정 패널 ────────────────────────────────
document.getElementById('btnSettings').addEventListener('click', () => {
  document.getElementById('settingsPanel').classList.add('open');
});
document.getElementById('closeSettings').addEventListener('click', () => {
  document.getElementById('settingsPanel').classList.remove('open');
});

// 설정 패널 내용 채우기
document.getElementById('settingsBody').innerHTML = `
  <div style="color: var(--text-dim); font-size: 13px; line-height: 1.8;">
    <p style="margin-bottom: 16px;">⚙️ 앱 정보</p>
    <p>HAD-Agent v2.0</p>
    <p>by AI Thinking Lab</p>
    <p style="margin-top: 16px; font-size: 11px; color: var(--text-dim);">
      © 2026 AI Thinking Lab. All rights reserved.
    </p>
  </div>
`;

// ── 실행 ─────────────────────────────────────
init().catch(console.error);
