// =============================================
// HAD-Agent — modules/chat/chat.js
// AI 챗봇 모듈 (Cloud Function 연동)
// =============================================

export default {
  id: 'chat',

  async init(config) {
    if (!document.querySelector('link[href="modules/chat/chat.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'modules/chat/chat.css';
      document.head.appendChild(link);
    }
    this._endpoint = config.agent.endpoint;
    this._avatar   = config.agent.avatar;
    this._name     = config.agent.name;
  },

  async render(config) {
    return `
      <div class="module-root chat-layout">

        <!-- 채팅 메시지 영역 -->
        <div class="chat-messages" id="chatMessages">
          <div style="flex:1"></div>
          <!-- 초기 인사 메시지 -->
          <div class="msg-ai-wrap">
            <div class="msg-ai-header">
              <img src="${config.agent.avatar}" alt="${config.agent.name}" class="msg-avatar">
              <span class="msg-name">${config.agent.name}</span>
            </div>
            <div class="msg msg-ai" id="welcomeMsg">
              반갑습니다, 리더님! 😊<br>
              <strong>${config.agent.name}</strong>입니다.<br>
              무엇이든 편하게 물어보세요!
            </div>
          </div>
        </div>

        <!-- 입력창 -->
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

    // 마크다운 환영 메시지 적용
    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg && typeof marked !== 'undefined') {
      welcomeMsg.innerHTML = marked.parse(welcomeMsg.innerText);
    }

    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      input.disabled = true;
      sendBtn.disabled = true;

      // 사용자 메시지 추가
      const userMsg = document.createElement('div');
      userMsg.className = 'msg msg-user';
      userMsg.textContent = text;
      messages.appendChild(userMsg);
      messages.scrollTop = messages.scrollHeight;

      // AI 로딩 메시지
      const aiWrap = document.createElement('div');
      aiWrap.className = 'msg-ai-wrap';
      aiWrap.innerHTML = `
        <div class="msg-ai-header">
          <img src="${avatar}" alt="${agentName}" class="msg-avatar">
          <span class="msg-name">${agentName}</span>
        </div>
        <div class="msg msg-ai chat-thinking">생각 중...</div>
      `;
      messages.appendChild(aiWrap);
      messages.scrollTop = messages.scrollHeight;

      const bubble = aiWrap.querySelector('.msg-ai');

      try {
        const res  = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();

        if (data.status === 'success' && data.reply) {
          bubble.className = 'msg msg-ai';
          bubble.innerHTML = typeof marked !== 'undefined'
            ? marked.parse(data.reply)
            : data.reply;
        } else {
          bubble.className = 'msg msg-ai msg-error';
          bubble.textContent = '응답을 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        }
      } catch (err) {
        bubble.className = 'msg msg-ai msg-error';
        bubble.textContent = '연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요. 🙏';
      }

      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) sendMessage();
    });

    input.focus();
  },

  destroy() {}
}
