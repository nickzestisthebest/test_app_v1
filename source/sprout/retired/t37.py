import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
    for path in ['settings','fin','home']:
        if path=='settings':
            pg.click('.tabbar [data-tab=money]');pg.wait_for_timeout(500);pg.click('[data-settings]');pg.wait_for_timeout(600);pg.click('#x-body [data-v=edit]')
        elif path=='fin':
            pg.click('.tabbar [data-tab=money]');pg.wait_for_timeout(500);pg.click('#pg .nwupd')
        else:
            pg.click('.tabbar [data-tab=home]');pg.wait_for_timeout(500);pg.evaluate("document.querySelector('#menu [data-nav=edit]').click()")
        pg.wait_for_timeout(1200)
        print(path,pg.evaluate("[document.body.className,window.scrollY,[...document.querySelectorAll('.focus-on')].map(e=>e.id||e.className).join('|'),document.getElementById('fbar').innerText.slice(0,40),(()=>{const e=document.getElementById('m-edit');if(!e)return 'no m-edit';const r=e.getBoundingClientRect();return [e.tagName,e.open,r.top,r.height,getComputedStyle(e).display]})()]"))
        pg.screenshot(path=f'ed_{path}.png')
        pg.evaluate("document.querySelectorAll('[data-home]')[0].click()");pg.wait_for_timeout(500)
    print(errs)
