// =============================================
// HAD-Agent — modules/chat/chat.js
// [v13.2.7] Simple Greeting & Top-Start Layout
// =============================================

export default {
  id: 'chat',

  async init(config) {
    if (!document.querySelector('link[href="modules/chat/chat.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'modules/chat/chat.css?v=' + (window.hadState?.version || Date.now());
      document.head.appendChild(link);
    }
    this._endpoint = config.agent.endpoint;
    this._avatar   = config.agent.avatar;
    this._name     = config.agent.name;
  },

  async render(config) {
    return `
      <div class="module-root chat-layout">
        <div class="chat-messages" id="chatMessages">
          <!-- [v13.2.7] 상단 flex spacer 제거 (위에서부터 시작) -->
          
          <!-- 짧고 간결한 인사말 -->
          <div class="msg-ai-wrap">
            <div class="msg-ai-header">
              <img src="${config.agent.avatar}" alt="${config.agent.name}" class="msg-avatar">
              <span class="msg-name">${config.agent.name}</span>
            </div>
            <div class="msg msg-ai" id="welcomeMsg">
              ${config.agent.userLabel}, 무엇을 도와드릴까요? 😊
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
    const endpoint = config.agent.endpoint;
    const avatar   = config.agent.avatar;
    const agentName = config.agent.name;
    const history   = [];

    const scrollToBottom = () => {
      setTimeout(() => {
        if (messages) {
          messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    };

    // 초기 로드 시엔 스크롤 하지 않음 (위에서부터 보이니까)
    
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
          <img src="${avatar}" alt="${agentName}" class="msg-avatar">
          <span class="msg-name">${agentName}</span>
        </div>
        <div class="msg msg-ai chat-thinking">생각 중...</div>
      `;
      messages.insertBefore(aiWrap, messages.querySelector('.chat-bottom-spacer'));
      scrollToBottom();

      const bubble = aiWrap.querySelector('.msg-ai');

      try {
        const res  = await fetch(endpoint, {
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
        bubble.textContent = '연결이 원활하지 않습니다.';
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
