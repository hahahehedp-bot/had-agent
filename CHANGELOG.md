# 📜 HAD-Agent 작업 이력 (Changelog)

이 문서는 HAD-Agent 프로젝트의 버전별 작업 내역과 주요 변경 사항을 기록합니다.

## [v15.8.8] - 2026-05-09
### Added
- **Core Purification (코어 대정화)**: 코어 엔진 내 잔존하던 모듈 종속성 및 하드코딩을 전면 제거하여 '무결성 헌법' 체계 확립.
- **Dynamic Versioning**: `index.html` 및 알림 UI에서 하드코딩된 버전을 제거하고 `Registry` 기반 동적 버전 표시 시스템 도입.
- **CSS Separation**: `components.css`에서 파일(`Resources`) 및 일정(`Schedule`) 관련 스타일을 분리(추출)하여 코어 경량화.
- **Strict Fallback Removal**: 기본 모듈(`home`) 및 서랍 슬롯(`chat`)의 하드코딩된 기본값을 제거. 설정 부재 시 '빈 슬롯'을 유지하도록 하여 모듈 자치권 강화.

## [v15.8.7] - 2026-05-09
### Fixed
- **우측 서랍(Agent Drawer) 가시성 버그 해결**: PC 환경 초기 로드 시 채팅창이 보이지 않던 현상을 JS 초기화 트리거(`renderSlotContent`) 및 CSS 구조(Flex/Height) 보강을 통해 완벽 해결.

## [v15.8.6] - 2026-05-09
### Added
- **안티그래비티 스타일 고정밀 드롭다운**: 촌스러운 사이드바형 설정 창을 제거하고, VSCode/Antigravity와 동일한 11px 고밀도 플로팅 메뉴 시스템 도입.
- **다층적 퀵 액션**: 드롭다운 내부에서 사용자 정보 확인, 테마 전환, 업데이트 체크 등을 즉시 수행할 수 있도록 UI 밀도 극대화.

## [v15.8.5] - 2026-05-09
### Added
- **고밀도 워크벤치 아키텍처 (High-Density Workbench)**: 36px 초슬림 헤더와 22px 상태 표시줄을 화면 최상/하단에 고정 배치하여 전문가용 작업 환경 구축.
- **브랜딩 중앙화**: 사이드바 헤더를 폐지하고 고객사 로고/사명을 상단 타이틀 바 좌측으로 이동 배치하여 UI 일관성 확보.
- **앱 로딩 세이프티 넷**: 초기화 교착 상태(Deadlock) 방지를 위한 5초 자동 해제 타이머 및 비동기 로딩 방어 로직 강화.
### Added
- **본질 기반 환경 판정 (Identity-based Detection)**: 해상도나 방향이 아닌, 오직 OS(Desktop vs Mobile)를 기준으로 기능을 개방하는 철학적 판정 시스템 도입.
- **사용자 주권 강화**: 세로형 피씨 모니터 등 특수 환경에서도 전문가용 워크벤치 기능을 제한 없이 제공하며, 레이아웃 배치는 사용자가 직접 제어하도록 설계.

## [v15.7.0] - 2026-05-09
### Added
- **PC 워크벤치 고도화**: 우상단 레이아웃 컨트롤 버튼(Sidebar/Drawer Toggle) 도입.
- **동적 레이아웃 엔진**: PC 환경에서도 사이드바와 드로어를 자유롭게 여닫을 수 있는 '집중 모드' 구현.
- **Pusher Logic**: 패널 개폐 상태에 따라 중앙 뷰포트와 헤더가 동적으로 리사이징되는 CSS 매커니즘 구축.

## [v15.6.0] - 2026-05-09
### Added
- **Region-based Placement System**: 화면을 SIDEBAR, VIEWPORT, DRAWER, NAVBAR의 4대 리전으로 정의하고, 모듈이 자신의 위치를 스스로 결정하는 아키텍처 도입.
- **코어 정화 (Core Purification)**: `index.html`, `router.js` 등 코어 파일에서 'chat', 'home' 등 특정 모듈에 대한 하드코딩 의존성을 완전히 제거하여 '완벽한 빈 그릇' 실현.
- **선택적 NAVBAR 정책**: 하단 탭바를 기본 비활성으로 전환하고, 활성 시 유튜브 스타일의 'Scroll-to-Hide' 로직을 적용하여 모바일 화면 활용도 극대화.
- **드로어 헤더 자치제**: 코어의 드로어 헤더를 제거하고, 각 모듈이 리전에 맞게 자신의 헤더와 액션을 직접 렌더링하도록 규격 변경.


