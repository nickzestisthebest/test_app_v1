import os,sys
from playwright.sync_api import sync_playwright
V=sys.argv[1];f={'v1':'v1_test.html','v2':'v2_test.html'}[V];R=[]
def chk(c,m): R.append(bool(c)); print(('ok  ' if c else 'FAIL'),m)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/'+f);pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo2]' if V=='v2' else '[data-wact=demo]');pg.wait_for_timeout(1500)
    if pg.query_selector('#stk-cel.on'): pg.click('#stk-cel [data-stk=celok]')
    for t in ['#t-hero','.port','#m-spend','#upc-mini','#m-per','#debt-rows','#guide']:
        sel='#ov [data-goto="%s"]'%t
        if not pg.query_selector(sel): print('skip',t);continue
        pg.evaluate("document.querySelector('%s').scrollIntoView({block:'center'})"%sel.replace("'","\\'"));pg.wait_for_timeout(200)
        pg.click(sel);pg.wait_for_timeout(700)
        vis=pg.evaluate("[...document.querySelectorAll('.wrap>*')].filter(e=>e.offsetParent!==null||getComputedStyle(e).display!=='none').filter(e=>getComputedStyle(e).display!=='none').map(e=>e.id||e.className).join(',')")
        title=pg.inner_text('#fbar h1') if pg.query_selector('#fbar h1') else ''
        chk(pg.evaluate("document.body.classList.contains('view-focus')") and '#ov' not in vis and 'ov' not in vis.split(','),'%s -> %s | visible: %s'%(t,title,vis))
        pg.screenshot(path='%s_f%s.png'%(V,t.replace('#','').replace('.','')),full_page=False)
        pg.click('#fbar .fback');pg.wait_for_timeout(500)
        chk(pg.evaluate("document.body.classList.contains('view-ov')"),'back to home')
    # see everything still works
    chk(pg.query_selector('#ov [data-goto=""]') is None,'full plan button removed')

    if V=='v2':
        pg.click('.tb[data-tab=money]');pg.wait_for_timeout(500);chk(pg.evaluate("document.body.classList.contains('view-tab')"),'money tab ok')
        pg.click('.tb[data-tab=home]');pg.wait_for_timeout(500);chk(pg.evaluate("document.body.classList.contains('view-ov')"),'home tab ok')
    chk(not errs,'errors '+str(errs[:2]))
    print('PASS',sum(R),'FAIL',len(R)-sum(R))
