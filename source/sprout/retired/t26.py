import os,sys
from playwright.sync_api import sync_playwright
for f in ['v1_test.html','v2_test.html']:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/'+f);pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo]');pg.wait_for_timeout(1200)
    pg.click('#open-menu');pg.wait_for_timeout(500);pg.click('#menu [data-nav=tx]');pg.wait_for_timeout(700)
    print(f,'tabs',pg.evaluate("[...document.querySelectorAll('#tx-seg button')].map(b=>b.textContent+(b.classList.contains('on')?'*':''))"))
    pg.click('[data-txview=list]');pg.wait_for_timeout(300);print('history on',pg.evaluate("document.querySelector('[data-txview=list]').classList.contains('on')"))
    pg.evaluate("window.scrollTo(0,0)");pg.screenshot(path=f+'_seg.png',clip={'x':0,'y':0,'width':390,'height':300})
    print(errs)