## [v15.5.0] - 2026-05-09

### Added

- **Professional Identity Governance**: 구글 로그인(수단)과 기업 실명 신분(사번/전화번호)을 분리하는 하이브리드 ID 체계 확립.
- **Kakao MFA Integration**: 카카오 알림톡(AlimTalk)을 활용한 2단계 본인 인증 UI 및 로직 구현.
- **Excel-as-CMS (HR Master)**: 인사팀이 관리하는 엑셀(`company_staff_master.csv`)을 앱이 직접 읽어 신분을 대조하는 실무 친화적 연동 체계 구축.
- **Graceful Degradation Policy**: 인증 미비 시 '일반 회원(Consumer)'으로 자동 강등하여 기업 데이터를 보호하고 플랫폼의 법적 책임을 면하는 보안 정책 적용.
- **Triple-Sync System**: 사원 명부(CSV), 가입 명부(JSON), 권한 규정(JSON)을 상호 대조하는 입체적 권한 제어 엔진 구축.
- **Triple-Tier Data Governance**: 데이터 소유권과 프라이버시를 위해 깃헙(엔진), 회사(자산), 개인(기억)의 3단계 분리 원칙 확립.
- **Core Enhancement**: `drive.js`에 CSV 파싱 엔진 탑재 및 `auth.js`에 다단계 MFA 온보딩 흐름(성함/사번 ➡️ 알림톡 ➡️ 연동) 구현.

## [v15.3.0] - 2026-05-09

### Added

- **AI Thinking Identity**: AI를 단순 생산성 도구가 아닌 '공동 사고(Shared Thinking)' 파트너로 정의하는 핵심 철학 주입.
- **Dynamic KST Awareness**: 서버 시간(UTC)이 아닌 한국 표준시(KST)를 실시간으로 인지하여 답변에 반영하는 지능형 시간 시스템 도입.
- **Grounding Insight**: 구글 검색 결과에 'AI Thinking' 관점의 인사이트를 결합하여 답변하도록 지침 고도화.
- **Emergence Focus**: 답변의 마무리에서 사용자의 지적 자극과 창발(Emergence)을 유도하는 로직 강화.

## [v15.2.8] - 2026-05-09

### Fixed

- **Markdown Rendering Safety**: 백엔드에서 헤더(`###`) 수신 시 앞에 줄바꿈이 없으면 강제로 주입하여 모바일 렌더링 깨짐 현상 완벽 해결.
- **Repetition Control**: 페르소나 지침 강화로 답변 후반부 무의미한 반복 현상 억제.
- **Fundamental UI Fix**: 리스트 스타일을 `inside`로 변경하여 마진 설정과 상관없이 점(Marker)이 짤리지 않도록 근본적으로 해결했습니다. 이로 인해 전체 패딩을 `10px`까지 줄여 화면 활용도를 극대화했습니다.
- **Stream Sanitization**: 프론트엔드에서 스트림 시작 시 발생하는 킥스타트 공백을 `trimStart()`로 자동 제거하도록 보완.

## [v15.2.6] - 2026-05-09

### Fixed

- **Anti-Buffering Kickstart**: GFE 및 프록시 버퍼링 해제를 위해 2KB 초기 데이터 전송 로직 적용 완료.

## [v15.2.5] - 2026-05-09

### Fixed

- **Streaming Real-time Recovery**: 백엔드에서 줄바꿈(`\n`)이 올 때까지 기다리던 로직을 정규식 기반 실시간 매칭으로 변경하여, 첫 글자부터 지연 없이 화면에 출력되도록 개선.
- **Connection Reliability**: 버퍼 누적 방지 및 즉각적인 `res.write()` 호출로 타임아웃 문제를 해결하고 스트리밍 연결 안정성 강화.

## [v15.2.1] - 2026-05-09

### Fixed

