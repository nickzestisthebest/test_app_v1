// Near-instant Apple Pay entries. An iPhone Shortcuts automation ("When I tap any of my Wallet cards") sends the merchant,
// amount and card name here with the person's own private link. The app picks them up on its next sync as pending
// purchases, and swaps each one for the bank's version when that arrives, so nothing counts twice.
// POST /api/tap?k=<private key> {merchant, amount, card}   ·   POST {op:'key'} (signed in) makes or shows the link
// POST {op:'pull'} (signed in) returns and clears what's waiting.
import { env, send, fail, body, handle, who, kv, kvReady, sha, incr, day } from './_lib.js';
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, n);
export default handle(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'post_only');
  if (!kvReady()) return fail(res, 503, 'storage_not_set_up', { setup: true });
  const u = new URL(req.url, 'http://x'), k = String(u.searchParams.get('k') || ''), b = await body(req);
  if (k) {
    if (!/^[a-f0-9]{32}$/.test(k)) return fail(res, 401, 'bad_key');
    const uid = await kv('GET', 'tapkey:' + (await sha(k)).slice(0, 40)); if (!uid) return fail(res, 401, 'bad_key');
    if ((await incr('taprate:' + uid + ':' + day(), 2 * 86400)) > 200) return fail(res, 429, 'too_many');
    const amt = Math.abs(parseFloat(String(b.amount || b.Amount || '').replace(/[^0-9.\-]/g, ''))); if (!(amt > 0 && amt < 100000)) return fail(res, 400, 'bad_amount');
    const item = { id: (await sha(uid + Date.now() + Math.random())).slice(0, 16), m: clean(b.merchant || b.Merchant || b.name || 'Apple Pay', 60), a: Math.round(amt * 100) / 100, card: clean(b.card || b.Card || '', 40), at: Date.now() };
    await kv('RPUSH', 'taps:' + uid, JSON.stringify(item)); await kv('EXPIRE', 'taps:' + uid, 14 * 86400);
    return send(res, 200, { ok: true });
  }
  const me = await who(req); const op = String(b.op || '');
  if (op === 'key') {
    let raw = null; if (b.reset || !(await kv('GET', 'tapmine:' + me.uid))) { raw = [...crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, '0')).join(''); const old = await kv('GET', 'tapmine:' + me.uid); if (old) await kv('DEL', 'tapkey:' + old); const h = (await sha(raw)).slice(0, 40); await kv('SET', 'tapkey:' + h, me.uid); await kv('SET', 'tapmine:' + me.uid, h) }
    const app = env('APP_URL').replace(/\/$/, '');
    return send(res, 200, { ok: true, url: raw ? (app || '') + '/api/tap?k=' + raw : null, has: true });
  }
  if (op === 'pull') { const L = (await kv('LRANGE', 'taps:' + me.uid, 0, 199)) || []; if (L.length) await kv('DEL', 'taps:' + me.uid); return send(res, 200, { ok: true, taps: L.map(x => { try { return JSON.parse(x) } catch { return null } }).filter(Boolean) }) }
  return fail(res, 400, 'unknown_op');
});
