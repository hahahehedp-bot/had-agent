// HAD-Agent — Service Worker (PWA 오프라인 지원)
const CACHE = 'had-agent-v2';
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './core/app.js',
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
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => cached);
    })
  );
});
