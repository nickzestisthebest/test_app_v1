"""Builds the installable app into public/ from the Sprout app file.
Usage: python3 tools/build_pwa.py [path/to/sprout_v2.html]
Then:  node tools/gen_prompts.mjs   (lets the server recognize the app's AI prompts)"""
import hashlib, json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..', 'sprout', 'sprout_v2.html')
ICON = os.path.join(ROOT, 'tools', 'icon_1024.png')
PUB = os.path.join(ROOT, 'public')
os.makedirs(os.path.join(PUB, 'icons'), exist_ok=True)

s = open(SRC, encoding='utf-8').read()
assert s.count('<title>Sprout v2</title>') == 1
s = s.replace('<title>Sprout v2</title>', '<title>Sprout</title>')
HEAD = ('<meta name="theme-color" content="#2a9f52">'
        '<meta name="description" content="Sprout: a calm daily budget that knows your bills and paychecks.">'
        '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
        '<meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="Sprout">'
        '<meta name="format-detection" content="telephone=no">'
        '<link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">'
        '<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">')
vp = '<meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">'
assert s.count(vp) == 1
s = s.replace(vp, vp + HEAD)
open(os.path.join(PUB, 'index.html'), 'w', encoding='utf-8').write(s)

im = Image.open(ICON).convert('RGB')
for name, size in [('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512), ('maskable-512.png', 512), ('favicon-32.png', 32)]:
    im.resize((size, size), Image.LANCZOS).save(os.path.join(PUB, 'icons', name), optimize=True)

man = {
    'name': 'Sprout', 'short_name': 'Sprout', 'id': '/', 'start_url': '/', 'scope': '/',
    'display': 'standalone', 'orientation': 'portrait', 'background_color': '#f6fbf7', 'theme_color': '#2a9f52',
    'description': 'A calm daily budget that knows your bills and paychecks.',
    'icons': [
        {'src': '/icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
        {'src': '/icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
        {'src': '/icons/maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]}
open(os.path.join(PUB, 'manifest.webmanifest'), 'w').write(json.dumps(man, indent=2))

ver = hashlib.sha256(s.encode('utf-8')).hexdigest()[:10]
SW = r"""// Sprout offline support. The app opens without a connection; bank sync and AI need one.
const V = 'sprout-__VER__';
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
""".replace('__VER__', ver)
open(os.path.join(PUB, 'sw.js'), 'w').write(SW)
open(os.path.join(PUB, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
print('public/ built, version', ver, 'index', len(s), 'bytes')
