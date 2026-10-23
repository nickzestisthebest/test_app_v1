// Bank connections through Plaid. Read-only: Sprout can see balances and transactions but can never move money.
// The Plaid access token for each bank is encrypted (AES-GCM) and kept on the server, never sent to the phone.
import { env, num, send, fail, body, handle, who, kv, kvReady, seal, unseal, sha, plaid, plaidReady, plaidEnv } from './_lib.js';
import { BRAND } from './_brand.js';

const ITEMS = uid => 'items:' + uid;
const LT = async t => 'lt:' + (await sha(t)).slice(0, 32);

async function listItems(uid) {
  const h = (await kv('HGETALL', ITEMS(uid))) || [];
  const out = [];
  for (let i = 0; i < h.length; i += 2) { try { out.push(Object.assign({ item_id: h[i] }, JSON.parse(h[i + 1]))) } catch { } }
  return out;
}
// where Plaid sends people back after the bank sign-in: only this app's own address is allowed
function backURL(req, url) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const app = env('APP_URL');
  try {
    const u = new URL(String(url || ''));
    const okHost = u.host === host || (app && u.host === new URL(app).host);
    const okProto = u.protocol === 'https:' || /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(u.host);
    if (okHost && okProto) return u.origin + u.pathname + '?plaid=done';
  } catch { }
  return (app ? app.replace(/\/$/, '') : 'https://' + host) + '/?plaid=done';
}
const pub = it => ({ item_id: it.item_id, institution: it.inst || 'Bank', at: it.at || 0 });
// where Plaid tells Sprout that new transactions are ready (free): set PLAID_WEBHOOK_URL, or it's this app's own /api/plaid
function hookURL(req) { const u = env('PLAID_WEBHOOK_URL'); if (u) return u; const app = env('APP_URL'); if (app && /^https:/.test(app)) return app.replace(/\/$/, '') + '/api/plaid?hook=1'; return '' }

const trimTx = t => ({
  id: t.transaction_id, acct: t.account_id, date: t.date, amount: t.amount,
  name: t.name || '', merchant: t.merchant_name || '', pending: !!t.pending, ptid: t.pending_transaction_id || null,
  pfc: (t.personal_finance_category && t.personal_finance_category.primary) || '',
  pfd: (t.personal_finance_category && t.personal_finance_category.detailed) || '',
  cur: t.iso_currency_code || 'USD',
  // logos and websites from Plaid's own enrichment (part of Transactions, no extra product)
  logo: t.logo_url || ((t.counterparties || []).find(c => c && c.logo_url) || {}).logo_url || null,
  web: t.website || ((t.counterparties || []).find(c => c && c.website) || {}).website || null
});
const trimAcct = a => ({
  id: a.account_id, name: a.name || a.official_name || 'Account', mask: a.mask || '', type: a.type, subtype: a.subtype || '',
  cur: a.balances ? a.balances.current : null, avail: a.balances ? a.balances.available : null, limit: a.balances ? a.balances.limit : null
});
function trimLiab(L) {
  if (!L) return null;
  const out = [];
  (L.credit || []).forEach(c => out.push({ acct: c.account_id, kind: 'credit', apr: ((c.aprs || []).find(a => a.apr_type === 'purchase_apr') || (c.aprs || [])[0] || {}).apr_percentage ?? null, min: c.minimum_payment_amount ?? null, due: c.next_payment_due_date || null, stmt: c.last_statement_balance ?? null }));
  (L.student || []).forEach(c => out.push({ acct: c.account_id, kind: 'student', apr: c.interest_rate_percentage ?? null, min: c.minimum_payment_amount ?? null, due: c.next_payment_due_date || null }));
  (L.mortgage || []).forEach(c => out.push({ acct: c.account_id, kind: 'mortgage', apr: (c.interest_rate || {}).percentage ?? null, min: c.next_monthly_payment ?? null, due: c.next_payment_due_date || null }));
  // other loans (auto, personal) when the bank shares them
  Object.keys(L).filter(k => !/^(credit|student|mortgage)$/.test(k) && Array.isArray(L[k])).forEach(k => L[k].forEach(c => { if (c && c.account_id) out.push({ acct: c.account_id, kind: k, apr: c.interest_rate_percentage ?? (c.interest_rate || {}).percentage ?? (((c.aprs || [])[0] || {}).apr_percentage) ?? null, min: c.minimum_payment_amount ?? c.next_monthly_payment ?? null, due: c.next_payment_due_date || null }) }));
  return out;
}

