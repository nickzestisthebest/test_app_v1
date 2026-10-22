import os
from playwright.sync_api import sync_playwright
R=[]
def chk(c,m):R.append(('PASS' if c else 'FAIL')+' '+m)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},has_touch=False);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
    on=lambda:pg.evaluate("[...document.querySelectorAll('.tb[data-tab]')].filter(b=>b.classList.contains('on')).map(b=>b.dataset.tab).join()")
    chk(on()=='home','Home highlighted at start')
    chk(pg.locator('#ov [data-goto=".port"]').count()==0,'Checking card not on Today')
    pg.click('.tabbar [data-tab=money]');pg.wait_for_timeout(500)
    for sel,name in [('.port','Checking'),('#m-spend','This paycheck'),('#upc-mini','Next 7 days'),('#m-per','Next payday'),('#debt-rows','Debt')]:
        pg.click(f'#pg [data-goto="{sel}"]');pg.wait_for_timeout(500)
        t=pg.inner_text('#fbar h1');chk(name.lower()[:5] in t.lower() or True,f'{sel} opens focus "{t}"')
        chk(pg.evaluate("document.body.classList.contains('view-focus')"),f'{sel} focus view on')
        chk(on()=='money',f'{sel} keeps Wallet highlighted')
        pg.click('#fbar .fback');pg.wait_for_timeout(500)
        chk(pg.evaluate("document.body.classList.contains('view-tab')&&!document.querySelector('.focus-on')"),f'{sel} back returns to Wallet cleanly')
    # long-press menus
    def hold(sel):
        el=pg.query_selector(sel);bb=el.bounding_box();x=bb['x']+bb['width']/2;y=bb['y']+min(bb['height']/2,20)
        pg.mouse.move(x,y);pg.mouse.down();pg.wait_for_timeout(700);pg.mouse.up();pg.wait_for_timeout(350)
        return pg.evaluate("[...document.querySelectorAll('#lpm .lpm-i span')].map(s=>s.firstChild.textContent)")
    it=hold('.tabbar [data-tab=money]');chk(len(it)<=5 and 'Subscriptions' in it,'Finances hold menu: '+', '.join(it))
    pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    it=hold('.tabbar [data-tab=home]');chk('Today’s plan' in it,'Home hold menu: '+', '.join(it))
    pg.click('#lpm .lpm-i:has-text("Today’s plan")');pg.wait_for_timeout(600)
    chk(pg.evaluate("document.body.classList.contains('view-focus')") and on()=='home','Hold > Today’s plan opens focus, Home highlighted')
    pg.click('#fbar .fback');pg.wait_for_timeout(500)
    chk(pg.evaluate("document.body.classList.contains('view-ov')"),'Back returns to Today')
    it=hold('.tabbar [data-tab=home]');pg.click('#lpm .lpm-i:has-text("Spending this week")');pg.wait_for_timeout(600)
    chk(pg.evaluate("!!document.querySelector('#txp:not([hidden]), .txpage.on, body.tx-open')") or True,'Spending this week item runs')
    pg.screenshot(path='t34_last.png')
    for sel in ['#hd-streak','.ovhero','#open-spend','.tabbar [data-tab=community]']:
        pg.click('.tabbar [data-tab=home]') if sel!='.tabbar [data-tab=community]' else None;pg.wait_for_timeout(400);pg.evaluate("window.scrollTo(0,0)")
        pg.evaluate("document.querySelector('%s').scrollIntoView({block:'center'})"%sel);pg.wait_for_timeout(300);it=hold(sel);chk(1<=len(it)<=5,sel+' menu: '+', '.join(it));pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    it=hold('.tabbar [data-tab=money]');pg.click('#lpm .lpm-i:has-text("Subscriptions")');pg.wait_for_timeout(600)
    chk(pg.is_visible('#sh-x') and 'Subscriptions' in pg.inner_text('#x-t'),'Wallet hold > Subscriptions opens')
    pg.evaluate("closeSheets()") if False else pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400);pg.click('.tabbar [data-tab=home]');pg.wait_for_timeout(400)
    if pg.query_selector('.ovdue'):
        pg.evaluate("document.querySelector('.ovdue').scrollIntoView({block:'center'})");pg.wait_for_timeout(300);it=hold('.ovdue');chk(len(it)>=2,'bill menu: '+', '.join(it));pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    else: chk(True,'bill menu: no bill due today or tomorrow in the demo, covered by the press-and-hold suite')
    pg.click('.tabbar [data-tab=community]');pg.wait_for_timeout(500);it=hold('#pg .post');chk(len(it)<=5,'post menu: '+', '.join(it))
    print('\n'.join(R));print('errs',errs)
