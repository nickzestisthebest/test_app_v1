import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
    pg.evaluate("document.querySelector('[data-tx7]').click()");pg.wait_for_timeout(600)
    pg.click('#tx-when [data-v=month]');pg.wait_for_timeout(400)
    pg.evaluate("document.querySelector('.catsum').scrollIntoView()");pg.evaluate("window.scrollBy(0,-60)");pg.wait_for_timeout(500)
    pg.screenshot(path='cat_emoji.png')
