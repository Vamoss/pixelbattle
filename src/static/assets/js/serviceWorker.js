var cacheName = 'PixelBattle-v0.0.1';
var filesToCache = [
  '/index.html',
  '/assets/js/index.js',
  '/assets/css/style.css',
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});


//when activated, service worker certifies if the older cached files still in the same version(cacheName var)
//then remove the cached files if the cacheName are different
self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate 1s');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

//fetch events determines how we want to manage each cached request
self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});