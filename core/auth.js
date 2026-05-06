// =============================================
// HAD-Agent — core/auth.js
// 모듈화된 인증 관리자 (Google, None 등 지원)
// =============================================

import config from '../client/config.js';

export async function initAuth() {
  const authCfg = config.auth;
  
  // 1. 인증이 필요 없는 경우 (마케팅용 범용 앱 등) 즉시 통과
  if (!authCfg || authCfg.type === 'none' || authCfg.required === false) {
    return true; 
  }

  // 2. Google OAuth 2.0 인증 모듈
  if (authCfg.type === 'google') {
    return new Promise((resolve) => {
      // 이미 로그인 상태인지 확인 (토큰 유무)
      const token = localStorage.getItem('had_agent_token');
      if (token) {
        return resolve(true); // 이미 로그인됨 -> 앱 실행 계속
      }

      // 로그인 오버레이 UI 동적 생성
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
          
          <!-- 구글 표준 로그인 버튼 설정 -->
          <div id="g_id_onload"
               data-client_id="${authCfg.clientId}"
               data-context="signin"
               data-ux_mode="popup"
               data-callback="handleCredentialResponse"
               data-auto_prompt="false">
          </div>
          <div class="g_id_signin" 
               data-type="standard" 
               data-size="large" 
               data-theme="outline" 
               data-text="signin_with" 
               data-shape="rectangular" 
               data-logo_alignment="left">
          </div>
          
          <!-- 개발자용 우회 버튼 (로컬 테스트 시 유용) -->
          <button id="btnDevBypass" style="margin-top:20px; padding:10px 20px; border-radius:8px; border:1px solid var(--border); background:var(--bg); color:var(--text-secondary); font-size:12px; cursor:pointer;">
            [개발자 전용] 로그인 없이 앱 들어가기
          </button>
        </div>
      `;
      document.body.appendChild(overlay);

      // 구글 SDK 콜백 함수 전역 등록
      window.handleCredentialResponse = (response) => {
        console.log("[Auth] Google Login Success");
        // 토큰 저장 (이후 새로고침 시 이 토큰을 읽고 자동 통과)
        localStorage.setItem('had_agent_token', response.credential);
        overlay.remove(); // UI에서 오버레이 제거
        resolve(true); // 앱 초기화 로직으로 복귀
      };

      // 우회 버튼 이벤트
      document.getElementById('btnDevBypass').addEventListener('click', () => {
        console.log("[Auth] Developer Bypass Triggered");
        localStorage.setItem('had_agent_token', 'dev_bypass_token');
        overlay.remove();
        resolve(true);
      });

      // 구글 SDK 스크립트 동적 로드 (DOM에 오버레이가 생성된 후 로드해야 함)
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });
  }

  // 알 수 없는 auth type인 경우 일단 통과
  return true;
}

// ── 로그아웃 함수 ──
export function logout() {
  localStorage.removeItem('had_agent_token');
  window.location.reload(); // 새로고침하여 인증 모듈을 처음부터 다시 태움
}
