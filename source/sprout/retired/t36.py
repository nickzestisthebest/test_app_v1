import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
    pg.screenshot(path='nm_home.png',clip={'x':0,'y':0,'width':390,'height':200})
    pg.click('.tabbar [data-tab=money]');pg.wait_for_timeout(700)
    pg.evaluate("document.querySelector('.nwupd').scrollIntoView({block:'center'})");pg.wait_for_timeout(300);pg.screenshot(path='nm_fin.png')
    pg.click('[data-settings]');pg.wait_for_timeout(700);pg.screenshot(path='nm_set.png')
    pg.click('#x-body [data-v=edit]');pg.wait_for_timeout(1000);pg.screenshot(path='nm_edit.png')
    print(errs)
