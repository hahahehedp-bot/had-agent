// =============================================
// HAD-Agent — modules/home/home.js
// 홈 대시보드 모듈
// =============================================

export default {
  id: 'home',
  placement: { primary: 'VIEWPORT' },

  async init(config) {
    if (!document.querySelector('link[href="modules/home/home.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'modules/home/home.css?v=5';
      document.head.appendChild(link);
    }
  },

  async render(config) {
    const activeModules = config.modules.filter(m => m.enabled && m.id !== 'home');

    // 모듈별로 벤토 카드의 크기 지정 (chat은 가로로 길게, 나머지는 정사각형)
    const bentoCards = activeModules.map(mod => {
      const isWide = mod.id === 'chat' || mod.id === 'myoffice'; // 주요 기능 및 외부 연동은 와이드로
      
      if (isWide) {
        return `
          <a href="#${mod.id}" class="bento-card wide" data-module="${mod.id}">
            <div class="bento-info">
              <div class="bento-title">${mod.label}</div>
              <div class="bento-desc">${mod.description || ''}</div>
            </div>
            <div class="bento-icon">${mod.icon}</div>
          </a>
        `;
      } else {
        return `
          <a href="#${mod.id}" class="bento-card" data-module="${mod.id}">
            <div class="bento-icon">${mod.icon}</div>
            <div class="bento-info">
              <div class="bento-title">${mod.label}</div>
              <div class="bento-desc">${mod.description || ''}</div>
            </div>
          </a>
        `;
      }
    }).join('');

    return `
      <div class="home-container">
        
        <!-- 웰컴 배너 (Hero Section) -->
        <div class="home-hero">
          <img src="${config.brand.logo}" alt="${config.brand.name}" class="home-hero-logo">
          <h1 class="home-hero-title">${config.brand.tagline || '환영합니다'}</h1>
          <p class="home-hero-subtitle">${config.brand.name}</p>
        </div>

        <!-- 벤토 그리드 메뉴 -->
        <div class="bento-grid">
          ${bentoCards}
        </div>

      </div>
    `;
  },

  afterRender(config) {
    // 메뉴 카드 클릭 이벤트
    document.querySelectorAll('.bento-card').forEach(card => {
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
