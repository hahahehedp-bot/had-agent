// =============================================
// HAD-Agent — modules/resources/resources.js
// 자료실 모듈 (Cloud Function으로 Drive 폴더 스캔)
// =============================================

export default {
  id: 'resources',

  async init(config) {},

  async render(config) {
    return `
      <link rel="stylesheet" href="modules/resources/resources.css">
      <div class="module-root" style="padding: 20px; padding-bottom: 80px;">
        <div class="section-header">
          <div class="section-title">📂 ${config.modules.find(m=>m.id==='resources')?.label || '자료실'}</div>
          <span class="section-action">↓ 탭하여 저장</span>
        </div>
        <div id="resourcesContainer">
          <div class="empty-state">
            <div class="loading-spinner" style="margin: 0 auto 12px;"></div>
            <p>자료를 불러오는 중...</p>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender(config) {
    const container = document.getElementById('resourcesContainer');
    try {
      // Cloud Function에 Drive 폴더 스캔 요청
      const endpoint = config.agent.endpoint.replace('/osunyi-chat', '/drive-files');
      const res  = await fetch(`${config.agent.endpoint}?action=getFolderFiles&folderId=${config.drive.rootFolderId}`);
      const data = await res.json();

      if (data.status === 'error') throw new Error(data.message);
      if (!data.length) throw new Error('empty');

      container.innerHTML = renderResources(data);

    } catch (err) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <p>등록된 자료가 없습니다.<br>드라이브 자료실 폴더에 파일을 업로드해 주세요.</p>
        </div>`;
    }
  },

  destroy() {}
}

function getMimeLabel(mime) {
  if (!mime) return 'FILE';
  if (mime.includes('pdf'))          return 'PDF';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'PPT';
  if (mime.includes('spreadsheet')  || mime.includes('excel'))      return 'XLS';
  if (mime.includes('document')     || mime.includes('word'))       return 'DOC';
  if (mime.includes('audio'))        return 'AUD';
  if (mime.includes('video'))        return 'VID';
  if (mime.includes('image'))        return 'IMG';
  return 'FILE';
}

function getBadgeClass(label) {
  const map = { PDF:'badge-pdf', PPT:'badge-ppt', XLS:'badge-xls', DOC:'badge-doc', AUD:'badge-aud', VID:'badge-vid', IMG:'badge-img' };
  return map[label] || 'badge-file';
}

function renderResources(categories) {
  return categories.map(cat => `
    <div class="resource-category">
      <div class="category-header">
        <span class="category-name">📁 ${cat.category}</span>
      </div>
      <div class="card" style="padding: 0 16px;">
        ${cat.files.map(f => {
          const label = getMimeLabel(f.mimeType);
          const badge = getBadgeClass(label);
          return `
            <div class="file-item" onclick="window.open('${f.url}','_blank')">
              <div class="file-type-badge ${badge}">${label}</div>
              <div class="file-info">
                <div class="file-name">${f.name}</div>
                <div class="file-meta">${f.size}</div>
              </div>
              <a href="${f.url}" target="_blank" class="file-action" onclick="event.stopPropagation()">↓</a>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}
