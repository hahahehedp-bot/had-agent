// =============================================
// HAD-Agent — core/auth.js
// 모듈화된 인증 관리자 (v13.0.0 Cleanup)
// =============================================

import config from '../client/config.js';

export async function initAuth() {
  const authCfg = config.auth;
  
  if (!authCfg || authCfg.type === 'none' || authCfg.required === false) {
    return true; 
  }

  if (authCfg.type === 'google') {
    return new Promise((resolve) => {
      const token = localStorage.getItem('had_agent_token');
      if (token) {
        // [v13.0.0] Registry에서 이미 체크했으므로 여기선 세션 유지 확인만
        return resolve(true);
      }

      const overlay = document.createElement('div');
      overlay.className = 'login-overlay';
      overlay.id = 'loginOverlay';
      overlay.innerHTML = `
        <div class="login-box">
          <div id="loginLogoWrap" style="margin-bottom: 20px;">
            ${config.brand.logo ? `<img src="${config.brand.logo}" alt="로고" style="width:80px;height:80px;margin-bottom:10px;">` : ''}
          </div>
          <h2 style="margin-bottom: 10px; color: var(--text-primary); font-family: 'Outfit', sans-serif;">Welcome to ${config.brand.name}</h2>
          <p style="margin-bottom: 30px; font-size: 14px; color: var(--text-secondary);">서비스를 이용하려면 구글 계정으로 로그인하세요.</p>
          
          <div id="g_id_onload"
               data-client_id="${authCfg.clientId}"
               data-context="signin"
               data-ux_mode="popup"
               data-callback="handleCredentialResponse"
               data-auto_prompt="false">
          </div>
          <div class="g_id_signin" data-type="standard" data-size="large" data-theme="outline" data-text="signin_with" data-shape="rectangular" data-logo_alignment="left"></div>
          
          ${authCfg.allowBypass ? `
          <button id="btnDevBypass" style="margin-top:20px; padding:10px 20px; border-radius:8px; border:1px solid var(--border); background:var(--bg); color:var(--text-secondary); font-size:12px; cursor:pointer;">
            [개발자 전용] 로그인 없이 앱 들어가기
          </button>` : ''}
        </div>
      `;
      document.body.appendChild(overlay);

      window.handleCredentialResponse = (response) => {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const userEmail = payload.email;

        // 권한 체크 및 상태 동기화
        const isAdmin = authCfg.adminEmails?.includes(userEmail);
        window.hadState.isAdmin = isAdmin;

        localStorage.setItem('had_agent_token', response.credential);
        localStorage.setItem('had_agent_email', userEmail);
        overlay.remove();
        resolve(true);
      };

      document.getElementById('btnDevBypass')?.addEventListener('click', () => {
        localStorage.setItem('had_agent_token', 'dev_bypass_token');
        overlay.remove();
        resolve(true);
      });

      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });
  }

  return true;
}

export function logout() {
  localStorage.removeItem('had_agent_token');
  localStorage.removeItem('had_agent_email');
  window.location.reload();
}