- **Build Error Resolved**: `package.json`의 잠재적 구문 오류(보이지 않는 문자 및 구조 정제)를 수정하여 Cloud Build 실패 문제 해결.
- **API Tool Alignment**: Gemini 3.1 규격에 맞게 구글 검색 도구 명칭을 `google_search_retrieval`에서 `google_search`로 정정.
- **Stability**: 스트리밍 파싱 버퍼 로직의 안정성 재검증 및 버전 업그레이드.

## [v15.2.0] - 2026-05-09

### Changed

- **Model Upgrade**: 챗봇 엔진을 `gemini-2.0-flash`에서 최신 **Gemini 3.1 Flash-Lite**로 전격 교체. (최고의 가성비 및 성능 확보)
- **Streaming Stability**: 스트리밍 청크 파싱 로직에 버퍼링 시스템을 도입하여 불완전한 JSON 데이터 수신 시에도 끊김 없는 답변 제공.
- **Engine Versioning**: 클라우드 함수 엔진 버전을 v15.2.0으로 갱신하여 시스템 무결성 유지.

## [v14.6.0] - 2026-05-08

### Fixed

- **Absolute Anchored Layout**: 모바일 브라우저의 가변적인 높이 계산 오류를 원천 차단하기 위해 절대 좌표계(Absolute) 기반의 앵커링 시스템 도입.
- **Dynamic Viewport Height (dvh)**: 최신 모바일 브라우저 표준인 `dvh` 단위를 적용하여 키보드나 URL 바 변화에도 비서창 높이가 일정하게 유지되도록 보정.
- **Root Cause Fix**: 레이아웃 체인의 모든 요소를 전수조사하여 스크롤 간섭을 일으키던 flex-grow 논리를 absolute-fill 방식으로 개편.

## [v14.5.0] - 2026-05-08

### Fixed

- **Stable Bottom Anchor**: 장문의 답변 중에도 입력창이 항상 화면 하단에 고정되도록 플렉스박스 계층 구조 최적화.
- **Fluid Scroll**: 대화 영역의 스크롤이 부모 컨테이너와 간섭 없이 매끄럽게 작동하도록 `height` 및 `min-height` 속성 정밀 튜닝.

## [v14.4.0] - 2026-05-08

### Fixed

- **Borderless UI**: 헤더와 입력창의 분리선(Border)을 모두 제거하여 하나의 판 위에서 대화하는 듯한 심리스한 경험 제공.
- **Bottom Anchor Fix**: 대화가 없는 초기 상태에서도 입력창이 화면 하단에 완벽하게 고정되도록 레이아웃 높이 로직 강화.

## [v14.3.0] - 2026-05-08

### Changed

- **Integrated Header Action**: 드로어 헤더에 [제목 + 대화/기록/설정] 아이콘 버튼을 통합 배치하여 공간 효율성 및 몰입감 극대화.
- **Legacy Tabs Removed**: 기존의 큰 알약 형태 탭바를 제거하여 채팅 메시지 영역을 상단으로 더 확장.
- **Internal Navigation Base**: 채팅 모듈 내부에서 뷰 전환이 가능하도록 핸들러 및 리스너 토대 마련.

## [v14.2.0] - 2026-05-08

### Changed

- **Relaxed Side Padding**: 메시지 영역의 좌우 여백을 4px에서 8px로 소폭 늘려 시각적 답답함을 해소하고 텍스트 가독성 개선.

## [v14.1.0] - 2026-05-08

### Changed

- **Immersive Drawer Width**: 비서 서랍의 너비를 기존 320px에서 380px(최대 90vw)로 확장하여 대화 몰입감 극대화.
- **Low-Blur Overlay**: 배경 블러 강도를 낮추어(4px -> 2px) 비서창 뒤의 원래 화면이 어렴풋이 부각되도록 조정.
- **Enhanced Transparency**: 오버레이 투명도를 미세 조정하여 세련된 유리 질감 구현.

## [v14.0.0] - 2026-05-08

### Changed

- **Ultra-Tight Layout**: `.agent-drawer-body`의 코어 스타일 충돌(padding 20px)을 제거하여 여백을 최소화하고 화면 활용도 극대화.
- **Pure Full-Width Input**: 입력창 하단 바의 패딩을 완전히 제거하여 진정한 제미나이 스타일의 전폭 레이아웃 완성.
- **Top Gap Resolved**: 상단 탭 전환기와 첫 대화 사이의 잔여 여백을 임계치까지 축소.

## [v13.9.0] - 2026-05-08

