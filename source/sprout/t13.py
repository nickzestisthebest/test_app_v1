import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v1_test.html');pg.wait_for_timeout(3200)
    def c(sel,w=600): pg.click(sel);pg.wait_for_timeout(w)
    def close():
        if pg.query_selector('.sheet.on button.lnk[data-close]'): c('.sheet.on button.lnk[data-close]',500)
    c('[data-wact=demo]',1200)
    for n in ['tx','checkin','import','insights','backup','redo','edit','how']:
        c('#open-menu',500);c('#menu [data-nav=%s]'%n,900)
        if n=='tx':
            pg.keyboard.press('Escape');pg.wait_for_timeout(300)
            if pg.query_selector('[data-txclose]'):
                try: pg.click('[data-txclose]',timeout=1500)
                except: pass
        close()
        if pg.query_selector('#sh-wiz.on'): pg.evaluate("document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')")
        if pg.query_selector('.backov'):
            try: pg.click('.backov',timeout=800)
            except: pass
        pg.wait_for_timeout(300)
    c('.stick [data-stkopen]',700);close()
    c('#hd-streak',700);close()
    c('#open-spend',500);pg.fill('#sp-amt','5');pg.keyboard.press('Enter');pg.wait_for_timeout(700);close()
    print('streak',pg.evaluate("state.stk.days"),'errs',errs)
