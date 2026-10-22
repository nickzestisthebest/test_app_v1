// What's set up on the server, and what this person's access code allows. The app checks this when it opens.
import { env, num, send, handle, who, kv, kvReady, plaidReady, plaidEnv, codes, month } from './_lib.js';

export default handle(async (req, res) => {
  const setup = {
    plaid: plaidReady(), plaidEnv: plaidEnv(), redirect: !!env('PLAID_REDIRECT_URI'),
    ai: !!env('ANTHROPIC_API_KEY'), storage: kvReady(), codes: Object.keys(codes()).length > 0,
    encryption: env('ENCRYPTION_KEY').length >= 16,
    credit: !!(env('CREDIT_PROVIDER_KEY') && env('CREDIT_ENROLL_URL'))
  };
  const out = { ok: true, app: 'sprout', version: 1, setup, ready: setup.plaid && setup.storage && setup.codes && setup.encryption };
  let me = null;
  try { me = await who(req, { optional: true }) } catch (e) { out.code = e.message }
  if (me) {
    out.code = 'ok'; out.tier = me.tier; out.plus = me.plus; out.freeBanks = num('FREE_MAX_BANKS', 2);
    out.cancel = env('CANCEL_FOR_ME', 'on').toLowerCase() !== 'off';
    if (me.owner && kvReady()) {
      const m = month();
      const h = (await kv('HGETALL', 'rq:all')) || [];
      let open = 0; for (let i = 1; i < h.length; i += 2) { try { if (/^(requested|working|needs_you)$/.test(JSON.parse(h[i]).status)) open++ } catch { } }
      out.cancelOpen = open;
      out.ai = { model: env('AI_MODEL', 'claude-haiku-5-5'), spentThisMonth: +parseFloat((await kv('GET', 'spend:' + m)) || '0').toFixed(4), budget: num('AI_MONTHLY_BUDGET_USD', 15), mine: +parseFloat((await kv('GET', 'uspend:' + me.uid + ':' + m)) || '0').toFixed(4) };
    }
  }
  send(res, 200, out);
});