### Changed

- **Gemini Full-Width Input**: 채팅 입력창 컨테이너의 좌우 패딩을 최소화하고 배경색을 조정하여 제미나이와 유사한 전폭 스타일 구현.
- **Placeholder Updated**: 입력창 문구를 "비서에게 물어보세요"로 변경하여 에이전트 정체성 강화.

## [v13.8.0] - 2026-05-08

### Fixed

- **Empty Layout Fix**: 대화가 없을 때 입력창이 화면 중앙에 뜨던 레이아웃 버그를 수정하여 항상 하단에 밀착되도록 조정.
- **Top Gap Minimized**: 상단 탭 전환기(비서/메모/도구)와 첫 번째 대화 사이의 여백을 최소화하여 몰입감 향상.
- **Redundant Spacers Removed**: 불필요한 레이아웃 쉴드 및 스페이서를 제거하여 순수 텍스트 중심의 제미나이 룩 완성.

## [v13.7.0] - 2026-05-08

### Changed

- **Swipe Sensitivity Up**: 우측 서랍을 여는 스와이프 감도를 대폭 개선하여 모바일에서의 반응성 향상.
- **Autofill Icon Block**: 입력창 ID 및 타입을 변경하여 키보드 상단의 열쇠, 카드 등 자동완성 아이콘 노출 완벽 차단.
- **Tighter Spacing**: 사용자 메시지와 AI 답변 사이의 간격을 좁히고 좌우 여백을 최적화하여 제미나이 스타일의 밀착형 레이아웃 완성.

## [v13.6.0] - 2026-05-08

### Added

- **Chat Unification**: 하단 탭바 및 사이드바에서 'AI 상담' 메뉴를 제거하고, 우측 서랍 비서로 채팅 창구를 단일화하여 인터페이스 간섭 해결.
- **Global Cache Purge**: 전체 시스템 버전을 v13.6.0으로 업그레이드하고 서비스 워커 캐시를 갱신하여 최신 코드 반영 보장.
- **Navigation Filtering**: 모듈 설정에 `hidden` 속성을 도입하여 백그라운드에서는 동작하되 UI 메뉴에서는 노출되지 않는 유연한 구조 확립.

## [v13.5.1] - 2026-05-08

### Fixed

- **Auto-Focus Removal**: 채팅 진입 시 및 답변 수신 후 자동으로 키보드가 올라오던 `input.focus()` 로직을 전면 제거하여 사용자 주도형 인터랙션으로 개선.
- **Autofill Overlay Block**: 브라우저가 채팅창을 주소/결제 폼으로 오해하여 결제/위치 옵션을 띄우는 현상을 방지하기 위해 `inputmode`, `spellcheck`, `autocomplete` 속성 강화.
- **Bubble Residue Cleanup**: 코어 스타일(`components.css`)의 잔재와 충돌하던 문제를 해결하여 AI 응답이 배경 없이 투명하게 전폭으로 표시되도록 완벽 수정.

## [v13.5.0] - 2026-05-08

### Added

- **Gemini-Style Alignment**: 사용자 메시지를 우측으로 정렬하고 제미나이 특유의 어두운 말풍선 스타일 적용.
- **Full-Width AI Response**: AI 답변에서 말풍선을 완전히 제거하고 화면 전체 너비를 활용하여 가독성 극대화.
- **Signature Star Icon**: AI 응답 헤더에 제미나이의 상징인 별(Diamond) 아이콘 도입 및 불필요한 이름 텍스트 제거.
- **Top-Zero Layout**: 채팅창 최상단 여백을 제거하여 첫 멘트가 화면 상단에 밀착되도록 조정.
- **Typography Optimization**: 'Outfit' 폰트 두께를 조정하여 제미나이와 유사한 세련된 텍스트 렌더링 구현.

## [v13.4.2] - 2026-05-08

### Fixed

- **No Greeting Start**: 첫 접속 시 인사말을 생략하여 제미나이와 같은 깔끔한 시작 화면 구현.
- **Pill Input with Arrow**: 입력창 테두리를 뚜렷하게 살리고, 내부 전송 버튼을 '위쪽 화살표(↑)' 아이콘으로 변경.
- **Full-Width Minimalist AI**: AI 답변의 말풍선을 완전히 제거하고 화면 전체 너비를 활용하여 가독성 향상.

