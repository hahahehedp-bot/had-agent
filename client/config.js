// =============================================
// HAD-Agent — client/config.js
// 오순이 (샌드박스 테스트용) 설정
// =============================================

export default {

  // ── 브랜딩 (고객사 고유값) ──────────────────────
  brand: {
    name:            "(주)오너",
    tagline:         "리더님의 빛나는 성공을 위하여",
    logo:            "client/assets/logo.png",
    logoText:        "client/assets/logo-text.png",
    primaryColor:    "#e5b2a4", // 브랜드를 상징하는 메인 컬러
  },

  // ── 테마 (사용자 선택 및 기본 테마 지정) ──────────────
  theme: {
    default: "glass-dark", // "modern-light", "glass-dark" 등
  },

  // ── Drive 설정 ─────────────────────────────────
  // 고객사 드라이브 폴더 ID (공개 공유 필요)
  drive: {
    rootFolderId:      "1zguMbzCqTrJQmD9SNEiic1OXwKEhzA_U",  // 오순이 루트 폴더 ID
    scheduleCsvId:     "1HNXY_pdzcS0XJfwn4AIeexc1ELmcuBbg",  // 일정/schedule.csv 파일 ID
    resourcesFolderId: "1K5XlEOLdXOgiEehTcQPMOWUHmcjYv-Ws",  // 자료실 폴더 ID
  },

  // ── AI 에이전트 ────────────────────────────────
  agent: {
    name:         "오순이",
    avatar:       "client/assets/logo.png",
    endpoint:     "https://asia-northeast3-triple-brain.cloudfunctions.net/osunyi-chat",
    systemPrompt: "당신은 (주)오너의 AI 비서 오순이입니다. 리버스12, 세노이드 등 제품과 사업에 대해 친근하고 전문적으로 상담합니다. 리더님이라고 호칭하세요.",
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
