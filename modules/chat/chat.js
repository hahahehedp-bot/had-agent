// =============================================
// HAD-Agent — modules/chat/chat.js
// [v15.2.1] Real-time Streaming Fix & Buffer Sync
// =============================================

export default {
  id: 'chat',

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
      <div class="module-root chat-layout" id="chatLayout">
        <div class="chat-messages" id="chatMessages">
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
          
          // 실시간 데이터 누적
          fullReply += chunk;

          // 실시간 마크다운 렌더링
          bubble.innerHTML = typeof marked !== 'undefined'
            ? marked.parse(fullReply)
            : fullReply;
          
          scrollToBottom();
        }

        // 스트리밍 종료 후 히스토리 업데이트
        history.push({ role: 'user', parts: [{ text: text }] });
        history.push({ role: 'model', parts: [{ text: fullReply }] });
        if (history.length > 20) history.splice(0, 2);

      } catch (err) {
        bubble.className = 'msg msg-ai msg-error';
        bubble.textContent = '연결 오류가 발생했습니다.';
        console.error('Streaming Error:', err);
      }

      input.disabled = false;
      scrollToBottom();
    };

    const btnChat     = document.getElementById('btnTabChat');
    const btnHistory  = document.getElementById('btnTabHistory');
    const btnSettings = document.getElementById('btnTabSettings');

    const switchView = (viewId, activeBtn) => {
      [btnChat, btnHistory, btnSettings].forEach(b => b?.classList.remove('active'));
      activeBtn?.classList.add('active');
      console.log(\`Switching to \${viewId} view...\`);
    };

    btnChat?.addEventListener('click', () => switchView('chat', btnChat));
    btnHistory?.addEventListener('click', () => switchView('history', btnHistory));
    btnSettings?.addEventListener('click', () => switchView('settings', btnSettings));

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) sendMessage();
    });
  },

  destroy() {}
}
