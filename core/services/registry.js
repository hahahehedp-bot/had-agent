// =============================================
// HAD-Agent — core/services/registry.js
// 중앙 레지스트리 (정적 + 동적 설정 관리)
// =============================================

import staticConfig from '../../client/config.js';

class RegistryService {
  constructor() {
    this.VERSION = '16.0.0-alpha.1'; // [v16.0.0 Alpha] Obsidian-Style Sliding Reboot
    this.config = { ...staticConfig };
    this.dynamicConfig = {};
    this.permissions = null; // 등급별 권한 데이터
    this.listeners = [];
    
    window.hadState = {
      version: this.VERSION,
      currentModule: null,
      user: null, // { email, role, name, employee_id, ... }
      contextData: null
    };
  }

  // ── [v15.3.0] 상태 관리 인터페이스 (Capsule) ──
  getState(key) { return key ? window.hadState[key] : window.hadState; }
  
  updateState(delta) {
    window.hadState = { ...window.hadState, ...delta };
  }

  /**
   * 초기화: 드라이브에서 설정을 가져와 머지합니다.
   */
  async init() {
    console.log(`[Registry] v${this.VERSION} 초기화 시작...`);
    try {
      const saved = localStorage.getItem('had_dynamic_config');
      if (saved) {
        this.dynamicConfig = JSON.parse(saved);
      }
      
      // 사용자 세션 복구
      const user = localStorage.getItem('had_agent_user');
      if (user) {
        window.hadState.user = JSON.parse(user);
      }

      this.mergeConfig();
    } catch (e) {
      console.warn('[Registry] 초기화 실패:', e);
    }
  }

  /**
   * 드라이브의 권한 규정(grade_permissions.json)과 동기화하여 UI 필터링
   */
  async syncPermissions(Drive) {
    try {
      const perms = await Drive.getCompanyFile('System/Config/grade_permissions.json');
      if (perms) {
        this.permissions = perms.permissions;
        this.mergeConfig();
        console.log('[Registry] 권한 동기화 완료:', window.hadState.user?.role);
      }
    } catch (e) {
      console.error('[Registry] 권한 동기화 실패:', e);
    }
  }

  /**
   * 정적 설정과 동적 설정, 그리고 권한을 합칩니다.
   */
  mergeConfig() {
    let finalModules = [...staticConfig.modules];

    // 1. 권한 기반 필터링 (RBAC)
    const userRole = window.hadState.user?.role;
    if (this.permissions && userRole && this.permissions[userRole]) {
      const allowed = this.permissions[userRole].allowed_modules;
      finalModules = finalModules.filter(m => allowed.includes(m.id) || m.hidden);
    }

    // 2. 동적 온오프 상태 업데이트
    if (this.dynamicConfig.modules) {
      finalModules = finalModules.map(mod => {
        const dynamicMod = this.dynamicConfig.modules.find(d => d.id === mod.id);
        return dynamicMod ? { ...mod, enabled: dynamicMod.enabled } : mod;
      });
    }

    this.config.modules = finalModules;

    // 3. 브랜드/에이전트 정보 업데이트
    if (this.dynamicConfig.brand) {
      this.config.brand = { ...this.config.brand, ...this.dynamicConfig.brand };
    }
    if (this.dynamicConfig.agent) {
      this.config.agent = { ...this.config.agent, ...this.dynamicConfig.agent };
    }

    this.notify();
  }

  getConfig() {
    return this.config;
  }

  getVersion() {
    return this.VERSION;
  }

  /**
   * 설정을 업데이트하고 저장합니다.
   */
  async updateConfig(delta) {
    this.dynamicConfig = { ...this.dynamicConfig, ...delta };
    localStorage.setItem('had_dynamic_config', JSON.stringify(this.dynamicConfig));
    this.mergeConfig();
    console.log('[Registry] 설정 업데이트 완료:', delta);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.config));
    window.dispatchEvent(new CustomEvent('hadConfigChanged', { detail: this.config }));
  }
}

const Registry = new RegistryService();
window.Registry = Registry; 

export { Registry };
