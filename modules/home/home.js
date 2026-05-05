// =============================================
// HAD-Agent — modules/home/home.js
// 홈 대시보드 모듈
// =============================================

export default {
  id: 'home',

  async init(config) {
    if (!document.querySelector('link[href="modules/home/home.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'modules/home/home.css';
      document.head.appendChild(link);
    }
  },

  async render(config) {
    const activeModules = config.modules.filter(m => m.enabled && m.id !== 'home');

    const menuCards = activeModules.map(mod => `
      <a href="#${mod.id}" class="home-menu-card" data-module="${mod.id}">
        <div class="home-menu-icon">${mod.icon}</div>
        <div class="home-menu-info">
          <div class="home-menu-title">${mod.label}</div>
          <div class="home-menu-desc">${mod.description || ''}</div>
        </div>
        <div class="home-menu-arrow">›</div>
      </a>
    `).join('');

    return `
      <div class="module-root" style="padding: 20px; padding-bottom: 80px;">
        
        <!-- 웰컴 배너 -->
        <div class="home-welcome card" style="margin-bottom: 20px; text-align: center; padding: 30px 20px;">
          <img src="${config.brand.logo}" alt="${config.brand.name}" 
               style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          <h1 style="font-size: 20px; color: var(--dark); margin-bottom: 6px; font-weight: 700;">
            ${config.brand.tagline || '환영합니다'}
          </h1>
          <p style="font-size: 13px; color: var(--text-dim);">${config.brand.name}</p>
        </div>

        <!-- 메뉴 그리드 -->
        <div class="home-menu-grid">
          ${menuCards}
        </div>

      </div>
    `;
  },

  afterRender(config) {
    // 메뉴 카드 클릭 이벤트
    document.querySelectorAll('.home-menu-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        import('../../core/router.js').then(({ navigateTo }) => {
          navigateTo(card.dataset.module);
        });
      });
    });
  },

  destroy() {}
}
