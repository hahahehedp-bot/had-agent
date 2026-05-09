// =============================================
// HAD-Agent — core/services/drive.js
// [v15.4.0] Drive-as-CMS: 멀티 루트 드라이브 브릿지
// =============================================

import config from '../../client/config.js';

class DriveService {
  constructor() {
    this.isInitialized = false;
    this.accessToken = null;
    this.companyRootId = config.drive.rootFolderId;
    this.userRootId = null; // 개인 드라이브 루트 (초기화 시 검색/생성됨)
  }

  /**
   * 드라이브 서비스 초기화 (GAPI 로드 및 인증 연동)
   */
  async init(accessToken) {
    if (this.isInitialized) return;
    this.accessToken = accessToken;

    return new Promise((resolve, reject) => {
      if (typeof gapi === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => this._loadGapi(resolve, reject);
        script.onerror = reject;
        document.head.appendChild(script);
      } else {
        this._loadGapi(resolve, reject);
      }
    });
  }

  _loadGapi(resolve, reject) {
    gapi.load('client', async () => {
      try {
        await gapi.client.init({});
        await gapi.client.load('drive', 'v3');
        gapi.client.setToken({ access_token: this.accessToken });
        
        console.log('[DRIVE] GAPI Drive v3 Loaded.');
        this.isInitialized = true;
        resolve(true);
      } catch (e) {
        console.error('[DRIVE] GAPI 초기화 실패:', e);
        reject(e);
      }
    });
  }

  /**
   * 회사 드라이브에서 파일 읽기 (명부 등)
   */
  async getCompanyFile(path) {
    return this._getFileByPath(this.companyRootId, path);
  }

  /**
   * 개인 드라이브에서 파일 읽기/쓰기 (세션 등)
   */
  async getUserFile(path) {
    if (!this.userRootId) {
      await this._ensureUserRoot();
    }
    return this._getFileByPath(this.userRootId, path);
  }

  /**
   * 개인 드라이브의 루트 폴더(HAD-Agent) 확보 및 생성
   */
  async _ensureUserRoot() {
    try {
      const response = await gapi.client.drive.files.list({
        q: "name = 'HAD-Agent' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.result.files.length > 0) {
        this.userRootId = response.result.files[0].id;
        console.log('[DRIVE] User Root Found:', this.userRootId);
      } else {
        const createResp = await gapi.client.drive.files.create({
          resource: {
            name: 'HAD-Agent',
            mimeType: 'application/vnd.google-apps.folder'
          },
          fields: 'id'
        });
        this.userRootId = createResp.result.id;
        console.log('[DRIVE] User Root Created:', this.userRootId);
      }
    } catch (e) {
      console.error('[DRIVE] User Root 확보 실패:', e);
      throw e;
    }
  }

  /**
   * 회사 드라이브에서 CSV 읽기 및 파싱
   */
  async getCompanyCSV(path) {
    const csvData = await this._getFileByPath(this.companyRootId, path);
    if (!csvData) return null;
    
    // 단순 CSV 파서 구현 (쉼표 기준)
    const lines = csvData.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
  }

  /**
   * 경로 기반 파일 검색 및 내용 반환
   * @param {string} rootId 루트 폴더 ID
   * @param {string} path 상대 경로 (예: "System/Config/member_directory.json")
   */
  async _getFileByPath(rootId, path) {
    // [TODO] 폴더 트리를 따라가며 최종 파일 ID를 찾는 로직 구현 예정
    // 현재는 단순화를 위해 파일명으로 검색하는 예시로 작성
    const fileName = path.split('/').pop();
    try {
      const response = await gapi.client.drive.files.list({
        q: `name = '${fileName}' and trashed = false`, // 실제로는 부모 ID(rootId) 체크 로직 추가 필요
        fields: 'files(id, name)',
      });

      if (response.result.files.length > 0) {
        const fileId = response.result.files[0].id;
        const contentResp = await gapi.client.drive.files.get({
          fileId: fileId,
          alt: 'media'
        });
        return contentResp.result;
      }
      return null;
    } catch (e) {
      console.warn(`[DRIVE] 파일 로드 실패: ${path}`, e);
      return null;
    }
  }
}

export const Drive = new DriveService();
