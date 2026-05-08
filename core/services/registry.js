// =============================================
// HAD-Agent — core/services/registry.js
// 중앙 레지스트리 (정적 + 동적 설정 관리)
// =============================================

import staticConfig from '../../client/config.js';

class RegistryService {
  constructor() {
    this.config = { ...staticConfig };
    this.dynamicConfig = {};
    this.listeners = [];
  }

  /**
   * 초기화: 드라이브에서 동적 설정을 가져와 머지합니다.
   */
  async init() {
    console.log('[Registry] 초기화 시작...');
    try {
      const saved = localStorage.getItem('had_dynamic_config');
      if (saved) {
        this.dynamicConfig = JSON.parse(saved);
        this.mergeConfig();
      }
      console.log('[Registry] 최종 활성 모듈:', this.config.modules.filter(m => m.enabled).map(m => m.id));
    } catch (e) {
      console.warn('[Registry] 동적 설정 로드 실패:', e);
    }
  }

  /**
   * 정적 설정과 동적 설정을 합칩니다. (동적이 우선순위 높음)
   */
  mergeConfig() {
    // 깊은 복사 혹은 필요한 영역만 업데이트
    // 1. 모듈 온오프 상태 업데이트
    if (this.dynamicConfig.modules) {
      this.config.modules = this.config.modules.map(mod => {
        const dynamicMod = this.dynamicConfig.modules.find(d => d.id === mod.id);
        return dynamicMod ? { ...mod, enabled: dynamicMod.enabled } : mod;
      });
    }

    // 2. 브랜드/에이전트 정보 업데이트
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

  /**
   * 설정을 업데이트하고 저장합니다.
   */
  async updateConfig(delta) {
    // 델타 값을 dynamicConfig에 머지
    this.dynamicConfig = { ...this.dynamicConfig, ...delta };
    
    // 로컬 스토리지 저장 (나중엔 Cloud Function 호출)
    localStorage.setItem('had_dynamic_config', JSON.stringify(this.dynamicConfig));
    
    this.mergeConfig();
    console.log('[Registry] 설정 업데이트 완료:', delta);
  }

  /**
   * 설정 변경 감지 리스너 등록
   */
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

export const Registry = new RegistryService();
