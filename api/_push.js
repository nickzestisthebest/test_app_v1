// Web Push for Sprout, with no npm packages: VAPID signing (RFC 8292) and message encryption (RFC 8291) on Node's Web Crypto.
// The server makes its own VAPID key pair the first time it's needed and keeps it, encrypted, in storage.
// (You can set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY yourself instead; the private key is a base64url PKCS#8 key.)
import { env, kv, seal, unseal } from './_lib.js';

const te = new TextEncoder();
export const b64u = u => Buffer.from(u).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const unb64u = s => new Uint8Array(Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
const cat = (...a) => { const n = a.reduce((s, x) => s + x.length, 0), o = new Uint8Array(n); let i = 0; a.forEach(x => { o.set(x, i); i += x.length }); return o };

let KEYS = null;
export async function vapidKeys() {
  if (KEYS) return KEYS;
  const S = crypto.subtle;
  if (env('VAPID_PUBLIC_KEY') && env('VAPID_PRIVATE_KEY')) {
    const priv = await S.importKey('pkcs8', unb64u(env('VAPID_PRIVATE_KEY')), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
    return (KEYS = { pub: env('VAPID_PUBLIC_KEY'), priv });
  }
  let stored = null;
  try { const v = await kv('GET', 'vapid:v1'); if (v) stored = JSON.parse(await unseal(v)) } catch { stored = null }
  if (!stored) {
    const kp = await S.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const pub = b64u(new Uint8Array(await S.exportKey('raw', kp.publicKey))), jwk = await S.exportKey('jwk', kp.privateKey);
    const box = await seal(JSON.stringify({ pub, jwk }));
    // two servers starting at once keep the same key: only the first one is saved
    await kv('SET', 'vapid:v1', box, 'NX');
    stored = JSON.parse(await unseal(await kv('GET', 'vapid:v1')));
  }
  const priv = await S.importKey('jwk', stored.jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  return (KEYS = { pub: stored.pub, priv });
}

async function vapidJWT(endpoint, keys) {
  const aud = new URL(endpoint).origin;
  const head = b64u(te.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const body = b64u(te.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env('VAPID_SUBJECT', 'mailto:support@sprout.app') })));
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keys.priv, te.encode(head + '.' + body)));
  return head + '.' + body + '.' + b64u(sig);
}
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8));
}
// RFC 8291: one record, aes128gcm
export async function encrypt(sub, text) {
  const S = crypto.subtle, ua = unb64u(sub.keys.p256dh), auth = unb64u(sub.keys.auth);
  const eph = await S.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const as = new Uint8Array(await S.exportKey('raw', eph.publicKey));
  const uaKey = await S.importKey('raw', ua, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await S.deriveBits({ name: 'ECDH', public: uaKey }, eph.privateKey, 256));
  const ikm = await hkdf(auth, shared, cat(te.encode('WebPush: info\0'), ua, as), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12);
  const key = await S.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await S.encrypt({ name: 'AES-GCM', iv: nonce }, key, cat(te.encode(text), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]);
  return cat(salt, rs, new Uint8Array([as.length]), as, ct);
}
// only real push services: never let a stored address point the server somewhere else
export const pushHostOK = u => { try { const h = new URL(u); return h.protocol === 'https:' && /(^|\.)(push\.apple\.com|fcm\.googleapis\.com|googleapis\.com|push\.services\.mozilla\.com|notify\.windows\.com|push\.api\.chromium\.org)$/.test(h.hostname) || (!!env('PUSH_TEST_HOST') && h.origin === env('PUSH_TEST_HOST')) } catch { return false } };
export async function sendPush(sub, payload, ttl = 86400) {
  if (!sub || !sub.endpoint || !sub.keys || !pushHostOK(sub.endpoint)) return { ok: false, status: 0, gone: true };
  const keys = await vapidKeys(), body = await encrypt(sub, JSON.stringify(payload));
  const r = await fetch(sub.endpoint, { method: 'POST', headers: { TTL: String(ttl), 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', Urgency: 'normal', Authorization: 'vapid t=' + (await vapidJWT(sub.endpoint, keys)) + ', k=' + keys.pub }, body });
  return { ok: r.status >= 200 && r.status < 300, status: r.status, gone: r.status === 404 || r.status === 410 };
}
