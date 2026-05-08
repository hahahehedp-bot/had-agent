// HAD-Agent — Service Worker (PWA 오프라인 지원)
const CACHE = 'had-agent-v14.0.0';
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './core/app.js',
  './core/auth.js',
  './core/router.js',
  './core/sidebar.js',
  './core/tabbar.js',
  './core/styles/layout.css',
  './core/styles/components.css',
  './core/styles/responsive.css',
  './client/config.js',
  './modules/home/home.js',
  './modules/home/home.css',
  './modules/chat/chat.js',
  './modules/chat/chat.css',
  './modules/schedule/schedule.js',
  './modules/resources/resources.js',
  './modules/feed/feed.js',
  './modules/feed/feed.css',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // 외부 API는 캐시 안 함
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    // [해결의 핵심] 네트워크를 먼저 시도 (Network-First)
    fetch(e.request).then(res => {
      // 네트워크 성공 시: 캐시에 최신 버전 복사 후 반환
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => {
      // 오프라인이거나 네트워크 실패 시: 캐시된 구버전 반환 (쿼리 스트링 무시)
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});
