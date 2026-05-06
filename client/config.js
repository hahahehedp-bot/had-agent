// =============================================
// HAD-Agent — client/config.js
// 화이트라벨 코어 엔진 테스트용 범용 설정
// =============================================

export default {

  // ── 브랜딩 (고객사 고유값) ──────────────────────
  brand: {
    name:            "AI Thinking Lab",
    tagline:         "미래를 앞당기는 지적 협업",
    logo:            "client/assets/icon-192.png", // 테스트용 기본 로고
    logoText:        "",
    primaryColor:    "#4f46e5", // 세련된 인디고 블루
  },

  // ── 테마 (사용자 선택 및 기본 테마 지정) ──────────────
  theme: {
    default: "modern-light", // "modern-light", "glass-dark" 등
  },

  // ── Drive 설정 ─────────────────────────────────
  // 고객사 드라이브 폴더 ID (공개 공유 필요)
  drive: {
    rootFolderId:      "TEST_FOLDER_ID", 
    scheduleCsvId:     "TEST_CSV_ID",
    resourcesFolderId: "TEST_RESOURCES_ID",
  },

  // ── AI 에이전트 ────────────────────────────────
  agent: {
    name:         "HAD 봇",
    avatar:       "client/assets/icon-192.png",
    endpoint:     "https://asia-northeast3-triple-brain.cloudfunctions.net/osunyi-chat",
    systemPrompt: "당신은 AI Thinking Lab의 테스트 에이전트 HAD 봇입니다. 기술적이고 명확하게 답변하세요.",
  },

  // ── 모듈 on/off 및 타입 정의 ───────────────────────
  // type 생략 시 기본 모듈(내부 JS 로드). type: "iframe"이면 외부 URL 인앱 렌더링.
  modules: [
    { id: "home",      enabled: true,  icon: "🏠",  label: "홈",       description: "메인 대시보드" },
    { id: "schedule",  enabled: true,  icon: "📅",  label: "일정",     description: "5월 세미나 및 행사 일정" },
    { id: "resources", enabled: true,  icon: "📂",  label: "자료실",   description: "제품 자료 및 영상" },
    { id: "chat",      enabled: true,  icon: "💬",  label: "AI 상담",  description: "오순이와 1:1 상담" },
    
    // 타사 솔루션 인앱 연동 (Iframe)
    { id: "shop",      enabled: true,  icon: "🛒",  label: "쇼핑몰",   description: "공식 쇼핑몰", type: "iframe", url: "https://example.com/shop" },
    { id: "myoffice",  enabled: true,  icon: "🏢",  label: "마이오피스", description: "사업자 관리 시스템", type: "iframe", url: "https://example.com/myoffice" },

    { id: "notice",    enabled: false, icon: "📢",  label: "공지",     description: "공지 및 팝업" },
    { id: "translate", enabled: false, icon: "🌐",  label: "번역",     description: "문서 번역" },
  ],

  // ── PWA 설정 ──────────────────────────────────
  pwa: {
    shortName:       "오순이",
    themeColor:      "#fdfaf9",
    backgroundColor: "#fdfaf9",
  }
}