## [v13.2.3] - 2026-05-08

### Fixed

- **Auto-Scroll**: 채팅 시 최신 메시지가 바닥에 자석처럼 붙도록 로직 강화.
- **UX Padding**: 입력창 하단 과도한 여백 축소 및 메시지 하단 완충 지대(Spacer) 추가.
- **Drawer Scroll Reset**: 비서창 진입 시 스크롤 초기화 및 안정화.

## [v13.0.0] - 2026-05-08

### Added

- **Global Cleanup (v13.0.0)**: 전방위적인 코어 리팩토링 및 부채 청산.
- **단일 진실 공급원 (Single Source of Truth)**: `Registry`에서 버전 및 전역 상태(`window.hadState`)를 중앙 집중 관리.
- **이벤트 기반 통신 (Event-Driven Bridge)**: 지저분한 전역 함수(`window._had...`)를 제거하고 `ctx.events` 기반의 세련된 모듈 간 통신 체계 구축.
- **문자열 외부화 (String Externalization)**: HTML/JS 내 하드코딩된 한국어 문구들을 `config` 참조 방식으로 전면 교체.

### Changed

- **버전 관리 자동화**: 모든 모듈 임포트 및 자산 로드 시 `Registry.VERSION`을 동적으로 주입하여 캐시 문제 근본적 해결.
- **Admin 메뉴 반응성**: 로그인 상태와 권한 변화에 따라 마스터 운영실 메뉴가 즉각적으로 반응하도록 개선.
- **UI 일관성**: 로딩 스피너 및 알림(alert) 로직의 통일성 확보.

## [v12.0.0] - 2026-05-08

### Added

- **복합 환경 판정 시스템 (Adaptive Context)**: `orientation`, `touch`, `width`를 조합한 3중 체크 로직 도입 (고해상도 모바일 대응).
- **슬롯 아키텍처 설정화**: 서랍 슬롯 매핑 정보를 `config.js`로 분리하여 코어 무결성 강화.
- **물리적 상태 격리**: 서랍 전환 시 JS 및 CSS 레벨에서 `visibility`와 `pointer-events`를 제어하여 시각적 충돌 원천 차단.

### Fixed

- **Router 참조 오류**: `router.js` 내 `Registry` 참조 에러 수정.
- **Service Worker 강제 갱신**: `skipWaiting` 및 `clients.claim` 로직 최적화로 PWA 업데이트 지연 해결.
- **코어 정화**: 리팩토링 과정의 잔존 코드 및 하드코딩된 로직 제거.

## [v11.4.0] - 2026-05-08

### 추가 (Added)

- **온데만드 컨텍스트 (On-demand Context)**: 사용자가 보고 있는 모듈의 문맥(예: 특정 피드 게시물)을 AI 비서가 즉시 인지하는 지능형 주입 로직 구현.
- **스마트 공유 (Smart Sharing)**: `HAD-Feed` 모듈에 Web Share API를 연동하여 모바일에서 즉각적인 콘텐츠 확산 기능 추가.
- **컨텍스트 배지 UI**: 우측 비서 드로어 오픈 시 현재 분석 중인 문맥을 시각적으로 표시하는 상태 바 도입.

### 변경 (Changed)

- **전역 상태 구조 고도화**: `window.hadState`를 통해 현재 모듈 및 컨텍스트 데이터를 코어-모듈 간에 매끄럽게 공유하도록 개선.
- **캐시 버스팅 최적화**: 전방위적인 v11.4.0 버전 점프로 안정적인 최신 코드 배포 보장.

---

## [v11.3.0] - 2026-05-08

### 추가 (Added)

- **양방향 서랍(Dual-Drawer) 인터페이스**: 모바일 환경에서 좌측(메뉴)과 우측(에이전트 비서)을 동시에 활용할 수 있는 서랍 구조 구현.
- **지능형 스와이프 제스처**: 좌측 끝에서 우측으로 밀면 '메뉴', 우측 끝에서 좌측으로 밀면 '비서'가 튀어나오는 직관적인 UX 도입.
- **온데만드 컨텍스트(On-demand Context)**: 챗봇을 여는 순간에만 현재 페이지 정보를 AI에게 전달하여 토큰 비용을 혁신적으로 절감하는 로직 설계.
- **스마트 공유 및 CRM 전략**: 자료나 일정을 카카오톡 등으로 즉시 전송할 수 있는 공유 시스템을 설계도에 반영.

