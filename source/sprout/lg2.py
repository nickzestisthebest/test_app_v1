import os,sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(600);pg.screenshot(path='../c_splash.png')
    pg.wait_for_timeout(2800);pg.click('[data-wact=demo2]');pg.wait_for_timeout(4500)
    pg.evaluate("const t=document.getElementById('toast');if(t)t.classList.remove('on','act')")
    pg.screenshot(path='../c_home.png')
    pg.click('#hd-streak');pg.wait_for_timeout(1300);pg.screenshot(path='../c_streak.png')
    print(errs)
    b.close()