const LIAB = () => env('PLAID_LIABILITIES', 'off').toLowerCase() === 'on';
const INV = () => env('PLAID_INVESTMENTS', 'off').toLowerCase() === 'on';
const trimHold = h => {
  const sec = {}; (h.securities || []).forEach(s => { sec[s.security_id] = s });
  return (h.holdings || []).map(x => { const s = sec[x.security_id] || {}; return { acct: x.account_id, ticker: s.ticker_symbol || '', name: (s.name || s.ticker_symbol || 'Holding').slice(0, 60), type: s.type || 'other', qty: x.quantity ?? null, price: x.institution_price ?? s.close_price ?? null, value: x.institution_value ?? null, basis: x.cost_basis ?? null, asOf: x.institution_price_as_of || s.close_price_as_of || null } });
};
async function syncItem(it, cursor, wantLiab) {
  const access_token = await unseal(it.tok);
  const out = { item_id: it.item_id, institution: it.inst || 'Bank', added: [], modified: [], removed: [], accounts: [], liabilities: null, cursor: cursor || '', more: false, status: 'ok' };
  try {
    let cur = cursor || '', pages = 0, restarted = false;
    const start = cur;
    for (; ;) {
      let r;
      try { r = await plaid('/transactions/sync', { access_token, cursor: cur || undefined, count: 500 }) }
      catch (e) {
        if (e.plaid && e.plaid.code === 'TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION' && !restarted) { restarted = true; cur = start; out.added = []; out.modified = []; out.removed = []; continue }
        throw e;
      }
      r.added.forEach(t => out.added.push(trimTx(t)));
      r.modified.forEach(t => out.modified.push(trimTx(t)));
      r.removed.forEach(t => out.removed.push(t.transaction_id));
      if (Array.isArray(r.accounts) && r.accounts.length) out.accounts = r.accounts.map(trimAcct);
      out.update = r.transactions_update_status || '';
      cur = r.next_cursor; pages++;
      if (!r.has_more) break;
      if (pages >= 12) { out.more = true; break }
    }
    out.cursor = cur;
    if (!out.accounts.length) { const a = await plaid('/accounts/get', { access_token }); out.accounts = a.accounts.map(trimAcct) }
    // interest rates from the bank cost extra with Plaid (a monthly charge per bank), so they're only asked for when turned on
    if (wantLiab && LIAB()) { try { const l = await plaid('/liabilities/get', { access_token }); out.liabilities = trimLiab(l.liabilities); out.rates = 'on' } catch (e) { const c = e.plaid && e.plaid.code; out.rates = c === 'ADDITIONAL_CONSENT_REQUIRED' || c === 'INVALID_PRODUCT' || c === 'PRODUCTS_NOT_SUPPORTED' ? (c === 'ADDITIONAL_CONSENT_REQUIRED' ? 'needs_permission' : 'not_available') : c === 'PRODUCT_NOT_READY' ? 'not_ready' : 'error'; out.ratesErr = c || (e.message || '').slice(0, 80) } }
    else out.rates = LIAB() ? 'skipped' : 'off';
    // investment holdings (also a separate Plaid charge), only when turned on
    if (INV() && wantLiab) { try { const h = await plaid('/investments/holdings/get', { access_token }); out.holdings = trimHold(h) } catch (e) { const c = e.plaid && e.plaid.code; out.holdErr = c === 'ADDITIONAL_CONSENT_REQUIRED' ? 'needs_permission' : c === 'PRODUCTS_NOT_SUPPORTED' || c === 'INVALID_PRODUCT' || c === 'NO_INVESTMENT_ACCOUNTS' ? 'not_available' : 'error' } }
  } catch (e) {
    const code = e.plaid && e.plaid.code;
    out.status = code === 'ITEM_LOGIN_REQUIRED' || code === 'PENDING_EXPIRATION' || code === 'ITEM_LOCKED' ? 'relink' : code === 'PRODUCT_NOT_READY' ? 'not_ready' : 'error';
    out.error = (e.plaid && (e.plaid.message || e.plaid.code)) || e.message;
  }
  return out;
}

