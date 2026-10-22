import os,sys
from playwright.sync_api import sync_playwright
for f in ['v1_test.html','v2_test.html']:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/'+f);pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo]');pg.wait_for_timeout(1200)
    def log(a,cat='Everyday'):
        pg.click('#open-spend');pg.wait_for_timeout(500);pg.fill('#sp-amt',a);pg.click('#sp-form [data-cat=%s]'%cat);pg.wait_for_timeout(600)
        t=pg.inner_text('#toast')
        if pg.query_selector('.sheet.on button.lnk[data-close]'): pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
        return t
    print(f,'small:',log('50')[:60])
    print(f,'100000 exactly:',log('100000')[:60])
    t=log('250000');print(f,'big:',t)
    pg.screenshot(path=f+'_wtf.png')
    n=pg.evaluate("state.spend.length");pg.click('#toast button');pg.wait_for_timeout(400);print('undo removes',pg.evaluate("state.spend.length")==n-1)
    print(errs)
