// =============================================
// HAD-Agent — router.js (Core)
// 해시 기반 뷰 전환 + 모듈 render() 호출
// =============================================

import { Registry } from './services/registry.js';

const REGIONS = {
  VIEWPORT: 'appMain',
  DRAWER: 'agentDrawerBody',
  SIDEBAR: 'sidebarNav',
  NAVBAR: 'tabBar'
};

let _modules = {};
let _config  = {};
let _current = null;
let _ctx     = {};

export function initRouter(loadedModules, config, context) {
  _modules = loadedModules;
  _config  = config || context.config;
  _ctx     = context;

  // 1. 해시 변경 리스너 (VIEWPORT 전용)
  window.addEventListener('hashchange', () => {
    const activeModules = _config.modules?.filter(m => m.enabled) || [];
    const defaultId = _config.ui?.defaultModule || (activeModules.length > 0 ? activeModules[0].id : 'home');
    const id = window.location.hash.replace('#', '') || defaultId;
    
    // 모듈의 배치가 VIEWPORT인 경우에만 메인 라우팅 수행
    const mod = _modules[id];
    if (mod && (!mod.placement || mod.placement.primary === 'VIEWPORT')) {
      renderModule(id, 'VIEWPORT');
    }
  });

  // 2. 서랍 오픈 리스너 (DRAWER 전용)
  _ctx.events.on('drawerOpening', ({ moduleId }) => {
    if (_modules[moduleId]) {
      renderModule(moduleId, 'DRAWER');
    }
  });
}

export async function navigateTo(moduleId) {
  const mod = _modules[moduleId];
  if (!mod) return;

  // DRAWER 모듈인 경우 해시를 바꾸지 않고 직접 렌더링 요청 (혹은 서랍 열기 이벤트 발행)
  if (mod.placement?.primary === 'DRAWER') {
    // 서랍이 이미 열려있지 않다면 사이드바 서비스에 열기 요청 필요
    // 여기서는 간단히 이벤트를 통해 연쇄 작용 유도
    _ctx.events.emit('requestDrawerOpen', { side: 'right', moduleId });
  } else {
    // VIEWPORT 모듈인 경우 해시 업데이트
    if (window.location.hash !== `#${moduleId}`) {
      window.location.hash = moduleId;
    } else {
      renderModule(moduleId, 'VIEWPORT');
    }
  }
}

async function renderModule(moduleId, regionId = 'VIEWPORT') {
  const mod = _modules[moduleId];
  if (!mod) return;

  const containerId = REGIONS[regionId];
  const container = document.getElementById(containerId);
  if (!container) return;

  // 1. 이전 모듈 정리 (해당 리전에 국한)
  // TODO: 리전별 현재 모듈 상태 관리 필요

  // 2. 상태 업데이트
  if (regionId === 'VIEWPORT') {
    _current = moduleId;
    window.Registry?.updateState({ currentModule: moduleId });
    _ctx.events.emit('moduleChanged', moduleId);
  }

  // 3. 렌더링
  container.innerHTML = '<div class="module-loading"><div class="loading-spinner"></div></div>';

  try {
    const currentConfig = _config || window.Registry?.getConfig();
    const html = await mod.render(currentConfig, _ctx);
    
    container.innerHTML = html;
    
    // 후처리
    if (mod.afterRender) {
      await mod.afterRender(currentConfig, _ctx);
    }
  } catch (e) {
    console.error(`[Router] ${regionId} 렌더링 실패: ${moduleId}`, e);
    container.innerHTML = `<div class="error-state">오류 발생</div>`;
  }
}
