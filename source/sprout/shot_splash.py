import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html'); pg.wait_for_timeout(900); pg.screenshot(path='s4_splash.png')
    print(pg.evaluate("document.querySelector('.stag4')&&document.querySelector('.stag4').textContent"), 'ERRS',errs[:3]); b.close()
