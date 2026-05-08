// =============================================
// HAD-Agent — app.js (Core Engine)
// config 읽기 → 테마 적용 → 모듈 로드 → 라우팅
// =============================================

import { Registry } from './services/registry.js';
import { initTabBar } from './tabbar.js';
import { initRouter, navigateTo } from './router.js';
import { initAuth } from './auth.js';
import { initTheme } from './services/theme.js';
import { applyBranding } from './services/branding.js';
import { initSettings } from './components/settings.js';

// ── 활성 모듈 목록 ───────────────────────────
function getActiveModules(cfg) {
  return cfg.modules.filter(m => m.enabled);
}

// ── 모듈 동적 import ─────────────────────────
async function loadModule(moduleId) {
  try {
    const version = Registry.getVersion();
    const mod = await import(`../modules/${moduleId}/${moduleId}.js?v=${version}`);
    return mod.default;
  } catch (e) {
    console.warn(`[HAD] 모듈 로드 실패: ${moduleId}`, e);
    return null;
  }
}

// ── 전역 이벤트 버스 ──────────────────────────
window.hadEvents = {
  listeners: {},
  on(event, cb) { (this.listeners[event] = this.listeners[event] || []).push(cb); },
  emit(event, data) { (this.listeners[event] || []).forEach(cb => cb(data)); }
};

const ServiceContext = {
  events: window.hadEvents,
  notify: (msg, type = 'info') => {
    // [v13.0.0] 향후 Toast UI로 교체될 지점
    console.log(`[${type.toUpperCase()}] ${msg}`);
    alert(msg); 
  },
  navigate: (to) => navigateTo(to),
  
  // 온데만드 컨텍스트 데이터 주입
  setContextData: (data) => {
    window.hadState.contextData = data;
    console.log('[HAD] Context Data Updated:', data);
  }
};

// ── 모듈 로드 및 실행 가드 (Sandbox) ─────────────────────────
async function safeRunModule(moduleId, action, context) {
  try {
    if (context[action]) {
      const config = Registry.getConfig();
      return await context[action](config, ServiceContext);
    }
  } catch (e) {
    console.error(`[HAD] 모듈 '${moduleId}' 실행 중 에러 (${action}):`, e);
    return `<div class="error-state">모듈 실행 중 오류가 발생했습니다.</div>`;
  }
}

// ── 앱 초기화 ────────────────────────────────
async function init() {
  const version = Registry.getVersion();
  
  // 1. Service Worker 등록
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('[SW] 등록 실패:', err));
  }

  try {
    // 2. 설정 로드 및 브랜딩 적용
    await Registry.init();
    const config = Registry.getConfig();
    ServiceContext.config = config;

    initTheme(config);
    applyBranding(config);
    
    // 3. 인증 (비동기 대기)
    await initAuth();
    initSettings(config);

    // 4. 모듈 프리페치 및 초기화
    const activeModules = getActiveModules(config);
    const loadedModules = {};

    await Promise.all(activeModules.map(async (modCfg) => {
      try {
        if (modCfg.type === 'iframe') {
          loadedModules[modCfg.id] = { 
            render: () => `<iframe src="${modCfg.url}" style="width:100%; height:100%; border:none; display:block; background:#fff;"></iframe>`,
            afterRender: () => {},
            ...modCfg 
          };
        } 
        else {
          const mod = await loadModule(modCfg.id);
          if (mod) {
            loadedModules[modCfg.id] = { ...mod, ...modCfg };
            await safeRunModule(modCfg.id, 'init', loadedModules[modCfg.id]);
          }
        }
      } catch (e) {
        console.error(`[HAD] 모듈 '${modCfg.id}' 로드 중 오류:`, e);
      }
    }));

    // 5. 사이드바, 탭바, 라우터 초기화
    const { initSidebar } = await import(`./sidebar.js?v=${version}`);
    initSidebar(activeModules, loadedModules, config, ServiceContext);
    initTabBar(activeModules, loadedModules, config, ServiceContext);
    initRouter(loadedModules, config, ServiceContext);

    // 6. 초기 로딩 화면 제거 및 진입
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
    
    setTimeout(() => {
      document.getElementById('loadingScreen')?.classList.add('fade-out');
      setTimeout(() => document.getElementById('loadingScreen')?.remove(), 500);
    }, 300);

  } catch (e) {
    console.error('[HAD] 앱 초기화 치명적 오류:', e);
    document.body.innerHTML = `<div class="fatal-error">시스템 초기화 실패: ${e.message}</div>`;
  }
}

init().catch(console.error);
