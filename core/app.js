// =============================================
// HAD-Agent — app.js (Core Engine)
// [v15.9.6] Core Purification & Integrity Guard
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
    
    // 1. 인증 초기화 및 사용자 확보
    await initAuth();
    const user = Registry.getState('user');
    const token = localStorage.getItem('had_agent_token');

    // 2. [v15.4.0] 드라이브 서비스 시동 및 권한 동기화
    if (token && token !== 'dev_bypass_token') {
      const { Drive } = await import('./services/drive.js?v=' + version);
      await Drive.init(token);
      await Registry.syncPermissions(Drive);
      ServiceContext.drive = Drive; // 모듈에서 드라이브 접근 가능하도록 주입
    }

    initSettings(config);

    const activeModules = getActiveModules(Registry.getConfig());
    const loadedModules = {};

    // ── 모듈 로드 엔진 (병렬 처리) ──
    await Promise.allSettled(activeModules.map(async (modCfg) => {
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
    
    // [v15.8.5] 사이드바 및 라우터 초기화 (안전 임포트)
    try {
      const SidebarModule = await import(`./sidebar.js?v=${version}`);
      const SidebarInit = SidebarModule.initSidebar || SidebarModule.default;
      if (SidebarInit) {
        SidebarInit(navModules, loadedModules, config, ServiceContext);
      } else {
        console.error('[HAD] initSidebar를 찾을 수 없습니다.');
      }
    } catch (e) {
      console.error('[HAD] 사이드바 모듈 임포트 실패:', e);
    }

    initTabBar(navModules, loadedModules, config, ServiceContext);
    initRouter(loadedModules, config, ServiceContext);

    const defaultId = config.ui?.defaultModule || (activeModules.length > 0 ? activeModules[0].id : null);
    const hash = window.location.hash.replace('#', '') || defaultId;
    if (hash) navigateTo(hash);
    
    // 초기화 완료 후 로딩 제거 (강제 타이머 추가)
    setTimeout(removeLoading, 300);

  } catch (e) {
    console.error('[HAD] 앱 초기화 치명적 오류:', e);
    removeLoading();
    
    // 치명적 오류 시에도 최소한의 사이드바/라우터는 작동 시도
    if (!window.initSidebar) {
       console.warn('[HAD] 비정상 상태에서 초기화 시도 중...');
    }
    
    if (!e.message.includes('Auth')) {
      const errorDiv = document.createElement('div');
      errorDiv.style = "position:fixed; bottom:20px; left:20px; background:rgba(220,38,38,0.9); color:white; padding:12px 20px; border-radius:8px; z-index:10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: sans-serif;";
      errorDiv.textContent = `시스템 초기화 실패: ${e.message}`;
      document.body.appendChild(errorDiv);
    }
  }

  // [Safety Net] 어떤 상황에서도 5초 후에는 로딩 제거
  setTimeout(removeLoading, 5000);
}

init().catch(console.error);
