
// =============================================
// HAD-Agent — core/services/branding.js
// 브랜드 자산 및 PWA 설정 주입 서비스
// =============================================

export function applyBranding(cfg) {
  // 1. 문서 메타데이터
  document.title = cfg.brand.name;
  document.getElementById('metaThemeColor')?.setAttribute('content', cfg.pwa?.themeColor || cfg.brand.primaryColor);
  document.getElementById('metaAppTitle')?.setAttribute('content', cfg.pwa?.shortName || cfg.brand.name);

  // 2. 파비콘 및 앱 아이콘 (Head에 주입)
  injectIcons(cfg);

  // 3. 헤더 및 로고 주입
  injectLogos(cfg);

  // 4. 사이드바 헤더 주입
  const sHeader = document.getElementById('sidebarHeader');
  if (sHeader) {
    sHeader.innerHTML = ''; // 초기화
    if (cfg.brand.logo) {
      sHeader.innerHTML += `<img src="${cfg.brand.logo}" alt="로고" class="sidebar-logo">`;
    }
    sHeader.innerHTML += `<span class="sidebar-brand">${cfg.brand.name}</span>`;
  }

  // 5. manifest 동적 업데이트
  updateManifest(cfg);
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
  if (cfg.brand.icon512) {
    let linkTouch = document.querySelector('link[rel="apple-touch-icon"]');
    if (!linkTouch) {
      linkTouch = document.createElement('link');
      linkTouch.rel = 'apple-touch-icon';
      document.head.appendChild(linkTouch);
    }
    linkTouch.href = cfg.brand.icon512;
  }
}

function injectLogos(cfg) {
  const hWrap = document.getElementById('headerLogoWrap');
  const lWrap = document.getElementById('loginLogoWrap');
  
  if (hWrap) hWrap.innerHTML = '';
  if (lWrap) lWrap.innerHTML = '';

  if (cfg.brand.logo) {
    if (hWrap) hWrap.innerHTML += `<img src="${cfg.brand.logo}" alt="로고" class="header-logo">`;
    if (lWrap) lWrap.innerHTML += `<img src="${cfg.brand.logo}" alt="로고" style="width:80px; height:80px; margin-bottom:10px;">`;
  }
  if (cfg.brand.logoText) {
    if (hWrap) hWrap.innerHTML += `<img src="${cfg.brand.logoText}" alt="브랜드" class="header-logo-text">`;
    if (lWrap) lWrap.innerHTML += `<br><img src="${cfg.brand.logoText}" alt="브랜드" style="height:30px;">`;
  }
}

function updateManifest(cfg) {
  const manifestLink = document.getElementById('manifestLink');
  if (manifestLink && cfg.pwa) {
    const manifest = {
      name: cfg.brand.name,
      short_name: cfg.pwa.shortName || cfg.brand.name,
      theme_color: cfg.pwa.themeColor || cfg.brand.primaryColor,
      background_color: cfg.pwa.backgroundColor || cfg.brand.primaryColor,
      display: 'standalone',
      start_url: './',
      icons: [
        { src: cfg.brand.icon192 || 'client/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: cfg.brand.icon512 || 'client/assets/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    manifestLink.href = URL.createObjectURL(blob);
  }
}
