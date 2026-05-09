// =============================================
// HAD-Agent — sidebar.js (Core)
// [v16.0.0-alpha.3] High-Density Panoramic Engine (2026 Standard)
// =============================================

import { Registry } from './services/registry.js';

export function initSidebar(activeModules, loadedModules, config, ctx) {
  const ServiceContext = ctx;
  const sidebar      = document.getElementById('sidebar');
  const agentDrawer  = document.getElementById('agentDrawer');
  const layout       = document.querySelector('.app-layout');
  const nav          = document.getElementById('sidebarNav');
  const btnHamburger = document.getElementById('btnHamburger');
  const btnToggleLeft  = document.getElementById('btnToggleLeft');
  const btnToggleRight = document.getElementById('btnToggleRight');
  const profileDropdown = document.getElementById('profileDropdown');
  const btnProfile = document.getElementById('btnProfile');
  const statusVersion = document.getElementById('statusVersion');

  if (!sidebar || !agentDrawer || !layout) return;

  // ── 🛠️ 환경 및 상태 관리 ──
  const isMobile = () => Registry.getEnv() === 'mobile';
  const PANEL_OFFSETS = [0, -92, -184]; // [v16.0.0-alpha.3] 92vw Peek Coordinate
  let currentPanelIndex = 1; // Default: Viewport (Center)

  const updatePanelAttrs = () => {
    document.body.setAttribute('data-sidebar-open', currentPanelIndex === 0);
    document.body.setAttribute('data-drawer-open', currentPanelIndex === 2);
    document.body.setAttribute('data-panel-index', currentPanelIndex);
  };

  function setPanel(index, force = false) {
    if (index < 0 || index > 2) return;
    currentPanelIndex = index;
    const offset = PANEL_OFFSETS[index];

    requestAnimationFrame(() => {
      layout.style.transform = `translateX(${offset}vw)`;
      // [v16.0.0] Zero-Blur Policy: No global-overlay activation
      document.body.classList.remove('no-scroll');
      updatePanelAttrs();

      // 모듈 렌더링 이벤트 트리거
      if (index === 2) renderSlotContent('agent');
      ServiceContext.events.emit(index === 1 ? 'drawerClosed' : 'drawerOpening', { slot: 'agent' });
    });
  }

  function toggleDrawer(side, force = null) {
    if (!isMobile()) {
      // PC 모드: 기존 사이드바 토글 (Attribute 방식)
      const attr = (side === 'left') ? 'data-sidebar-open' : 'data-drawer-open';
      const current = document.body.getAttribute(attr) === 'true';
      const target = (force !== null) ? force : !current;
      document.body.setAttribute(attr, target);
    } else {
      // 모바일 모드: 파노라마 슬라이딩
      if (side === 'left') {
        setPanel(currentPanelIndex === 0 ? 1 : 0);
      } else {
        setPanel(currentPanelIndex === 2 ? 1 : 2);
      }
    }
  }

  // [v16.0.0-alpha.4] 고도화된 스냅 엔진 (Velocity & Flick Support)
  let touchStartX = 0;
  let startTime = 0;
  let startTranslateX = 0;
  let isDragging = false;

  window.addEventListener('touchstart', (e) => {
    if (!isMobile()) return;
    touchStartX = e.touches[0].clientX;
    startTime = Date.now();
    const matrix = window.getComputedStyle(layout).transform;
    if (matrix !== 'none') {
      startTranslateX = parseFloat(matrix.split(',')[4]);
    } else {
      startTranslateX = PANEL_OFFSETS[currentPanelIndex] * (window.innerWidth / 100);
    }
    isDragging = false;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isMobile()) return;
    const deltaX = e.touches[0].clientX - touchStartX;
    if (!isDragging && Math.abs(deltaX) > 10) {
      isDragging = true;
      layout.style.transition = 'none';
    }

    if (isDragging) {
      let newTranslate = startTranslateX + deltaX;
      const vw = window.innerWidth;
      const minTranslate = PANEL_OFFSETS[2] * (vw / 100);
      const maxTranslate = 0;

      // Elastic Boundary (Rubber Banding)
      if (newTranslate > maxTranslate) newTranslate /= 3;
      if (newTranslate < minTranslate) newTranslate = minTranslate + (newTranslate - minTranslate) / 3;

      layout.style.transform = `translateX(${newTranslate}px)`;
    }
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!isMobile() || !isDragging) return;
    isDragging = false;
    layout.style.transition = ''; 

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const deltaTime = Date.now() - startTime;
    const velocity = deltaX / deltaTime; // px/ms

    const threshold = window.innerWidth * 0.3; // [v16.0.0-alpha.4] 스냅 턱 상향 (30%)
    const velocityThreshold = 0.5; // [v16.0.0-alpha.4] 플릭 감도 설정

    let targetIndex = currentPanelIndex;

    // 1. 속도 기반 판정 (Flick)
    if (Math.abs(velocity) > velocityThreshold) {
      if (velocity > 0 && currentPanelIndex > 0) targetIndex--;
      else if (velocity < 0 && currentPanelIndex < 2) targetIndex++;
    } 
    // 2. 거리 기반 판정 (Slow Drag)
    else if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && currentPanelIndex > 0) targetIndex--;
      else if (deltaX < 0 && currentPanelIndex < 2) targetIndex++;
    }

    setPanel(targetIndex);
  }, { passive: true });

  // ── 🎨 초기화 및 이벤트 바인딩 ──
  if (statusVersion) statusVersion.textContent = "v" + Registry.getVersion();
  if (isMobile()) setPanel(1, true);
  else {
    document.body.setAttribute('data-sidebar-open', 'true');
    document.body.setAttribute('data-drawer-open', 'true');
    renderSlotContent('agent');
  }

  // 내비게이션 렌더링
  if (nav) {
    nav.innerHTML = activeModules.map(mod => `
      <div class='sidebar-nav-item' data-module='${mod.id}'>
        <span class='nav-icon'>${mod.icon}</span>
        <span class='nav-label'>${mod.label}</span>
      </div>
    `).join('');
    nav.addEventListener('click', (e) => {
      const item = e.target.closest('.sidebar-nav-item');
      if (!item) return;
      if (isMobile()) setPanel(1);
      ServiceContext.navigate(item.dataset.module);
    });
  }

  // 각종 버튼 이벤트
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
    if (mod) {
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
