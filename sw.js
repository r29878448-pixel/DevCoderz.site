self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('devcoderz-cache').then((cache) => cache.addAll(['/PW/'])));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
