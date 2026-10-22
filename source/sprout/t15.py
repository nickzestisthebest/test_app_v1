import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
    pg.tap('[data-wact=demo]');pg.wait_for_timeout(1200)
    cdp=ctx.new_cdp_session(pg)
    bb=pg.query_selector('#open-spend').bounding_box();x=bb['x']+bb['width']/2;y=bb['y']+bb['height']/2
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]});pg.wait_for_timeout(900)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});pg.wait_for_timeout(500)
    print('menu',pg.evaluate("document.getElementById('lpm')&&document.getElementById('lpm').classList.contains('on')"),'sheet',pg.evaluate("document.getElementById('sh-spend').classList.contains('on')"))
    pg.screenshot(path='touch_lp.png')
    pg.mouse.click(8,8) if False else pg.tap('#lpm .lpm-bg',position={'x':10,'y':10});pg.wait_for_timeout(400)
    pg.tap('#open-spend');pg.wait_for_timeout(600);print('tap opens sheet',pg.evaluate("document.getElementById('sh-spend').classList.contains('on')"))
    print(errs)
