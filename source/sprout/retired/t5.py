import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3500)
    pg.screenshot(path='v2_a.png')
    pg.click('[data-wact=connect]');pg.wait_for_timeout(800)
    for k in ['checking','cards','loans','later']:
        pg.click('[data-lk=conn][data-v=%s]'%k);pg.wait_for_timeout(1300)
    pg.screenshot(path='v2_b.png')
    pg.click('[data-lk=next]');pg.wait_for_timeout(500)
    pg.screenshot(path='v2_c.png')
    print(pg.evaluate("JSON.stringify(LK&&0)") if False else '')
    pg.click('[data-lk=finish]');pg.wait_for_timeout(2500)
    pg.screenshot(path='v2_d.png')
    print(pg.evaluate("JSON.stringify({pay:state.pay,freq:state.payFreq,bills:state.bills.map(b=>b.name+':'+b.amt),debts:state.debts.map(d=>d.name+':'+d.bal),cash:state.cash,ev:state.everyday,hist:HIST.length,spend:state.spend.length,pend:state.spend.filter(s=>s.pending).length})"))
    pg.evaluate("state.link.at=Date.now()-3.6e6;state.link.mock.pending.forEach(p=>p.t=Date.now()-1e6)")
    pg.evaluate("lkSync()");pg.wait_for_timeout(1500)
    print(pg.evaluate("JSON.stringify(state.spend.filter(s=>s.d>=state.link.mock.pending[0].d).map(s=>[s.note,s.amt,!!s.pending,s.cat]))"))
    print(pg.evaluate("JSON.stringify({pend:state.spend.filter(s=>s.pending).length,n:state.spend.length})"))
    pg.evaluate("window.scrollTo(0,0)");pg.screenshot(path='v2_e.png')
    print(errs)
