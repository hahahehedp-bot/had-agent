// =============================================
// HAD-Agent — app.js (Core Engine)
// config 읽기 → 테마 적용 → 모듈 로드 → 라우팅
// =============================================

import { Registry } from './services/registry.js';
import { initSidebar } from './sidebar.js';
import { initTabBar } from './tabbar.js';
import { initRouter, navigateTo } from './router.js';
import { initAuth } from './auth.js';
import { initTheme, toggleTheme } from './services/theme.js';
import { applyBranding } from './services/branding.js';
import { updateAppBadge } from './services/notification.js';

let config = Registry.getConfig();

// ── 활성 모듈 목록 ───────────────────────────
function getActiveModules(cfg) {
  return cfg.modules.filter(m => m.enabled);
}

// ── 모듈 동적 import ─────────────────────────
async function loadModule(moduleId) {
  try {
    const mod = await import(`../modules/${moduleId}/${moduleId}.js?v=9`);
    return mod.default;
  } catch (e) {
    console.warn(`[HAD] 모듈 로드 실패: ${moduleId}`, e);
    return null;
  }
}

import { initSettings } from './components/settings.js';

// ── 앱 초기화 ────────────────────────────────
async function init() {
  // 0. Service Worker 즉시 등록 (PWA 최적화)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('[SW] 등록 실패:', err));
  }

  try {
    // 1. 레지스트리 초기화 (동적 설정 로드)
    await Registry.init();
    config = Registry.getConfig();

    // 2. 테마 + 브랜딩
    initTheme(config);
    applyBranding(config);

    // 2. 인증 로직 실행
    await initAuth();

    // 3. 설정 패널 초기화
    initSettings(config);

    // 4. 활성 모듈 로드
    const activeModules = getActiveModules(config);
    const loadedModules = {};

    await Promise.all(activeModules.map(async (modCfg) => {
      if (modCfg.type === 'iframe') {
        const iframeMod = {
          render: () => `<iframe src="${modCfg.url}" style="width:100%; height:100%; border:none; display:block; background:#fff;"></iframe>`,
          afterRender: () => {}
        };
        loadedModules[modCfg.id] = { ...iframeMod, ...modCfg };
      } 
      else {
        const mod = await loadModule(modCfg.id);
        if (mod) {
          loadedModules[modCfg.id] = { ...mod, ...modCfg };
          if (mod.init) await mod.init(config);
        }
      }
    }));

    // 5. 사이드바 + 탭바 초기화
    initSidebar(activeModules, loadedModules, config);
    initTabBar(activeModules, loadedModules);

    // 6. 라우터 초기화
    initRouter(loadedModules, config);

    // 7. 첫 화면으로
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);

    // 8. 로딩 화면 제거
    document.getElementById('loadingScreen')?.remove();

  } catch (e) {
    console.error('[HAD] 앱 초기화 실패:', e);
    const ls = document.getElementById('loadingScreen');
    if (ls) {
      ls.innerHTML = `
        <div style="color:white; text-align:center; padding:20px;">
          <p>앱을 불러오는 중 오류가 발생했습니다.</p>
          <p style="font-size:12px; opacity:0.8;">${e.message}</p>
        </div>
      `;
    }
  }
}

// ── 실행 ─────────────────────────────────────
init().catch(console.error);
