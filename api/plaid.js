// Bank connections through Plaid. Read-only: Sprout can see balances and transactions but can never move money.
// The Plaid access token for each bank is encrypted (AES-GCM) and kept on the server, never sent to the phone.
import { env, num, send, fail, body, handle, who, kv, kvReady, seal, unseal, sha, plaid, plaidReady, plaidEnv } from './_lib.js';

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

const trimTx = t => ({
  id: t.transaction_id, acct: t.account_id, date: t.date, amount: t.amount,
  name: t.name || '', merchant: t.merchant_name || '', pending: !!t.pending, ptid: t.pending_transaction_id || null,
  pfc: (t.personal_finance_category && t.personal_finance_category.primary) || '',
  pfd: (t.personal_finance_category && t.personal_finance_category.detailed) || '',
  cur: t.iso_currency_code || 'USD'
});
const trimAcct = a => ({
  id: a.account_id, name: a.name || a.official_name || 'Account', mask: a.mask || '', type: a.type, subtype: a.subtype || '',
  cur: a.balances ? a.balances.current : null, avail: a.balances ? a.balances.available : null, limit: a.balances ? a.balances.limit : null
});
function trimLiab(L) {
  if (!L) return null;
  const out = [];
  (L.credit || []).forEach(c => out.push({ acct: c.account_id, kind: 'credit', apr: ((c.aprs || []).find(a => a.apr_type === 'purchase_apr') || (c.aprs || [])[0] || {}).apr_percentage ?? null, min: c.minimum_payment_amount ?? null, due: c.next_payment_due_date || null }));
  (L.student || []).forEach(c => out.push({ acct: c.account_id, kind: 'student', apr: c.interest_rate_percentage ?? null, min: c.minimum_payment_amount ?? null, due: c.next_payment_due_date || null }));
  (L.mortgage || []).forEach(c => out.push({ acct: c.account_id, kind: 'mortgage', apr: (c.interest_rate || {}).percentage ?? null, min: c.next_monthly_payment ?? null, due: c.next_payment_due_date || null }));
  return out;
}

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
    if (wantLiab) { try { const l = await plaid('/liabilities/get', { access_token }); out.liabilities = trimLiab(l.liabilities) } catch { } }
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
      client_name: env('APP_NAME', 'Sprout').slice(0, 30), language: 'en', country_codes: ['US'],
      user: { client_user_id: me.uid }
    };
    if (env('PLAID_REDIRECT_URI')) p.redirect_uri = env('PLAID_REDIRECT_URI');
    if (b.hosted) p.hosted_link = { completion_redirect_uri: backURL(req, b.return_to), url_lifetime_seconds: 1800 };
    if (upd) p.access_token = await unseal(upd.tok);
    else { p.products = ['transactions']; p.optional_products = ['liabilities']; p.transactions = { days_requested: Math.min(730, Math.max(30, num('PLAID_DAYS', 365))) } }
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
