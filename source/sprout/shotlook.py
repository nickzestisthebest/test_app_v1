import os
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for th in ['light','dark']:
        pg=b.new_page(viewport={'width':390,'height':844},color_scheme=th)
        pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};try{localStorage.setItem('sprout-lp-hint','1')}catch(e){}")
        pg.goto(URL);pg.wait_for_timeout(3000);pg.click('[data-wact=demo2]');pg.wait_for_timeout(6000)
        pg.evaluate("window.__T.closeSheets()");pg.wait_for_timeout(500);pg.screenshot(path='look_'+th+'.png')
        pg.evaluate("window.__T.xOpen('budgets')");pg.wait_for_timeout(700);pg.screenshot(path='look_bud_'+th+'.png')
    b.close()
