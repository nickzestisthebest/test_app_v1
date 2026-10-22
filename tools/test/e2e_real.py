"""Real-life money test: $0 in checking, most spending on a credit card, a student loan.
Every number Sprout shows is checked against values worked out here, separately, straight from the bank data.
Run tools/test/run_servers.sh first."""
import json, re, datetime, urllib.request
from playwright.sync_api import sync_playwright

BASE = 'http://localhost:3000'; MOCK = 'http://127.0.0.1:4010'
TV = re.search(r"const TERMS_V='([^']+)'", open('../sprout/acct.js').read()).group(1)
SEED = """(()=>{try{const L=localStorage;L.setItem('sprout-debug','1');if(!L.getItem('sprout-accounts-v1'))L.setItem('sprout-accounts-v1',JSON.stringify({cur:'t1',list:{t1:{id:'t1',first:'Nick',last:'S',email:'real@example.com',phone:'(555) 222-3333',dob:'1990-01-01',zip:'30301',salt:'s',pwh:'x',created:1,fidAsked:1,agree:{v:'__TV__',at:1,tos:true,privacy:true,esign:true}}}}));if(!L.getItem('sprout-server-code::t1'))L.setItem('sprout-server-code::t1','owner-code-1234')}catch(e){}})()""".replace('__TV__', TV)
R = []
import atexit
atexit.register(lambda: print('\n'.join(R) + '\n' + str(sum(r.startswith('PASS') for r in R)) + ' / ' + str(len(R)) + ' passed'))
def ck(name, cond, info=''):
    R.append(('PASS ' if cond else 'FAIL ') + name + (' ' + str(info)[:400] if not cond and info != '' else ''))
def mock(path, body=None):
    req = urllib.request.Request(MOCK + path, data=json.dumps(body).encode() if body is not None else None, headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read() or b'{}')
def kv(*cmd):
    req = urllib.request.Request(MOCK + '/kv', data=json.dumps(list(cmd)).encode(), headers={'Authorization': 'Bearer kvtoken'})
    return json.loads(urllib.request.urlopen(req).read())
def usd(v):
    s = '{:,.2f}'.format(abs(v)); return ('−' if v < 0 else '') + '$' + s
def usd0(v):
    s = '{:,}'.format(int(round(abs(v)))); return ('−' if round(v) < 0 else '') + '$' + s
near = lambda a, b: abs((a or 0) - (b or 0)) < 0.011

