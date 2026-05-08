// =============================================
// HAD-Agent — modules/chat/chat.js
// [v13.2.8] Greeting Recovery & Layout Safety
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
    const welcome = agent.welcomeMsg || `${agent.userLabel || '리더'}님, 무엇을 도와드릴까요? 😊`;
    
    return `
      <div class="module-root chat-layout" id="chatLayout">
        <div class="chat-messages" id="chatMessages">
          <div class="msg-ai-wrap">
            <div class="msg-ai-header">
              <img src="${agent.avatar}" alt="${agent.name}" class="msg-avatar">
              <span class="msg-name">${agent.name}</span>
            </div>
            <div class="msg msg-ai" id="welcomeMsg">
              ${welcome}
            </div>
          </div>
          <div class="chat-bottom-spacer"></div>
        </div>

        <div class="chat-input-bar">
          <input type="text" id="chatInput" class="chat-input" placeholder="메시지를 입력하세요..." autocomplete="off">
          <button id="chatSend" class="chat-send-btn" aria-label="전송">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
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

    // 마크다운 환영 메시지 적용
    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg && typeof marked !== 'undefined') {
      welcomeMsg.innerHTML = marked.parse(welcomeMsg.innerHTML);
    }
    
    scrollToBottom();

    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      input.disabled = true;
      sendBtn.disabled = true;

      const userMsg = document.createElement('div');
      userMsg.className = 'msg msg-user';
      userMsg.textContent = text;
      messages.insertBefore(userMsg, messages.querySelector('.chat-bottom-spacer'));
      scrollToBottom();

      const aiWrap = document.createElement('div');
      aiWrap.className = 'msg-ai-wrap';
      aiWrap.innerHTML = `
        <div class="msg-ai-header">
          <img src="${agent.avatar}" alt="${agent.name}" class="msg-avatar">
          <span class="msg-name">${agent.name}</span>
        </div>
        <div class="msg msg-ai chat-thinking">생각 중...</div>
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
            ? marked.parse(data.reply)
            : data.reply;
            
          history.push({ role: 'user', parts: [{ text: text }] });
          history.push({ role: 'model', parts: [{ text: data.reply }] });
          if (history.length > 20) history.splice(0, 2);
        } else {
          bubble.className = 'msg msg-ai msg-error';
          bubble.textContent = '문제가 발생했습니다.';
        }
      } catch (err) {
        bubble.className = 'msg msg-ai msg-error';
        bubble.textContent = '연결 오류';
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
