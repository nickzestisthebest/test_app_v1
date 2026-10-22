import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for run in range(6):
        pg=b.new_page(viewport={'width':390,'height':844});errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
        pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3000)
        pg.click('[data-wact=connect]');pg.wait_for_timeout(700)
        for k in ['checking','cards']:
            pg.click('[data-lk=conn][data-v=%s]'%k);pg.wait_for_timeout(1200)
        pg.click('[data-lk=next]');pg.wait_for_timeout(300);pg.click('[data-lk=finish]');pg.wait_for_timeout(1500)
        pg.evaluate("state.link.mock.pending.forEach(p=>p.t=Date.now()-1e6)")
        pg.evaluate("lkSync()");pg.wait_for_timeout(1500)
        print(pg.evaluate("JSON.stringify([state.spend.filter(s=>s.pending).map(s=>[s.note,s.amt]),state.spend.filter(s=>s.d===state.link.mock.pending[0].d).length])"),errs)
        pg.close()
