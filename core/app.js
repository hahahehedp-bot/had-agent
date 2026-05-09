// =============================================
// HAD-Agent — app.js (Core Engine)
// [v13.2.0] Stability Fix: 로딩 화면 제거 보장
// =============================================

import { Registry } from './services/registry.js';
import { initTabBar } from './tabbar.js';
import { initRouter, navigateTo } from './router.js';
import { initAuth } from './auth.js';
import { initTheme } from './services/theme.js';
import { applyBranding } from './services/branding.js';
import { initSettings } from './components/settings.js';

function getActiveModules(cfg) {
  return cfg.modules.filter(m => m.enabled);
}

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

window.hadEvents = {
  listeners: {},
  on(event, cb) { (this.listeners[event] = this.listeners[event] || []).push(cb); },
  emit(event, data) { (this.listeners[event] || []).forEach(cb => cb(data)); }
};

const ServiceContext = {
  events: window.hadEvents,
  notify: (msg, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${msg}`);
    // [v15.3.0] TODO: 전용 토스트 UI 모듈이 있다면 alert 대신 교체 예정
    alert(msg); 
  },
  navigate: (to) => navigateTo(to),
  setContextData: (data) => {
    // [DEPRECATED] window.hadState.contextData = data; 
    Registry.updateState({ contextData: data });
  }
};

async function safeRunModule(moduleId, action, context) {
  try {
    if (context[action]) {
      const config = Registry.getConfig();
      return await context[action](config, ServiceContext);
    }
  } catch (e) {
    console.error(`[HAD] 모듈 '${moduleId}' 실행 중 에러 (${action}):`, e);
    return `<div class="error-state">오류 발생 (Module Error)</div>`;
  }
}

async function init() {
  // [v15.3.0] 버전 정보는 이제 Registry에서 단일화하여 관리함
  const version = Registry.getVersion();
  console.log(`[HAD] Core Engine v${version} Starting...`);
  
  if ('serviceWorker' in navigator) {
    // [DEPRECATED] 구형 캐시 갱신 방식 대신 Registry 버전을 쿼리로 활용 고려
    navigator.serviceWorker.register(`./sw.js?v=${version}`).catch(err => console.warn('[SW] 등록 실패:', err));
  }

  const removeLoading = () => {
    const loader = document.getElementById('loadingScreen');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.remove();
        console.log('[HAD] Loading Screen Removed.');
      }, 500);
    }
  };

  try {
    await Registry.init();
    const config = Registry.getConfig();
    ServiceContext.config = config;

    initTheme(config);
    applyBranding(config);
    
    await initAuth();
    initSettings(config);

    const activeModules = getActiveModules(config);
    const loadedModules = {};

    // ── 모듈 로드 엔진 (병렬 처리) ──
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
        console.error(`[HAD] 모듈 '${modCfg.id}' 로드 실패:`, e);
      }
    }));

    const navModules = activeModules.filter(m => !m.hidden);
    const { initSidebar } = await import(`./sidebar.js?v=${version}`);
    
    initSidebar(navModules, loadedModules, config, ServiceContext);
    initTabBar(navModules, loadedModules, config, ServiceContext);
    initRouter(loadedModules, config, ServiceContext);

    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
    
    // 초기화 완료 후 로딩 제거
    setTimeout(removeLoading, 300);

  } catch (e) {
    console.error('[HAD] 앱 초기화 치명적 오류:', e);
    removeLoading();
    
    if (!e.message.includes('Auth')) {
      document.body.innerHTML += `<div class="fatal-error" style="position:fixed; bottom:20px; left:20px; background:rgba(220,38,38,0.9); color:white; padding:12px 20px; border-radius:8px; z-index:10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: sans-serif;">시스템 초기화 실패: ${e.message}</div>`;
    }
  }
}

init().catch(console.error);
