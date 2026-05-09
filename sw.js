// HAD-Agent — Service Worker (PWA 오프라인 지원)
// [v16.0.0] Dynamic Versioning System
let CACHE = 'had-agent-v16.0.0-alpha.2'; // 초기값

// [v16.0.0] 버전 정보를 동적으로 가져오는 유틸리티
async function updateCacheVersion() {
  try {
    const res = await fetch('./version.json?t=' + Date.now());
    const data = await res.json();
    CACHE = 'had-agent-v' + data.version;
    return CACHE;
  } catch (e) {
    return CACHE;
  }
}
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
    updateCacheVersion().then(cacheName => 
      caches.open(cacheName).then(c => c.addAll(CORE_FILES))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    updateCacheVersion().then(cacheName =>
      caches.keys().then(keys => Promise.all(
        keys.filter(k => k !== cacheName).map(k => caches.delete(k))
      ))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    // [해결의 핵심] 네트워크를 먼저 시도 (Network-First)
    fetch(e.request).then(res => {
      const clone = res.clone();
      updateCacheVersion().then(cacheName => 
        caches.open(cacheName).then(c => c.put(e.request, clone))
      );
      return res;
    }).catch(() => {
      // 오프라인이거나 네트워크 실패 시: 캐시된 구버전 반환 (쿼리 스트링 무시)
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});
