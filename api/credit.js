// Credit monitoring (Plus): weekly credit updates through a licensed credit-data partner (for example Array or iSoftpull).
// Nothing here pulls credit until the owner signs a contract with a partner and adds its keys in Vercel:
//   CREDIT_PROVIDER (a name), CREDIT_PROVIDER_KEY (secret), CREDIT_ENROLL_URL (the partner's hosted sign-up page).
// The person always signs up on the partner's own page (identity check and FCRA consent happen there), so Sprout never
// sees a Social Security number. Sprout keeps only the consent record and the partner's token, encrypted.
// POST {op:'status'|'consent'|'start'|'stop'}
import { env, send, fail, body, handle, who, kv, kvReady, seal } from './_lib.js';

const configured = () => !!(env('CREDIT_PROVIDER_KEY') && env('CREDIT_ENROLL_URL'));
export default handle(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'post only');
  const me = await who(req);
  const b = await body(req);
  const op = String(b.op || '');
  if (op === 'status') return send(res, 200, { ok: true, configured: configured(), provider: configured() ? env('CREDIT_PROVIDER', 'partner') : '', plus: !!me.plus });
  if (!me.plus) return fail(res, 402, 'Credit monitoring comes with Plus.');
  if (!configured()) return fail(res, 501, 'Credit monitoring isn’t set up on this server yet.');
  if (!kvReady()) return fail(res, 503, 'storage');
  if (op === 'consent') {
    // the written instruction the person agreed to, kept as proof of permissible purpose (FCRA 604(a)(2))
    const c = { v: String(b.v || '').slice(0, 40), at: Date.now(), text: String(b.text || '').slice(0, 2000), ua: String(req.headers['user-agent'] || '').slice(0, 200) };
    if (!c.v || c.text.length < 100) return fail(res, 400, 'consent');
    await kv('SET', 'crc:' + me.uid, await seal(JSON.stringify(c)));
    return send(res, 200, { ok: true });
  }
  if (op === 'start') {
    if (!(await kv('GET', 'crc:' + me.uid))) return fail(res, 412, 'consent first');
    const u = new URL(env('CREDIT_ENROLL_URL'));
    u.searchParams.set('ref', me.uid.slice(0, 24));
    return send(res, 200, { ok: true, url: u.toString() });
  }
  if (op === 'stop') { await kv('DEL', 'crc:' + me.uid); await kv('DEL', 'crt:' + me.uid); return send(res, 200, { ok: true }) }
  return fail(res, 400, 'op');
});
