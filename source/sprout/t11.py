import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo]');pg.wait_for_timeout(900)
    pg.click('header [data-settings]');pg.wait_for_timeout(800)
    print(pg.evaluate("document.getElementById('sh-x').hidden"), pg.evaluate("document.getElementById('x-body').innerHTML.slice(0,200)"))
    print(errs)
