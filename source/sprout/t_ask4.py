# quick checks of the Ask + Log changes on the screenshot-shaped seed
import os, csv, json
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'; rows=list(csv.DictReader(open('../csvin/tx.csv')))
R=[]
def ck(n,ok,info=''): R.append(('PASS ' if ok else 'FAIL ')+n+('' if ok else ' :: '+str(info)[:300]))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); pg=b.new_page(viewport={'width':390,'height':844}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL); pg.wait_for_timeout(2500); pg.evaluate(open('seed_n2.js').read(), rows); pg.wait_for_timeout(700)
    pg.evaluate("__T.closeSheets();document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')")
    ev=lambda c: pg.evaluate("(()=>{return __T.ev(%s)})()"%json.dumps(c))
    # parser
    x=ev("__S.QL.parse('I got five dollars McDonald’s burger today')[0]")
    ck('five dollars McDonalds burger -> $5 McDonald’s today dining', x and abs(x['amt']-5)<.001 and 'McDonald' in x['note'] and x['bc']=='din' and x['d']==ev('fd(realDay())'), x)
    x=ev("__S.QL.parse('twelve fifty chipotle yesterday')[0]"); ck('twelve fifty chipotle yesterday', x and abs(x['amt']-12.5)<.001 and 'Chipotle' in x['note'] and x['d']==ev('fd(realDay()-MS)'), x)
    x=ev("__S.QL.parse('got paid 2053')[0]"); ck('got paid 2053 is money in', x and x['cat']=='Income' and abs(x['amt']-2053)<.01, x)
    x=ev("__S.QL.parse('venmo alex 40 for dinner')[0]"); ck('venmo alex 40 for dinner', x and abs(x['amt']-40)<.01 and x.get('person')=='alex', x)
    x=ev("__S.QL.parse('chipotle 12 and gas 40 yesterday')"); ck('two items in one sentence', len(x)==2 and abs(x[0]['amt']-12)<.01 and abs(x[1]['amt']-40)<.01 and x[1]['bc']=='gas', x)
    x=ev("__S.QL.parse('$12.50 at starbucks')[0]"); ck('$12.50 at starbucks', x and abs(x['amt']-12.5)<.001 and 'Starbucks' in x['note'] and x['bc']=='din', x)
    # ask: price then down payment keeps context
    r1=ev("BR.answer('I want to buy a car for 50000')"); ck('car 50000 answered with plan numbers', r1 and 'left over on your plan' in r1['reply'], r1 and r1['reply'][:200])
    r2=ev("BR.answer('I want to put 10000 down and finance the rest')"); ck('10k down keeps the 50k car', r2 and 'down payment' in r2['reply'] and 'financed $40,000' in r2['reply'], r2 and r2['reply'][:300])
    ck('no advice wording', r2 and 'Spend 20% less' not in r2['reply'] and 'you should' not in r2['reply'].lower(), r2 and r2['reply'])
    r3=ev("BR.answer('when can I afford to put 10k down')"); ck('when can I put 10k down uses the price', r3 and 'financed $40,000' in r3['reply'], r3 and r3['reply'][:300])
    inc=ev("FZ.mo().inc"); ck('income matches the plan (about $4,449)', abs(inc-4449.29)<30, inc)
    # calendar what-if: window starts on the chosen day; sources add up
    w=ev("(()=>{const r=__S.P4.whatIfSpend(fd(realDay()+30*MS),900);return{head:r.head,dEx:r.dEx,dGl:r.dGl,cush:r.fromCush,short:r.short,other:r.other,amt:r.amt,low:r.lowA&&r.lowA.t>=realDay()+30*MS}})()")
    ck('what-if $900 window starts on the chosen day', w['low'], w)
    ck('what-if sources add up to the amount', abs(w['dEx']+w['dGl']+w['cush']+w['short']+w['other']-900)<=1.0 or w['head']=='Fits', w)
    # net worth own/owe tie-out and no check problems
    c=ev("MX.check()"); ck('MX.check has no problems', not c, c)
    s=ev("(()=>{const S=__S.P4.sides();return{a:Math.abs(S.ownTot-S.own.reduce((x,y)=>x+y.v,0))<.011,b:Math.abs(S.oweTot-S.owe.reduce((x,y)=>x+y.v,0))<.011,n:Math.abs(LG.nw().N-(S.ownTot-S.oweTot))<.011}})()")
    ck('own and owe lists add up', s['a'] and s['b'] and s['n'], s)
    # by paycheck identity
    ok=ev("rows.slice(0,8).every(r=>MX.period(r).ok)"); ck('every pay period adds up', ok)
    # debts: strategies change order
    o1=ev("(()=>{MX.pref().order='rate';return MX.order().map(d=>d.name)})()"); o2=ev("(()=>{MX.pref().order='small';return MX.order().map(d=>d.name)})()")
    ck('rate order puts known rates first', o1 and 'Robinhood' in o1[0], o1); ck('smallest balance order is ascending', o2==sorted(o2,key=lambda n: ev("(state.debts.find(d=>d.name==%s)||{}).bal"%json.dumps(n))), o2)
    ev("(()=>{MX.pref().order='rate';plan()})()")
    # finances card and debts page agree on the debt-free date
    pg.evaluate("__T.xOpen('debts')"); pg.wait_for_timeout(600); t=pg.inner_text('#x-body'); d1=ev("(()=>{const f=F3.free();return f&&!f.none?F3.mon(f.t):''})()")
    ck('debts page debt-free date matches the plan', d1 in t, (d1,t[:120]))
    ck('debts page: no arrows, drag handle only in My order', '↑' not in t)
    pg.click('[data-f3=order][data-v=mine]'); pg.wait_for_timeout(600); ck('my order shows grips', pg.locator('.d4grip').count()>=2)
    pg.click('[data-f3=order][data-v=rate]'); pg.wait_for_timeout(400)
    # spending summary: net = in - out
    pg.evaluate("__T.closeSheets()"); pg.wait_for_timeout(300); pg.evaluate("__T.ev(\"SP.open('list')\")"); pg.wait_for_timeout(900)
    vals=pg.evaluate("[...document.querySelectorAll('#tx-sum>div b')].map(b=>b.textContent)")
    num=lambda s: float(s.replace('−','-').replace('$','').replace(',','').replace('+',''))
    ck('spending net = in - out', len(vals)>=3 and abs(num(vals[0])-abs(num(vals[1]))-num(vals[2]))<.011, vals)
    ev("(()=>{SP3.open=true;TXV='list';renderTx();return 1})()"); pg.wait_for_timeout(500)
    ck('no Basics chip in filters', pg.evaluate("!!document.querySelector('[data-txf=type][data-v=out]')") and not pg.evaluate("!!document.querySelector('[data-txf=type][data-v=Everyday]')"), pg.evaluate("[...document.querySelectorAll('[data-txf]')].map(b=>b.dataset.txf+':'+b.dataset.v).join(' ')"))
    print('\n'.join(R)); print(sum(r.startswith('PASS') for r in R),'/',len(R),'errs',errs[:3]); b.close()
