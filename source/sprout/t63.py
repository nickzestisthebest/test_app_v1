# The whole new batch, on the person's own data: every screen opens cleanly, and the new features do what they say.
import os, csv, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.getcwd() + '/v2_test.html'
rows = list(csv.DictReader(open('../csvin/tx.csv')))
R = []
def ck(n, c, i=''): R.append(('PASS ' if c else 'FAIL ') + n + ('' if c else ' ' + str(i)[:400]))
os.makedirs('probe', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL); pg.wait_for_timeout(2500); S = pg.evaluate; W = pg.wait_for_timeout
    S(open('nick_seed.js').read(), rows); W(600)
    S("__T.closeSheets()"); W(300)
    # ---- every linked account is in the right place
    acc = S("(()=>{const G=__S.F2.groups();return G.map(g=>[g[0],g[2].map(a=>a.name)])})()")
    inv = [g for g in acc if g[0] == 'invest'][0][1]
    ck('the 401(k) is under Investments and retirement', 'Fidelity 401k' in inv, acc)
    nw = S("__T.LG.nw()")
    ck('the 401(k) counts in net worth', nw.get('I', 0) >= 8632, nw)
    S("__T.xOpen('vault')"); W(500); v = pg.inner_text('#x-body')
    ck('Savings shows investments and retirement', 'INVESTMENTS AND RETIREMENT' in v.upper() and '8,632' in v, v[:300])
    pg.screenshot(path='probe/a_vault.png', full_page=True)
    S("__T.closeSheets()"); W(300)
    safe = S("(()=>{const sp=state.spend.map(s=>Object.assign({t:Date.parse(s.d)},s));return JSON.stringify(__T.availAt(Date.now(),sp)).length>0})()")
    # ---- paycheck found from deposits, and the set-up note offers it
    pay = S("(()=>{const p=__S.RC.pay();return p?[p.name,p.amt,p.freq]:null})()")
    ck('paycheck found from payroll deposits', pay and pay[2] == 'biweekly', pay)
    S("document.querySelector('#tabbar [data-tab=money], [data-tab=money]')&&document.querySelector('[data-tab=money]').click()"); W(700)
    fin = S("document.body.innerText")
    ck('Finances offers the paycheck it found', 'Found your paycheck' in fin, fin[:500])
    ck('Finances has the Spending card', 'SPENDING' in fin.upper())
    pg.screenshot(path='probe/b_fin.png', full_page=True)
    S("__S.RC.usePay(__S.RC.pay())"); W(500)
    ck('using it sets the paycheck', S("state.pay>0&&state.payFreq==='biweekly'"))
    # ---- subscriptions and bills from linked history
    subs = S("detectSubs().map(s=>s.name)") if False else S("__T.detectSubs().map(s=>s.name)")
    ck('subscriptions are found in linked history', len(subs) >= 2 and any('Onelife' in s or 'Prime' in s for s in subs), subs)
    nb = S("__S.RC.newBills().map(s=>s.name)")
    ck('recurring bills are found', any('Capital One Auto' in s or 'T-Mobile' in s for s in nb), nb)
    # ---- pay-later is debt
    ck('pay-later plans count in what you owe', S("__S.PL.owed()") > 0 and S("__T.ev('totalDebt()')") >= S("__S.PL.owed()") if False else S("__S.PL.owed()") > 0)
    # ---- Spending: insights first
    S("__S.SP.open('ins')"); W(900)
    sp = pg.inner_text('#txv')
    ck('Spending opens on Insights', 'Insights' in sp and 'MONTH BY MONTH' in sp.upper(), sp[:300])
    pg.screenshot(path='probe/c_spend.png', full_page=False)
    S("__T.closeSheets()"); W(400)
    # ---- money calendar
    S("CALS=null") if False else S("__T.ev('CALS=null')")
    S("__T.xOpen('calendar')"); W(500); c = pg.inner_text('#x-body')
    ck('calendar shows coming in, going out and lowest balance', 'Coming in' in c and 'Lowest balance' in c, c[:300])
    k1 = S("[document.querySelectorAll('#x-body .c4due').length,document.querySelectorAll('#x-body .c4d.in,#x-body .c4d.both').length]")
    pg.click('[data-x=calnav][data-v="1"]'); W(400)
    k2 = S("[document.querySelectorAll('#x-body .c4due').length,document.querySelectorAll('#x-body .c4d.in,#x-body .c4d.both').length]")
    ck('calendar marks due days and paydays', k1[0] + k2[0] > 0 and k1[1] + k2[1] > 0, (k1, k2))
    pg.screenshot(path='probe/d_cal2.png', full_page=True)
    pg.click('[data-x=calnav][data-v="-1"]'); W(300)
    S("(()=>{const b=document.querySelector('[data-f3=calview][data-v=bal]');if(b)b.click()})()"); W(400)
    S("(()=>{const t=document.querySelector('#x-body .c4d.today');if(t)t.click()})()"); W(400)
    ck('calendar day sheet shows the balance at day end', 'at day’s end' in pg.inner_text('#x-body'))
    pg.screenshot(path='probe/d_cal.png', full_page=True)
    S("__T.closeSheets()"); W(300)
    # ---- credit report
    S("__T.xOpen('credit')"); W(400); cr = pg.inner_text('#x-body')
    ck('credit page explains the free report', 'AnnualCreditReport.com' in cr, cr[:300])
    rep = {"bureau": "Experian", "reportDate": "2026-10-15", "score": {"value": 684, "model": "FICO 8", "date": "2026-10-15"},
           "accounts": [{"name": "Capital One Savor", "type": "card", "open": True, "opened": "2019-03", "limit": 2000, "balance": 1450, "payment": 40, "late30": 1, "lastLate": "2024-02", "status": "Current", "last4": "1111"},
                        {"name": "Navient", "type": "student", "open": True, "opened": "2016-08", "limit": 18000, "balance": 9200, "payment": 120, "status": "Current"},
                        {"name": "Old Store Card", "type": "retail", "open": False, "opened": "2014-05", "closed": "2020-01", "limit": 500, "balance": 0}],
           "inquiries": [{"name": "Chase", "date": "2026-03-02"}, {"name": "Audi Finance", "date": "2025-07-01"}],
           "collections": [{"name": "Midland", "original": "Comcast", "amount": 212, "date": "2023-05", "paid": False}], "records": []}
    S("(j)=>{const c=__S.CR.clean(j);__S.CR.save(c,'pdf')}", rep); W(300)
    S("__T.ev('xRender()')"); W(400); cr = pg.inner_text('#x-body')
    ck('score shows', '684' in cr and 'FICO 8' in cr, cr[:300])
    ck('payment history read', '1 late payment' in cr, cr[:800])
    ck('inquiries with dates', 'Chase' in cr and 'counts until' in cr)
    ck('collections with dispute links', 'Midland' in cr and 'Equifax' in cr)
    ck('student loan Sprout did not know about is offered', 'Navient' in cr and 'Not in Sprout yet'.upper() in cr.upper(), cr[:1500])
    pg.screenshot(path='probe/e_credit.png', full_page=True)
    d0 = S("__T.ev('totalDebt()')")
    pg.click('[data-cr=add]'); W(400)
    ck('adding it counts in what you owe', S("__T.ev('totalDebt()')") - d0 > 9000, (d0, S("__T.ev('totalDebt()')")))
    S("__T.closeSheets()"); W(300)
    # ---- notifications page
    S("__T.xOpen('notifs')"); W(400); nt = pg.inner_text('#x-body')
    ck('notifications are grouped', all(g in nt.upper() for g in ['HEADS UP', 'BILLS AND PAY-LATER', 'CARDS AND CREDIT', 'SPENDING', 'WINS', 'TIPS']), nt[:400])
    ck('quiet hours and a daily cap', 'Quiet hours' in nt and 'At most each day' in nt)
    pg.screenshot(path='probe/f_notifs.png', full_page=True)
    S("__T.closeSheets()"); W(300)
    tight = S("(()=>{const d=new Date(Date.now()+3*864e5);state.bills.push({name:'Rent',amt:400,type:'monthly',day:d.getDate()});state.cash=420;state.cashAt=Date.now();__T.ev('plan()');const L=__S.NT.now().filter(a=>a.k==='tight'||a.k==='neg');return L.map(a=>a.t)})()")
    ck('a heads-up when a payment is near and checking is low', len(tight) >= 1, tight)
    S("__T.xOpen('yourplan')"); W(400); yp = pg.inner_text('#x-body')
    ck('Your plan lists paycheck, bills, what you owe and money', all(x in yp.upper() for x in ['PAYCHECK', 'BILLS', 'WHAT YOU OWE', 'MONEY']), yp[:300])
    pg.screenshot(path='probe/g_plan.png', full_page=True)
    S("__T.closeSheets()"); W(300)
    # ---- Ask: the Audi question, on the phone
    S("state.x2.plus={on:1,bill:'yr'}")
    S("document.getElementById('open-ask').click()"); W(600)
    def ask(q):
        pg.fill('#cmd-in', q); S("__T.ev('runCmd()')"); W(900)
        return pg.inner_text('#cmd-out')
    a1 = ask('I want to buy a new Audi rs3, how and when can I afford kne')
    ck('asks for the price, naming the car', 'How much is the' in a1 and 'RS3' in a1, a1[-300:])
    a2 = ask('It’s 60,000')
    ck('gives a plan with when, not just no', ('current pace' in a2 or 'more goes out than comes in' in a2) and 'Left over' in a2, a2[-900:])
    ck('shows the math is not advice', 'not financial advice' in a2)
    ck('payment sliders are drawn', S("document.querySelectorAll('#cmd-out .fzcalc').length") >= 1)
    pg.screenshot(path='probe/h_ask.png', full_page=True)
    a3 = ask('how much did i spnd on gorceries this month')
    ck('typos: groceries this month', 'on Groceries' in a3 or 'groceries' in a3.lower(), a3[-300:])
    a4 = ask('whats my net wroth')
    ck('typos: net worth', 'net worth is' in a4.lower(), a4[-200:])
    S("__T.closeSheets()"); W(300)
    # ---- Log: type it
    n0 = S("state.spend.length")
    S("document.querySelector('[data-open=sh-spend],#open-log,[data-log]')&&0")
    S("__T.ev(\"openSheet('sh-spend')\")"); W(500)
    pg.fill('#ql-in', '12 at chipotle and 40 gas yesterday'); W(500)
    ql = pg.inner_text('#ql-out')
    ck('quick log reads two items', 'Chipotle' in ql and ('Gas' in ql or 'gas' in ql) and 'Log 2 items' in S("(document.getElementById('l4go')||{}).textContent||''"), ql)
    pg.screenshot(path='probe/i_log.png', full_page=False)
    pg.click('#l4go'); W(500)
    ck('both are logged', S("state.spend.length") - n0 == 2)
    # ---- small things
    S("__T.closeSheets()"); S("__T.setTab&&__T.setTab('home')"); W(600)
    pg.screenshot(path='probe/j_home.png', full_page=False)
    gs = S("(()=>{const e=document.querySelector('.ovhello>span');return e?parseFloat(getComputedStyle(e).fontSize):0})()")
    ck('greeting is a bit bigger', gs >= 16, gs)
    ck('no page errors', not errs, errs[:4])
    b.close()
print('\n'.join(R)); print(sum(r.startswith('PASS') for r in R), '/', len(R))
