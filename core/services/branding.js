// =============================================
// HAD-Agent — core/services/branding.js
// 브랜드 자산 및 PWA 설정 주입 서비스
// [v13.0.0] Cleanup: 문자열 주입 추가
// =============================================

export function applyBranding(cfg) {
  // 1. 문서 메타데이터
  document.title = cfg.brand.name;
  document.getElementById('metaThemeColor')?.setAttribute('content', cfg.pwa?.themeColor || cfg.brand.primaryColor);
  document.getElementById('metaAppTitle')?.setAttribute('content', cfg.pwa?.shortName || cfg.brand.name);

  // 2. 파비콘 및 앱 아이콘
  injectIcons(cfg);

  // 3. 헤더 및 로고 주입
  injectLogos(cfg);

  // 4. 사이드바 헤더 주입
  const sHeader = document.getElementById('sidebarHeader');
  if (sHeader) {
    sHeader.innerHTML = '';
    if (cfg.brand.logo) {
      sHeader.innerHTML += `<img src="${cfg.brand.logo}" alt="로고" class="sidebar-logo">`;
    }
    sHeader.innerHTML += `<span class="sidebar-brand">${cfg.brand.name}</span>`;
  }

  // 5. [v13.0.0] 에이전트 정보 주입 (index.html 연동)
  const drawerTitle = document.getElementById('drawerTitle');
  if (drawerTitle) drawerTitle.textContent = cfg.agent?.name || '에이전트';

  const drawerWelcome = document.getElementById('drawerWelcomeMsg');
  if (drawerWelcome) drawerWelcome.textContent = cfg.agent?.welcomeMsg || '무엇을 도와드릴까요?';

  const loadingText = document.getElementById('loadingText');
  if (loadingText) loadingText.textContent = `${cfg.brand.name} 로딩 중...`;
}

function injectIcons(cfg) {
  if (cfg.brand.icon192) {
    let linkIcon = document.querySelector('link[rel="icon"]');
    if (!linkIcon) {
      linkIcon = document.createElement('link');
      linkIcon.rel = 'icon';
      document.head.appendChild(linkIcon);
    }
    linkIcon.href = cfg.brand.icon192;
  }
}

function injectLogos(cfg) {
  const hWrap = document.getElementById('headerLogoWrap');
  if (hWrap) {
    hWrap.innerHTML = '';
    if (cfg.brand.logo) hWrap.innerHTML += `<img src="${cfg.brand.logo}" alt="로고" class="header-logo">`;
    if (cfg.brand.logoText) hWrap.innerHTML += `<img src="${cfg.brand.logoText}" alt="브랜드" class="header-logo-text">`;
  }
}
