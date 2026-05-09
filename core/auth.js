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

      window.handleCredentialResponse = async (response) => {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const userEmail = payload.email;
        
        // [v15.4.0] 1. 드라이브 서비스 초기화
        import('./services/drive.js').then(async ({ Drive }) => {
          await Drive.init(response.credential);
          
          // [v15.4.0] 2. 가입 명부 확인
          const registry = await Drive.getCompanyFile(config.drive.paths.memberDirectory || 'System/Config/member_registry.json');
          const member = registry?.members?.find(m => m.email === userEmail);

          if (member) {
            // 이미 가입된 회원 -> 바로 입장
            window.hadState.user = { ...member, email: userEmail };
            localStorage.setItem('had_agent_token', response.credential);
            localStorage.setItem('had_agent_email', userEmail);
            overlay.remove();
            resolve(true);
          } else {
            // 미가입 회원 -> 2단계 본인 확인 UI 노출
            renderOnboardingUI(overlay, userEmail, Drive, resolve, response.credential);
          }
        });
      };

      function renderOnboardingUI(overlay, email, Drive, resolve, credential) {
        // [v15.5.0] Stage 1: 기본 정보 입력
        overlay.innerHTML = `
          <div class="login-box" id="onboardingBox" style="max-width: 400px;">
            <h2 style="margin-bottom: 10px; color: var(--text-primary);">Membership Check</h2>
            <p style="margin-bottom: 25px; font-size: 14px; color: var(--text-secondary);">사번과 성함을 입력해 주세요.</p>
            
            <input type="text" id="regName" placeholder="성함" style="width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-secondary);">
            <input type="text" id="regId" placeholder="사번/회원번호" style="width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-secondary);">
            
            <button id="btnCheckStaff" class="primary-btn" style="width: 100%; padding: 14px; border-radius: 8px; background: var(--primary); color: white; border: none; font-weight: 600; cursor: pointer;">
              본인 정보 확인
            </button>
            <div style="margin-top: 15px; border-top: 1px solid var(--border); padding-top: 15px;">
              <button id="btnSkipAuth" style="width: 100%; background: none; border: none; color: var(--text-secondary); font-size: 13px; cursor: pointer; text-decoration: underline;">
                인증 없이 일반 회원으로 입장하기
              </button>
            </div>
            <p id="regError" style="margin-top: 15px; color: #ef4444; font-size: 13px; display: none;"></p>
          </div>
        `;

        const setRoleAndEnter = (role, name) => {
          window.hadState.user = { email, role, name: name || 'GUEST' };
          localStorage.setItem('had_agent_token', credential);
          localStorage.setItem('had_agent_user', JSON.stringify(window.hadState.user));
          overlay.remove();
          resolve(true);
        };

        // 일반 회원으로 입장
        document.getElementById('btnSkipAuth').onclick = () => setRoleAndEnter('소비자', 'GUEST');

        document.getElementById('btnCheckStaff').onclick = async () => {
          const name = document.getElementById('regName').value;
          const empId = document.getElementById('regId').value;
          const errorMsg = document.getElementById('regError');

          try {
            // [v15.5.0] CSV 사원 명부 대조
            const staffList = await Drive.getCompanyCSV('System/Config/company_staff_master.csv');
            const staff = staffList?.find(s => s['사번'] === empId && s['이름'] === name);

            if (staff) {
              // [Stage 2] 카카오 인증 대기 UI로 전환
              renderMfaUI(overlay, staff, setRoleAndEnter);
            } else {
              errorMsg.innerText = "정보가 일치하지 않습니다. 다시 확인해 주세요.";
              errorMsg.style.display = "block";
            }
          } catch (e) {
            errorMsg.innerText = "데이터 로드 중 오류가 발생했습니다.";
            errorMsg.style.display = "block";
          }
        };
      }

      function renderMfaUI(overlay, staff, callback) {
        const maskedPhone = staff['전화번호'].replace(/(\d{3})-(\d{4})-\d{4}/, '$1-****-$3');
        const box = document.getElementById('onboardingBox');
        
        box.innerHTML = `
          <h2 style="margin-bottom: 10px; color: var(--text-primary);">Kakao Verification</h2>
          <p style="margin-bottom: 25px; font-size: 14px; color: var(--text-secondary);">
            등록된 번호로 인증번호를 전송합니다.<br><b>${maskedPhone}</b>
          </p>
          
          <div id="mfaInputArea" style="display: none;">
            <input type="text" id="mfaCode" placeholder="인증번호 6자리" maxlength="6" 
                   style="width: 100%; padding: 12px; margin-bottom: 15px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-secondary); text-align: center; letter-spacing: 5px; font-size: 20px;">
          </div>

          <button id="btnRequestMfa" class="primary-btn" style="width: 100%; padding: 14px; border-radius: 8px; background: #fee500; color: #191919; border: none; font-weight: 600; cursor: pointer;">
            카카오톡 인증 요청
          </button>
          
          <button id="btnConfirmMfa" class="primary-btn" style="width: 100%; padding: 14px; border-radius: 8px; background: var(--primary); color: white; border: none; font-weight: 600; cursor: pointer; display: none;">
            인증 완료 및 입장
          </button>
          <p id="mfaError" style="margin-top: 15px; color: #ef4444; font-size: 13px; display: none;"></p>
        `;

        document.getElementById('btnRequestMfa').onclick = () => {
          // [SIMULATION] 실제 발송 API 호출 대신 화면 전환
          document.getElementById('btnRequestMfa').style.display = 'none';
          document.getElementById('mfaInputArea').style.display = 'block';
          document.getElementById('btnConfirmMfa').style.display = 'block';
          console.log('[MFA] 시뮬레이션: 인증번호 "123456" 발송됨');
        };

        document.getElementById('btnConfirmMfa').onclick = () => {
          const code = document.getElementById('mfaCode').value;
          if (code === '123456') { // 시뮬레이션 고정 번호
            callback(staff['직급'], staff['이름']);
          } else {
            const error = document.getElementById('mfaError');
            error.innerText = "인증번호가 올바르지 않습니다.";
            error.style.display = 'block';
          }
        };
      }

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
