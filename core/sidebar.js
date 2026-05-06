// =============================================
// HAD-Agent — sidebar.js (Core)
// =============================================

export function initSidebar(activeModules, loadedModules, config) {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const btnHamburger = document.getElementById('btnHamburger');
  const nav      = document.getElementById('sidebarNav');

  // 사이드바 메뉴 항목 생성
  nav.innerHTML = activeModules.map(mod => `
    <div class="sidebar-nav-item" data-module="${mod.id}">
      <span class="nav-icon">${mod.icon}</span>
      <span>${mod.label}</span>
    </div>
  `).join('');

  // 메뉴 클릭 → 해당 모듈로 이동
  nav.addEventListener('click', (e) => {
    const item = e.target.closest('.sidebar-nav-item');
    if (!item) return;
    closeSidebar();
    import('./router.js').then(({ navigateTo }) => navigateTo(item.dataset.module));
  });

  // 햄버거 버튼
  btnHamburger.addEventListener('click', () => openSidebar());

  // 오버레이 클릭 시 닫기
  overlay.addEventListener('click', closeSidebar);

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }

  // ── 모바일 제스처 (스와이프) 추가 ──────────────────
  let touchStartX = 0;
  let touchStartY = 0;

  // 1. 화면 왼쪽 끝에서 오른쪽으로 밀면 열기
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // 조건: 화면 왼쪽 끝(30px)에서 시작 + 오른쪽으로 50px 이상 이동 + 수직 이동 적음
    if (touchStartX < 30 && deltaX > 50 && deltaY < 30) {
      openSidebar();
    }
  }, { passive: true });

  // 2. 사이드바 영역 내부에서 왼쪽으로 밀면 닫기
  sidebar.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  sidebar.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    // 조건: 왼쪽으로 50px 이상 이동
    if (deltaX < -50) {
      closeSidebar();
    }
  }, { passive: true });

  // 설정 메뉴
  document.getElementById('sidebarSettings')?.addEventListener('click', () => {
    closeSidebar();
    document.getElementById('settingsPanel')?.classList.add('open');
  });

  // 앱 정보 메뉴
  document.getElementById('sidebarInfo')?.addEventListener('click', () => {
    closeSidebar();
    alert(`${config.brand.name} v2.0\nPowered by AI Thinking Lab`);
  });

  // ── 마스터 운영실 (관리자 전용) ──────────────────
  if (window.hadState?.isAdmin) {
    const footer = document.querySelector('.sidebar-footer');
    if (footer) {
      const adminItem = document.createElement('div');
      adminItem.className = 'sidebar-footer-item master-admin';
      adminItem.id = 'sidebarAdmin';
      adminItem.innerHTML = '🛡️ 마스터 운영실';
      footer.prepend(adminItem);

      adminItem.addEventListener('click', () => {
        closeSidebar();
        alert('마스터 운영실을 준비 중입니다. (v7.2.0에서 구현 예정)');
        // TODO: 관리자 패널 컴포넌트 호출
      });
    }
  }

  // 활성 항목 표시 함수 (router에서 호출)
  window._hadSetActiveSidebarItem = (moduleId) => {
    nav.querySelectorAll('.sidebar-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.module === moduleId);
    });
  };
}