mock('/reset', {}); mock('/control?op=queue', {'profiles': ['broke-bank', 'broke-card']})
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, service_workers='block')
    ctx.add_init_script(SEED)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    W = pg.wait_for_timeout; S = lambda js: pg.evaluate(js)

    pg.goto(BASE); W(5000)
    ck('owner code active', S("__S.LIVE.st&&__S.LIVE.st.code==='ok'"))
    S("__S.closeSheets()"); W(400); S("__S.lkOpen()"); W(1500)
    pg.click('[data-lv=add]')
    pg.wait_for_url(re.compile(r'.*plaid=done.*|.*localhost:3000/$'), timeout=15000); W(1500)
    for i in range(40):
        if pg.locator('#lk-body').count() and 'Paycheck' in pg.inner_text('#lk-body'): break
        W(500)
    body = pg.inner_text('#lk-body')
    ck('setup asks about a credit card when none is linked', 'Do you use a credit card?' in body, body[:300])
    pg.screenshot(path='shots/r01_found_card_prompt.png', full_page=True)
    pg.click('[data-lk=finish]'); W(2500)
    S("__S.closeSheets()"); W(500)

    # ---- checking only: $0, card payments visible but the card isn't ----
    st = S("(()=>{const s=__S.st();return{cash:s.cash,cp:s.spend.filter(x=>x.xf==='cp').map(x=>[x.d,x.amt,!!x.xm]),hero:(document.querySelector('.ovhero b')||{}).innerText,sub:(document.querySelector('.ovhero .s')||{}).innerText,nudge:(document.querySelector('.lgnudge')||{}).innerText||''}})()")
    ck('checking is $0 from the bank', near(st['cash'], 0), st['cash'])
    ck('Safe to spend is $0.00 with $0 in checking', st['hero'] == '$0.00', st['hero'])
    ck('Safe to spend says checking is the limit', 'Checking can’t cover' in (st['sub'] or ''), st['sub'])
    ck('card payments counted while the card is unlinked', len(st['cp']) == 4 and not any(x[2] for x in st['cp']), st['cp'])
    ck('Home asks to link the card, with the real amount', 'You paid $2,560 to a card in the last 6 weeks' in st['nudge'], st['nudge'])
    pg.screenshot(path='shots/r02_home_nudge.png')

    # ---- link the card from Home ----
    pg.click('.lgnudge [data-lg=addcard]')
    pg.wait_for_url(re.compile(r'.*plaid=done.*|.*localhost:3000/$'), timeout=20000)
    for i in range(90):
        try:
            if S("(__S.st().link.items||[]).length===2&&__S.st().debts.some(d=>/Freedom/.test(d.name))&&__S.st().spend.filter(x=>x.card).length>40"): break
        except Exception: pass
        W(500)
    W(1500)
    raw = mock('/control?op=raw', {})['items']
    bank, card = raw['broke-bank'], raw['broke-card']
    ac = {a['account_id']: a for a in bank['accounts'] + card['accounts']}
    cc = next(a for a in card['accounts'] if a['type'] == 'credit'); sl = next(a for a in card['accounts'] if a['type'] == 'loan')
    chk = bank['accounts'][0]

    # ---- expected values, worked out here from the raw bank data ----
    P2P = re.compile(r'venmo|zelle|cash ?app|paypal', re.I)
    def pfc(t): return t['personal_finance_category']['primary']
    def pfd(t): return t['personal_finance_category']['detailed']
    money_in = 0.0; refunds = 0.0; out = 0.0
    for t in bank['tx']:
        a = t['amount']  # Plaid: positive = money leaving
        if a < 0:
            if pfc(t) == 'INCOME' or (pfc(t) == 'TRANSFER_IN' and P2P.search(t['merchant_name'])): money_in += -a
            elif pfc(t) not in ('TRANSFER_IN', 'LOAN_PAYMENTS'): refunds += -a
        else:
            if pfd(t) == 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT': continue  # the card is linked and shows the purchases
            if pfd(t) in ('TRANSFER_OUT_SAVINGS', 'TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS'): continue
            out += a
    for t in card['tx']:
        a = t['amount']
        if a < 0:
            if pfd(t) == 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT': continue
            refunds += -a
        else: out += a
    exp_in, exp_out = round(money_in, 2), round(out - refunds, 2)
    exp_nw = round(chk['balances']['available'] - cc['balances']['current'] - sl['balances']['current'], 2)

    got = S("(()=>{const s=__S.st(),F=__S.LG.flows(s.spend),N=__S.LG.nw(),C=__S.LG.credit();return{F,N,C,debts:s.debts.map(d=>({n:d.name,b:d.bal,apr:d.apr,min:d.min,lim:d.limit||0,acct:!!d.acct})),cp:s.spend.filter(x=>x.xf==='cp').map(x=>!!x.xm),cash:s.cash}})()")
    F, N = got['F'], got['N']
    ck('money in = paychecks plus money from people (no refunds, no transfers)', near(F['inc'], exp_in), (F['inc'], exp_in))
    ck('money out = every purchase, bill and fee, minus refunds, card payments not counted twice', near(F['out'], exp_out), (F['out'], exp_out))
    ck('cash flow = money in minus money out', near(F['net'], round(exp_in - exp_out, 2)), (F['net'], exp_in - exp_out))
    ck('refunds lower spending', near(F['ref'], round(refunds, 2)), (F['ref'], refunds))
    ck('every card payment matched to the linked card', got['cp'] and all(got['cp']), got['cp'])
    ck('net worth = checking minus card minus loan', near(N['N'], exp_nw), (N, exp_nw))
    ck('available credit from the bank', near(got['C']['avail'], 1179.45) and near(got['C']['limit'], 6000), got['C'])
    fr = next((d for d in got['debts'] if 'Freedom' in d['n']), None); lo = next((d for d in got['debts'] if 'Student' in d['n']), None)
    ck('linked card became a debt with its real APR, minimum and limit', fr and near(fr['b'], 4820.55) and fr['apr'] == 27.49 and near(fr['min'], 145) and fr['lim'] == 6000, fr)
    ck('student loan became a debt', lo and near(lo['b'], 18250) and lo['apr'] == 5.5 and near(lo['min'], 210), lo)

    # net worth history, worked out from the transactions month by month
    today = datetime.date.fromisoformat(S("new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10)"))
    def mend(y, m):
        n = datetime.date(y + (m == 12), m % 12 + 1, 1); return n - datetime.timedelta(days=1)
    first = max(min(datetime.date.fromisoformat(t['date']) for t in bank['tx']), min(datetime.date.fromisoformat(t['date']) for t in card['tx']))
    exp_series = []
    for i in range(24, 0, -1):
        y, m = today.year, today.month - i
        while m <= 0: m += 12; y -= 1
        me = mend(y, m)
        if me < first: continue
        cash = chk['balances']['current'] + sum(t['amount'] for t in bank['tx'] if datetime.date.fromisoformat(t['date']) > me)
        owed = cc['balances']['current'] - sum(t['amount'] for t in card['tx'] if datetime.date.fromisoformat(t['date']) > me)
        # the loan was higher in the past by the payments made since (the app rolls it back from the bank's loan payments)
        loan = sl['balances']['current'] + sum(t['amount'] for t in bank['tx'] if 'nelnet' in t['name'].lower() and datetime.date.fromisoformat(t['date']) > me)
        exp_series.append(round(cash - max(0, owed) - loan, 2))
    exp_series.append(exp_nw)
    app_series = S("__S.LG.series().map(o=>o.v)")
    ck('net worth history matches the transactions month by month', len(app_series) == len(exp_series) and all(near(a, e) for a, e in zip(app_series, exp_series)), (app_series, exp_series))
    ck('net worth trend points the right way', (exp_series[-1] - exp_series[0] < 0) == (app_series[-1] - app_series[0] < 0), (app_series[0], app_series[-1]))

    # ---- what the screens show ----
    pg.reload(); W(5000); S("__S.closeSheets()"); W(500)
    hero = S("(document.querySelector('.ovhero b')||{}).innerText")
    ck('Safe to spend still $0.00 with the card linked', hero == '$0.00', hero)
    ck('no card nudge once the card is linked', pg.locator('.lgnudge').count() == 0)
    pg.screenshot(path='shots/r03_home_linked.png')
    pg.click('.ovhero'); W(900)
    sb = pg.inner_text('#x-body')
    sbl = sb.lower()
    ck('Safe to spend explains itself', 'what your checking can cover' in sbl and 'Checking right now' in sb and '$0.00' in sb and 'Available credit' in sb and '$1,179.45' in sb, sb[-700:])
    pg.screenshot(path='shots/r04_safe.png', full_page=True)
    pg.click('[data-lgset=useCredit]'); W(700)
    on = S("document.querySelector('#x-body .xhero b').innerText")
    ck('counting card credit is a choice, and it changes the number', on != '$0.00' and 'Card credit you chose to count' in pg.inner_text('#x-body'), on)
    pg.click('[data-lgset=useCredit]'); W(700)
    ck('and it turns back off', pg.inner_text('#x-body .xhero b') == '$0.00', pg.inner_text('#x-body .xhero b'))
    S("__S.closeSheets()"); W(500)
    S("__S.xGo('networth')"); W(900)
    nb = pg.inner_text('#x-body')
    ck('net worth page shows the real total', usd0(exp_nw) in nb, nb[:300])
    ck('net worth page names its sources', 'From your bank' in nb and 'Past months are worked out from your transactions' in nb, nb[-400:])
    pg.screenshot(path='shots/r05_networth.png', full_page=True)
    S("__S.closeSheets()"); W(400)
    pg.evaluate("document.querySelector('#menu [data-nav=tx]').click()"); W(1200)
    pg.evaluate("document.querySelector('[data-txf=when][data-v=all]').click()"); W(600)
    ts = pg.inner_text('#tx-sum')
    ck('all-time money in on screen', '+' + usd(exp_in) in ts, ts)
    ck('all-time money out on screen', '−' + usd(exp_out) in ts, ts)
    ck('all-time cash flow on screen', ('−' if exp_in - exp_out < 0 else '+') + usd(abs(exp_in - exp_out)) in ts, ts)
    pg.screenshot(path='shots/r06_tx_all.png', full_page=True)
    pg.evaluate("document.querySelector('[data-txview=cat]')&&document.querySelector('[data-txview=cat]').click()"); W(600)
    cat = pg.inner_text('#tx-list')
    ck('breakdown total matches money out', usd(exp_out) in cat.split('\n')[1] if len(cat.split('\n')) > 1 else False, cat[:200])
    pg.keyboard.press('Escape'); W(300); pg.evaluate("(document.querySelector('#txv [data-txclose]')||{click(){}}).click()"); W(500)

    subs = S("(()=>{try{return __S.BR.answer('what subscriptions do I have').items.map(i=>i.name)}catch(e){return String(e)}})()")
    ck('subscriptions found on the card and checking', isinstance(subs, list) and all(any(k in s for s in subs) for k in ['Netflix', 'Spotify', 'Hulu']) and any('Prime' in s or 'Amazon' in s for s in subs), subs)
    ck('card interest and loan payments are not subscriptions', isinstance(subs, list) and not any(re.search(r'interest|nelnet|chase|loan|zelle', s, re.I) for s in subs), subs)

    # ---- backup: a fresh phone with the same account gets the plan and streak back ----
    S("(()=>{const s=__S.st(),y=new Date(Date.now()-864e5-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);s.stk=Object.assign(s.stk||{},{run:9,best:9,last:y});})()")
    S("__S.LG.bk.pulled=true"); pg.evaluate("__S.LG.push()"); W(1500)
    keys = [k for k in mock('/stats')['kvKeys'] if k.startswith('bk:')]
    ck('backup stored on the server', len(keys) == 1, mock('/stats')['kvKeys'])
    v = kv('GET', keys[0])['result'] if keys else ''
    ck('backup is encrypted at rest', v and '"box":"v1.' in v and 'Freedom' not in v and '4820' not in v, (v or '')[:120])
    ctx2 = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, service_workers='block')
    ctx2.add_init_script(SEED); p2 = ctx2.new_page(); p2.goto(BASE)
    for i in range(30):
        p2.wait_for_timeout(500)
        try:
            if p2.evaluate("!!(window.__S&&__S.st().setup)"): break
        except Exception: pass
    r2 = p2.evaluate("(()=>{const s=__S.st();return{setup:s.setup,run:s.stk&&s.stk.run,debts:s.debts.length,spend:s.spend.length}})()")
    ck('new phone restores the plan', r2['setup'] and r2['debts'] >= 2 and r2['spend'] > 50, r2)
    ck('new phone keeps the streak', r2['run'] == 9, r2)
    ctx2.close()

    # turning backup off deletes the server copy
    S("__S.xGo('server')"); W(800)
    pg.click('[data-lgbk]'); W(1200)
    ck('turning backup off deletes it', not [k for k in mock('/stats')['kvKeys'] if k.startswith('bk:')], mock('/stats')['kvKeys'])
    ck('no page errors', not errs, errs[:3])
    b.close()
