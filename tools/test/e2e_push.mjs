// Phone notifications, end to end against the stand-in push service: subscribe, queue, send once, decrypt, clean up.
// Run tools/test/run_servers.sh first, then: node tools/test/e2e_push.mjs
const BASE = 'http://localhost:3000', MOCK = 'http://127.0.0.1:4010', S = crypto.subtle, te = new TextEncoder();
const b64u = u => Buffer.from(u).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => new Uint8Array(Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
const R = []; const ck = (n, c, i = '') => R.push((c ? 'PASS ' : 'FAIL ') + n + (c ? '' : ' ' + JSON.stringify(i).slice(0, 300)));
const api = async (body, code = 'free-code-5678') => { const r = await fetch(BASE + '/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-sprout-code': code }, body: JSON.stringify(body) }); const j = await r.json(); j.status = r.status; return j };
const run = async () => (await fetch(BASE + '/api/push?op=run', { headers: { authorization: 'Bearer test-cron-secret' } })).json();
const pushes = async () => (await (await fetch(MOCK + '/pushes')).json()).items;
async function hkdf(salt, ikm, info, len) { const k = await S.importKey('raw', ikm, 'HKDF', false, ['deriveBits']); return new Uint8Array(await S.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8)) }
const cat = (...a) => { const o = new Uint8Array(a.reduce((s, x) => s + x.length, 0)); let i = 0; a.forEach(x => { o.set(x, i); i += x.length }); return o };
// the phone's side: its own key pair and secret
const ua = await S.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
const uaPub = new Uint8Array(await S.exportKey('raw', ua.publicKey)), auth = crypto.getRandomValues(new Uint8Array(16));
async function decrypt(b64) {
  const buf = new Uint8Array(Buffer.from(b64, 'base64')), salt = buf.slice(0, 16), idlen = buf[20], asPub = buf.slice(21, 21 + idlen), ct = buf.slice(21 + idlen);
  const asKey = await S.importKey('raw', asPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await S.deriveBits({ name: 'ECDH', public: asKey }, ua.privateKey, 256));
  const ikm = await hkdf(auth, shared, cat(te.encode('WebPush: info\0'), uaPub, asPub), 32);
  const cek = await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16), nonce = await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12);
  const k = await S.importKey('raw', cek, 'AES-GCM', false, ['decrypt']);
  const pt = new Uint8Array(await S.decrypt({ name: 'AES-GCM', iv: nonce }, k, ct));
  let end = pt.length - 1; while (end > 0 && pt[end] === 0) end--; return JSON.parse(new TextDecoder().decode(pt.slice(0, end)));
}
async function jwtOK(authz, vapidPub, aud) {
  const m = String(authz).match(/^vapid t=([^,]+), k=(.+)$/); if (!m || m[2] !== vapidPub) return false;
  const [h, p, sg] = m[1].split('.'), body = JSON.parse(Buffer.from(p, 'base64').toString());
  const key = await S.importKey('raw', unb64u(vapidPub), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  return body.aud === aud && body.exp > Date.now() / 1000 && await S.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, unb64u(sg), te.encode(h + '.' + p));
}
await fetch(MOCK + '/pushes');
const k = await api({ op: 'key' });
ck('server hands out its public key', k.ok && unb64u(k.key).length === 65, k);
const k2 = await api({ op: 'key' });
ck('the key stays the same', k2.key === k.key);
const dev = 'phone' + Date.now().toString(36);
const sub = { endpoint: MOCK + '/push/' + dev, keys: { p256dh: b64u(uaPub), auth: b64u(auth) } };
ck('a push address that isn’t a real push service is refused', (await api({ op: 'sub', dev, sub: { endpoint: 'https://evil.example.com/x', keys: sub.keys } })).status === 400);
ck('subscribing works', (await api({ op: 'sub', dev, sub })).ok);
const now = Date.now();
const q = await api({ op: 'queue', dev, items: [
  { id: 'p-due-1', at: now - 60e3, title: 'Due tomorrow: Rent', body: '$1,200.00. Sprout already set the money aside.', url: '/?go=calendar' },
  { id: 'p-later', at: now + 3600e3, title: 'Later', body: 'Not yet', url: '/' },
  { id: 'p-old', at: now - 3 * 86400e3, title: 'Old', body: 'Too late', url: '/' },
  { id: 'p-bad', at: now - 60e3, title: 'Bad link', body: 'x', url: 'https://evil.example.com' }] });
ck('the queue keeps only what can still be sent', q.ok && q.n === 3, q);
const r1 = await run();
ck('the scheduler sends what is due', r1.ok && r1.sent === 2, r1);
const got = await pushes();
ck('the push service got two messages', got.length === 2, got.length);
const msgs = await Promise.all(got.map(g => decrypt(g.body)));
const due = msgs.find(m => m.title === 'Due tomorrow: Rent');
ck('the message decrypts on the phone (RFC 8291)', !!due && due.body.startsWith('$1,200.00') && due.url === '/?go=calendar', msgs);
ck('a link that leaves Sprout is replaced', msgs.some(m => m.title === 'Bad link' && m.url === '/'), msgs);
ck('encrypted with aes128gcm and a time to live', got.every(g => g.enc === 'aes128gcm' && +g.ttl > 0));
ck('signed by the server (VAPID)', await jwtOK(got[0].auth, k.key, MOCK), got[0].auth.slice(0, 40));
const r2 = await run();
ck('nothing is sent twice', r2.sent === 0 && (await pushes()).length === 0, r2);
ck('a test notification', (await api({ op: 'test', dev })).ok && (await pushes()).length === 1);
// a phone that unsubscribed at Apple or Google is cleaned up
const dev2 = 'gone' + Date.now().toString(36);
await api({ op: 'sub', dev: dev2, sub: { endpoint: MOCK + '/push/x/gone', keys: sub.keys } });
await api({ op: 'queue', dev: dev2, items: [{ id: 'g1', at: now - 1000, title: 'Hi', body: 'x', url: '/' }] });
await run(); await pushes();
ck('a phone that’s gone is removed', (await api({ op: 'test', dev: dev2 })).status === 404);
ck('turning it off removes the phone', (await api({ op: 'unsub', dev })).ok && (await api({ op: 'test', dev })).status === 404);
ck('only the scheduler can run the sender', (await fetch(BASE + '/api/push?op=run')).status === 401);
ck('needs an access code', (await (await fetch(BASE + '/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"op":"key"}' })).status) === 401);
console.log(R.join('\n')); console.log(R.filter(x => x.startsWith('PASS')).length, '/', R.length);
