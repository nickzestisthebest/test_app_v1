import os,sys
from playwright.sync_api import sync_playwright
V=sys.argv[1];f={'v1':'v1_test.html','v2':'v2_test.html'}[V]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/'+f);pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo]');pg.wait_for_timeout(1200)
    print('scrollW',pg.evaluate("document.documentElement.scrollWidth"))
    for t in ['#m-spend','#m-per']:
        pg.evaluate("document.querySelector('#ov [data-goto=\"%s\"]').click()"%t);pg.wait_for_timeout(700)
        pg.screenshot(path='%s_x%s.png'%(V,t[3:]),full_page=True)
        print(t,'fx len',len(pg.inner_text('#fx')))
        pg.click('[data-fxmore]');pg.wait_for_timeout(400);print('more shows modules',pg.evaluate("[...document.querySelectorAll('.mods .focus-on')].map(e=>e.id)"))
        pg.click('#fbar .fback');pg.wait_for_timeout(400)
    pg.click('#open-menu');pg.wait_for_timeout(500);pg.click('#menu [data-nav=tx]');pg.wait_for_timeout(800)
    print('tx focus',pg.evaluate("document.body.classList.contains('view-focus')"),pg.inner_text('#fbar h1'))
    pg.screenshot(path=V+'_txpage.png')
    pg.click('#tx-add');pg.wait_for_timeout(500);pg.fill('#sp-amt','7');pg.fill('#sp-note','Bagel');pg.click('#sp-form [data-cat=Everyday]');pg.wait_for_timeout(700)
    if pg.query_selector('.sheet.on button.lnk[data-close]'): pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    print('added shows','Bagel' in pg.inner_text('#tx-list'))
    pg.screenshot(path=V+'_txpage2.png')
    pg.click('#fbar .fback');pg.wait_for_timeout(500);print('home',pg.evaluate("document.body.classList.contains('view-ov')"),'txOpen hidden',pg.evaluate("getComputedStyle(document.getElementById('txv')).display"))
    print(errs)
