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
    adminEmails: ["hahahehedp@gmail.com", "admin@owner.com"],
    allowBypass: true,
    // [v15.5.0] Kakao MFA Configuration
    mfa: {
      enabled: true,
      senderId: '@연희동베이커리_세종빵집_맛집', // [REAL] 유여름 사장님 보유 비즈니스 채널
      templateId: 'auth_code_v1'
    }
  },

  // ── 테마 (사용자 선택 및 기본 테마 지정) ──────────────
  theme: {
    default: "modern-light", // "modern-light", "glass-dark" 등
  },

  // ── Drive 설정 (Drive-as-CMS Section 5) ──────────────────────────
  // 고객사 드라이브 폴더 ID 및 내부 구조 정의
  drive: {
    rootFolderId:      "TEST_ROOT_ID", 
    systemPath:        "System",      // 엔진룸 (Config, Agent, User_Data)
    dataPath:          "Data",        // 공용 데이터 (Schedule, Resources, Feed)
    
    // [v15.3.3] 세부 경로 정의
    paths: {
      memberDirectory: "System/Config/member_directory.json",
      userWorkspace:   "System/User_Data",
      sessions:        "Chat/Sessions"
    }
  },

  // ── AI 에이전트 아이덴티티 ────────────────────────────
  agent: {
    name:         "HAD 에이전트",
    userLabel:    "리더님", 
    welcomeMsg:   "반갑습니다. 지적 협업을 위한 HAD 에이전트입니다. 무엇을 도와드릴까요?",
    avatar:       "client/assets/icon-192.png",
    endpoint:     "https://asia-northeast3-triple-brain.cloudfunctions.net/osunyi-chat",
    systemPrompt: "당신은 HAD-Agent 플랫폼의 전문 비서입니다. 사용자를 '{userLabel}'(으)로 호칭하며, 기술적이고 명확한 분석을 제공합니다.",
  },

  // ── 모듈 on/off 및 타입 정의 ───────────────────────
  modules: [
    { id: "home",      enabled: true,  icon: "🏠",  label: "홈",       description: "메인 대시보드" },
    { id: "schedule",  enabled: true,  icon: "📅",  label: "일정",     description: "세미나 및 행사 일정" },
    { id: "resources", enabled: true,  icon: "📂",  label: "자료실",   description: "제품 자료 및 영상" },
    { id: "feed",      enabled: true,  icon: "📋",  label: "피드",     description: "사내 소식 및 피드" },
    { id: "chat",      enabled: true,  hidden: true, icon: "💬",  label: "AI 상담",  description: "HAD 봇과 1:1 상담" },
    
    // 외부 Iframe 모듈 예시 (마이오피스, 쇼핑몰 등)
    { id: "myoffice",  enabled: true,  type: "iframe", url: "https://example.com/myoffice", icon: "🏢", label: "마이오피스", description: "나의 비즈니스 현황" },
  ],

  // ── UI 레이아웃 설정 (v15.6.0 리전 시스템 적용) ───────────────────
  ui: {
    defaultModule: "home", 
    useOverlayOnPC: false,
    drawerSlots: {
      'agent': 'chat'
    },
    // 하단 탭바 설정 (선택 사항)
    navbar: {
      enabled: false, // 기본 비활성 (Invisible AI 지향)
      items: [
        { id: "home", icon: "🏠", label: "홈" },
        { id: "feed", icon: "📋", label: "피드" },
        { id: "chat", icon: "💬", label: "비서" }
      ]
    }
  },

  // ── PWA 설정 (설치형 앱 메타데이터) ──────────────────
  pwa: {
    shortName:       "HAD-Agent",
    themeColor:      "#4f46e5",
    backgroundColor: "#ffffff",
  }
}
