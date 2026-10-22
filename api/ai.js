// AI for Sprout, with cost guards:
// 1. The app answers most questions on the phone first (free). Only what it can't answer comes here.
// 2. Only the app's own prompts are accepted (checked against api/_prompts.js), so the key can't be used for anything else.
// 3. Per-person daily and monthly limits, a per-minute limit, and a hard monthly dollar budget for the whole app.
// 4. The long, unchanging instructions are prompt-cached, and identical questions reuse a saved answer.
// 5. Cheapest capable model by default (Claude Haiku 5.5), with short answers.
import { env, num, send, fail, body, handle, who, kv, kvReady, incr, sha, day, month } from './_lib.js';
import { PROMPTS } from './_prompts.js';

const MODEL = () => env('AI_MODEL', 'claude-haiku-5-5');
const PRICE = () => ({ in: num('PRICE_INPUT', 0.10), out: num('PRICE_OUTPUT', 0.50), cw: num('PRICE_CACHE_WRITE', 0.125), cr: num('PRICE_CACHE_READ', 0.01) });
const BUDGET = () => num('AI_MONTHLY_BUDGET_USD', 15);

// who can use what, and how often
const RULES = {
  ask: { plusOnly: true, day: num('ASK_PER_DAY', 60), month: num('ASK_PER_MONTH', 800), max: 700, cache: 6 * 3600 },
  scan: { freeMonth: num('FREE_SCANS_PER_MONTH', 10), month: num('SCANS_PER_MONTH', 300), day: 40, max: 4000, cache: 0 },
  setup: { day: 6, month: 40, max: 1500, cache: 3600 },
  import: { day: 30, month: 200, max: 4000, cache: 30 * 86400 },
  translate: { day: 80, month: 1500, max: 4000, cache: 30 * 86400 },
  credit: { freeMonth: num('FREE_CREDIT_READS_PER_MONTH', 2), month: num('CREDIT_READS_PER_MONTH', 12), day: 8, max: 6000, cache: 0 }
};

export function costOf(u) {
  const p = PRICE();
  return ((u.input_tokens || 0) * p.in + (u.cache_creation_input_tokens || 0) * p.cw + (u.cache_read_input_tokens || 0) * p.cr + (u.output_tokens || 0) * p.out) / 1e6;
}
export function parseJSON(t) {
  let s = String(t || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try { return JSON.parse(s) } catch { }
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(s.slice(a, b + 1)) } catch { } }
  return null;
}

async function check(kind, prompt) {
  const P = PROMPTS[kind];
  if (!P || !prompt.startsWith(P.start)) return null;
  const i = P.marker ? prompt.indexOf(P.marker) : -1;
  const system = i > 0 ? prompt.slice(0, i) : '', user = i > 0 ? prompt.slice(i + 2) : prompt;
  if (P.hash && (await sha(system)) !== P.hash) return null; // Ask must match the app's instructions exactly
  return { system, user };
}

export default handle(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'post_only');
  if (!env('ANTHROPIC_API_KEY')) return fail(res, 503, 'ai_not_set_up', { setup: true });
  if (!kvReady()) return fail(res, 503, 'storage_not_set_up', { setup: true });
  const me = await who(req);
  const b = await body(req);
  const kind = String(b.kind || ''), R = RULES[kind];
  const prompt = String(b.prompt || '');
  if (!R) return fail(res, 400, 'unknown_kind');
  if (prompt.length > 60000) return fail(res, 413, 'too_long');
  const parts = await check(kind, prompt);
  if (!parts) return fail(res, 400, 'unknown_prompt');
  const images = Array.isArray(b.images) ? b.images.slice(0, 8).filter(x => typeof x === 'string' && x.length < 2e6) : [];

  if (R.plusOnly && !me.plus) return fail(res, 402, 'plus_required');

  // the whole app stops calling the AI once this month's budget is used up (the phone keeps answering what it can)
  const spent = parseFloat((await kv('GET', 'spend:' + month())) || '0');
  if (spent >= BUDGET()) return fail(res, 503, 'ai_paused', { reason: 'monthly_budget' });

  // saved answer for the exact same question and numbers: no cost
  const ck = R.cache && !images.length ? 'ac:' + (await sha(kind + '|' + MODEL() + '|' + prompt)).slice(0, 40) : null;
  if (ck) { const hit = await kv('GET', ck); if (hit) { try { return send(res, 200, { ok: true, result: JSON.parse(hit), cached: true }) } catch { } } }

  // limits
  const u = me.uid, d = day(), m = month();
  if (await incr('rl:' + u + ':' + Math.floor(Date.now() / 60000), 120) > num('PER_MINUTE', 12)) return fail(res, 429, 'slow_down');
  // several screenshots scanned together (or the files of one credit report) are read one by one but count as one
  const batch = kind === 'scan' || kind === 'credit' ? String(b.batch || '').replace(/[^a-z0-9]/gi, '').slice(0, 24) : '';
  let counted = true;
  if (batch) { const n = await incr('sb:' + u + ':' + batch, 3600); if (n > 8) return fail(res, 429, 'slow_down'); counted = n === 1 }
  const nd = counted ? await incr('n:' + u + ':' + kind + ':' + d, 2 * 86400) : 0, nm = counted ? await incr('n:' + u + ':' + kind + ':' + m, 40 * 86400) : 0;
  const monthCap = R.freeMonth && !me.plus ? R.freeMonth : R.month;
  if ((R.day && nd > R.day) || (monthCap && nm > monthCap)) return fail(res, 429, 'limit_reached', { kind, period: R.day && nd > R.day ? 'day' : 'month' });

  const content = images.map(data => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } }));
  content.push({ type: 'text', text: parts.user });
  const req2 = { model: MODEL(), max_tokens: R.max, messages: [{ role: 'user', content }] };
  if (parts.system) req2.system = [{ type: 'text', text: parts.system, cache_control: { type: 'ephemeral' } }];

  const base = env('ANTHROPIC_BASE_URL') || 'https://api.anthropic.com';
  const r = await fetch(base + '/v1/messages', { method: 'POST', headers: { 'x-api-key': env('ANTHROPIC_API_KEY'), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(req2) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error('anthropic', r.status, j && j.error);
    return fail(res, r.status === 429 || r.status === 529 ? 503 : 502, 'ai_unavailable');
  }
  const usage = j.usage || {}, cost = costOf(usage);
  await kv('INCRBYFLOAT', 'spend:' + m, cost.toFixed(6));
  await kv('INCRBYFLOAT', 'uspend:' + u + ':' + m, cost.toFixed(6));
  const text = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  let result = parseJSON(text);
  if (!result) { if (kind === 'ask') result = { reply: text.trim().slice(0, 2000), actions: [] }; else return fail(res, 502, 'bad_reply') }
  if (ck) await kv('SET', ck, JSON.stringify(result), 'EX', R.cache);
  return send(res, 200, { ok: true, result, usage: { in: usage.input_tokens || 0, out: usage.output_tokens || 0, cacheRead: usage.cache_read_input_tokens || 0 }, cost: +cost.toFixed(6) });
});
