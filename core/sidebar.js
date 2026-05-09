// =============================================
// HAD-Agent — sidebar.js (Core)
// [v15.3.0] Core Stabilization & Dynamic Versioning
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

  /**
   * ── 패널 상태 동기화 (Attribute Sync) ─────────────────────
   */
  const updatePanelAttrs = () => {
    document.body.setAttribute('data-sidebar-open', sidebar.classList.contains('open'));
    document.body.setAttribute('data-drawer-open', agentDrawer.classList.contains('open'));
    document.body.setAttribute('data-pc', !isDrawerMode());
  };

  /**
   * ── 지능형 환경 판정 (Identity-based Detection) ──────────
   * [v15.7.5] OS 기반 단일 판정 체계
   * 해상도나 종횡비가 아닌, 기기의 '본질(OS)'을 기준으로 기능을 개방합니다.
   * 사용자가 세로 피씨 모니터를 쓰더라도 전문가용 기능을 온전히 누리게 함이 목적입니다.
   */
  const isDrawerMode = () => {
    const isDesktop = /Windows|Macintosh|Linux/.test(navigator.userAgent) && !/Android|iPhone|iPad/.test(navigator.userAgent);
    return !isDesktop;
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
      // [모바일 독점 모드]
      if (isDrawerMode()) {
        other.classList.remove('open');
        other.style.visibility = 'hidden';
      }
      
      target.style.visibility = 'visible';
      target.style.pointerEvents = 'auto';
      target.classList.add('open');
      
      if (side === 'right') {
        const slotMap = config.ui?.drawerSlots || { 'agent': 'chat' };
        ServiceContext.events.emit('drawerOpening', { slot: 'agent', moduleId: slotMap['agent'] });
      }
    } else {
      target.classList.remove('open');
      if (side === 'right') ServiceContext.events.emit('drawerClosed', { slot: 'agent' });
      
      // 닫기 후 가시성 복구 (모바일만)
      setTimeout(() => {
        if (!target.classList.contains('open') && isDrawerMode()) {
          target.style.visibility = 'hidden';
        }
      }, 300);
    }

    updatePanelAttrs();

  // 글로벌 오버레이 및 바디 스크롤 잠금 처리
    const anyOpen = sidebar.classList.contains('open') || agentDrawer.classList.contains('open');
    if (anyOpen && isDrawerMode()) {
      globalOverlay.classList.add('active');
      document.body.classList.add('no-scroll');
    } else {
      globalOverlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  }

  // 초기 상태 반영 (PC면 기본적으로 열어둠)
  if (!isDrawerMode()) {
    sidebar.classList.add('open');
    agentDrawer.classList.add('open');
    sidebar.style.visibility = 'visible';
    agentDrawer.style.visibility = 'visible';
  }
  updatePanelAttrs();

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

  // ── 프로필 드롭다운 제어 (Profile Dropdown) ──────────
  const btnProfile      = document.getElementById('btnProfile');
  const profileDropdown = document.getElementById('profileDropdown');

  // [v15.8.5] 사용자 정보 동적 반영
  const updateProfileUI = () => {
    const user = window.Registry?.getState('user');
    const nameEl = document.getElementById('dropUserName');
    const emailEl = document.getElementById('dropUserEmail');
    if (user && nameEl) nameEl.textContent = `${user.name} ${user.role || '리더님'}`;
    if (user && emailEl) emailEl.textContent = user.email || 'guest@owner.com';
  };

  btnProfile?.addEventListener('click', (e) => {
    e.stopPropagation();
    updateProfileUI();
    profileDropdown?.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    profileDropdown?.classList.remove('open');
  });

  // ── 안티그래비티 스타일 드롭다운 액션 바인딩 ───────────────────────
  document.getElementById('dropQuickSettings')?.addEventListener('click', () => {
    ServiceContext.notify('퀵 설정 패널을 준비 중입니다. (Antigravity Style)');
  });

  document.getElementById('dropTheme')?.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'glass-dark' ? 'modern-light' : 'glass-dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('had_theme', next);
    ServiceContext.notify(`테마가 ${next}로 변경되었습니다.`);
  });

  document.getElementById('dropUpdate')?.addEventListener('click', () => {
    ServiceContext.notify('최신 버전(v15.8.5)입니다.');
  });

  document.getElementById('dropLogout')?.addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('had_agent_token');
      window.location.reload();
    }
  });

  // ── 버튼 이벤트 (안전 바인딩) ──────────────────
  btnHamburger?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer('left');
  });

  btnToggleLeft?.addEventListener('click', () => toggleDrawer('left'));
  btnToggleRight?.addEventListener('click', () => toggleDrawer('right'));
  
  const closeAgentBtn = document.getElementById('btnCloseAgent');
  closeAgentBtn?.addEventListener('click', () => toggleDrawer('right', false));

  // [v15.6.0] 외부 리전 요청 대응 (Router 등에서 호출)
  ServiceContext.events.on('requestDrawerOpen', ({ side, moduleId }) => {
    toggleDrawer(side, true);
  });

  ServiceContext.events.on('requestDrawerClose', ({ side }) => {
    toggleDrawer(side, false);
  });
  
  globalOverlay?.addEventListener('click', () => {
    toggleDrawer('left', false);
    toggleDrawer('right', false);
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
    drawerBody.scrollTop = 0; // [v13.2.2] 스크롤 초기화
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
    
    if (touchStartX < 80 && deltaX > 60) toggleDrawer('left', true);
    if (touchStartX > window.innerWidth - 100 && deltaX < -60) toggleDrawer('right', true);
  }, { passive: true });
}
