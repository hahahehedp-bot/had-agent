// =============================================
// HAD-Agent — sidebar.js (Core)
// [v16.0.0 Alpha] Obsidian-Style Sliding Reboot
// =============================================

import { Registry } from './services/registry.js';

export function initSidebar(activeModules, loadedModules, config, ctx) {
  const ServiceContext = ctx;
  const sidebar      = document.getElementById('sidebar');
  const agentDrawer  = document.getElementById('agentDrawer');
  const globalOverlay = document.getElementById('globalOverlay');
  
  const btnHamburger = document.getElementById('btnHamburger');
  const btnToggleLeft  = document.getElementById('btnToggleLeft');
  const btnToggleRight = document.getElementById('btnToggleRight');
  const nav            = document.getElementById('sidebarNav');

  if (!sidebar || !agentDrawer) {
    console.error('[HAD] 필수 레이아웃 요소를 찾을 수 없습니다.');
    return;
  }

  const updatePanelAttrs = () => {
    const isMobile = isDrawerMode();
    document.body.setAttribute('data-sidebar-open', sidebar.classList.contains('open'));
    document.body.setAttribute('data-drawer-open', agentDrawer.classList.contains('open'));
    document.body.setAttribute('data-pc', !isMobile);
    document.body.setAttribute('data-panel-index', currentPanelIndex);
  };

  const isDrawerMode = () => {
    const isDesktop = /Windows|Macintosh|Linux/.test(navigator.userAgent) && !/Android|iPhone|iPad/.test(navigator.userAgent);
    return !isDesktop;
  };

  let isMoving = false; 
  let currentPanelIndex = 1;

  function setPanel(index, force = false) {
    if (isMoving && !force) return;
    if (index < 0 || index > 2) return;

    currentPanelIndex = index;
    const layout = document.querySelector('.app-layout');
    
    if (isDrawerMode()) {
      const offset = -100 * index;
      layout.style.transform = "translateX(" + offset + "vw)";
      sidebar.classList.toggle('open', index === 0);
      agentDrawer.classList.toggle('open', index === 2);
      
      if (index !== 1) {
        globalOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
      } else {
        globalOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    } else {
      layout.style.transform = 'none';
    }

    updatePanelAttrs();
    
    if (index === 2) {
      const slotMap = config.ui?.drawerSlots || {};
      ServiceContext.events.emit('drawerOpening', { slot: 'agent', moduleId: slotMap['agent'] });
    } else if (index === 1) {
       ServiceContext.events.emit('drawerClosed', { slot: 'agent' });
    }
  }

  function toggleDrawer(side, force = null) {
    if (!isDrawerMode()) {
      const target = (side === 'left') ? sidebar : agentDrawer;
      const shouldOpen = (force !== null) ? force : !target.classList.contains('open');
      target.classList.toggle('open', shouldOpen);
      updatePanelAttrs();
      return;
    }
    if (side === 'left') {
      const targetIdx = (currentPanelIndex === 0) ? 1 : 0;
      setPanel(force === true ? 0 : (force === false ? 1 : targetIdx));
    } else {
      const targetIdx = (currentPanelIndex === 2) ? 1 : 2;
      setPanel(force === true ? 2 : (force === false ? 1 : targetIdx));
    }
  }

  if (!isDrawerMode()) {
    sidebar.classList.add('open');
    agentDrawer.classList.add('open');
    sidebar.style.visibility = 'visible';
    agentDrawer.style.visibility = 'visible';
    setTimeout(() => renderSlotContent('agent'), 100);
  } else {
    setPanel(1, true);
  }
  updatePanelAttrs();
  
  const statusVersion = document.getElementById('statusVersion');
  if (statusVersion) statusVersion.textContent = "v" + Registry.getVersion();

  ServiceContext.events.on('drawerOpening', ({ slot }) => {
    renderSlotContent(slot);
  });

  if (nav) {
    nav.innerHTML = activeModules.map(mod => "<div class='sidebar-nav-item' data-module='" + mod.id + "'><span class='nav-icon'>" + mod.icon + "</span><span class='nav-label'>" + mod.label + "</span></div>").join('');
    nav.addEventListener('click', (e) => {
      const item = e.target.closest('.sidebar-nav-item');
      if (!item) return;
      if (isDrawerMode()) setPanel(1);
      ServiceContext.navigate(item.dataset.module);
    });
  }

  const btnProfile = document.getElementById('btnProfile');
  const profileDropdown = document.getElementById('profileDropdown');

  btnProfile?.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown?.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    profileDropdown?.classList.remove('open');
  });

  btnHamburger?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer('left');
  });

  btnToggleLeft?.addEventListener('click', () => toggleDrawer('left'));
  btnToggleRight?.addEventListener('click', () => toggleDrawer('right'));
  
  globalOverlay?.addEventListener('click', () => {
    setPanel(1);
  });

  ServiceContext.events.on('moduleChanged', (moduleId) => {
    nav?.querySelectorAll('.sidebar-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.module === moduleId);
    });
  });

  async function renderSlotContent(slot) {
    const drawerBody = document.getElementById('agentDrawerBody');
    if (!drawerBody) return;
    drawerBody.innerHTML = '<div class="loading-spinner-wrap"><div class="loading-spinner"></div></div>';
    const slotMap = config.ui?.drawerSlots || {};
    const moduleId = slotMap[slot];
    const mod = loadedModules[moduleId];
    if (mod) {
      try {
        const html = await mod.render(config, ServiceContext);
        drawerBody.innerHTML = html;
        if (mod.afterRender) await mod.afterRender(config, ServiceContext);
      } catch (e) {
        drawerBody.innerHTML = '<div class="error-msg">모듈 에러</div>';
      }
    }
  }

  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (!isDrawerMode() || deltaY > 100 || Math.abs(deltaX) < 80) return; 
    if (deltaX > 80) {
      setPanel(currentPanelIndex - 1);
    } else if (deltaX < -80) {
      setPanel(currentPanelIndex + 1);
    }
  }, { passive: true });
}
