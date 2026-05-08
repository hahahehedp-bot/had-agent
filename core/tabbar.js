// =============================================
// HAD-Agent — tabbar.js (Core)
// =============================================

export function initTabBar(activeModules, loadedModules, config, ctx) {
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
    ctx.navigate(item.dataset.module);
  });

  // [v13.0.0] 라우터 변경 감지
  ctx.events.on('moduleChanged', (moduleId) => {
    tabBar.querySelectorAll('.tab-item').forEach(el => {
      el.classList.toggle('active', el.dataset.module === moduleId);
    });
  });
}
