# subscriptions, bills and paychecks from the person's own CSV
import os, csv, json
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'
rows=list(csv.DictReader(open('../csvin/tx.csv')))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL);pg.wait_for_timeout(2500)
    pg.evaluate(open('t59_seed.js').read(),rows)
    out=pg.evaluate("""(()=>{const R=window.__S.RC;const A=R.all();return {subs:A.filter(s=>s.kind==='sub').map(s=>[s.name,s.price,s.cad,s.n,s.conf,new Date(s.next).toISOString().slice(0,10)]),bills:A.filter(s=>s.kind==='bill').map(s=>[s.name,s.typ,s.cad,s.n,s.conf,s.day,R.inPlan(s)]),plans:A.filter(s=>s.kind==='plan').map(s=>[s.name,s.price,s.cad,s.n]),pays:R.pays().map(p=>[p.name,p.amt,p.freq,new Date(p.next).toISOString().slice(0,10),p.n,p.conf])}})()""")
    for k,v in out.items():
        print('==',k)
        for x in v: print('  ',x)
    print('errors',errs[:2]);b.close()
