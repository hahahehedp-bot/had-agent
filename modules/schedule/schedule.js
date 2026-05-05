// =============================================
// HAD-Agent — modules/schedule/schedule.js
// 일정 모듈 (Drive CSV 직접 fetch)
// =============================================

export default {
  id: 'schedule',

  async init(config) {
    if (!document.querySelector('link[href="modules/schedule/schedule.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'modules/schedule/schedule.css';
      document.head.appendChild(link);
    }
  },

  async render(config) {
    return `
      <div class="module-root" style="padding: 20px; padding-bottom: 80px;">
        <div class="section-header">
          <div class="section-title">📅 ${config.modules.find(m=>m.id==='schedule')?.label || '일정'}</div>
        </div>
        <div id="scheduleContainer">
          <div class="empty-state">
            <div class="loading-spinner" style="margin: 0 auto 12px;"></div>
            <p>일정을 불러오는 중...</p>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender(config) {
    const container = document.getElementById('scheduleContainer');
    try {
      const csvUrl = `${config.agent.endpoint}?action=getCsv&fileId=${config.drive.scheduleCsvId}`;
      const res  = await fetch(csvUrl);
      const text = await res.text();

      if (!text || text.includes('<!DOCTYPE')) throw new Error('CSV 파일을 읽을 수 없습니다.');

      const events = parseScheduleCSV(text);
      container.innerHTML = renderEvents(events);
      bindCalendarButtons();

    } catch (err) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <p>등록된 일정이 없습니다.<br>드라이브에 schedule.csv를 업로드해 주세요.</p>
        </div>`;
    }
  },

  destroy() {}
}

function parseScheduleCSV(csv) {
  const rows = csv.split('\n')
    .map(r => r.trim())
    .filter(r => r && !r.startsWith('Week'));

  return rows.map(row => {
    const cols = row.split(',');
    return {
      week:  cols[0]?.trim(),
      day:   cols[1]?.trim(),
      title: cols[2]?.trim(),
      time:  cols[3]?.trim(),
      loc:   cols[4]?.trim(),
      desc:  cols[5]?.trim() || ''
    };
  }).filter(e => e.title);
}

function renderEvents(events) {
  if (!events.length) {
    return `<div class="empty-state"><div class="empty-icon">📅</div><p>등록된 일정이 없습니다.</p></div>`;
  }

  // 주차별 그룹화
  const grouped = {};
  events.forEach(e => {
    const key = `${e.week}주차`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  return Object.entries(grouped).map(([week, evts]) => `
    <div class="schedule-week">
      <div class="week-label"><span class="tag">📌 ${week}</span></div>
      ${evts.map(e => `
        <div class="event-item">
          <div class="event-date">
            <div class="day">${e.day}</div>
            <div class="mon">MAY</div>
          </div>
          <div class="event-info">
            <div class="event-title">${e.title}</div>
            <div class="event-detail">${e.time} · ${e.loc}</div>
          </div>
          <button class="btn-cal" 
            data-title="${encodeURIComponent(e.title)}"
            data-day="${e.day}"
            data-loc="${encodeURIComponent(e.loc)}"
            data-desc="${encodeURIComponent(e.desc)}"
            title="구글 캘린더에 추가">➕</button>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function bindCalendarButtons() {
  document.querySelectorAll('.btn-cal').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = decodeURIComponent(btn.dataset.title);
      const day   = btn.dataset.day.padStart(2, '0');
      const loc   = decodeURIComponent(btn.dataset.loc);
      const desc  = decodeURIComponent(btn.dataset.desc);
      const start = `20260${day}T100000`;
      const end   = `20260${day}T180000`;
      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(loc)}`;
      window.open(url, '_blank');
    });
  });
}
