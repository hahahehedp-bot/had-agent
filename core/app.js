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
import { initSettings } from './components/settings.js';


// ── 활성 모듈 목록 ───────────────────────────
function getActiveModules(cfg) {
  return cfg.modules.filter(m => m.enabled);
}

// ── 모듈 동적 import ─────────────────────────
async function loadModule(moduleId) {
  try {
    const mod = await import(`../modules/${moduleId}/${moduleId}.js?v=11.1`);
    return mod.default;
  } catch (e) {
    console.warn(`[HAD] 모듈 로드 실패: ${moduleId}`, e);
    return null;
  }
}

// ── 전역 이벤트 버스 및 서비스 컨텍스트 초기화 ──────────────────
window.hadEvents = {
  listeners: {},
  on(event, cb) { (this.listeners[event] = this.listeners[event] || []).push(cb); },
  emit(event, data) { (this.listeners[event] || []).forEach(cb => cb(data)); }
};

const ServiceContext = {
  events: window.hadEvents,
  notify: (msg, type = 'info') => alert(`[${type.toUpperCase()}] ${msg}`), // 향후 Toast로 교체
  navigate: (to) => navigateTo(to)
};

// ── 모듈 로드 및 실행 가드 (Sandbox) ─────────────────────────
async function safeRunModule(moduleId, action, context) {
  try {
    if (context[action]) {
      // 자가 치유: config가 유실된 경우 레지스트리에서 다시 수혈
      const config = ServiceContext.config || Registry.getConfig();
      return await context[action](config, ServiceContext);
    }
  } catch (e) {
    console.error(`[HAD] 모듈 '${moduleId}' 실행 중 에러 (${action}):`, e);
    return `<div class="error-state">모듈 실행 중 오류가 발생했습니다. (${e.message})</div>`;
  }
}

// ── 앱 초기화 ────────────────────────────────
async function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('[SW] 등록 실패:', err));
  }

  try {
    await Registry.init();
    const config = Registry.getConfig();
    ServiceContext.config = config; // 즉시 수혈

    initTheme(config);
    applyBranding(config);
    await initAuth();
    initSettings(config);

    const activeModules = getActiveModules(config);
    const loadedModules = {};

    await Promise.all(activeModules.map(async (modCfg) => {
      try {
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
            // 모듈 초기화 (에러 격리)
            await safeRunModule(modCfg.id, 'init', loadedModules[modCfg.id]);
          }
        }
      } catch (e) {
        console.error(`[HAD] 모듈 '${modCfg.id}' 로드 중 치명적 오류:`, e);
      }
    }));

    initSidebar(activeModules, loadedModules, config);
    initTabBar(activeModules, loadedModules);
    initRouter(loadedModules, config, ServiceContext);

    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
    document.getElementById('loadingScreen')?.remove();

  } catch (e) {
    console.error('[HAD] 앱 초기화 실패:', e);
    // ... 에러 UI 렌더링 ...
  }
}

// ── 실행 ─────────────────────────────────────
init().catch(console.error);
