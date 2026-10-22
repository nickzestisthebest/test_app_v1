import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for w,sch,n in [(390,'light','a'),(360,'dark','b'),(430,'light','c')]:
        pg=b.new_page(viewport={'width':w,'height':844},device_scale_factor=2,color_scheme=sch)
        pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}}")
        pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
        pg.click('[data-wact=demo2]');pg.wait_for_timeout(5500)
        pg.evaluate("document.querySelector('.ovhero').scrollIntoView({block:'center'})");pg.wait_for_timeout(1500)
        pg.locator('.ovhero').screenshot(path='../hero_'+n+'.png')
    b.close()
