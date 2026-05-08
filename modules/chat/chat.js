// =============================================
// HAD-Agent — modules/chat/chat.js
// [v13.4.0] Gemini Look Implementation
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
          <div class="chat-top-shield"></div>

          <div class="msg-ai-wrap" id="welcomeWrap">
            <div class="msg-ai-header">
              <img src="${agent.avatar}" alt="${agent.name}" class="msg-avatar">
              <span class="msg-name">${agent.name}</span>
            </div>
            <!-- [v13.4.0] 제미나이 스타일: 배경 없는 메시지 -->
            <div class="msg msg-ai" id="welcomeMsg"></div>
          </div>
          
          <div class="chat-bottom-spacer" style="height:20px; flex-shrink:0;"></div>
        </div>

        <div class="chat-input-bar">
          <div class="chat-input-row">
            <input type="text" id="chatInput" class="chat-input" placeholder="메시지를 입력하세요..." autocomplete="off">
            <button id="chatSend" class="chat-send-btn" aria-label="전송">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div class="chat-bottom-shield"></div>
        </div>
      </div>
    `;
  },

  afterRender(config) {
    const input    = document.getElementById('chatInput');
    const sendBtn  = document.getElementById('chatSend');
    const messages = document.getElementById('chatMessages');
    const agent    = config.agent || {};
    const history  = [];

    const scrollToBottom = () => {
      if (messages) {
        messages.scrollTop = messages.scrollHeight;
      }
    };

    // [v13.4.0] 인사말 마크다운 렌더링 (제미나이 룩)
    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg && typeof marked !== 'undefined') {
      const welcomeText = agent.welcomeMsg || `${agent.userLabel || '리더'}님, 무엇을 도와드릴까요? 😊`;
      welcomeMsg.innerHTML = marked.parse(welcomeText);
    }
    
    scrollToBottom();

    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      input.disabled = true;
      sendBtn.disabled = true;

      // 사용자 메시지 (말풍선 유지)
      const userMsg = document.createElement('div');
      userMsg.className = 'msg msg-user';
      userMsg.textContent = text;
      messages.insertBefore(userMsg, messages.querySelector('.chat-bottom-spacer'));
      scrollToBottom();

      // AI 메시지 (말풍선 제거 스타일)
      const aiWrap = document.createElement('div');
      aiWrap.className = 'msg-ai-wrap';
      aiWrap.innerHTML = `
        <div class="msg-ai-header">
          <img src="${agent.avatar}" alt="${agent.name}" class="msg-avatar">
          <span class="msg-name">${agent.name}</span>
        </div>
        <div class="msg msg-ai chat-thinking">...</div>
      `;
      messages.insertBefore(aiWrap, messages.querySelector('.chat-bottom-spacer'));
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
          bubble.textContent = '응답을 가져올 수 없습니다.';
        }
      } catch (err) {
        bubble.className = 'msg msg-ai msg-error';
        bubble.textContent = '연결 상태를 확인해 주세요.';
      }

      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
      scrollToBottom();
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) sendMessage();
    });

    input.focus();
  },

  destroy() {}
}
