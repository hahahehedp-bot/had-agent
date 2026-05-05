// =============================================
// HAD-Agent — sidebar.js (Core)
// =============================================

export function initSidebar(activeModules, loadedModules, config) {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const btnHamburger = document.getElementById('btnHamburger');
  const nav      = document.getElementById('sidebarNav');

  // 사이드바 메뉴 항목 생성
  nav.innerHTML = activeModules.map(mod => `
    <div class="sidebar-nav-item" data-module="${mod.id}">
      <span class="nav-icon">${mod.icon}</span>
      <span>${mod.label}</span>
    </div>
  `).join('');

  // 메뉴 클릭 → 해당 모듈로 이동
  nav.addEventListener('click', (e) => {
    const item = e.target.closest('.sidebar-nav-item');
    if (!item) return;
    closeSidebar();
    import('./router.js').then(({ navigateTo }) => navigateTo(item.dataset.module));
  });

  // 햄버거 버튼
  btnHamburger.addEventListener('click', () => toggleSidebar());

  // 오버레이 클릭 시 닫기
  overlay.addEventListener('click', closeSidebar);

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }

  // 활성 항목 표시 함수 (router에서 호출)
  window._hadSetActiveSidebarItem = (moduleId) => {
    nav.querySelectorAll('.sidebar-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.module === moduleId);
    });
  };
}
