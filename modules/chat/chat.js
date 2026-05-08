// =============================================
// HAD-Agent — modules/chat/chat.js
// [v14.0.0] Ultra-Tight Layout & Pure Full-Width Input
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
          <!-- [v13.8.0] 상단 여백 제거를 위해 쉴드 및 스페이서 삭제 -->
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
              <!-- [v13.4.2] 제미나이 스타일 단순 화살표 -->
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
        <div class="msg msg-ai chat-thinking">...</div>
      `;
      messages.appendChild(aiWrap);
      scrollToBottom();

      const bubble = aiWrap.querySelector('.msg-ai');

      try {
        const res  = await fetch(agent.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: history })
        });
        const data = await res.json();

        if (data.status === 'success' && data.reply) {
          bubble.className = 'msg msg-ai';
          bubble.innerHTML = typeof marked !== 'undefined'
            ? marked.parse(data.reply.trim())
            : data.reply.trim();
            
          history.push({ role: 'user', parts: [{ text: text }] });
          history.push({ role: 'model', parts: [{ text: data.reply }] });
          if (history.length > 20) history.splice(0, 2);
        } else {
          bubble.className = 'msg msg-ai msg-error';
          bubble.textContent = '응답 오류';
        }
      } catch (err) {
        bubble.className = 'msg msg-ai msg-error';
        bubble.textContent = '연결 오류';
      }

      input.disabled = false;
      // input.focus(); // [v13.5.1] 자동 포커스 제거 (키보드 팝업 방지)
      scrollToBottom();
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) sendMessage();
    });

    // input.focus(); // [v13.5.1] 초기 진입 시 자동 포커스 제거
  },

  destroy() {}
}
