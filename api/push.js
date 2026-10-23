// Phone notifications. The app works out what to say (on the phone, from the person's own numbers) and hands this server
// a short list of dated reminders. This server keeps them encrypted and sends each one once, when it's due.
// POST {op:'key'|'sub'|'unsub'|'queue'|'test'} from the app. GET /api/push?op=run from a scheduler sends whatever is due.
import { env, send, fail, body, handle, who, kv, kvReady, seal, unseal, incr, day } from './_lib.js';
import { vapidKeys, sendPush, pushHostOK } from './_push.js';

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').slice(0, n);
const devOf = b => String(b.dev || '').replace(/[^a-z0-9]/gi, '').slice(0, 16);
const SENT_TTL = 40 * 86400;

async function getJSON(k) { const v = await kv('GET', k); if (!v) return null; try { return JSON.parse(await unseal(v)) } catch { return null } }
async function putJSON(k, o) { return kv('SET', k, await seal(JSON.stringify(o))) }

// send what's due for one phone: never twice, never something that's more than a day late, at most 3 per run
async function runOne(member, now) {
  const [uid, dev] = String(member).split('|');
  const S = await getJSON('ps:' + uid + ':' + dev);
  if (!S || !S.sub) { await kv('SREM', 'psdevs', member); return { sent: 0, gone: true } }
  const Q = (await getJSON('pq:' + uid + ':' + dev)) || { items: [] };
  const due = (Q.items || []).filter(x => x.at <= now && now - x.at < 24 * 3600e3).sort((a, b) => a.at - b.at);
  let sent = 0;
  for (const x of due) {
    if (sent >= 3) break;
    const sk = 'psent:' + uid + ':' + dev + ':' + x.id;
    if (await kv('GET', sk)) continue;
    await kv('SET', sk, '1', 'EX', SENT_TTL);
    const r = await sendPush(S.sub, { title: x.title, body: x.body, url: x.url, tag: x.id });
    if (r.gone) { await kv('DEL', 'ps:' + uid + ':' + dev); await kv('SREM', 'psdevs', member); return { sent, gone: true } }
    if (r.ok) sent++;
  }
  // drop what's old so the list stays small
  Q.items = (Q.items || []).filter(x => now - x.at < 24 * 3600e3);
  await putJSON('pq:' + uid + ':' + dev, Q);
  return { sent };
}

// a direct nudge to every phone a person has (used by the bank webhook): short text only, never amounts or names
export async function pushTo(uid, msg) {
  const all = (await kv('SMEMBERS', 'psdevs')) || [];let n = 0;
  for (const m of all) { if (String(m).split('|')[0] !== uid) continue; const S = await getJSON('ps:' + m.replace('|', ':')); if (!S || !S.sub) continue;
    try { const r = await sendPush(S.sub, { title: clean(msg.title, 60), body: clean(msg.body, 160), url: clean(msg.url || '/', 200), tag: clean(msg.tag || 'sprout', 40) }); if (r.ok) n++ } catch { } }
  return n;
}
export default handle(async (req, res) => {
  if (!kvReady()) return fail(res, 503, 'storage_not_set_up', { setup: true });
  if (req.method === 'GET') {
    const u = new URL(req.url, 'http://x');
    if (u.searchParams.get('op') !== 'run') return fail(res, 400, 'unknown_op');
    // a scheduler (Vercel Cron, or any free cron service) calls this. With CRON_SECRET set, only it can.
    const sec = env('CRON_SECRET');
    if (sec && String(req.headers.authorization || '') !== 'Bearer ' + sec) return fail(res, 401, 'not_allowed');
    if (!sec && (await incr('prun:' + Math.floor(Date.now() / 60000), 120)) > 1) return send(res, 200, { ok: true, skipped: true });
    const now = Date.now(), members = (await kv('SMEMBERS', 'psdevs')) || [];
    let sent = 0;
    for (const m of members.slice(0, 2000)) { try { sent += (await runOne(m, now)).sent } catch (e) { console.error('push', e && e.message) } }
    return send(res, 200, { ok: true, phones: members.length, sent });
  }
  if (req.method !== 'POST') return fail(res, 405, 'post_only');
  const me = await who(req), b = await body(req), op = String(b.op || '');
  if (op === 'key') return send(res, 200, { ok: true, key: (await vapidKeys()).pub });
  const dev = devOf(b);
  if (dev.length < 6) return fail(res, 400, 'bad_device');
  const member = me.uid + '|' + dev, SK = 'ps:' + me.uid + ':' + dev, QK = 'pq:' + me.uid + ':' + dev;
  if (await incr('pn:' + me.uid + ':' + day(), 2 * 86400) > 400) return fail(res, 429, 'slow_down');
  if (op === 'sub') {
    const s = b.sub || {};
    if (!s.endpoint || !pushHostOK(s.endpoint) || !s.keys || !s.keys.p256dh || !s.keys.auth) return fail(res, 400, 'bad_subscription');
    const sub = { endpoint: clean(s.endpoint, 800), keys: { p256dh: clean(s.keys.p256dh, 200), auth: clean(s.keys.auth, 64) } };
    await putJSON(SK, { sub, at: Date.now() });
    await kv('SADD', 'psdevs', member);
    return send(res, 200, { ok: true });
  }
  if (op === 'unsub') { await kv('DEL', SK); await kv('DEL', QK); await kv('SREM', 'psdevs', member); return send(res, 200, { ok: true }) }
  if (op === 'queue') {
    const now = Date.now();
    const items = (Array.isArray(b.items) ? b.items : []).slice(0, 40).map(x => ({ id: clean(x.id, 80).replace(/[^a-zA-Z0-9:._-]/g, '-'), at: +x.at, title: clean(x.title, 120), body: clean(x.body, 240), url: /^\/(\?go=[a-z]*)?$/.test(String(x.url || '')) ? String(x.url) : '/' }))
      .filter(x => x.id && x.title && Number.isFinite(x.at) && x.at > now - 24 * 3600e3 && x.at < now + 40 * 86400e3);
    await putJSON(QK, { items, at: now });
    return send(res, 200, { ok: true, n: items.length });
  }
  if (op === 'test') {
    const S = await getJSON(SK);
    if (!S || !S.sub) return fail(res, 404, 'not_subscribed');
    const r = await sendPush(S.sub, { title: 'Sprout', body: 'Notifications are working. You’ll only get the kinds you chose.', url: '/', tag: 'test' });
    if (r.gone) { await kv('DEL', SK); await kv('SREM', 'psdevs', member) }
    return send(res, r.ok ? 200 : 502, { ok: r.ok, status: r.status });
  }
  return fail(res, 400, 'unknown_op');
});
