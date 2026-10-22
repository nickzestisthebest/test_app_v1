import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
    pg.click('.tb[data-tab=money]');pg.wait_for_timeout(500);pg.click('#pg [data-x=open][data-v=credit]');pg.wait_for_timeout(500)
    pg.evaluate("document.querySelector('.crc').scrollIntoView()");pg.wait_for_timeout(1800)
    pg.screenshot(path='cr2_a.png')
    bb=pg.query_selector('[data-crchart]').bounding_box();pg.mouse.move(bb['x']+bb['width']*0.35,bb['y']+60);pg.wait_for_timeout(300)
    print('scrub',pg.inner_text('.crhd'))
    pg.screenshot(path='cr2_b.png')
    pg.click('#x-body [data-x=crr][data-v="24"]');pg.wait_for_timeout(1600);pg.evaluate("document.querySelector('.crc').scrollIntoView()");pg.wait_for_timeout(200);pg.screenshot(path='cr2_c.png',full_page=False)
    pg.click('.crevrow');pg.wait_for_timeout(300);print('event',pg.inner_text('.crhd'))
    print(errs)
