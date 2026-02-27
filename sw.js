/* ══════════════════════════════════════════════
   Louvor J7MSC — Service Worker
   Cache-first com fallback de rede
   ══════════════════════════════════════════════ */

const CACHE_NAME   = 'louvor-j7msc-v1';
const OFFLINE_URL  = '/index.html';

/* Ficheiros a pré-cachear na instalação */
const PRE_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

/* ── Install ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

/* ── Activate: apaga caches antigas ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: Cache-first, fallback rede, fallback offline ── */
self.addEventListener('fetch', event => {
  /* Ignora pedidos não-GET e pedidos externos (ex: YouTube, Spotify) */
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          /* Guarda uma cópia no cache se for uma resposta válida */
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          /* Offline fallback para navegação */
          if (event.request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

/* ── Background Sync (opcional, para funcionalidades futuras) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    // reservado para futuras sincronizações
  }
});

/* ── Push Notifications (opcional) ── */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Louvor J7MSC', {
    body:    data.body   || '',
    icon:    '/icons/icon-192.png',
    badge:   '/icons/icon-96.png',
    vibrate: [200, 100, 200]
  });
});
