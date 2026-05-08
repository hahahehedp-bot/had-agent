// =============================================
// HAD-Agent — sidebar.js (Core)
// [v13.1.0] Exclusive Drawer System (서랍 상호 배제 강화)
// =============================================

export function initSidebar(activeModules, loadedModules, config, ctx) {
  const ServiceContext = ctx;
  const sidebar      = document.getElementById('sidebar');
  const agentDrawer  = document.getElementById('agentDrawer');
  const globalOverlay = document.getElementById('globalOverlay');
  
  const btnHamburger = document.getElementById('btnHamburger');
  const btnCloseAgent = document.getElementById('btnCloseAgent');
  const nav          = document.getElementById('sidebarNav');

  /**
   * ── 환경 판정 (Environment Detection) ─────────────────────
   * 현재 레이아웃이 '서랍형(Overlay)'인지 '고정형(Static)'인지 판정
   */
  const isDrawerMode = () => {
    // 사이드바의 computed style을 직접 확인하여 relative(PC고정)가 아니면 서랍 모드로 간주
    const style = window.getComputedStyle(sidebar);
    return style.position === 'fixed';
  };

  /**
   * ── 서랍 제어 핵심 (Exclusive Logic) ────────────────────────
   * @param {string} side - 'left' (메뉴) 또는 'right' (비서)
   * @param {boolean} force - true(열기), false(닫기), null(토글)
   */
  function toggleDrawer(side, force = null) {
    const target = (side === 'left') ? sidebar : agentDrawer;
    const other  = (side === 'left') ? agentDrawer : sidebar;
    
    // 현재 열려있는지 확인
    const isCurrentlyOpen = target.classList.contains('open');
    const shouldOpen = (force !== null) ? force : !isCurrentlyOpen;

    if (shouldOpen) {
      // [독점 모드] 내가 열릴 때 반대쪽은 "무조건" 닫음 (애니메이션 없이 즉시)
      if (isDrawerMode()) {
        other.classList.remove('open');
        other.style.visibility = 'hidden';
        other.style.pointerEvents = 'none';
      }
      
      // 나를 활성화
      target.style.visibility = 'visible';
      target.style.pointerEvents = 'auto';
      target.classList.add('open');
      
      if (side === 'right') renderSlotContent('agent');
    } else {
      // 닫기
      target.classList.remove('open');
      
      // 닫기 애니메이션 완료 후 가시성 복구 (PC 환경 등 고려)
      setTimeout(() => {
        if (!target.classList.contains('open')) {
          target.style.visibility = isDrawerMode() ? 'hidden' : 'visible';
        }
      }, 300);
    }

    // 글로벌 오버레이 처리
    const anyOpen = sidebar.classList.contains('open') || agentDrawer.classList.contains('open');
    if (anyOpen && isDrawerMode()) {
      globalOverlay.classList.add('active');
    } else {
      globalOverlay.classList.remove('active');
    }
  }

  // ── 메뉴 항목 생성 ─────────────────────────────
  nav.innerHTML = activeModules.map(mod => `
    <div class="sidebar-nav-item" data-module="${mod.id}">
      <span class="nav-icon">${mod.icon}</span>
      <span class="nav-label">${mod.label}</span>
    </div>
  `).join('');

  nav.addEventListener('click', (e) => {
    const item = e.target.closest('.sidebar-nav-item');
    if (!item) return;
    toggleDrawer('left', false); // 이동 시 메뉴 닫기
    ServiceContext.navigate(item.dataset.module);
  });

  // ── 마스터 운영실 (반응형 주입) ──────────────────
  function updateAdminMenu() {
    if (window.hadState.isAdmin) {
      const footer = document.querySelector('.sidebar-footer');
      if (footer && !document.getElementById('sidebarAdmin')) {
        const adminItem = document.createElement('div');
        adminItem.className = 'sidebar-footer-item master-admin';
        adminItem.id = 'sidebarAdmin';
        adminItem.innerHTML = '🛡️ 마스터 운영실';
        footer.prepend(adminItem);
        adminItem.addEventListener('click', () => {
          toggleDrawer('left', false);
          ServiceContext.notify('마스터 운영실을 준비 중입니다.');
        });
      }
    }
  }
  updateAdminMenu();

  // ── 버튼 이벤트 ──────────────────────────────
  btnHamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer('left');
  });
  
  btnCloseAgent.addEventListener('click', () => toggleDrawer('right', false));
  
  globalOverlay.addEventListener('click', () => {
    toggleDrawer('left', false);
    toggleDrawer('right', false);
  });

  // 설정/앱정보 메뉴
  document.getElementById('sidebarSettings')?.addEventListener('click', () => {
    toggleDrawer('left', false);
    document.getElementById('settingsPanel')?.classList.add('open');
  });
  document.getElementById('sidebarInfo')?.addEventListener('click', () => {
    toggleDrawer('left', false);
    alert(`${config.brand.name} v${window.hadState.version}\nPowered by AI Thinking Lab`);
  });

  // ── 라우터 변경 감지 ────────────────────────────
  ServiceContext.events.on('moduleChanged', (moduleId) => {
    nav.querySelectorAll('.sidebar-nav-item').forEach(el => {
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
        drawerBody.innerHTML = '<div class="error-msg">모듈을 불러올 수 없습니다.</div>';
      }
    }
  }

  // ── 스와이프 제스처 (Exclusive Guard 적용) ─────────
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
    
    if (!isDrawerMode() || deltaY > 80) return; // 상하 스크롤 시 무시
    
    // 왼쪽 끝에서 오른쪽으로 밀기 -> 메뉴 열기 (비서는 무조건 닫힘)
    if (touchStartX < 50 && deltaX > 80) {
      toggleDrawer('left', true);
    }
    // 오른쪽 끝에서 왼쪽으로 밀기 -> 비서 열기 (메뉴는 무조건 닫힘)
    if (touchStartX > window.innerWidth - 50 && deltaX < -80) {
      toggleDrawer('right', true);
    }
  }, { passive: true });
}
