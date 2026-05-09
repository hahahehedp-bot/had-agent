
// =============================================
// HAD-Agent — core/components/settings.js
// 설정 및 프로필 팝업 컴포넌트
// =============================================

import { toggleTheme } from '../services/theme.js';
import { updateAppBadge } from '../services/notification.js';

export function initSettings(config) {
  const btnProfile = document.getElementById('btnProfile');
  const settingsPanel = document.getElementById('settingsPanel');
  const closeSettings = document.getElementById('closeSettings');
  const settingsBody = document.getElementById('settingsBody');

  // [v15.8.5] 프로필 버튼 클릭 시 사이드바를 여는 레거시 로직 제거 (드롭다운으로 대체됨)
  // if (btnProfile && settingsPanel) {
  //   btnProfile.addEventListener('click', () => settingsPanel.classList.add('open'));
  // }
  if (closeSettings && settingsPanel) {
    closeSettings.addEventListener('click', () => settingsPanel.classList.remove('open'));
  }

  if (settingsBody) {
    renderSettings(settingsBody, config);
  }
}

function renderSettings(container, config) {
  const optSound = localStorage.getItem('noti-sound') !== 'off';
  const optVibe  = localStorage.getItem('noti-vibe') !== 'off';
  const optBadge = localStorage.getItem('noti-badge') !== 'off';

  // 현재 사용자 정보 (나중에 auth 모듈에서 가져와야 함)
  const user = {
    name: "유여름",
    email: "admin@owner.com"
  };

  container.innerHTML = `
    <div class="settings-profile-header">
      <div class="settings-avatar">👤</div>
      <div class="settings-user-info">
        <div class="user-name">${user.name} ${config.agent.userLabel}</div>
        <div class="user-email">${user.email}</div>
      </div>
    </div>
    
    <div class="settings-options">
      <div class="settings-item">👤 내 프로필 수정</div>
      <div id="btnToggleTheme" class="settings-item">🎨 테마 전환 (Dark/Light)</div>
      <div id="btnHardRefresh" class="settings-item highlight">🔄 최신 업데이트 받기</div>
      
      <div class="settings-divider">🔔 알림 상세 설정</div>
      <div id="btnOptSound" class="settings-sub-item">${optSound ? '🔊 소리 (ON)' : '🔈 소리 (OFF)'}</div>
      <div id="btnOptVibe" class="settings-sub-item">${optVibe ? '📳 진동 (ON)' : '📴 진동 (OFF)'}</div>
      <div id="btnOptBadge" class="settings-sub-item">${optBadge ? '🔴 앱 배지 숫자 (ON)' : '⭕ 앱 배지 숫자 (OFF)'}</div>

      <div class="settings-logout">🚪 로그아웃</div>
    </div>

    <div class="settings-footer">
      <p>${config.pwa.shortName} v2.0</p>
      <p>Powered by ${config.brand.name}</p>
    </div>
  `;

  // 이벤트 바인딩
  document.getElementById('btnToggleTheme')?.addEventListener('click', () => {
    toggleTheme();
  });

  document.getElementById('btnHardRefresh')?.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('cb', Date.now());
    window.location.replace(url.toString());
  });

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
