import os,sys
from playwright.sync_api import sync_playwright
tag=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};window.__noSeed=1")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(500);pg.screenshot(path='../lg_%s_splash.png'%tag)
    pg.wait_for_timeout(3500);pg.screenshot(path='../lg_%s_welcome.png'%tag)
    pg2=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg2.add_init_script("window.claude={use:async()=>{throw new Error('x')}}")
    pg2.goto('file://'+os.getcwd()+'/v2_test.html');pg2.wait_for_timeout(3400);pg2.click('[data-wact=demo2]');pg2.wait_for_timeout(4000)
    pg2.locator('header.top').screenshot(path='../lg_%s_header.png'%tag)
    print(pg2.evaluate("[...document.querySelectorAll('.logo,.aulogo svg')].map(e=>e.className.baseVal!==undefined?'svg':e.className+':'+getComputedStyle(e).backgroundImage.slice(0,60)+' '+getComputedStyle(e).backgroundColor)"))
    b.close()