### 변경 (Changed)

- **에이전트 비서 레이아웃**: 기존 독립 페이지였던 채팅 모듈을 언제 어디서나 불러올 수 있는 '상주형 드로어' 형태로 아키텍처 변경.

## [v11.2.0] - 2026-05-08

### 추가 (Added)

- **제로-드라이브(Zero-Drive) 전략**: 사용자가 구글 드라이브를 열 필요 없이 UI만으로 모든 업무를 처리하는 '블랙박스 데이터 거버넌스' 확립.
- **린(Lean) 폴더 체계**: 드라이브 내 구조를 `Schedule`, `Resources`, `Feed`, `System` 4대 핵심 키워드로 간소화.
- **시스템 엔진룸 격리**: 마스터 계정만 접근 가능한 `System` 폴더를 통해 데이터 무결성 및 보안 강화.

### 변경 (Changed)

- **용어 대통합**: 프로젝트 전체의 `Board` 명칭을 `Feed`로 변경하고, 관련 폴더 및 코드 내 모든 참조를 동기화.
- **마스터 설계도 최신화**: `1_architecture.md`와 `3_modules.md`에 새로운 보안 및 운영 규약을 전수 기록.

## [v11.1.0] - 2026-05-08

### Fixed

- **UI Flashing & Disappearance**: 렌더링 후 화면이 사라지던 현상(Undeclared Variable 및 Async Race Condition) 해결.
- **Cache Busting**: 전면적인 버전 점프(v9 -> v11.1)를 통해 브라우저 캐시로 인한 구버전 코드 실행 문제 근본적 차단.
- **Syntax Cleanup**: 코어 전반의 문법 오류(Duplicate Catch, Misplaced Imports) 전수 수정.

### Added

- **Self-Healing Config**: 모듈 실행 시 `config`가 유실된 경우 `Registry`에서 즉시 재수혈받는 자가 치유 로직 도입.
- **Major Version Jump**: 함선의 엔진을 v11 체제로 업그레이드하여 시스템 안정성 확보.

## [v9.1.0] - 2026-05-08

### Added

- **Core Reinforcement**: '무적 코어' 엔진 구축 시작
  - **Error Isolation (Sandbox)**: 모듈별 `try-catch` 가드 도입.
  - **Global Event Bus**: `window.hadEvents` 체계 마련.
  - **Service Context Injection**: `ctx` 객체 주입 표준화.

## [v7.3.0] - 2026-05-08

### 📋 소셜 피드형 게시판 (HAD-Feed) 신규 개발

- **Social Feed UI 구현**: 페이스북/인스타그램의 UX를 벤치마킹한 카드 기반 피드 레이아웃 구축 (`modules/board/`).
- **Visual-First 디자인**: 대형 이미지 카드, 글래스모피즘 스타일, 소셜 반응 버튼(좋아요/댓글) 구현.
- **Drive-as-CMS 연동 준비**: 폴더별 게시물 관리(Folder-per-post) 구조를 위한 데이터 스펙 확정.
- **모바일 최적화**: 무한 스크롤 및 엄지 최적화 인터랙션을 위한 CSS/JS 레이아웃 최적화.

## [v7.2.0] - 2026-05-07

### 🛡️ 마스터 운영실 진입점 확보

- **관리자 전용 메뉴 노출**: `isAdmin` 권한 확인 시 사이드바 하단에 '🛡️ 마스터 운영실' 메뉴가 동적으로 나타나도록 구현.
- **전용 스타일링 적용**: 마스터 메뉴에 골드(Gold) 테마 스타일을 적용하여 시각적 권한 인지 강화.
- **제스처 연동**: 사이드바 스와이프 제스처와 관리자 메뉴 동적 렌더링 간의 정합성 확인.

## [v7.1.0] - 2026-05-07

### 📱 모바일 사용자 경험(UX) 강화

- **사이드바 스와이프 제스처 구현**:
  - 화면 왼쪽 끝에서 오른쪽으로 밀어 사이드바 열기 기능 추가.
  - 사이드바 내부에서 왼쪽으로 밀어 닫기 기능 추가.
  - 기존 버튼 방식과 병행하여 하이브리드 제어 지원.

