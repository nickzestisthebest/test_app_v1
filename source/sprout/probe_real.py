# dumps what each screen says for the realistic seed, plus the canonical numbers, to find mismatches
import os, csv, sys, json
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'; rows=list(csv.DictReader(open('../csvin/tx.csv')))
pages=sys.argv[1:] or ['networth','accounts','paylater','budgets','yourplan','safe','calendar']
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); pg=b.new_page(viewport={'width':390,'height':844}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL); pg.wait_for_timeout(2500); S=pg.evaluate; W=pg.wait_for_timeout
    S(open('seed_real.js').read(), rows); W(600); S("__T.closeSheets()"); W(300)
    print('CANON', S("(()=>{const n=__T.ev('LG.nw()');return JSON.stringify({nw:n,td:__T.ev('totalDebt()'),pl:__T.ev('PL.owed()'),debts:__T.ev('state.debts.map(d=>d.name+\":\"+d.bal+\"@\"+d.apr+\" min \"+d.min)'),pay:__T.ev('[state.pay,state.payFreq,state.firstPay]'),ev:__T.ev('[state.everyday,state.discReduced]')})})()"))
    S("document.querySelector('.tabbar [data-tab=home]').click()"); W(600); print('=== HOME\n'+pg.inner_text('#ov'))
    S("document.querySelector('.tabbar [data-tab=money]').click()"); W(600); print('=== FIN\n'+pg.inner_text('#pg'))
    for x in pages:
        S("__T.closeSheets()"); W(300); S("__T.xOpen('%s')"%x); W(600); print('=== '+x+'\n'+pg.inner_text('#x-body'))
    print('ERRS',errs[:3]); b.close()
