// Shared helpers for the Sprout server. No npm packages: everything uses Node's built-in fetch and Web Crypto.
// Files in /api that start with "_" are not exposed as endpoints on Vercel.

export const env = (k, d = '') => (process.env[k] ?? d).toString().trim();
export const num = (k, d) => { const v = parseFloat(env(k, '')); return Number.isFinite(v) ? v : d };

// ---------- responses ----------
export function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
export const fail = (res, code, error, extra = {}) => send(res, code, Object.assign({ ok: false, error }, extra));

export async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body) } catch { return {} } }
  const chunks = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > 6e6) throw Object.assign(new Error('too_large'), { code: 413 }); chunks.push(c) }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') } catch { return {} }
}
export const ip = req => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim() || 'unknown';

// ---------- hashing and encryption ----------
const te = new TextEncoder(), td = new TextDecoder();
const b64 = u => Buffer.from(u).toString('base64');
const unb64 = s => new Uint8Array(Buffer.from(s, 'base64'));
export async function sha(s) { const h = await crypto.subtle.digest('SHA-256', te.encode(s)); return Buffer.from(h).toString('hex') }
let KEY = null;
async function key() {
  if (KEY) return KEY;
  const secret = env('ENCRYPTION_KEY');
  if (secret.length < 16) throw Object.assign(new Error('ENCRYPTION_KEY must be at least 16 characters'), { code: 500, setup: true });
  const raw = await crypto.subtle.digest('SHA-256', te.encode(secret));
  KEY = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  return KEY;
}
export async function seal(text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(), te.encode(text));
  return 'v1.' + b64(iv) + '.' + b64(new Uint8Array(ct));
}
export async function unseal(s) {
  const [v, iv, ct] = String(s).split('.');
  if (v !== 'v1') throw new Error('bad_token');
  return td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, await key(), unb64(ct)));
}

// ---------- storage (Upstash Redis over REST; Vercel's Upstash integration sets these for you) ----------
const KVURL = () => env('KV_REST_API_URL') || env('UPSTASH_REDIS_REST_URL');
const KVTOK = () => env('KV_REST_API_TOKEN') || env('UPSTASH_REDIS_REST_TOKEN');
export const kvReady = () => !!(KVURL() && KVTOK());
export async function kv(...cmd) {
  if (!kvReady()) throw Object.assign(new Error('storage_not_set_up'), { code: 500, setup: true });
  const r = await fetch(KVURL(), { method: 'POST', headers: { Authorization: 'Bearer ' + KVTOK(), 'Content-Type': 'application/json' }, body: JSON.stringify(cmd.map(String)) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw Object.assign(new Error('storage: ' + (j.error || r.status)), { code: 502 });
  return j.result;
}
export async function kvJSON(k) { const v = await kv('GET', k); try { return v ? JSON.parse(v) : null } catch { return null } }
export async function kvPutJSON(k, v, ttl) { return ttl ? kv('SET', k, JSON.stringify(v), 'EX', ttl) : kv('SET', k, JSON.stringify(v)) }
export async function incr(k, ttl) { const n = await kv('INCR', k); if (n === 1 && ttl) await kv('EXPIRE', k, ttl); return n }

// ---------- access codes ----------
// ACCESS_CODES="yourlongcode:owner:nick, friendcode:plus:amy, othercode:free"  (anyone without a valid code is turned away)
// plan: owner = Plus plus the AI cost readout in Settings; plus = Plus features; free = the free plan
// person (optional): their bank connections follow the person, so you can change their code or plan later without losing them
export function codes() {
  const out = {};
  env('ACCESS_CODES').split(/[,\n]/).map(x => x.trim()).filter(Boolean).forEach(x => {
    const [c0, t0 = 'free', who0 = ''] = x.split(':').map(v => v.trim()); const c = c0, t = t0.toLowerCase();
    if (c.length >= 8) out[c] = { tier: t === 'owner' ? 'owner' : t === 'plus' ? 'plus' : 'free', person: who0.toLowerCase() };
  });
  return out;
}
export async function who(req, { optional = false } = {}) {
  const code = String(req.headers['x-sprout-code'] || '').trim();
  if (!code) { if (optional) return null; throw Object.assign(new Error('need_code'), { code: 401 }) }
  const entry = codes()[code];
  if (!entry) {
    // slow down guessing: 20 wrong tries per 15 minutes per network address
    if (kvReady()) { const n = await incr('fail:' + ip(req), 900); if (n > 20) throw Object.assign(new Error('too_many_tries'), { code: 429 }) }
    throw Object.assign(new Error('bad_code'), { code: 401 });
  }
  const tier = entry.tier;
  return { uid: (await sha('sprout-user:' + (entry.person ? 'person:' + entry.person : code))).slice(0, 24), tier, plus: tier !== 'free', owner: tier === 'owner' };
}

// ---------- dates ----------
export const day = () => new Date().toISOString().slice(0, 10);
export const month = () => new Date().toISOString().slice(0, 7);

// ---------- Plaid ----------
export const plaidEnv = () => (env('PLAID_ENV', 'sandbox').toLowerCase() === 'production' ? 'production' : 'sandbox');
export const plaidReady = () => !!(env('PLAID_CLIENT_ID') && env('PLAID_SECRET'));
export async function plaid(path, payload) {
  const base = env('PLAID_BASE_URL') || ('https://' + plaidEnv() + '.plaid.com');
  const r = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ client_id: env('PLAID_CLIENT_ID'), secret: env('PLAID_SECRET') }, payload)) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error_message || 'Plaid error'), { code: r.status >= 500 ? 502 : 400, plaid: { type: j.error_type, code: j.error_code, message: j.display_message || j.error_message } });
  return j;
}

export function handle(fn) {
  return async (req, res) => {
    try {
      if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end() }
      await fn(req, res);
    } catch (e) {
      const code = e.code && Number.isInteger(e.code) ? e.code : 500;
      if (code >= 500 && !e.setup) console.error(e);
      fail(res, code, e.message || 'server_error', e.plaid ? { plaid: e.plaid } : e.setup ? { setup: true } : {});
    }
  };
}
