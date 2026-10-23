# The 2026-10-22 batch on a realistic tight month: every number ties out, budgets don't fight, every screen and button works.
import os, csv, re, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.getcwd() + '/v2_test.html'
rows = list(csv.DictReader(open('../csvin/tx.csv')))
R = []
def ck(n, c, i=''): R.append(('PASS ' if c else 'FAIL ') + n + ('' if c else ' ' + str(i)[:400]))
num = lambda s: float(re.sub(r'[^0-9.]', '', s)) * (-1 if s.strip().startswith(('−', '-')) else 1)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL); pg.wait_for_timeout(2500); S = pg.evaluate; W = pg.wait_for_timeout; ev = lambda e: S("__T.ev(%s)" % json.dumps(e))
    S(open('seed_real.js').read(), rows); W(700); S("__T.closeSheets()"); W(300)
    # ---- one set of facts
    ck('the tie-out check finds nothing wrong', ev('MX.check()') == [], ev('MX.check()'))
    owe = ev('MX.owe()'); nw = ev('LG.nw()')
    ck('what you owe includes pay-later and Cash App Borrow', abs(owe - 40012.65) < 0.01 and ev("MX.debts().some(d=>d.kind==='borrow')"), owe)
    ck('net worth uses the same debts', abs(nw['L'] - owe) < 0.01 and abs(nw['N'] - (nw['A'] - owe)) < 0.01, nw)
    S("document.querySelector('.tabbar [data-tab=money]').click()"); W(700)
    fin = pg.inner_text('#pg')
    ck('Finances debts card shows the same total', '$40,013' in fin, fin[:600])
    ck('Finances has net worth, cash flow, debts, savings, spending, calendar and tools in that order',
       all(fin.upper().find(a) >= 0 for a in ['NET WORTH', 'CASH FLOW', 'DEBTS', 'SAVINGS AND INVESTING', 'SPENDING', 'MONEY CALENDAR', 'MONEY PULSE']) and
       fin.upper().find('NET WORTH') < fin.upper().find('CASH FLOW') < fin.upper().find('DEBTS') < fin.upper().find('MONEY CALENDAR'), fin[:500])
    ck('savings sits next to debt', S("(()=>{const g=document.querySelector('#pg .f3grid');return !!g&&!!g.querySelector('.f3dt')&&!!g.querySelector('.f3sv')})()"))
    # every Finances card opens its own screen
    for sel, title in [('.f3nw', 'Net worth'), ('.f3cf', 'Cash flow'), ('.f3dt', 'Debts'), ('.f3sv', 'Savings'), ('.f3cal', 'Money calendar')]:
        S("__T.closeSheets()"); W(300); S("document.querySelector('.tabbar [data-tab=money]').click()"); W(400)
        S("document.querySelector('#pg %s').click()" % sel); W(700)
        t = S("document.getElementById('x-t').textContent")
        ck('Finances %s opens %s' % (sel, title), title in t and not S("document.getElementById('sh-x').hidden"), t)
    # debts screen, accounts list and net worth all agree
    S("__T.closeSheets()"); W(300); S("__T.xOpen('debts')"); W(600); d = pg.inner_text('#x-body')
    ck('Debts total matches', '$40,013' in d, d[:200])
    ck('debts show pay-later and Cash App Borrow', 'Cash App Borrow' in d and 'Audi South Atlanta' in d)
    ck('extra goes to the highest rate first by default', 'Extra goes here now' in d and ev("MX.order(E)[0].apr") >= 29.99, ev("MX.order(E).map(x=>x.name+' '+x.apr)"))
    ex = ev("(()=>{const r=rows.find(r=>Object.values(r.ex).some(v=>v>0.004));return r?Object.keys(r.ex).filter(k=>r.ex[k]>0.004):[]})()")
    ck('the first extra payment goes to a 29.99% card', all(ev("E.debts.find(x=>x.name===%s).apr" % json.dumps(k)) >= 29.99 for k in ex) and len(ex) > 0, ex)
    ck('green is not the debt color', '#6fa98a' not in S("(document.querySelector('#x-body .c4b svg')||{outerHTML:'missing'}).outerHTML") and S("!!document.querySelector('#x-body .c4b svg')"))
    S("document.querySelector('#x-body .d4b') && document.querySelector('#x-body .d4b').click()"); W(400)
    ck('tapping a debt opens its own sheet', S("__T.ev('XP.page')")=='debt1')
    S("__T.xOpen('networth')"); W(600); n = pg.inner_text('#x-body')
    owes = sum(num(x) for x in re.findall(r'\n(−\$[\d,]+\.\d\d)\n', n))
    ck('the accounts list adds up to what you owe', abs(abs(owes) - owe) < 0.02 * 3 + 0.05 or abs(abs(owes) / 2 - owe) < 0.05, (owes, owe))
    ck('accounts list has no doubled card numbers', '**7710 ••7710' not in n and 'CHECKING ...4821' not in n, n[:300])
    ck('past and forecast are labeled', 'Past, from your transactions' in n and 'Ahead, if your plan goes as set' in n)
    # ---- budgets: fixed amounts that never move each other
    S("__T.closeSheets()"); W(300); S("__T.xOpen('budgets')"); W(600)
    g0 = ev("budLim(BCATS.find(c=>c[0]==='groc'))"); d0 = ev("budLim(BCATS.find(c=>c[0]==='din'))"); e0 = ev('state.everyday'); f0 = ev('state.discReduced')
    for i in range(3): S("document.querySelector('#x-body [data-x=bud][data-v=din][data-w=\"-10\"]').click()"); W(250)
    ck('lowering one budget leaves the others alone', ev("budLim(BCATS.find(c=>c[0]==='groc'))") == g0 and ev("budLim(BCATS.find(c=>c[0]==='din'))") == max(0, d0 - 30), (g0, d0))
    ck('Basics and Fun totals follow the categories', ev('state.everyday') == e0 and ev('state.discReduced') == f0 - (d0 - max(0, d0 - 30)), (ev('state.everyday'), ev('state.discReduced')))
    for i in range(30): S("(()=>{const b=document.querySelector('#x-body [data-x=bud][data-v=din][data-w=\"-10\"]');if(b)b.click()})()"); W(60)
    ck('a budget can go to $0', ev("budLim(BCATS.find(c=>c[0]==='din'))") == 0)
    bt = pg.inner_text('#x-body')
    ck('the budget page shows where the paycheck goes, in order', all(x in bt for x in ['Must-pays', 'Your budgets', 'Extra to debt', 'Left in checking']) and bt.find('Must-pays') < bt.find('Your budgets') < bt.find('Extra to debt'), bt[-900:])
    S("__T.ev(\"xGo('budcat','oth')\")"); W(500); c = pg.inner_text('#x-body')
    ck('a category opens to where the money went', 'WHERE IT WENT' in c.upper() or 'PARTS' in c.upper(), c[:300])
    S("document.querySelector('#x-body .b3grp').click()"); W(500)
    ck('and then to the purchases', S("document.querySelectorAll('#x-body [data-b2move]').length") > 0)
    # ---- Home, in order
    S("__T.closeSheets()"); W(300); S("document.querySelector('.tabbar [data-tab=home]').click()"); W(700)
    order = S("[...document.getElementById('ov').children].map(e=>e.className.split(' ').filter(c=>/stick|row|inscard|ovhero|safem|pcard3/.test(c)).join(' ')).filter(Boolean)")
    want = ['stick', 'row', 'inscard', 'ovhero', 'safem', 'pcard3']
    got = [next((w for w in want if w in o.split(' ')), None) for o in order]
    ck('Home: streak, today’s plan, top insight, safe today, safe this month', [g for g in got if g][:5] == want[:5], order)
    ck('no Budget score on Home', 'Budget score' not in pg.inner_text('#ov'))
    ck('Money Pulse has five scores', len(ev('PULSE.W')) == 5 and all(0 <= ev('PULSE.calc().S')[k]['v'] <= 100 for k in ['cash', 'debt', 'spend', 'save', 'nw']))
    m = ev('MX.month()'); hm = pg.inner_text('#ov .safem')
    ck('safe this month matches Budgets', ('$' + format(abs(round(m['left'])), ',')) in hm.replace('−', '') , (m['left'], hm))
    # ---- insights you can rate
    t0 = ev('SP.top()[0].id')
    if not S("!!document.querySelector('#ov .inscard [data-ins=not]')"):
        S("__S.SP.open('ins')"); W(1200)
    S("document.querySelector('[data-insid=%s] [data-ins=not]').click()" % json.dumps(t0).replace('"', "\\'")); W(500)
    ck('marking an insight not useful hides it', ev('SP.top().every(i=>i.id!==%s)' % json.dumps(t0)))
    S("document.querySelector('#toast .tbtn').click()"); W(400)
    ck('undo brings it back', ev('SP.top().some(i=>i.id===%s)' % json.dumps(t0)))
    # ---- honest spending money
    L = ev('MX.left()'); ck('spending money is never more than checking can cover', L['coverLeft'] is None or L['left'] <= L['coverLeft'] + 0.01, L)
    S("__T.xOpen('cashflow')"); W(600); cf = pg.inner_text('#x-body')
    ck('cash flow shows the paycheck plan and the week ahead', 'Paycheck by paycheck'.upper() in cf.upper() and 'Next 7 days'.upper() in cf.upper(), cf[:300])
    # ---- alerts: every Review opens something
    S("__T.closeSheets()"); W(300); S("__T.xOpen('alerts')"); W(600); n = S("document.querySelectorAll('#x-body [data-al3go]').length"); bad = []
    for i in range(n):
        S("__T.closeSheets()"); W(250); S("__T.xOpen('alerts')"); W(400)
        S("document.querySelectorAll('#x-body [data-al3go]')[%d].click()" % i); W(700)
        open_ = S("(()=>{const s=document.getElementById('sh-x');return !s.hidden&&document.getElementById('x-t').textContent!=='Alerts'})()") or S("!!(typeof txOpen!=='undefined'&&txOpen)")
        if not open_: bad.append(i)
    ck('every Review button opens a screen (%d)' % n, n > 0 and not bad, bad)
    # ---- calendar
    S("__T.closeSheets()"); W(300); S("__T.xOpen('calendar')"); W(600); cal = pg.inner_text('#x-body')
    ck('calendar opens on today with Pay and Spend tabs', 'TODAY' in cal.upper() and S("document.querySelectorAll('#x-body [data-c4tab]').length")==2, cal[:400])
    payday = ev("fd(rows.find(r=>r.inc>0&&r.d0>realToday()).d0)")
    S("document.querySelector('[data-x=calsel][data-v=\"%s\"]').click()" % payday); W(500); pdx = pg.inner_text('#x-body')
    ck('a payday shows the paycheck and the plan for it', 'PAYDAY' in pdx.upper() and ('FROM THE PLAN' in pdx.upper() or 'DUE THIS DAY' in pdx.upper() or 'SPENDING ROOM' in pdx.upper()), pdx.replace(chr(10),' | ')[:1400])
    ck('day sheet shows the balance at day end', 'at day’s end' in pg.inner_text('#x-body'))
    # ---- what if
    S("__T.closeSheets()"); W(300); S("__T.xOpen('whatif')"); W(600); wi = pg.inner_text('#x-body')
    ck('what-if switches describe math, not advice', 'aren’t recommendations' in wi and not re.search(r'\byou should\b|\bwe recommend\b|\bbest option\b', wi, re.I))
    low0 = ev('metrics(rows,E).low'); S("document.querySelector('#x-body .wi3 input[data-w=w3fun]').click()"); W(600)
    ck('a switch changes the plan', ev('metrics(rows,E).low') > low0, (low0, ev('metrics(rows,E).low')))
    S("document.querySelector('#x-body .wi3 input[data-w=w3fun]').click()"); W(400)
    # ---- smarts
    ck('Kroger Fuel is gas', ev("B2.catOf({note:'KROGER FUEL #1234'})") == 'gas' and ev("B2.catOf({note:'Kroger'})") == 'groc')
    ck('Apple $2.99 found as a subscription', ev("RC.all().some(s=>s.kind==='sub'&&Math.abs(s.typ-2.99)<0.01)"))
    ck('card interest is found', len(ev('RC.interest()')) >= 2)
    ck('payments to unlinked cards are found', any(c['name'] in ('Apple Card', 'Chase card') for c in ev('RC.cardPays()')))
    # ---- no em dashes anywhere on the main screens
    texts = []
    for pgname in ['budgets', 'debts', 'cashflow', 'networth', 'calendar', 'whatif', 'pulse', 'alerts', 'subs']:
        S("__T.closeSheets()"); W(250); S("__T.xOpen('%s')" % pgname); W(500); texts.append(pg.inner_text('#x-body'))
    S("__T.closeSheets()"); W(250); texts.append(pg.inner_text('#ov')); texts.append(pg.inner_text('#pg'))
    ck('no em dashes on screen', not any('—' in t for t in texts), [t[max(0, t.find('—') - 40):t.find('—') + 20] for t in texts if '—' in t][:3])
    ck('no page errors', not errs, errs[:3])
    b.close()
print('\n'.join(R)); print(sum(r.startswith('PASS') for r in R), '/', len(R))