## [v7.0.0] - 2026-05-07

### 🏛️ 마스터 관리 시스템 기반 구축

- **중앙 레지스트리 (`Registry`) 도입**: 정적 설정과 동적 설정을 통합 관리하고 변경 사항을 앱 전역에 전파하는 핵심 서비스 구축.
- **마스터 권한 식별 (RBAC)**: 구글 로그인 시 `adminEmails` 화이트리스트와 대조하여 `isAdmin` 권한을 부여하는 로직 구현.
- **하이브리드 설정 체계**: 로컬 스토리지(향후 드라이브)를 통한 동적 설정 저장 및 머지 메커니즘 적용.
- **코드 무결성**: 모든 코어 서비스와 모듈이 `Registry`를 통해 설정을 참조하도록 앱 초기화 로직(`app.js`) 전면 개편.

## [v6.0.0] - 2026-05-07

### 🛠️ PWA & UI 레이어 복구

- **PWA 안정화**: 불안정했던 Blob URL 기반의 동적 매니페스트 생성을 중단하고 정적 `manifest.json` 기반으로 회귀하여 설치(Install) 기능 정상화.
- **Service Worker 최적화**: 쿼리 스트링 무시 로직(`ignoreSearch: true`) 도입 및 캐시 전략 개선.
- **UI 레이어 복원**: 모듈화 과정에서 누락된 `settingsPanel` 및 `authOverlay` HTML 구조를 `index.html`에 재삽입.
- **사이드바 기능 연동**: 사이드바 하단 '설정' 및 '앱 정보' 버튼에 대한 이벤트 바인딩 완료.
- **캐시 강제 갱신**: 전방위적인 v6 버전 쿼리 적용으로 최신 코드 반영 보장.

## [v5.0.0] - 2026-05-06

### 🏗️ 코어 엔진 모듈화 및 챗봇 고도화

- **아키텍처 리팩토링**: `app.js`에서 테마, 브랜딩, 알림 로직을 `core/services`로 분리.
- **설정 컴포넌트 분리**: UI 로직을 `core/components/settings.js`로 독립시켜 유지보수성 향상.
- **챗봇 안정화**:
  - 백엔드(Cloud Function)에 Gemini 2.5 Flash 적용.
  - 멀티턴(History) 대화 지원 및 503 에러 발생 시 자동 재시도(Retry) 로직 추가.
- **캐시 버스팅**: `index.html` 및 모듈 로딩 시 `?v=5` 쿼리 적용 시작.

## [v4.0.0] - 2026-05-06 (AM)

### 🍱 Bento UI 최적화

- **레이아웃 완성**: 홈 모듈에 Bento Grid 스타일 적용.
- **디자인 토큰 매핑**: 테마 시스템과 벤토 카드 스타일 간의 변수 매핑 로직 추가.
- **무한 로딩 해결**: `app.js` 내의 템플릿 리터럴 문법 오류 수정으로 초기화 중단 현상 해결.

## [v1.0.0 ~ v3.0.0] - 2026-05-04 ~ 05

### 🚀 초기 모듈형 아키텍처 수립

- **Drive-as-CMS**: 구글 드라이브 기반의 리소스 및 일정 관리 시스템 구축.
- **기본 모듈 구축**: 홈, 일정, 자료실, AI 상담, 마이오피스 기본 틀 구현.
- **PWA 기본 설정**: 오프라인 지원을 위한 Service Worker 기초 작업.

---

## 🚀 향후 개발 과제 (Next Steps)

- **[v7.3.0 예정] 마스터 운영실 UI 및 제어 로직 실체화**
  - `core/components/admin.js` 생성 및 동적 폼 생성기(Form Generator) 구현.
  - 구글 드라이브 `system_config.json`과 연동하여 실시간 설정 읽기/쓰기 구현.
- **[v8.0.0 예정] 하이브리드 자동화 모듈 확장**
  - `modules/memo/` (HAD-Memo) 모듈 신설 및 에이전트(HAD 봇) 연동.
  - 관리자 공지 배너(Emergency Notice) 컴포넌트 core 주입.
- **[최적화]**
  - 제스처 감도 미세 조정 및 애니메이션 보강.
  - 관리자 권한 보안 강화 (Backend 검증 로직 추가).

---

_기록자: 안티그래비티 (AI Agent)_
