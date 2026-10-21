// Sprout offline support. The app opens without a connection; bank sync and AI need one.
const V = 'sprout-92721b8b52';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())) });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== V).map(n => caches.delete(n)))).then(() => self.clients.claim())) });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin || u.pathname.startsWith('/api/')) return;
  if (r.mode === 'navigate') {
    // newest app when online, the saved copy when offline
    e.respondWith(Promise.race([fetch(r).then(res => { const c = res.clone(); if (res.ok) caches.open(V).then(x => x.put('/', c)); return res }),
      new Promise((_, no) => setTimeout(no, 5000))]).catch(() => caches.match('/').then(m => m || fetch(r))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)) } return res })));
});