export default handle(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'post_only');
  if (!plaidReady()) return fail(res, 503, 'plaid_not_set_up', { setup: true });
  if (!kvReady()) return fail(res, 503, 'storage_not_set_up', { setup: true });
  const b = await body(req);
  const op = String(b.op || '');
  if (b.webhook_type) return webhook(req, res, b);

  // the bank's login page can send people back to Safari instead of the app; the link token alone identifies them then
  let me = await who(req, { optional: op === 'exchange' });
  if (!me && op === 'exchange') {
    const uid = b.link_token ? await kv('GET', await LT(String(b.link_token))) : null;
    if (!uid) return fail(res, 401, 'need_code');
    me = { uid, tier: 'free', plus: false, viaLink: true };
  }
  const maxFree = num('FREE_MAX_BANKS', 2);

  if (op === 'link_token') {
    const items = await listItems(me.uid);
    const upd = b.item_id ? items.find(i => i.item_id === b.item_id) : null;
    if (!upd && !me.plus && items.length >= maxFree) return fail(res, 402, 'free_bank_limit', { limit: maxFree });
    const p = {
      client_name: env('APP_NAME', BRAND.name).slice(0, 30), language: 'en', country_codes: ['US'],
      user: { client_user_id: me.uid }
    };
    if (env('PLAID_REDIRECT_URI')) p.redirect_uri = env('PLAID_REDIRECT_URI');
    if (b.hosted) p.hosted_link = { completion_redirect_uri: backURL(req, b.return_to), url_lifetime_seconds: 1800 };
    if (upd) p.access_token = await unseal(upd.tok);
    else { p.products = ['transactions']; const opt = []; if (LIAB()) opt.push('liabilities'); if (INV()) opt.push('investments'); if (opt.length) p.optional_products = opt; p.transactions = { days_requested: Math.min(730, Math.max(30, num('PLAID_DAYS', 365))) } }
    if (upd && b.add) { const add = [].concat(b.add).filter(x => (x === 'liabilities' && LIAB()) || (x === 'investments' && INV())); if (add.length) p.additional_consented_products = add }
    const hook = hookURL(req); if (hook && !upd) p.webhook = hook;
    const r = await plaid('/link/token/create', p);
    await kv('SET', await LT(r.link_token), me.uid, 'EX', 4 * 3600);
    return send(res, 200, { ok: true, link_token: r.link_token, hosted_link_url: r.hosted_link_url || null, expiration: r.expiration, update: !!upd });
  }

  if (op === 'exchange') {
    if (!b.public_token) return fail(res, 400, 'missing_public_token');
    const items = await listItems(me.uid);
    if (!me.plus && !me.viaLink && items.length >= maxFree) return fail(res, 402, 'free_bank_limit', { limit: maxFree });
    const r = await plaid('/item/public_token/exchange', { public_token: String(b.public_token) });
    const inst = String((b.institution && (b.institution.name || b.institution)) || 'Bank').slice(0, 60);
    await kv('HSET', ITEMS(me.uid), r.item_id, JSON.stringify({ tok: await seal(r.access_token), inst, at: Date.now() }));
    await kv('SET', 'itemuid:' + r.item_id, me.uid);
    return send(res, 200, { ok: true, item_id: r.item_id, institution: inst });
  }

  // after Plaid's hosted page sends them back: collect the new bank connection(s)
  if (op === 'hosted_done') {
    const lt = String(b.link_token || '');
    const owner = lt ? await kv('GET', await LT(lt)) : null;
    if (!owner || owner !== me.uid) return fail(res, 403, 'not_yours');
    const doneKey = 'ltdone:' + (await sha(lt)).slice(0, 32);
    const prev = await kv('GET', doneKey);
    if (prev) { try { return send(res, 200, JSON.parse(prev)) } catch { } }
    const r = await plaid('/link/token/get', { link_token: lt });
    const items = await listItems(me.uid), linked = [];
    let finished = false, exited = false;
    for (const s of (r.link_sessions || [])) {
      if (s.finished_at) finished = true;
      if (s.exit) exited = true;
      const adds = (s.results && s.results.item_add_results) || [];
      const list = adds.length ? adds.map(x => ({ pt: x.public_token, inst: x.institution && x.institution.name }))
        : (s.on_success && s.on_success.public_token ? [{ pt: s.on_success.public_token, inst: s.on_success.metadata && s.on_success.metadata.institution && s.on_success.metadata.institution.name }] : []);
      for (const x of list) {
        if (!x.pt) continue;
        if (!me.plus && items.length + linked.length >= maxFree) break;
        const ex = await plaid('/item/public_token/exchange', { public_token: x.pt });
        const inst = String(x.inst || 'Bank').slice(0, 60);
        await kv('HSET', ITEMS(me.uid), ex.item_id, JSON.stringify({ tok: await seal(ex.access_token), inst, at: Date.now() }));
        await kv('SET', 'itemuid:' + ex.item_id, me.uid);
        linked.push({ item_id: ex.item_id, institution: inst });
      }
    }
    const out = { ok: true, finished, exited: exited && !linked.length, linked };
    if (finished) await kv('SET', doneKey, JSON.stringify(out), 'EX', 6 * 3600);
    return send(res, 200, out);
  }

  if (op === 'items') return send(res, 200, { ok: true, items: (await listItems(me.uid)).map(pub), env: plaidEnv() });

  if (op === 'sync') {
    const cursors = b.cursors && typeof b.cursors === 'object' ? b.cursors : {};
    const only = b.item_id ? String(b.item_id) : null;
    const items = (await listItems(me.uid)).filter(i => !only || i.item_id === only);
    const results = await Promise.all(items.map(it => syncItem(it, String(cursors[it.item_id] || ''), !cursors[it.item_id] || !!b.liabilities)));
    return send(res, 200, { ok: true, items: results, env: plaidEnv(), at: Date.now() });
  }

  if (op === 'remove') {
    const items = await listItems(me.uid);
    const it = items.find(i => i.item_id === b.item_id);
    if (!it) return fail(res, 404, 'not_found');
    try { await plaid('/item/remove', { access_token: await unseal(it.tok) }) } catch { }
    await kv('HDEL', ITEMS(me.uid), it.item_id);
    return send(res, 200, { ok: true });
  }

  return fail(res, 400, 'unknown_op');
});

