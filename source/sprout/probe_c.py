import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(6000)
    pg.click('.tabbar [data-tab=community]');pg.wait_for_timeout(800)
    if pg.query_selector('#pg [data-x=welx]'):pg.click('#pg [data-x=welx]');pg.wait_for_timeout(400)
    pg.screenshot(path='../pc.png')
    print(pg.evaluate("[...document.querySelectorAll('#pg .post')][0].outerHTML.slice(0,2500)"))
    b.close()
