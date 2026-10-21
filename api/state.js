// An encrypted backup of each person's plan, so signing in on a new phone (or after the app's storage
// was cleared) brings back their plan, history and streak. The app sends it compressed; the server
// encrypts it with ENCRYPTION_KEY before storing it, and only the same access code plus the same
// Sprout account can read it back. People can turn backup off in Settings, which deletes this copy.
import { send, fail, body, handle, who, kv, kvReady, seal, unseal, incr, day } from './_lib.js';

const MAX = 900000; // characters of compressed, base64 data (stays under storage request limits)

export default handle(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'post_only');
  if (!kvReady()) return fail(res, 503, 'storage_not_set_up', { setup: true });
  const me = await who(req), b = await body(req), op = String(b.op || '');
  const acct = String(b.acct || '').toLowerCase().replace(/[^a-f0-9]/g, '').slice(0, 32);
  if (acct.length < 16) return fail(res, 400, 'bad_account');
  const K = 'bk:' + me.uid + ':' + acct;

  if (op === 'put') {
    const data = String(b.data || '');
    if (!/^[GJ]:[A-Za-z0-9+/=]+$/.test(data)) return fail(res, 400, 'bad_data');
    if (data.length > MAX) return fail(res, 413, 'too_large');
    if (await incr('bkn:' + me.uid + ':' + day(), 2 * 86400) > 500) return fail(res, 429, 'slow_down');
    const s = b.stk && typeof b.stk === 'object' ? b.stk : {};
    const meta = { at: Number.isFinite(+b.at) ? +b.at : Date.now(), saved: Date.now(), dev: String(b.dev || '').slice(0, 40),
      stk: { run: +s.run || 0, best: +s.best || 0, last: String(s.last || '').slice(0, 10) } };
    await kv('SET', K, JSON.stringify({ meta, box: await seal(data) }));
    return send(res, 200, { ok: true, at: meta.at });
  }
  if (op === 'get') {
    const v = await kv('GET', K);
    if (!v) return send(res, 200, { ok: true, none: true });
    let j = null; try { j = JSON.parse(v) } catch { }
    if (!j || !j.box) return send(res, 200, { ok: true, none: true });
    return send(res, 200, { ok: true, meta: j.meta, data: b.meta_only ? undefined : await unseal(j.box) });
  }
  if (op === 'delete') { await kv('DEL', K); return send(res, 200, { ok: true }) }
  return fail(res, 400, 'unknown_op');
});
