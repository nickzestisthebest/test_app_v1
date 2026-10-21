// Stand-ins for Plaid, Anthropic and Upstash so the whole flow can be tested offline.
// Not part of the deployed app.
import http from 'node:http';
const PORT = +process.env.MOCK_PORT || 4010, BASE = 'http://127.0.0.1:' + PORT;
const rnd = () => Math.random().toString(36).slice(2, 10);
const DAY = 864e5, today = () => { const n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) };
const ymd = t => new Date(t).toISOString().slice(0, 10);

// ---------- Upstash Redis (REST) ----------
const KV = new Map(), EXP = new Map();
const live = k => { const e = EXP.get(k); if (e && e < Date.now()) { KV.delete(k); EXP.delete(k) } return KV.get(k) };
function kv(cmd) {
  const [c, k, ...a] = cmd; const C = c.toUpperCase();
  if (C === 'GET') { const v = live(k); return v === undefined || typeof v === 'object' ? null : v }
  if (C === 'SET') { KV.set(k, a[0]); if (a[1] === 'EX') EXP.set(k, Date.now() + a[2] * 1000); else EXP.delete(k); return 'OK' }
  if (C === 'INCR') { const n = (+live(k) || 0) + 1; KV.set(k, String(n)); return n }
  if (C === 'INCRBYFLOAT') { const n = (+live(k) || 0) + parseFloat(a[0]); KV.set(k, String(n)); return String(n) }
  if (C === 'EXPIRE') { EXP.set(k, Date.now() + a[0] * 1000); return 1 }
  if (C === 'HSET') { const h = live(k) || {}; for (let i = 0; i < a.length; i += 2)h[a[i]] = a[i + 1]; KV.set(k, h); return 1 }
  if (C === 'HGET') { const h = live(k) || {}; return h[a[0]] ?? null }
  if (C === 'HGETALL') { const h = live(k) || {}; return Object.entries(h).flat() }
  if (C === 'HDEL') { const h = live(k) || {}; a.forEach(f => delete h[f]); return 1 }
  if (C === 'DEL') { KV.delete(k); return 1 }
  throw new Error('kv ' + C);
}

