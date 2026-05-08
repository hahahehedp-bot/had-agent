// =============================================
// HAD-Agent — modules/chat/chat.js
// [v13.4.1] Real Gemini Look - Integrated Input
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

          <div class="msg-ai-wrap">
            <div class="msg-ai-header">
              <img src="${agent.avatar}" alt="${agent.name}" class="msg-avatar">
              <span class="msg-name">${agent.name}</span>
            </div>
            <div class="msg msg-ai" id="welcomeMsg"></div>
          </div>
          
          <div class="chat-bottom-spacer" style="height:30px; flex-shrink:0;"></div>
        </div>

        <!-- [v13.4.1] 제미나이 스타일 통합 입력바 -->
        <div class="chat-input-container">
          <div class="chat-input-wrapper">
            <input type="text" id="chatInput" class="chat-input" placeholder="Gemini에게 물어보기" autocomplete="off">
            <button id="chatSend" class="chat-send-icon-btn" aria-label="전송">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

    // 인사말 렌더링
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

      // 사용자 메시지
      const userMsg = document.createElement('div');
      userMsg.className = 'msg msg-user';
      userMsg.textContent = text;
      messages.insertBefore(userMsg, messages.querySelector('.chat-bottom-spacer'));
      scrollToBottom();

      // AI 메시지
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
          bubble.textContent = '응답 오류';
        }
      } catch (err) {
        bubble.className = 'msg msg-ai msg-error';
        bubble.textContent = '연결 오류';
      }

      input.disabled = false;
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
