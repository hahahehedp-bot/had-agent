// =============================================
// HAD-Agent — router.js (Core)
// 해시 기반 뷰 전환 + 모듈 render() 호출
// =============================================

let _modules = {};
let _config  = {};
let _current = null;
let _ctx     = {};

export function initRouter(loadedModules, config, context) {
  _modules = loadedModules;
  _config  = config;
  _ctx     = context;

  window.addEventListener('hashchange', () => {
    const id = window.location.hash.replace('#', '') || 'home';
    navigateTo(id);
  });

  // 브라우저 뒤로가기 처리
  window.addEventListener('popstate', () => {
    const id = window.location.hash.replace('#', '') || 'home';
    renderModule(id);
  });
}

export async function navigateTo(moduleId) {
  if (!_modules[moduleId]) {
    console.warn(`[Router] 모듈 없음: ${moduleId}`);
    moduleId = Object.keys(_modules)[0]; // 첫 번째 모듈로 폴백
  }

  // URL 해시 업데이트
  if (window.location.hash !== `#${moduleId}`) {
    history.pushState({ module: moduleId }, '', `#${moduleId}`);
  }

  await renderModule(moduleId);
}

async function renderModule(moduleId) {
  if (!_modules[moduleId]) return;

  // 이전 모듈 정리
  if (_current && _current !== moduleId && _modules[_current]?.destroy) {
    try {
      _modules[_current].destroy(_ctx);
    } catch (e) {
      console.warn(`[Router] 모듈 '${_current}' destroy 실패:`, e);
    }
  }
  _current = moduleId;

  // 탭바 + 사이드바 활성 표시
  window._hadSetActiveTab?.(moduleId);
  window._hadSetActiveSidebarItem?.(moduleId);

  // 메인 영역에 렌더링
  const main = document.getElementById('appMain');
  main.innerHTML = '<div class="loading-screen"><div class="loading-spinner"></div></div>';

  try {
    const html = await _modules[moduleId].render(_config, _ctx);
    main.innerHTML = html;
    main.querySelector('.module-root')?.classList.add('animate-in');

    // 모듈 후처리 (이벤트 바인딩 등)
    if (_modules[moduleId].afterRender) {
      await _modules[moduleId].afterRender(_config, _ctx);
    }
  } catch (e) {
    console.error(`[Router] 렌더링 실패: ${moduleId}`, e);
    main.innerHTML = `
      <div class="empty-state" style="margin-top: 60px;">
        <div class="empty-icon">⚠️</div>
        <p>화면을 불러오는 중 문제가 발생했습니다.</p>
      </div>`;
  }

  // 스크롤 상단으로
  main.scrollTop = 0;
}
