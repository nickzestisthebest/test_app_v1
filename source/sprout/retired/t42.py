import os
from playwright.sync_api import sync_playwright
R=[]
def chk(c,m):R.append(('PASS ' if c else 'FAIL ')+m)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for vp in [{'width':390,'height':844},{'width':360,'height':780}]:
        pg=b.new_page(viewport=vp,device_scale_factor=2);errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};try{localStorage.setItem('sprout-lp-hint','1')}catch(e){}")
        pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400);pg.click('[data-wact=demo2]');pg.wait_for_timeout(5500)
        w=vp['width']
        pg.evaluate("document.getElementById('toast').classList.remove('on','act')")
        pg.screenshot(path=f'hd_{w}.png',clip={'x':0,'y':0,'width':w,'height':200})
        chk(pg.evaluate("document.documentElement.scrollWidth")<=w,f'{w}px: header fits, no sideways scroll')
        chk(pg.is_visible('#hd-bell') and pg.inner_text('#hd-bell-c')=='5',f'{w}px: bell shows 5 alerts')
        chk(pg.evaluate("document.getElementById('tb-bdg').hidden"),f'{w}px: Finances tab no longer carries the alert badge')
        pg.click('#hd-bell');pg.wait_for_timeout(700);chk('Alerts' in pg.inner_text('#x-t'),f'{w}px: bell opens Alerts');pg.screenshot(path=f'hd_alerts_{w}.png');pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(500)
        pg.click('header [data-v=insights]');pg.wait_for_timeout(900);vis=pg.evaluate("[...document.querySelectorAll('.sheet')].filter(s=>!s.hidden).map(s=>s.id).join()");chk(bool(vis),f'{w}px: insights button opens Spending insights ({vis})');pg.screenshot(path=f'hd_ins_{w}.png')
        pg.evaluate("document.querySelectorAll('.sheet.on [data-close]').forEach(b=>b.tagName==='BUTTON'&&b.click())");pg.wait_for_timeout(500)
        pg.click('.tabbar [data-tab=money]');pg.wait_for_timeout(600);t=pg.inner_text('#pg')
        chk('alerts' not in t.lower() and 'Spending insights' not in t,f'{w}px: Finances has no alerts pill or alert/insight tiles')
        pg.evaluate("window.scrollTo(0,400)");pg.wait_for_timeout(600);pg.screenshot(path=f'hd_scrolled_{w}.png',clip={'x':0,'y':0,'width':w,'height':160})
        chk(pg.is_visible('#hd-bell'),f'{w}px: bell stays in the shrunken top bar')
        chk(not errs,f'{w}px: no errors {errs[:2]}')
        pg.close()
    print('\n'.join(R))
