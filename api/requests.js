// Cancel for me requests. Each one holds the person's authorization (what they agreed to, and when).
// The owner works the queue from Settings in the app and marks each request as it moves.
// Names and emails are encrypted at rest. Sprout never collects passwords for other services.
// Turn the whole feature off with CANCEL_FOR_ME=off (people then see how to cancel it themselves).
import { env, send, fail, body, handle, who, kv, kvReady, seal, unseal, incr, day } from './_lib.js';

const ALL = 'rq:all', MINE = uid => 'rq:u:' + uid;
const OPEN = new Set(['requested', 'working', 'needs_you']);
const NEXT = new Set(['working', 'done', 'needs_you', 'failed']);
const str = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
export const cancelOn = () => env('CANCEL_FOR_ME', 'on').toLowerCase() !== 'off';

async function all() {
  const h = (await kv('HGETALL', ALL)) || [], out = [];
  for (let i = 0; i < h.length; i += 2) { try { out.push(JSON.parse(h[i + 1])) } catch { } }
  return out.sort((a, b) => b.at - a.at);
}
const mineView = q => ({ id: q.id, kind: q.kind, sub_id: q.sub_id, service: q.service, amount: q.amount, status: q.status, note: q.note || '', at: q.at, done: q.done || null });
export async function openCount() { return (await all()).filter(q => OPEN.has(q.status)).length }

export default handle(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'post_only');
  if (!kvReady()) return fail(res, 503, 'storage_not_set_up', { setup: true });
  const me = await who(req), b = await body(req), op = String(b.op || '');

  if (op === 'create') {
    if (!cancelOn()) return fail(res, 403, 'cancel_off');
    if (!me.plus) return fail(res, 402, 'plus_required');
    const service = str(b.service, 60), email = str(b.account_email, 120), name = str(b.account_name, 80), c = b.consent || {};
    if (!service || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, 'missing_details');
    const text = str(c.text, 300);
    if (!text.startsWith('I authorize Sprout to contact ') || !text.includes(service) || !(Math.abs(Date.now() - +c.at) < 864e5)) return fail(res, 400, 'missing_consent');
    if (await incr('rqn:' + me.uid + ':' + day(), 2 * 86400) > 20) return fail(res, 429, 'slow_down');
    const mine = (await all()).filter(q => q.uid === me.uid && OPEN.has(q.status));
    if (mine.some(q => q.sub_id === str(b.sub_id, 60))) return fail(res, 409, 'already_requested');
    if (mine.length >= 10) return fail(res, 429, 'too_many_open');
    const id = 'rq' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const q = { id, uid: me.uid, kind: 'cancel', sub_id: str(b.sub_id, 60), service, amount: Math.round((+b.amount || 0) * 100) / 100, cadence: str(b.cadence, 20),
      who: await seal(JSON.stringify({ name, email })), consent: { text, at: +c.at, v: str(c.v, 20), ip: String(req.headers['x-forwarded-for'] || '').split(',')[0].trim().slice(0, 45) },
      status: 'requested', note: '', at: Date.now(), upd: Date.now() };
    await kv('HSET', ALL, id, JSON.stringify(q));
    await kv('HSET', MINE(me.uid), id, '1');
    return send(res, 200, { ok: true, id, status: 'requested' });
  }

  if (op === 'mine') return send(res, 200, { ok: true, requests: (await all()).filter(q => q.uid === me.uid).slice(0, 50).map(mineView) });

  if (op === 'withdraw') {
    const raw = await kv('HGET', ALL, str(b.id, 40)); const q = raw ? JSON.parse(raw) : null;
    if (!q || q.uid !== me.uid) return fail(res, 404, 'not_found');
    if (q.status !== 'requested') return fail(res, 409, 'already_started');
    q.status = 'withdrawn'; q.upd = Date.now(); await kv('HSET', ALL, q.id, JSON.stringify(q));
    return send(res, 200, { ok: true });
  }

  // owner only from here
  if (!me.owner) return fail(res, 403, 'owner_only');
  if (op === 'queue') {
    const L = (await all()).slice(0, 200);
    const out = [];
    for (const q of L) { let w = {}; try { w = JSON.parse(await unseal(q.who)) } catch { } out.push(Object.assign(mineView(q), { cadence: q.cadence, account_name: w.name || '', account_email: w.email || '', consent: q.consent })) }
    return send(res, 200, { ok: true, requests: out });
  }
  if (op === 'update') {
    const raw = await kv('HGET', ALL, str(b.id, 40)); const q = raw ? JSON.parse(raw) : null;
    if (!q) return fail(res, 404, 'not_found');
    const status = str(b.status, 20);
    if (!NEXT.has(status) || !OPEN.has(q.status)) return fail(res, 400, 'bad_status');
    q.status = status; q.note = str(b.note, 300); q.upd = Date.now(); if (status === 'done') q.done = Date.now();
    await kv('HSET', ALL, q.id, JSON.stringify(q));
    return send(res, 200, { ok: true });
  }
  return fail(res, 400, 'unknown_op');
});
