// =============================================
// HAD-Agent — app.js (Core Engine)
// config 읽기 → 테마 적용 → 모듈 로드 → 라우팅
// =============================================

import config from '../client/config.js';
import { initSidebar } from './sidebar.js';
import { initTabBar } from './tabbar.js';
import { initRouter, navigateTo } from './router.js';

// ── 테마 모듈 로드 및 브랜딩 컬러 주입 ───────────
function applyTheme(cfg) {
  const root = document.documentElement;
  
  // 1. localStorage에서 사용자 설정 테마 확인 (없으면 config 기본값)
  const savedTheme = localStorage.getItem('had-theme');
  const themeMode = savedTheme || cfg.theme?.default || 'modern-light';
  
  // 2. 테마 CSS 모듈 파일 동적 로드
  const themeLink = document.getElementById('themeStylesheet');
  if (themeLink) {
    themeLink.href = `core/themes/${themeMode}.css`;
  }

  // 3. 브랜딩 컬러 주입 (테마 위에 오버레이)
  if (cfg.brand?.primaryColor) {
    root.style.setProperty('--brand-color', cfg.brand.primaryColor);
  }
}

// ── 브랜딩 주입 (HTML 동적 생성) ────────────────
function applyBranding(cfg) {
  // 1. 문서 메타데이터
  document.title = cfg.brand.name;
  document.getElementById('metaThemeColor')?.setAttribute('content', cfg.pwa?.themeColor || cfg.brand.primaryColor);
  document.getElementById('metaAppTitle')?.setAttribute('content', cfg.pwa?.shortName || cfg.brand.name);

  // 2. 파비콘 및 앱 아이콘 (Head에 주입)
  if (cfg.brand.icon192) {
    const linkIcon = document.createElement('link');
    linkIcon.rel = 'icon';
    linkIcon.type = 'image/png';
    linkIcon.href = cfg.brand.icon192;
    document.head.appendChild(linkIcon);
  }
  if (cfg.brand.icon512) {
    const linkTouch = document.createElement('link');
    linkTouch.rel = 'apple-touch-icon';
    linkTouch.href = cfg.brand.icon512;
    document.head.appendChild(linkTouch);
  }

  // 3. 헤더 및 로그인 화면 로고 주입
  const hWrap = document.getElementById('headerLogoWrap');
  const lWrap = document.getElementById('loginLogoWrap');
  if (cfg.brand.logo) {
    if (hWrap) hWrap.innerHTML += `<img src="\${cfg.brand.logo}" alt="로고" class="header-logo">`;
    if (lWrap) lWrap.innerHTML += `<img src="\${cfg.brand.logo}" alt="로고" style="width:80px; height:80px; margin-bottom:10px;">`;
  }
  if (cfg.brand.logoText) {
    if (hWrap) hWrap.innerHTML += `<img src="\${cfg.brand.logoText}" alt="브랜드" class="header-logo-text">`;
    if (lWrap) lWrap.innerHTML += `<br><img src="\${cfg.brand.logoText}" alt="브랜드" style="height:30px;">`;
  }

  // 4. 사이드바 헤더 주입
  const sHeader = document.getElementById('sidebarHeader');
  if (sHeader) {
    if (cfg.brand.logo) {
      sHeader.innerHTML += `<img src="\${cfg.brand.logo}" alt="로고" class="sidebar-logo">`;
    }
    sHeader.innerHTML += `<span class="sidebar-brand">\${cfg.brand.name}</span>`;
  }

  // 5. manifest 동적 업데이트
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

// ── 🔐 구글 로그인 및 인증 로직 ────────────────
// 전역 공간에 콜백 함수 노출 (Google SDK가 호출함)
window.handleCredentialResponse = (response) => {
  console.log("Encoded JWT ID token: " + response.credential);
  // 원래는 여기서 토큰을 백엔드로 보내 오너 ID와 매핑/검증해야 합니다.
  // 성공 시 오버레이 숨김
  document.getElementById('loginOverlay')?.classList.add('hidden');
};

// 개발자 테스트용 우회 버튼
document.getElementById('btnDevBypass')?.addEventListener('click', () => {
  document.getElementById('loginOverlay')?.classList.add('hidden');
});

// ── 활성 모듈 목록 ───────────────────────────
function getActiveModules(cfg) {
  return cfg.modules.filter(m => m.enabled);
}

// ── 모듈 동적 import ─────────────────────────
async function loadModule(moduleId) {
  try {
    const mod = await import(`../modules/${moduleId}/${moduleId}.js`);
    return mod.default;
  } catch (e) {
    console.warn(`[HAD] 모듈 로드 실패: ${moduleId}`, e);
    return null;
  }
}

// ── 앱 초기화 ────────────────────────────────
async function init() {
  try {
    // 1. 테마 + 브랜딩
    applyTheme(config);
    applyBranding(config);

    // 2. 활성 모듈 로드
    const activeModules = getActiveModules(config);
    const loadedModules = {};

    await Promise.all(activeModules.map(async (modCfg) => {
      // 1. Iframe 기반 타사 서비스 연동 모듈
      if (modCfg.type === 'iframe') {
        const iframeMod = {
          render: () => \`<iframe src="\${modCfg.url}" style="width:100%; height:100%; border:none; display:block; background:#fff;"></iframe>\`,
          afterRender: () => {}
        };
        loadedModules[modCfg.id] = { ...iframeMod, ...modCfg };
      } 
      // 2. 내부 네이티브 모듈
      else {
        const mod = await loadModule(modCfg.id);
        if (mod) {
          loadedModules[modCfg.id] = { ...mod, ...modCfg };
          if (mod.init) await mod.init(config);
        }
      }
    }));

    // 3. 사이드바 + 탭바 초기화
    initSidebar(activeModules, loadedModules, config);
    initTabBar(activeModules, loadedModules);

    // 4. 라우터 초기화
    initRouter(loadedModules, config);

    // 5. 첫 화면으로
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);

    // 6. 로딩 화면 제거
    document.getElementById('loadingScreen')?.remove();

    // 7. Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  } catch (e) {
    console.error('[HAD] 앱 초기화 실패:', e);
    const ls = document.getElementById('loadingScreen');
    if (ls) {
      ls.innerHTML = `
        <div style="color:white; text-align:center; padding:20px;">
          <p>앱을 불러오는 중 오류가 발생했습니다.</p>
          <p style="font-size:12px; opacity:0.8;">${e.message}</p>
        </div>
      `;
    }
  }
}

// ── 프로필 및 설정 메뉴 (우측 팝업) ───────────────
document.getElementById('btnProfile')?.addEventListener('click', () => {
  document.getElementById('settingsPanel')?.classList.add('open');
});
document.getElementById('closeSettings')?.addEventListener('click', () => {
  document.getElementById('settingsPanel')?.classList.remove('open');
});

// 프로필 메뉴 내용 채우기
const settingsBody = document.getElementById('settingsBody');
if (settingsBody) {
  // 알림 상세 설정 상태 불러오기
  const optSound = localStorage.getItem('noti-sound') !== 'off';
  const optVibe  = localStorage.getItem('noti-vibe') !== 'off';
  const optBadge = localStorage.getItem('noti-badge') !== 'off';

  settingsBody.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px; padding-bottom:20px; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
      <div style="width:48px; height:48px; border-radius:50%; background:var(--bg); display:flex; align-items:center; justify-content:center; font-size:24px;">👤</div>
      <div>
        <div style="font-weight:600; color:var(--text-primary);">유여름 리더님</div>
        <div style="font-size:12px; color:var(--text-secondary);">admin@owner.com</div>
      </div>
    </div>
    
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="cursor:pointer; color:var(--text-primary);">👤 내 프로필 수정</div>
      <div id="btnToggleTheme" style="cursor:pointer; color:var(--text-primary);">🎨 테마 전환 (Dark/Light)</div>
      <div id="btnHardRefresh" style="cursor:pointer; color:var(--brand-color); font-weight:600;">🔄 최신 업데이트 받기 (캐시 비우기)</div>
      
      <!-- 세분화된 알림 설정 -->
      <div style="color:var(--text-primary); margin-top:10px; border-top:1px dashed var(--border-color); padding-top:10px;">
        <div style="font-size:12px; font-weight:600; margin-bottom:10px; color:var(--text-secondary);">🔔 알림 상세 설정</div>
        <div id="btnOptSound" style="cursor:pointer; padding:4px 0; font-size:14px;">\${optSound ? '🔊 소리 (ON)' : '🔈 소리 (OFF)'}</div>
        <div id="btnOptVibe" style="cursor:pointer; padding:4px 0; font-size:14px;">\${optVibe ? '📳 진동 (ON)' : '📴 진동 (OFF)'}</div>
        <div id="btnOptBadge" style="cursor:pointer; padding:4px 0; font-size:14px;">\${optBadge ? '🔴 앱 배지 숫자 (ON)' : '⭕ 앱 배지 숫자 (OFF)'}</div>
      </div>

      <div style="cursor:pointer; color:red; margin-top:20px; border-top:1px solid var(--border-color); padding-top:16px;">🚪 로그아웃</div>
    </div>

    <div style="margin-top: 40px; font-size: 12px; color: var(--text-secondary);">
      <p>HAD-Agent v2.0</p>
      <p>Powered by AI Thinking Lab</p>
    </div>
  `;

  // 테마 토글 버튼 동작
  document.getElementById('btnToggleTheme')?.addEventListener('click', () => {
    const currentTheme = document.getElementById('themeStylesheet').href;
    const isDark = currentTheme.includes('glass-dark');
    const newTheme = isDark ? 'modern-light' : 'glass-dark';
    document.getElementById('themeStylesheet').href = \`core/themes/\${newTheme}.css\`;
    localStorage.setItem('had-theme', newTheme);
  });

  // 강제 새로고침(캐시 우회) 버튼 동작
  document.getElementById('btnHardRefresh')?.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('cb', Date.now());
    window.location.replace(url.toString());
  });

  // 알림 상세 옵션 토글 로직
  const bindToggle = (id, key, textOn, textOff) => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      const isOn = localStorage.getItem(key) !== 'off';
      if (isOn) {
        localStorage.setItem(key, 'off');
        e.target.textContent = textOff;
        if (key === 'noti-badge') updateAppBadge(0);
      } else {
        localStorage.setItem(key, 'on');
        e.target.textContent = textOn;
        if ('Notification' in window && Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
      }
    });
  };

  bindToggle('btnOptSound', 'noti-sound', '🔊 소리 (ON)', '🔈 소리 (OFF)');
  bindToggle('btnOptVibe',  'noti-vibe',  '📳 진동 (ON)', '📴 진동 (OFF)');
  bindToggle('btnOptBadge', 'noti-badge', '🔴 앱 배지 숫자 (ON)', '⭕ 앱 배지 숫자 (OFF)');
}

// ── App Badging API (앱 아이콘 숫자 표시) ───────
export function updateAppBadge(count) {
  if (localStorage.getItem('noti-badge') === 'off') return;
  if ('setAppBadge' in navigator) {
    if (count > 0) navigator.setAppBadge(count).catch(console.error);
    else navigator.clearAppBadge().catch(console.error);
  }
}

// ── 모바일 당겨서 새로고침 (Pull-to-Refresh) ─────────────────
function setupPullToRefresh() {
  const main = document.getElementById('appMain');
  if (!main) return;

  let startY = 0;
  let isPulling = false;
  let ptrEl = null;

  main.addEventListener('touchstart', (e) => {
    // 스크롤이 맨 위일 때만 작동 (여유값 5px)
    if (main.scrollTop <= 5) {
      startY = e.touches[0].clientY;
      isPulling = true;
    }
  }, { passive: true });

  main.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const y = e.touches[0].clientY;
    const diff = y - startY;

    // 아래로 당길 때만 작동
    if (diff > 0 && main.scrollTop <= 5) {
      if (!ptrEl) {
        ptrEl = document.createElement('div');
        ptrEl.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:60px; display:flex; align-items:center; justify-content:center; font-size:14px; color:var(--text-secondary); font-weight:600; z-index:99; background:transparent; pointer-events:none;';
        main.insertBefore(ptrEl, main.firstChild);
      }
      
      const pullDistance = Math.min(diff / 2.5, 80);
      ptrEl.innerHTML = diff > 150 ? '🔄 손을 놓으면 새로고침' : '⬇️ 당겨서 새로고침...';
      ptrEl.style.transform = `translateY(\${pullDistance}px)`;
      
      // 모바일 기본 스크롤 동작 방지 (Pull-to-refresh 전용)
      if (e.cancelable) e.preventDefault();
    } else {
      isPulling = false;
      if (ptrEl) { ptrEl.remove(); ptrEl = null; }
    }
  }, { passive: false });

  main.addEventListener('touchend', () => {
    if (!isPulling) return;
    isPulling = false;
    
    if (ptrEl) {
      if (ptrEl.innerHTML.includes('손을 놓으면')) {
        ptrEl.innerHTML = '⏳ 1초 뒤 새로고침...';
        // 캐시 우회를 위해 URL에 타임스탬프를 강제로 붙여서 이동
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.set('cb', Date.now());
          window.location.href = url.toString();
        }, 500);
      } else {
        ptrEl.remove();
        ptrEl = null;
      }
    }
  });
}

// ── 통합 알림 실행 함수 (소리, 진동, 배지 제어) ────
export function triggerNotification(title, options = {}) {
  // 1. 소리
  if (localStorage.getItem('noti-sound') !== 'off') {
    const audio = new Audio('client/assets/alert.mp3'); // 알림음 파일 필요
    audio.play().catch(e => console.log('Audio play ignored by browser', e));
  }
  
  // 2. 진동 (짧게 두 번 징- 징-)
  if (localStorage.getItem('noti-vibe') !== 'off') {
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
  }
  
  // 3. 브라우저/푸시 알림 팝업
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: options.body || '',
      icon: 'client/assets/icon-192.png',
      badge: 'client/assets/icon-192.png',
      vibrate: localStorage.getItem('noti-vibe') !== 'off' ? [200, 100, 200] : []
    });
  }
}

// ── 실행 ─────────────────────────────────────
init().catch(console.error);
