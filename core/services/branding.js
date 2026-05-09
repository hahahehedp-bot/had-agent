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

  // 3. 헤더 로고 및 고객사명 주입 (Global Title Bar)
  const hWrap = document.getElementById('headerLogoWrap');
  if (hWrap) {
    hWrap.innerHTML = '';
    if (cfg.brand.logo) {
      hWrap.innerHTML += `<img src="${cfg.brand.logo}" alt="로고" class="header-client-logo">`;
    }
    hWrap.innerHTML += `<span class="header-client-name">${cfg.brand.name}</span>`;
  }

  // 4. [v15.8.5] 사이드바 헤더는 순수 메뉴를 위해 비움
  const sHeader = document.getElementById('sidebarHeader');
  if (sHeader) sHeader.remove();

  // 5. 에이전트 및 로딩 정보 주입
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
