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
    alert(msg); 
  },
  navigate: (to) => navigateTo(to),
  setContextData: (data) => {
    window.hadState.contextData = data;
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
    return `<div class="error-state">오류 발생</div>`;
  }
}

async function init() {
  const version = Registry.getVersion();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('[SW] 등록 실패:', err));
  }

  // ── [v13.2.0] 로딩 제거 함수 정의 ──
  const removeLoading = () => {
    const loader = document.getElementById('loadingScreen');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
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

    const { initSidebar } = await import(`./sidebar.js?v=${version}`);
    initSidebar(activeModules, loadedModules, config, ServiceContext);
    initTabBar(activeModules, loadedModules, config, ServiceContext);
    initRouter(loadedModules, config, ServiceContext);

    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
    
    // 초기화 완료 후 로딩 제거
    setTimeout(removeLoading, 300);

  } catch (e) {
    console.error('[HAD] 앱 초기화 치명적 오류:', e);
    // 오류가 나더라도 로딩 화면은 일단 치워야 함 (로그인 화면 등이 보일 수 있게)
    removeLoading();
    
    if (e.message.includes('Auth')) {
      // 인증 관련이면 무시 (authOverlay가 뜰 것임)
    } else {
      document.body.innerHTML += `<div class="fatal-error" style="position:fixed; bottom:20px; left:20px; background:rgba(0,0,0,0.8); color:white; padding:10px; border-radius:8px; z-index:10000;">초기화 실패: ${e.message}</div>`;
    }
  }
}

init().catch(console.error);
