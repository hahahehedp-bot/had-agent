// =============================================
// HAD-Agent — router.js (Core)
// 해시 기반 뷰 전환 + 모듈 render() 호출
// =============================================

import { Registry } from './services/registry.js';

let _modules = {};
let _config  = {};
let _current = null;
let _ctx     = {};

export function initRouter(loadedModules, config, context) {
  _modules = loadedModules;
  _config  = config || context.config;
  _ctx     = context;

  // [v15.3.0] 중복 리스너 정리 및 동적 기본 경로 설정
  window.addEventListener('hashchange', () => {
    const activeModules = _config.modules?.filter(m => m.enabled) || [];
    const defaultId = activeModules.length > 0 ? activeModules[0].id : 'home';
    
    // [DEPRECATED] const id = window.location.hash.replace('#', '') || 'home';
    const id = window.location.hash.replace('#', '') || defaultId;
    renderModule(id);
  });
}

export async function navigateTo(moduleId) {
  if (!_modules[moduleId]) {
    console.warn(`[Router] 모듈 없음: ${moduleId}`);
    const activeModules = _config.modules?.filter(m => m.enabled) || [];
    moduleId = activeModules.length > 0 ? activeModules[0].id : Object.keys(_modules)[0];
  }

  // URL 해시 업데이트 -> hashchange 이벤트 유발
  if (window.location.hash !== `#${moduleId}`) {
    window.location.hash = moduleId;
  } else {
    // 이미 같은 해시인 경우 수동 렌더링
    renderModule(moduleId);
  }
}

async function renderModule(moduleId) {
  if (!_modules[moduleId] || _current === moduleId) return;

  // 1. 이전 모듈 정리
  if (_current && _modules[_current]?.destroy) {
    try {
      _modules[_current].destroy(_ctx);
    } catch (e) {
      console.warn(`[Router] 모듈 '${_current}' destroy 실패:`, e);
    }
  }
  
  _current = moduleId;

  // 2. 전역 상태 업데이트 및 이벤트 발행 (v15.3.0 캡슐화 적용 - window.Registry 명시)
  window.Registry?.updateState({ currentModule: moduleId, contextData: null });
  
  // 사이드바/탭바에게 변경 알림
  _ctx.events.emit('moduleChanged', moduleId);

  // 3. 메인 영역 렌더링
  const main = document.getElementById('appMain');
  main.innerHTML = '<div class="module-loading"><div class="loading-spinner"></div></div>';

  try {
    const currentConfig = _config || window.Registry?.getConfig();
    const html = await _modules[moduleId].render(currentConfig, _ctx);
    
    main.innerHTML = html;
    const root = main.querySelector('.module-root');
    if (root) root.classList.add('animate-in');

    // 4. 후처리
    if (_modules[moduleId].afterRender) {
      await _modules[moduleId].afterRender(currentConfig, _ctx);
    }
  } catch (e) {
    console.error(`[Router] 렌더링 실패: ${moduleId}`, e);
    main.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <p>화면을 불러오는 중 문제가 발생했습니다. (v${window.Registry?.getVersion()})</p>
        <button onclick="location.reload()">새로고침</button>
      </div>`;
  }

  main.scrollTop = 0;
}