// ---------- Plaid webhooks: "new transactions are ready". Verified, then the person's phone gets a quiet nudge ----------
const keyCache = {};
async function verifyHook(req, raw) {
  if (env('PLAID_WEBHOOK_VERIFY', 'on').toLowerCase() === 'off') return true;
  const jwt = String(req.headers['plaid-verification'] || ''); const parts = jwt.split('.'); if (parts.length !== 3) return false;
  const dec = x => JSON.parse(Buffer.from(x.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  let head, claims; try { head = dec(parts[0]); claims = dec(parts[1]) } catch { return false }
  if (head.alg !== 'ES256' || !head.kid) return false;
  if (!claims.iat || Math.abs(Date.now() / 1000 - claims.iat) > 300) return false;
  let jwk = keyCache[head.kid]; if (!jwk) { const r = await plaid('/webhook_verification_key/get', { key_id: head.kid }); jwk = r.key; keyCache[head.kid] = jwk }
  if (!jwk || jwk.expired_at) return false;
  const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  const sig = Buffer.from(parts[2].replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, sig, new TextEncoder().encode(parts[0] + '.' + parts[1]));
  if (!ok) return false;
  const h = Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))).toString('hex');
  return h === claims.request_body_sha256;
}
async function webhook(req, res, b) {
  const raw = typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(b);
  if (!(await verifyHook(req, raw))) return fail(res, 401, 'bad_signature');
  const item = String(b.item_id || ''), uid = item ? await kv('GET', 'itemuid:' + item) : null;
  if (uid && b.webhook_type === 'TRANSACTIONS' && /SYNC_UPDATES_AVAILABLE|DEFAULT_UPDATE|INITIAL_UPDATE|HISTORICAL_UPDATE/.test(String(b.webhook_code || ''))) {
    await kv('SET', 'fresh:' + uid, String(Date.now()), 'EX', 7 * 86400);
    // one quiet push at most every 30 minutes: no amounts or names leave the server, the app syncs when it opens
    const gate = await kv('SET', 'freshpush:' + uid, '1', 'NX', 'EX', 1800);
    if (gate) { try { const { pushTo } = await import('./push.js'); if (typeof pushTo === 'function') await pushTo(uid, { title: BRAND.name, body: 'New activity from your bank. Open ' + BRAND.name + ' to see it.', tag: 'fresh', url: '/?sync=1' }) } catch { } }
  }
  if (uid && b.webhook_type === 'ITEM' && /ERROR|PENDING_EXPIRATION|LOGIN_REPAIRED/.test(String(b.webhook_code || ''))) await kv('SET', 'itemstat:' + item, String(b.webhook_code), 'EX', 30 * 86400);
  return send(res, 200, { ok: true });
}
