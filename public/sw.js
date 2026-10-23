// Sprout offline support. The app opens without a connection; bank sync and AI need one.
const V = 'sprout-8b62cfe531';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())) });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== V).map(n => caches.delete(n)))).then(() => self.clients.claim())) });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin || u.pathname.startsWith('/api/') || u.pathname === '/sw.js') return;
  if (r.mode === 'navigate' && u.pathname !== '/') return;
  if (r.mode === 'navigate') {
    // newest app when online, the saved copy when offline
    e.respondWith(Promise.race([fetch(r).then(res => { const c = res.clone(); if (res.ok) caches.open(V).then(x => x.put('/', c)); return res }),
      new Promise((_, no) => setTimeout(no, 8000))]).catch(() => caches.match('/').then(m => m || fetch(r))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)) } return res })));
});
// notifications you chose in Sprout: show them, and open the right screen when tapped
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {} } catch (_) { d = { body: e.data ? e.data.text() : '' } }
  const url = /^\/(\?go=[a-z]*)?$/.test(String(d.url || '')) ? d.url : '/';
  e.waitUntil(self.registration.showNotification(String(d.title || 'Sprout').slice(0, 120), { body: String(d.body || '').slice(0, 240), tag: String(d.tag || 'sprout').slice(0, 80), icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data: { url } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(L => { for (const c of L) { if ('focus' in c) { c.navigate ? c.navigate(url).catch(() => 0) : 0; return c.focus() } } return self.clients.openWindow(url) }));
});