// ---------- Plaid ----------
const LT = {}, ITEMS = {}, PUBLIC = {};
// scenarios: each new bank connection takes the next profile in the queue (default: the classic test bank)
let QUEUE = [];
const PROFILES = {
  'broke-bank': { inst: 'Peach State Bank' },
  'broke-card': { inst: 'Chase' }
};
// fixed, readable data for the "real life" scenario: $0 in checking, a card that carries most of the spending, a student loan
function realBank(it) {
  const L = [], T = (d, amt, m, pfc, pfd, extra) => L.push(tx(it, 'chk', d, amt, m, pfc, pfd, Object.assign({ name: m.toUpperCase() }, extra || {})));
  for (let d = 3; d <= 115; d += 14) T(d, -1600, 'Acme Corp Payroll', 'INCOME', 'INCOME_WAGES');
  [[10, 1250], [40, 1310], [70, 1190], [100, 1275]].forEach(([d, a]) => T(d, a, 'Chase Credit Crd Autopay', 'LOAN_PAYMENTS', 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT'));
  [5, 35, 65, 95].forEach(d => T(d, 1100, 'Zelle payment to J Landlord', 'TRANSFER_OUT', 'TRANSFER_OUT_ACCOUNT_TRANSFER'));
  [12, 42, 72, 102].forEach(d => T(d, 210, 'Nelnet Student Loan', 'LOAN_PAYMENTS', 'LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT'));
  [8, 38, 68, 98].forEach(d => T(d, 14.99, 'Amazon Prime', 'GENERAL_MERCHANDISE', 'GENERAL_MERCHANDISE_ONLINE_MARKETPLACES'));
  [22, 52, 82, 112].forEach(d => T(d, 88, 'Georgia Power', 'RENT_AND_UTILITIES', 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY'));
  for (let d = 2; d < 118; d += 6) T(d, 40 + (d % 5) * 3, 'Kroger', 'FOOD_AND_DRINK', 'FOOD_AND_DRINK_GROCERIES');
  [20, 50].forEach(d => T(d, 60, 'ATM Withdrawal', 'TRANSFER_OUT', 'TRANSFER_OUT_WITHDRAWAL'));
  T(15, 45, 'Venmo', 'TRANSFER_OUT', 'TRANSFER_OUT_ACCOUNT_TRANSFER');
  T(25, -30, 'Venmo', 'TRANSFER_IN', 'TRANSFER_IN_ACCOUNT_TRANSFER');
  T(27, -23.5, 'Amazon', 'GENERAL_MERCHANDISE', 'GENERAL_MERCHANDISE_ONLINE_MARKETPLACES');
  T(1, 35, 'Overdraft Fee', 'BANK_FEES', 'BANK_FEES_OVERDRAFT_FEES');
  return L;
}
function realCard(it) {
  const L = [], C = (d, amt, m, pfc, pfd) => L.push(tx(it, 'cc', d, amt, m, pfc, pfd, { name: m.toUpperCase() }));
  [6, 36, 66, 96].forEach(d => C(d, 11.99, 'Spotify', 'ENTERTAINMENT', 'ENTERTAINMENT_MUSIC_AND_AUDIO'));
  [9, 39, 69, 99].forEach(d => C(d, 15.49, 'Netflix', 'ENTERTAINMENT', 'ENTERTAINMENT_TV_AND_MOVIES'));
  [14, 44, 74, 104].forEach(d => C(d, 17.99, 'Hulu', 'ENTERTAINMENT', 'ENTERTAINMENT_TV_AND_MOVIES'));
  for (let d = 1; d < 118; d += 4) C(d, 12 + (d % 4), 'Chick-fil-A', 'FOOD_AND_DRINK', 'FOOD_AND_DRINK_FAST_FOOD');
  for (let d = 3; d < 118; d += 9) C(d, 18 + (d % 7), 'Uber', 'TRANSPORTATION', 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES');
  for (let d = 7; d < 118; d += 10) C(d, 55 + (d % 11), 'Target', 'GENERAL_MERCHANDISE', 'GENERAL_MERCHANDISE_SUPERSTORES');
  [[9, 1250], [39, 1310], [69, 1190], [99, 1275]].forEach(([d, a]) => C(d, -a, 'Automatic Payment - Thank You', 'LOAN_PAYMENTS', 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT'));
  [16, 46, 76, 106].forEach(d => C(d, 96.4, 'Interest Charge on Purchases', 'BANK_FEES', 'BANK_FEES_INTEREST_CHARGE'));
  C(33, -42.1, 'Target', 'GENERAL_MERCHANDISE', 'GENERAL_MERCHANDISE_SUPERSTORES');
  return L;
}
const stats = { anthropic: 0, cacheReads: 0, plaid: {}, lastAI: null };
function accountsOf(it) {
  if (it.profile === 'broke-bank') return [{ account_id: it.id + '-chk', name: 'Everyday Checking', mask: '4411', type: 'depository', subtype: 'checking', balances: { available: 0, current: 0, limit: null } }];
  if (it.profile === 'broke-card') return [
    { account_id: it.id + '-cc', name: 'Freedom Unlimited', mask: '7788', type: 'credit', subtype: 'credit card', balances: { available: 1179.45, current: 4820.55, limit: 6000 } },
    { account_id: it.id + '-sl', name: 'Student Loan', mask: '9900', type: 'loan', subtype: 'student', balances: { available: null, current: 18250, limit: null } }];
  return [
    { account_id: it.id + '-chk', name: 'Platypus Checking', mask: '0000', type: 'depository', subtype: 'checking', balances: { available: it.bal, current: it.bal + 61.9, limit: null } },
    { account_id: it.id + '-sav', name: 'Platypus Savings', mask: '1111', type: 'depository', subtype: 'savings', balances: { available: 5200, current: 5200, limit: null } },
    { account_id: it.id + '-cc', name: 'Platypus Credit Card', mask: '3333', type: 'credit', subtype: 'credit card', balances: { available: 3749.6, current: 1250.4, limit: 5000 } }
  ];
}
function tx(it, acct, daysAgo, amount, merchant, pfc, pfd, extra = {}) {
  return Object.assign({ transaction_id: 'tx-' + rnd(), account_id: it.id + '-' + acct, date: ymd(today() - daysAgo * DAY), amount, name: merchant.toUpperCase() + ' #' + (100 + Math.floor(Math.random() * 800)), merchant_name: merchant, pending: false, pending_transaction_id: null, personal_finance_category: { primary: pfc, detailed: pfd }, iso_currency_code: 'USD' }, extra);
}
function history(it) {
  const L = [];
  for (let d = 4; d < 120; d += 14) L.push(tx(it, 'chk', d, -2150, 'Acme Corp Payroll', 'INCOME', 'INCOME_WAGES'));
  for (let m = 0; m < 4; m++) {
    const base = today() - m * 30 * DAY, dd = n => Math.max(1, Math.round((today() - (base - n * DAY)) / DAY));
    L.push(tx(it, 'chk', m * 30 + 18, 1400, 'Harbor Properties', 'RENT_AND_UTILITIES', 'RENT_AND_UTILITIES_RENT'));
    L.push(tx(it, 'chk', m * 30 + 9, m === 0 ? 17.99 : 15.49, 'Netflix', 'ENTERTAINMENT', 'ENTERTAINMENT_TV_AND_MOVIES'));
    L.push(tx(it, 'cc', m * 30 + 20, 9.99, 'Apple', 'GENERAL_SERVICES', 'GENERAL_SERVICES_OTHER_GENERAL_SERVICES', { name: 'APPLE.COM/BILL' }));
    L.push(tx(it, 'cc', m * 30 + 12, 11.99, 'Spotify', 'ENTERTAINMENT', 'ENTERTAINMENT_MUSIC_AND_AUDIO'));
    L.push(tx(it, 'chk', m * 30 + 22, 92.4 + m, 'Georgia Power', 'RENT_AND_UTILITIES', 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY'));
    L.push(tx(it, 'chk', m * 30 + 15, 300, 'Platypus Card Payment', 'LOAN_PAYMENTS', 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT'));
    L.push(tx(it, 'cc', m * 30 + 15, -300, 'Payment Thank You', 'LOAN_PAYMENTS', 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT'));
  }
  for (let d = 2; d < 118; d += 4) L.push(tx(it, 'chk', d, 38 + (d * 7) % 45, 'Kroger', 'FOOD_AND_DRINK', 'FOOD_AND_DRINK_GROCERIES'));
  for (let d = 1; d < 118; d += 3) L.push(tx(it, 'cc', d, 6 + (d % 5), 'Starbucks', 'FOOD_AND_DRINK', 'FOOD_AND_DRINK_COFFEE'));
  for (let d = 5; d < 118; d += 6) L.push(tx(it, 'cc', d, 11 + (d % 7), 'Chipotle', 'FOOD_AND_DRINK', 'FOOD_AND_DRINK_FAST_FOOD'));
  for (let d = 3; d < 118; d += 9) L.push(tx(it, 'chk', d, 44 + (d % 6), 'Shell', 'TRANSPORTATION', 'TRANSPORTATION_GAS'));
  for (let d = 30; d < 118; d += 7) L.push(tx(it, 'cc', d, 30 + (d % 20), 'Target', 'GENERAL_MERCHANDISE', 'GENERAL_MERCHANDISE_SUPERSTORES'));
  for (let d = 6; d < 118; d += 11) L.push(tx(it, 'cc', d, 22 + (d % 30), 'Amazon', 'GENERAL_MERCHANDISE', 'GENERAL_MERCHANDISE_ONLINE_MARKETPLACES'));
  // things worth a heads-up
  L.push(tx(it, 'cc', 3, 14.2, 'Chipotle', 'FOOD_AND_DRINK', 'FOOD_AND_DRINK_FAST_FOOD'), tx(it, 'cc', 3, 14.2, 'Chipotle', 'FOOD_AND_DRINK', 'FOOD_AND_DRINK_FAST_FOOD'));
  L.push(tx(it, 'cc', 2, 240.0, 'Target', 'GENERAL_MERCHANDISE', 'GENERAL_MERCHANDISE_SUPERSTORES'));
  L.push(tx(it, 'chk', 7, 35, 'Overdraft Fee', 'BANK_FEES', 'BANK_FEES_OVERDRAFT_FEES'));
  L.push(tx(it, 'chk', 0, 5.75, 'Starbucks', 'FOOD_AND_DRINK', 'FOOD_AND_DRINK_COFFEE', { pending: true, transaction_id: 'pend-sbux' }));
  return L;
}
function plaid(path, b) {
  stats.plaid[path] = (stats.plaid[path] || 0) + 1;
  if (!b.client_id || !b.secret) return [400, { error_type: 'INVALID_REQUEST', error_code: 'MISSING_FIELDS', error_message: 'client_id and secret required' }];
  if (path === '/link/token/create') {
    const lt = 'link-sandbox-' + rnd(); LT[lt] = { req: b, sessions: [] };
    return [200, { link_token: lt, expiration: new Date(Date.now() + 4 * 3600e3).toISOString(), hosted_link_url: b.hosted_link ? BASE + '/hosted?lt=' + lt : undefined }];
  }
  if (path === '/link/token/get') { const L = LT[b.link_token]; if (!L) return [400, { error_code: 'INVALID_LINK_TOKEN' }]; return [200, { link_token: b.link_token, link_sessions: L.sessions }] }
  if (path === '/item/public_token/exchange') {
    const p = PUBLIC[b.public_token]; if (!p || p.used) return [400, { error_type: 'INVALID_INPUT', error_code: 'INVALID_PUBLIC_TOKEN', error_message: 'bad public token' }];
    p.used = true; const id = 'item-' + rnd(), at = 'access-sandbox-' + rnd();
    const it = ITEMS[at] = { id, at, inst: p.inst, ready: false, bal: 1840.22, events: [], profile: p.profile || '' };
    (it.profile === 'broke-bank' ? realBank(it) : it.profile === 'broke-card' ? realCard(it) : history(it)).forEach(t => it.events.push({ k: 'add', t }));
    return [200, { access_token: at, item_id: id }];
  }
  const it = ITEMS[b.access_token];
  if (!it) return [400, { error_type: 'INVALID_INPUT', error_code: 'INVALID_ACCESS_TOKEN', error_message: 'bad access token' }];
  if (it.relink && path !== '/item/remove') return [400, { error_type: 'ITEM_ERROR', error_code: 'ITEM_LOGIN_REQUIRED', error_message: 'login required', display_message: 'Sign in to your bank again.' }];
  if (path === '/transactions/sync') {
    if (!it.ready) { it.ready = true; return [200, { added: [], modified: [], removed: [], next_cursor: '', has_more: false, transactions_update_status: 'NOT_READY', accounts: [] }] }
    const from = b.cursor ? +String(b.cursor).slice(1) : 0, n = Math.min(500, b.count || 100), E = it.events.slice(from, from + n);
    const out = { added: [], modified: [], removed: [], accounts: accountsOf(it), next_cursor: 'c' + (from + E.length), has_more: from + E.length < it.events.length, transactions_update_status: 'HISTORICAL_UPDATE_COMPLETE' };
    E.forEach(e => e.k === 'add' ? out.added.push(e.t) : e.k === 'mod' ? out.modified.push(e.t) : out.removed.push({ transaction_id: e.t }));
    return [200, out];
  }
  if (path === '/accounts/get') return [200, { accounts: accountsOf(it) }];
  if (path === '/liabilities/get' && it.profile === 'broke-bank') return [200, { liabilities: { credit: [], student: [], mortgage: [] } }];
  if (path === '/liabilities/get' && it.profile === 'broke-card') return [200, { liabilities: {
    credit: [{ account_id: it.id + '-cc', aprs: [{ apr_percentage: 27.49, apr_type: 'purchase_apr' }], minimum_payment_amount: 145, next_payment_due_date: ymd(today() + 9 * DAY), last_statement_balance: 4610.2 }],
    student: [{ account_id: it.id + '-sl', interest_rate_percentage: 5.5, minimum_payment_amount: 210, next_payment_due_date: ymd(today() + 12 * DAY) }], mortgage: [] } }];
  if (path === '/liabilities/get') return [200, { liabilities: { credit: [{ account_id: it.id + '-cc', aprs: [{ apr_percentage: 24.99, apr_type: 'purchase_apr' }], minimum_payment_amount: 35, next_payment_due_date: ymd(today() + 12 * DAY) }], student: [], mortgage: [] } }];
  if (path === '/item/remove') { delete ITEMS[b.access_token]; return [200, { request_id: 'x' }] }
  return [404, { error_code: 'NOT_FOUND' }];
}
// test controls: new activity at the bank, or a bank that needs signing in again
function control(op, b) {
  if (op === 'queue') { QUEUE = (b.profiles || []).slice(); return { ok: true, queue: QUEUE } }
  const it = Object.values(ITEMS)[0]; if (!it) return { ok: false };
  if (op === 'activity') {
    it.events.push({ k: 'remove', t: 'pend-sbux' });
    it.events.push({ k: 'add', t: tx(it, 'chk', 0, 5.75, 'Starbucks', 'FOOD_AND_DRINK', 'FOOD_AND_DRINK_COFFEE') });
    it.events.push({ k: 'add', t: tx(it, 'chk', 0, 63.18, 'Publix', 'FOOD_AND_DRINK', 'FOOD_AND_DRINK_GROCERIES') });
    it.bal = 1771.29; return { ok: true };
  }
  if (op === 'relink') { it.relink = !!b.on; return { ok: true } }
  if (op === 'queue') { QUEUE = (b.profiles || []).slice(); return { ok: true, queue: QUEUE } }
  if (op === 'raw') { const out = {}; Object.values(ITEMS).forEach(i => { out[i.profile || i.id] = { accounts: accountsOf(i), tx: i.events.filter(e => e.k === 'add').map(e => e.t) } }); return { ok: true, items: out } }
  return { ok: false };
}

// ---------- Anthropic ----------
function anthropic(b, headers) {
  if (!headers['x-api-key']) return [401, { type: 'error', error: { type: 'authentication_error' } }];
  stats.anthropic++; stats.lastAI = b;
  const sys = (b.system || []).map(s => s.text).join(''), user = JSON.stringify(b.messages);
  const sysT = Math.round(sys.length / 4), cached = sysT >= 512 && stats['seen:' + sys.length];
  stats['seen:' + sys.length] = 1; if (cached) stats.cacheReads++;
  const note = (user.match(/Their note:\\n(.*?)"/) || [])[1] || '';
  const text = JSON.stringify({ reply: 'AI here. About "' + note.slice(0, 40) + '": **$42.00** is a fair guess based on your numbers.', actions: [] });
  return [200, { id: 'msg_' + rnd(), type: 'message', role: 'assistant', model: b.model, content: [{ type: 'text', text }], stop_reason: 'end_turn',
    usage: { input_tokens: Math.round(user.length / 4), output_tokens: 48, cache_creation_input_tokens: cached ? 0 : sysT, cache_read_input_tokens: cached ? sysT : 0 } }];
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, BASE); const chunks = []; for await (const c of req) chunks.push(c);
  let b = {}; try { b = JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { }
  const send = (code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) };
  try {
    if (u.pathname === '/kv') { if (req.headers.authorization !== 'Bearer kvtoken') return send(401, { error: 'unauthorized' }); return send(200, { result: kv(b) }) }
    if (u.pathname.startsWith('/plaid/')) { const [c, o] = plaid(u.pathname.slice(6), b); return send(c, o) }
    if (u.pathname === '/anthropic/v1/messages') { const [c, o] = anthropic(b, req.headers); return send(c, o) }
    if (u.pathname === '/hosted') {
      // Plaid's hosted page: pretend the person picked a bank and signed in (or backed out)
      const L = LT[u.searchParams.get('lt')]; if (!L) return send(400, { error: 'bad lt' });
      const exit = u.searchParams.get('exit') === '1', s = { link_session_id: 'ls-' + rnd(), started_at: new Date().toISOString(), finished_at: new Date().toISOString() };
      if (exit) s.exit = { error: null, metadata: { status: 'requires_credentials' } };
      else if (L.req.access_token) { const it = ITEMS[L.req.access_token]; if (it) it.relink = false; s.results = { item_add_results: [] } }
      else { const pt = 'public-sandbox-' + rnd(), prof = QUEUE.length ? QUEUE.shift() : ''; PUBLIC[pt] = { inst: prof ? PROFILES[prof].inst : 'First Platypus Bank', profile: prof }; s.results = { item_add_results: [{ public_token: pt, institution: { name: PUBLIC[pt].inst, institution_id: 'ins_109508' }, accounts: [] }] } }
      L.sessions.push(s);
      res.statusCode = 302; res.setHeader('Location', L.req.hosted_link.completion_redirect_uri); return res.end();
    }
    if (u.pathname === '/control') return send(200, control(u.searchParams.get('op'), b));
    if (u.pathname === '/stats') return send(200, Object.assign({ kvKeys: [...KV.keys()] }, stats, { lastAI: stats.lastAI ? { model: stats.lastAI.model, max_tokens: stats.lastAI.max_tokens, system: stats.lastAI.system, user: JSON.stringify(stats.lastAI.messages) } : null }));
    if (u.pathname === '/reset') { KV.clear(); EXP.clear(); QUEUE = []; for (const o of [LT, ITEMS, PUBLIC]) for (const k of Object.keys(o)) delete o[k]; for (const k of Object.keys(stats)) delete stats[k]; Object.assign(stats, { anthropic: 0, cacheReads: 0, plaid: {}, lastAI: null }); return send(200, { ok: true }) }
    if (u.pathname === '/reset-spend') { [...KV.keys()].filter(k => k.startsWith('spend:')).forEach(k => KV.delete(k)); return send(200, { ok: true }) }
    send(404, { error: 'not found' });
  } catch (e) { send(500, { error: String(e) }) }
}).listen(PORT, () => console.log('mock on ' + BASE));
