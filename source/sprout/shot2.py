import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1,has_touch=True,is_mobile=True)
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(5000)
    cdp=pg.context.new_cdp_session(pg)
    bb=pg.query_selector('#open-spend').bounding_box();x=bb['x']+bb['width']/2;y=bb['y']+20
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
    pg.wait_for_timeout(250);pg.screenshot(path='hold1.png')
    pg.wait_for_timeout(500);pg.screenshot(path='hold2.png')
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    pg.wait_for_timeout(400);pg.screenshot(path='hold3.png')
    b.close()
