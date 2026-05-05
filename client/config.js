// =============================================
// HAD-Agent — client/config.js
// 오순이 (샌드박스 테스트용) 설정
// =============================================

export default {

  // ── 브랜딩 ────────────────────────────────────
  brand: {
    name:            "(주)오너",
    tagline:         "리더님의 빛나는 성공을 위하여",
    logo:            "client/assets/logo.png",
    logoText:        "client/assets/logo-text.png",
    themeColor:      "#e5b2a4",
    themeColorLight: "#f2d1c9",
    darkColor:       "#1a1a5e",
    bgColor:         "#fdfaf9",
  },

  // ── Drive 설정 ─────────────────────────────────
  // 고객사 드라이브 폴더 ID (공개 공유 필요)
  drive: {
    rootFolderId:  "REPLACE_WITH_ROOT_FOLDER_ID",   // 오순이 루트 폴더 ID
    scheduleCsvId: "REPLACE_WITH_SCHEDULE_CSV_ID",  // 일정/schedule.csv 파일 ID
  },

  // ── AI 에이전트 ────────────────────────────────
  agent: {
    name:         "오순이",
    avatar:       "client/assets/logo.png",
    endpoint:     "https://asia-northeast3-triple-brain.cloudfunctions.net/osunyi-chat",
    systemPrompt: "당신은 (주)오너의 AI 비서 오순이입니다. 리버스12, 세노이드 등 제품과 사업에 대해 친근하고 전문적으로 상담합니다. 리더님이라고 호칭하세요.",
  },

  // ── 모듈 on/off ────────────────────────────────
  // enabled: true → 탭바 + 사이드바에 자동 표시
  modules: [
    { id: "home",      enabled: true,  icon: "🏠",  label: "홈",       description: "메인 대시보드" },
    { id: "schedule",  enabled: true,  icon: "📅",  label: "일정",     description: "5월 세미나 및 행사 일정" },
    { id: "resources", enabled: true,  icon: "📂",  label: "자료실",   description: "제품 자료 및 영상" },
    { id: "chat",      enabled: true,  icon: "💬",  label: "AI 상담",  description: "오순이와 1:1 상담" },
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
