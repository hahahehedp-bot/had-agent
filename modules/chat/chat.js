// =============================================
// HAD-Agent — modules/chat/chat.js
// [v14.3.0] Gemini Header Icons & Internal Navigation Base
// =============================================

export default {
  placement: { primary: 'DRAWER' },

  async init(config) {
    if (!document.querySelector('link[href="modules/chat/chat.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'modules/chat/chat.css?v=' + Date.now();
      document.head.appendChild(link);
    }
  },

  async render(config) {
    const agent = config.agent || {};
    
    return `
      <div class="agent-drawer-header">
        <div class="agent-status-dot"></div>
        <h3 id="drawerTitle">${agent.name || '에이전트'}</h3>
        <div class="drawer-header-actions">
          <button class="header-action-btn active" id="btnTabChat" title="대화창">💬</button>
          <button class="header-action-btn" id="btnTabHistory" title="과거세션">🕒</button>
          <button class="header-action-btn" id="btnTabSettings" title="설정">⚙️</button>
        </div>
        <button class="btn-close-agent" id="btnCloseAgent">&times;</button>
      </div>

      <div class="module-root chat-layout" id="chatLayout">
        <div class="chat-messages" id="chatMessages">
          <!-- 채팅 메시지 영역 -->
        </div>

        <div class="chat-input-container">
          <div class="chat-input-wrapper">
            <input type="search" id="chat-query" class="chat-input" 
                   placeholder="비서에게 물어보세요" 
                   autocomplete="off" 
                   autocorrect="off" 
                   autocapitalize="off" 
                   spellcheck="false" 
                   inputmode="text" 
                   enterkeyhint="send"
                   data-lpignore="true"
                   x-autocompletetype="off">
            <button id="chatSend" class="chat-send-icon-btn" aria-label="전송">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
          <div class="chat-bottom-shield"></div>
        </div>
      </div>
    `;
  },

  afterRender(config) {
    const input    = document.getElementById('chat-query');
    const sendBtn  = document.getElementById('chatSend');
    const messages = document.getElementById('chatMessages');
    const agent    = config.agent || {};
    const history  = [];

    const scrollToBottom = () => {
      if (messages) {
        messages.scrollTop = messages.scrollHeight;
      }
    };

    scrollToBottom();

    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      input.disabled = true;

      const userMsg = document.createElement('div');
      userMsg.className = 'msg msg-user';
      userMsg.textContent = text;
      messages.appendChild(userMsg);
      scrollToBottom();

      const aiWrap = document.createElement('div');
      aiWrap.className = 'msg-ai-wrap';
      aiWrap.innerHTML = `
        <div class="msg-ai-header">
          <!-- [v13.5.0] 제미나이 스타일 별 아이콘 -->
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="msg-avatar">
            <path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z" fill="#4285F4"/>
          </svg>
        </div>
        <div class="msg msg-ai markdown-body chat-thinking">...</div>
      `;
      messages.appendChild(aiWrap);
      scrollToBottom();

      const bubble = aiWrap.querySelector('.msg-ai');

      try {
        const response = await fetch(agent.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: history, stream: true })
        });

        bubble.classList.remove('chat-thinking');
        bubble.textContent = '';
        
        let fullReply = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          
          // [v15.3.3] 텍스트 누적 및 메타데이터 필터링
          fullReply += chunk;

          // 메타데이터 영역 분리 시도
          let cleanDisplay = fullReply;
          if (fullReply.includes('[METADATA]')) {
            const parts = fullReply.split('[METADATA]');
            cleanDisplay = parts[0].trim();
            
            // 메타데이터 파싱 (종료 시점에 1회 수행)
            if (parts.length >= 3) {
              try {
                const metadata = JSON.parse(parts[1]);
                console.log('[v15.3.3] Usage Metadata Received:', metadata);
                // [TODO] Registry.updateUsage(metadata) 호출하여 장부 기록 로직 연결
              } catch (e) {
                console.warn('[v15.3.3] Metadata Parse Error:', e);
              }
            }
          }

          // 실시간 마크다운 렌더링 (메타데이터 제외한 깨끗한 내용만)
          bubble.innerHTML = typeof marked !== 'undefined'
            ? marked.parse(cleanDisplay)
            : cleanDisplay;
          
          scrollToBottom();
        }

        // 스트리밍 종료 후 히스토리 업데이트 (메타데이터 제외한 깨끗한 답변만 저장)
        const finalAnswer = fullReply.split('[METADATA]')[0].trim();
        history.push({ role: 'user', parts: [{ text: text }] });
        history.push({ role: 'model', parts: [{ text: finalAnswer }] });
        if (history.length > 20) history.splice(0, 2);

      } catch (err) {
        bubble.className = 'msg msg-ai msg-error';
        bubble.textContent = '연결 오류가 발생했습니다.';
        console.error('Streaming Error:', err);
      }

      input.disabled = false;
      scrollToBottom();
    };

    // [v14.3.0] 헤더 아이콘 리스너 (내부 내비게이션용)
    const btnChat     = document.getElementById('btnTabChat');
    const btnHistory  = document.getElementById('btnTabHistory');
    const btnSettings = document.getElementById('btnTabSettings');

    const switchView = (viewId, activeBtn) => {
      // 액티브 클래스 교체
      [btnChat, btnHistory, btnSettings].forEach(b => b?.classList.remove('active'));
      activeBtn?.classList.add('active');
      
      // 실제 뷰 전환 로직은 다음 턴에 상세 구현
      console.log(`Switching to ${viewId} view...`);
    };

    btnChat?.addEventListener('click', () => switchView('chat', btnChat));
    btnHistory?.addEventListener('click', () => switchView('history', btnHistory));
    btnSettings?.addEventListener('click', () => switchView('settings', btnSettings));

    sendBtn.addEventListener('click', sendMessage);
    
    // [v15.6.0] 서랍 닫기 연동
    document.getElementById('btnCloseAgent')?.addEventListener('click', () => {
      ctx.events.emit('requestDrawerClose', { side: 'right' });
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) sendMessage();
    });

    // input.focus(); // [v13.5.1] 초기 진입 시 자동 포커스 제거
  },

  destroy() {}
}
