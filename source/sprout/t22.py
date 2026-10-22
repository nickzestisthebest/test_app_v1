import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v1_test.html');pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo]');pg.wait_for_timeout(1200)
    print('home sw',pg.evaluate("document.documentElement.scrollWidth"))
    for t in ['#m-per','#t-hero','.port']:
        pg.evaluate("document.querySelector('#ov [data-goto=\"%s\"]').click()"%t);pg.wait_for_timeout(600)
        print(t,pg.evaluate("document.documentElement.scrollWidth"),pg.evaluate("[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>392&&e.offsetParent).slice(0,5).map(e=>e.tagName+'.'+e.className+'#'+e.id+' '+Math.round(e.getBoundingClientRect().right))"))
        pg.evaluate("document.querySelector('#fbar .fback').click()");pg.wait_for_timeout(400)
