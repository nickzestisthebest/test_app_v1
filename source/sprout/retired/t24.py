import os,sys
from playwright.sync_api import sync_playwright
V=sys.argv[1];f={'v1':'v1_test.html','v2':'v2_test.html'}[V]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/'+f);pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo2]' if V=='v2' else '[data-wact=demo]');pg.wait_for_timeout(1500)
    if V=='v1':
        for a,n in [('14.2','Chipotle'),('58','Kroger'),('44','Shell gas'),('12','Netflix')]:
            pg.click('#open-spend');pg.wait_for_timeout(400);pg.fill('#sp-amt',a);pg.fill('#sp-note',n);pg.click('#sp-form [data-cat=%s]'%('Personal' if n in('Chipotle','Netflix') else 'Everyday'));pg.wait_for_timeout(500)
            if pg.query_selector('.sheet.on button.lnk[data-close]'): pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('[data-tx7]').scrollIntoView({block:'center'})");pg.click('[data-tx7]');pg.wait_for_timeout(800)
    print('cat view',pg.evaluate("!!document.querySelector('.catsum')"),'title',pg.inner_text('#fbar h1'))
    pg.screenshot(path=V+'_cat.png')
    pg.click('.catb');pg.wait_for_timeout(400);print('expanded',pg.evaluate("document.querySelectorAll('.catlist .txrow').length"))
    pg.screenshot(path=V+'_cat2.png')
    pg.click('.tx-when-dummy') if False else None
    pg.click('#tx-when [data-v=thism]');pg.wait_for_timeout(400);print('still cat after filter',pg.evaluate("!!document.querySelector('.catsum')"))
    pg.click('[data-txview=list]');pg.wait_for_timeout(400);print('list view',pg.evaluate("!document.querySelector('.catsum')&&document.querySelectorAll('#tx-list .txrow').length>0"))
    pg.click('[data-txview=cat]');pg.wait_for_timeout(400);pg.click('.catb');pg.wait_for_timeout(300);pg.click('.catlist .txrow');pg.wait_for_timeout(500)
    print('tap item -> edit in list',pg.evaluate("!!document.querySelector('.txed')"))
    print(errs)
