import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for scheme in ['light','dark']:
        pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,color_scheme=scheme);errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
        pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
        pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
        pg.click('.tabbar [data-tab=money]');pg.wait_for_timeout(800)
        pg.screenshot(path=f'nw_card_{scheme}.png',clip={'x':0,'y':0,'width':390,'height':520})
        pg.click('.nwcard');pg.wait_for_timeout(1400)
        pg.screenshot(path=f'nw_page_{scheme}.png')
        if scheme=='light':
            box=pg.query_selector('[data-nwchart]').bounding_box()
            pg.mouse.move(box['x']+box['width']*.35,box['y']+box['height']/2);pg.wait_for_timeout(300)
            print('scrub:',pg.inner_text('#nw-sub'))
            pg.mouse.move(box['x']+box['width']*.95,box['y']+box['height']/2);pg.wait_for_timeout(300)
            print('proj:',pg.inner_text('#nw-sub'))
            pg.click('[data-nwr="24"]');pg.wait_for_timeout(800)
            print('2y:',pg.inner_text('#nw-sub'))
            pg.evaluate("document.querySelector('#sh-x .panel').scrollTo(0,640)");pg.wait_for_timeout(800)
            pg.screenshot(path='nw_page2.png')
            pg.evaluate("document.querySelector('#sh-x .panel').scrollTo(0,1400)");pg.wait_for_timeout(800)
            pg.screenshot(path='nw_page3.png')
        print(scheme,errs)
        pg.close()
