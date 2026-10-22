import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for scheme in ['light','dark']:
        pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,color_scheme=scheme);errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
        pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
        pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
        if scheme=='dark':
            pg.evaluate("document.documentElement.setAttribute('data-theme','dark')")
        pg.click('.tb[data-tab=money]');pg.wait_for_timeout(500);pg.click('#pg [data-x=open][data-v=credit]');pg.wait_for_timeout(600)
        pg.evaluate("document.querySelector('#x-body .xcard').scrollIntoView()");pg.wait_for_timeout(300)
        pg.screenshot(path='cr_%s.png'%scheme)
        pg.click('#x-body [data-x=crr][data-v="6"]');pg.wait_for_timeout(400)
        print(scheme,'6m labels',pg.evaluate("document.querySelectorAll('#x-body svg[aria-label^=\"Credit score over\"] circle').length"),errs)
