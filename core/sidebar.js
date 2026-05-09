// =============================================
// HAD-Agent — sidebar.js (Core)
// [v16.0.0-alpha.5] Swiper.js Engine Integration
// =============================================

import { Registry } from './services/registry.js';

export function initSidebar(activeModules, loadedModules, config, ctx) {
  const ServiceContext = ctx;
  const sidebar      = document.getElementById('sidebar');
  const agentDrawer  = document.getElementById('agentDrawer');
  const appLayout    = document.querySelector('.app-layout');
  const nav          = document.getElementById('sidebarNav');
  const btnHamburger = document.getElementById('btnHamburger');
  const btnToggleLeft  = document.getElementById('btnToggleLeft');
  const btnToggleRight = document.getElementById('btnToggleRight');
  const profileDropdown = document.getElementById('profileDropdown');
  const btnProfile = document.getElementById('btnProfile');
  const statusVersion = document.getElementById('statusVersion');

  if (!sidebar || !agentDrawer || !appLayout) return;

  // ── 🛠️ 환경 및 상태 관리 ──
  const isMobile = () => Registry.getEnv() === 'mobile';
  let swiper = null;

  const updatePanelAttrs = (index) => {
    document.body.setAttribute('data-sidebar-open', index === 0);
    document.body.setAttribute('data-drawer-open', index === 2);
    document.body.setAttribute('data-panel-index', index);
  };

  // ── 🚀 Swiper.js 엔진 가동 (Mobile Only) ──
  if (isMobile()) {
    swiper = new Swiper('.app-layout', {
      initialSlide: 1,
      speed: 400,
      resistanceRatio: 0.7, // 경계 저항
      threshold: 15, // 스냅 턱 상향
      touchAngle: 45, // 수직 스크롤 간섭 방지
      on: {
        slideChange: (s) => {
          const index = s.activeIndex;
          updatePanelAttrs(index);
          if (index === 2) renderSlotContent('agent');
          ServiceContext.events.emit(index === 1 ? 'drawerClosed' : 'drawerOpening', { slot: 'agent' });
        }
      }
    });
  }

  function setPanel(index) {
    if (swiper) swiper.slideTo(index);
  }

  function toggleDrawer(side, force = null) {
    if (!isMobile()) {
      const attr = (side === 'left') ? 'data-sidebar-open' : 'data-drawer-open';
      const current = document.body.getAttribute(attr) === 'true';
      const target = (force !== null) ? force : !current;
      document.body.setAttribute(attr, target);
    } else {
      if (side === 'left') {
        const target = (swiper.activeIndex === 0) ? 1 : 0;
        swiper.slideTo(target);
      } else {
        const target = (swiper.activeIndex === 2) ? 1 : 2;
        swiper.slideTo(target);
      }
    }
  }

  // ── 🎨 초기화 및 이벤트 바인딩 ──
  if (statusVersion) statusVersion.textContent = "v" + Registry.getVersion();
  
  if (!isMobile()) {
    document.body.setAttribute('data-sidebar-open', 'true');
    document.body.setAttribute('data-drawer-open', 'true');
    renderSlotContent('agent');
  } else {
    updatePanelAttrs(1);
  }

  // 내비게이션 렌더링
  if (nav) {
    nav.innerHTML = activeModules.map(mod => `
      <div class='sidebar-nav-item ${ServiceContext.router?.currentModule === mod.id ? 'active' : ''}' data-module='${mod.id}'>
        <span class='nav-icon'>${mod.icon}</span>
        <span class='nav-label'>${mod.label}</span>
      </div>
    `).join('');
    
    nav.addEventListener('click', (e) => {
      const item = e.target.closest('.sidebar-nav-item');
      if (!item) return;
      if (isMobile()) swiper.slideTo(1);
      ServiceContext.navigate(item.dataset.module);
    });
  }

  // 버튼 이벤트
  btnHamburger?.addEventListener('click', (e) => { e.stopPropagation(); toggleDrawer('left'); });
  btnToggleLeft?.addEventListener('click', () => toggleDrawer('left'));
  btnToggleRight?.addEventListener('click', () => toggleDrawer('right'));
  btnProfile?.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown?.classList.toggle('open'); });
  document.addEventListener('click', () => profileDropdown?.classList.remove('open'));

  async function renderSlotContent(slot) {
    const drawerBody = document.getElementById('agentDrawerBody');
    if (!drawerBody) return;
    const slotMap = config.ui?.drawerSlots || {};
    const moduleId = slotMap[slot];
    const mod = loadedModules[moduleId];
    if (mod && !drawerBody.hasChildNodes()) {
      drawerBody.innerHTML = '<div class="loading-spinner"></div>';
      const html = await mod.render(config, ServiceContext);
      drawerBody.innerHTML = html;
      if (mod.afterRender) await mod.afterRender(config, ServiceContext);
    }
  }

  ServiceContext.events.on('moduleChanged', (moduleId) => {
    nav?.querySelectorAll('.sidebar-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.module === moduleId);
    });
  });
}
