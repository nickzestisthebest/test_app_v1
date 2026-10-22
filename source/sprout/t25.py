import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
    h0=pg.evaluate("document.querySelector('header.top').getBoundingClientRect().height")
    pg.evaluate("window.scrollTo(0,600)");pg.wait_for_timeout(600)
    h1=pg.evaluate("document.querySelector('header.top').getBoundingClientRect().height");print(h0,h1)
    pg.screenshot(path='hdr_stuck.png',clip={'x':0,'y':0,'width':390,'height':120})
    pg.evaluate("window.scrollTo(0,0)");pg.wait_for_timeout(600);pg.screenshot(path='hdr_top.png',clip={'x':0,'y':0,'width':390,'height':120})
