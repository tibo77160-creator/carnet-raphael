// Carnet de Raphaël — cache hors-ligne. Changez VERSION à chaque mise à jour.
const VERSION = 'carnet-1.0.1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png'];
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).catch(() => {})); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  // Pages et fichiers de l'app : réseau d'abord (mises à jour immédiates), cache si hors ligne
  if (url.origin === location.origin) {
    e.respondWith(fetch(r).then((res) => { const c = res.clone(); caches.open(VERSION).then((ca) => ca.put(r, c)); return res; })
      .catch(() => caches.match(r).then((m) => m || caches.match('./index.html'))));
    return;
  }
  // Librairie Firebase : cache d'abord (fichiers versionnés)
  if (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { const c = res.clone(); caches.open(VERSION).then((ca) => ca.put(r, c)); return res; })));
  }
});
