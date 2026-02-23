// Louvor J7MSC — Service Worker
// Cache-first para assets, network-first para API Bíblia
const CACHE = 'j7msc-v2';
const SHELL = 'j7msc-shell-v2';

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then(function(c) {
    return c.addAll(['/']).catch(function(){});
  }));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE && k !== SHELL; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (e.request.method !== 'GET') return;
  if (url.startsWith('chrome-extension')) return;
  if (url.startsWith('blob:')) return;

  // Bible API: network first, fallback to cache
  if (url.indexOf('bible-api.com') > -1) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        if (res.ok) {
          var clone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        return caches.match(e.request).then(function(cached){
          return cached || new Response(
            JSON.stringify({error:'offline', verses:[]}),
            {headers:{'Content-Type':'application/json'}}
          );
        });
      })
    );
    return;
  }

  // Everything else: cache first, then network
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var netFetch = fetch(e.request).then(function(res) {
        if (res.ok && res.status === 200) {
          var clone = res.clone();
          caches.open(SHELL).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      }).catch(function(){ return cached; });
      return cached || netFetch;
    })
  );
});
