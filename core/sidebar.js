// =============================================
// HAD-Agent — sidebar.js (Core)
// [v13.2.0] Stability Fix (PC 가시성 및 모바일 로딩 에러 방지)
// =============================================

export function initSidebar(activeModules, loadedModules, config, ctx) {
  const ServiceContext = ctx;
  const sidebar      = document.getElementById('sidebar');
  const agentDrawer  = document.getElementById('agentDrawer');
  const globalOverlay = document.getElementById('globalOverlay');
  
  const btnHamburger = document.getElementById('btnHamburger');
  const btnCloseAgent = document.getElementById('btnCloseAgent');
  const nav          = document.getElementById('sidebarNav');

  if (!sidebar || !agentDrawer) {
    console.error('[HAD] 필수 레이아웃 요소를 찾을 수 없습니다.');
    return;
  }

  /**
   * ── 환경 판정 (Environment Detection) ─────────────────────
   */
  const isDrawerMode = () => {
    // 윈도우 너비가 768px 미만이면 모바일 서랍 모드로 간주 (스타일 계산보다 안전)
    return window.innerWidth < 768;
  };

  /**
   * ── 서랍 제어 핵심 ──────────────────────────
   */
  function toggleDrawer(side, force = null) {
    const target = (side === 'left') ? sidebar : agentDrawer;
    const other  = (side === 'left') ? agentDrawer : sidebar;
    
    const isCurrentlyOpen = target.classList.contains('open');
    const shouldOpen = (force !== null) ? force : !isCurrentlyOpen;

    if (shouldOpen) {
      // [독점 모드]
      if (isDrawerMode()) {
        other.classList.remove('open');
        other.style.visibility = 'hidden';
      }
      
      target.style.visibility = 'visible';
      target.style.pointerEvents = 'auto';
      target.classList.add('open');
      
      if (side === 'right') renderSlotContent('agent');
    } else {
      target.classList.remove('open');
      
      // 닫기 후 가시성 복구
      setTimeout(() => {
        if (!target.classList.contains('open')) {
          // PC 모드면 항상 보이게, 모바일이면 숨김
          target.style.visibility = isDrawerMode() ? 'hidden' : 'visible';
        }
      }, 300);
    }

    const anyOpen = sidebar.classList.contains('open') || agentDrawer.classList.contains('open');
    globalOverlay.classList.toggle('active', anyOpen && (isDrawerMode() || config.ui?.useOverlayOnPC));
  }

  // ── 메뉴 항목 생성 ─────────────────────────────
  if (nav) {
    nav.innerHTML = activeModules.map(mod => `
      <div class="sidebar-nav-item" data-module="${mod.id}">
        <span class="nav-icon">${mod.icon}</span>
        <span class="nav-label">${mod.label}</span>
      </div>
    `).join('');

    nav.addEventListener('click', (e) => {
      const item = e.target.closest('.sidebar-nav-item');
      if (!item) return;
      if (isDrawerMode()) toggleDrawer('left', false); 
      ServiceContext.navigate(item.dataset.module);
    });
  }

  // ── 마스터 운영실 (보안 강화) ──────────────────
  function updateAdminMenu() {
    const footer = document.querySelector('.sidebar-footer');
    if (window.hadState?.isAdmin && footer && !document.getElementById('sidebarAdmin')) {
      const adminItem = document.createElement('div');
      adminItem.className = 'sidebar-footer-item master-admin';
      adminItem.id = 'sidebarAdmin';
      adminItem.innerHTML = '🛡️ 마스터 운영실';
      footer.prepend(adminItem);
      adminItem.addEventListener('click', () => {
        if (isDrawerMode()) toggleDrawer('left', false);
        ServiceContext.notify('마스터 운영실을 준비 중입니다.');
      });
    }
  }
  updateAdminMenu();

  // ── 버튼 이벤트 (안전 바인딩) ──────────────────
  btnHamburger?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer('left');
  });
  
  btnCloseAgent?.addEventListener('click', () => toggleDrawer('right', false));
  
  globalOverlay?.addEventListener('click', () => {
    toggleDrawer('left', false);
    toggleDrawer('right', false);
  });

  document.getElementById('sidebarSettings')?.addEventListener('click', () => {
    if (isDrawerMode()) toggleDrawer('left', false);
    document.getElementById('settingsPanel')?.classList.add('open');
  });
  
  document.getElementById('sidebarInfo')?.addEventListener('click', () => {
    if (isDrawerMode()) toggleDrawer('left', false);
    alert(`${config.brand.name} v${window.hadState.version}\nPowered by AI Thinking Lab`);
  });

  // ── 라우터 변경 감지 ────────────────────────────
  ServiceContext.events.on('moduleChanged', (moduleId) => {
    nav?.querySelectorAll('.sidebar-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.module === moduleId);
    });
  });

  // ── 슬롯 컨텐츠 렌더링 ──────────────────────────
  async function renderSlotContent(slot) {
    const drawerBody = document.getElementById('agentDrawerBody');
    if (!drawerBody) return;
    drawerBody.innerHTML = '<div class="loading-spinner-wrap"><div class="loading-spinner"></div></div>';

    const slotMap = config.ui?.drawerSlots || { 'agent': 'chat' };
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

  // ── 스와이프 제스처 ───────────────────────────
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (!isDrawerMode() || deltaY > 60) return; 
    
    if (touchStartX < 50 && deltaX > 80) toggleDrawer('left', true);
    if (touchStartX > window.innerWidth - 50 && deltaX < -80) toggleDrawer('right', true);
  }, { passive: true });
}
