// =============================================
// HAD-Agent — tabbar.js (Core)
// =============================================

export function initTabBar(activeModules, loadedModules) {
  const tabBar = document.getElementById('tabBar');

  tabBar.innerHTML = activeModules.map(mod => `
    <button class="tab-item" data-module="${mod.id}" aria-label="${mod.label}">
      <span class="tab-icon">${mod.icon}</span>
      <span class="tab-label">${mod.label}</span>
    </button>
  `).join('');

  tabBar.addEventListener('click', (e) => {
    const item = e.target.closest('.tab-item');
    if (!item) return;
    import('./router.js').then(({ navigateTo }) => navigateTo(item.dataset.module));
  });

  // 활성 탭 표시 함수 (router에서 호출)
  window._hadSetActiveTab = (moduleId) => {
    tabBar.querySelectorAll('.tab-item').forEach(el => {
      el.classList.toggle('active', el.dataset.module === moduleId);
    });
  };
}
