import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3000)
    pg.evaluate("document.body.classList.remove('noai')")
    pg.click('[data-wact=demo]');pg.wait_for_timeout(900)
    pg.click('.tb[data-tab=money]');pg.wait_for_timeout(400)
    pg.click('#pg [data-x=open][data-v=subs]');pg.wait_for_timeout(600)
    pg.click('#x-body [data-x=open][data-v=cancel][data-w=adobe]');pg.wait_for_timeout(500)
    pg.click('#x-body [data-x=runcancel]')
    for i in range(6):
        pg.wait_for_timeout(800);print(i,pg.evaluate("document.querySelector('#x-body').textContent.slice(0,140)"))
    pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(500)
    pg.click('.tb[data-tab=money]');pg.wait_for_timeout(300)
    pg.click('#pg [data-x=open][data-v=nego]');pg.wait_for_timeout(600)
    pg.click('#x-body [data-x=runnego][data-v=net]')
    for i in range(7):
        pg.wait_for_timeout(800);print(i,pg.evaluate("document.querySelector('#x-t').textContent+' | '+document.querySelector('#x-body').textContent.slice(0,160)"))
    print(errs)
