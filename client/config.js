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

  // ── 인증 설정 (로그인 방식) ───────────────────────
  // type: "google" (구글 인증), "none" (마케팅/퍼블릭용), 등
  auth: {
    type: "google",
    clientId: "473448066886-7kjj7jhvliclqgdpa30et6t2m1shgbdt.apps.googleusercontent.com",
    required: true,
    adminEmails: ["hahahehedp@gmail.com", "admin@owner.com"], // 마스터 관리자 이메일
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
  modules: [
    { id: "home",      enabled: true,  icon: "🏠",  label: "홈",       description: "메인 대시보드" },
    { id: "schedule",  enabled: true,  icon: "📅",  label: "일정",     description: "세미나 및 행사 일정" },
    { id: "resources", enabled: true,  icon: "📂",  label: "자료실",   description: "제품 자료 및 영상" },
    { id: "chat",      enabled: true,  icon: "💬",  label: "AI 상담",  description: "HAD 봇과 1:1 상담" },
    
    // 외부 Iframe 모듈 예시 (마이오피스, 쇼핑몰 등)
    { id: "myoffice",  enabled: true,  type: "iframe", url: "https://example.com/myoffice", icon: "🏢", label: "마이오피스", description: "나의 비즈니스 현황" },
  ],

  // ── PWA 설정 (설치형 앱 메타데이터) ──────────────────
  pwa: {
    shortName:       "HAD-Agent",
    themeColor:      "#4f46e5",
    backgroundColor: "#ffffff",
  }
}
