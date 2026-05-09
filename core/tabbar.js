// =============================================
// HAD-Agent — tabbar.js (Core)
// =============================================

export function initTabBar(activeModules, loadedModules, config, ctx) {
  const tabBar = document.getElementById('tabBar');
  const navCfg = config.ui?.navbar;

  if (!tabBar) return;

  // 1. 활성화 체크 (기본값: 비활성)
  if (!navCfg || !navCfg.enabled) {
    tabBar.style.display = 'none';
    return;
  }

  tabBar.style.display = 'flex';

  // 2. 동적 아이템 구성 (설정이 있으면 따르고, 없으면 활성 모듈 사용)
  const items = navCfg.items || activeModules.map(m => ({ id: m.id, icon: m.icon, label: m.label }));

  tabBar.innerHTML = items.map(item => `
    <button class="tab-item" data-module="${item.id}" aria-label="${item.label}">
      <span class="tab-icon">${item.icon}</span>
      <span class="tab-label">${item.label}</span>
    </button>
  `).join('');

  tabBar.addEventListener('click', (e) => {
    const item = e.target.closest('.tab-item');
    if (!item) return;
    ctx.navigate(item.dataset.module);
  });

  // 3. 유튜브 스타일 동적 제어 (Scroll-to-Hide)
  let lastScrollTop = 0;
  const main = document.getElementById('appMain');
  
  if (main) {
    main.addEventListener('scroll', () => {
      let st = main.scrollTop;
      if (st > lastScrollTop && st > 50) {
        // Scroll Down
        tabBar.classList.add('hidden');
      } else {
        // Scroll Up
        tabBar.classList.remove('hidden');
      }
      lastScrollTop = st;
    }, { passive: true });
  }

  // 4. 라우터 변경 감지
  ctx.events.on('moduleChanged', (moduleId) => {
    tabBar.querySelectorAll('.tab-item').forEach(el => {
      el.classList.toggle('active', el.dataset.module === moduleId);
    });
  });
}
