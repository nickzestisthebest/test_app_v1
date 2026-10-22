import os,sys
from playwright.sync_api import sync_playwright
V=sys.argv[1];f={'v1':'v1_test.html','v2':'v2_test.html'}[V]
R=[]
def chk(c,m): R.append((bool(c),m)); print(('ok  ' if c else 'FAIL'),m)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},has_touch=False);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/'+f);pg.wait_for_timeout(3200)
    def c(sel,w=500): pg.click(sel);pg.wait_for_timeout(w)
    def hold(sel,ms=700):
        el=pg.query_selector(sel);bb=el.bounding_box();x=bb['x']+bb['width']/2;y=bb['y']+min(bb['height']/2,20)
        pg.mouse.move(x,y);pg.mouse.down();pg.wait_for_timeout(ms);pg.mouse.up();pg.wait_for_timeout(350)
    menu=lambda: pg.evaluate("document.getElementById('lpm')&&document.getElementById('lpm').classList.contains('on')")
    mtxt=lambda: pg.evaluate("document.querySelector('#lpm .lpm-card').innerText")
    c('[data-wact=demo]',1200)
    # log some purchases for "usual"
    for amt,note in [('5.75','Coffee'),('5.75','Coffee'),('14.20','Chipotle')]:
        c('#open-spend',500);pg.fill('#sp-amt',amt);pg.fill('#sp-note',note);c('#sp-form [data-cat=Everyday]',600)
        if pg.query_selector('.sheet.on button.lnk[data-close]'): c('.sheet.on button.lnk[data-close]',400)
    n0=pg.evaluate("state.spend.length")
    hold('#open-spend');chk(menu(),'log menu opens');chk('Coffee' in mtxt(),'usual purchases listed');
    pg.screenshot(path=V+'_lp_log.png')
    chk(not pg.evaluate("document.getElementById('sh-spend').classList.contains('on')"),'sheet NOT opened by hold')
    c('#lpm [data-lpi="0"]',600);chk(pg.evaluate("state.spend.length")==n0+1,'quick add logged')
    # short tap still works
    c('#open-spend',500);chk(pg.evaluate("document.getElementById('sh-spend').classList.contains('on')"),'tap still opens sheet');c('.sheet.on button.lnk[data-close]',400)
    # escape closes
    hold('#open-spend');pg.keyboard.press('Escape');pg.wait_for_timeout(200);chk(not menu(),'escape closes')
    hold('#open-spend');(pg.mouse.click(8,8),pg.wait_for_timeout(300));chk(not menu(),'backdrop closes')
    # hero peek
    pg.evaluate("window.scrollTo(0,0)")
    if pg.query_selector('.ovhero'):
        pg.evaluate("document.querySelector('.ovhero').scrollIntoView({block:'center'})");pg.wait_for_timeout(300)
        hold('.ovhero');chk(menu() and 'Basics left' in mtxt(),'hero peek');pg.screenshot(path=V+'_lp_hero.png');c('#lpm [data-lpi="0"]',500);chk(pg.evaluate("document.getElementById('sh-spend').classList.contains('on')"),'peek action log');c('.sheet.on button.lnk[data-close]',400)
        chk(pg.evaluate("!document.body.classList.contains('view-detail')"),'hero tap suppressed after hold')
    # streak chip
    pg.evaluate("window.scrollTo(0,0)");hold('#hd-streak');chk(menu() and 'streak' in mtxt(),'streak menu');c('#lpm [data-lpi="0"]',700)
    chk(pg.evaluate("document.getElementById('sh-check').classList.contains('on')"),'quick check-in opens');c('#sh-check button.lnk[data-close]',400) if pg.query_selector('#sh-check button.lnk[data-close]') else pg.keyboard.press('Escape')
    pg.wait_for_timeout(400)
    if pg.query_selector('.sheet.on'): pg.evaluate("document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')")
    # bills
    pg.evaluate("window.scrollTo(0,0)")
    sel='.ovdue' if pg.query_selector('.ovdue') else None
    if not sel:
        c('.tabbar [data-tab=money]',600);pg.evaluate("document.querySelector('#pg [data-goto=\"#upc-mini\"]').click()");pg.wait_for_timeout(900);sel=[s for s in ['#upc-mini .rw','#upc .li'] if any(e.is_visible() and e.query_selector('[data-pay]') for e in pg.query_selector_all(s))][0]
    pg.evaluate("document.querySelector(%r).scrollIntoView({block:'center'})"%sel);pg.wait_for_timeout(300)
    paid0=pg.evaluate("Object.keys(state.paid||{}).length")
    hold(sel);chk(menu() and 'Mark paid' in mtxt(),'bill menu');pg.screenshot(path=V+'_lp_bill.png');c('#lpm [data-lpi="0"]',800);chk(pg.evaluate("Object.keys(state.paid||{}).length")==paid0+1,'bill marked paid')
    # tx list
    c('.tb[data-tab=money]',500);c('#pg [data-x=nav][data-v=tx]',1000)
    if pg.query_selector('[data-txview=list]'): c('[data-txview=list]',600)
    hold('#tx-list .txrow');chk(menu() and 'Delete' in mtxt(),'tx menu');pg.screenshot(path=V+'_lp_tx.png')
    items=pg.evaluate("[...document.querySelectorAll('#lpm .lpm-i')].map(b=>b.innerText)")
    n1=pg.evaluate("state.spend.length");di=[i for i,t in enumerate(items) if 'Delete' in t][0]
    c('#lpm [data-lpi="%d"]'%di,500);chk(pg.evaluate("state.spend.length")==n1-1,'tx delete');pg.click('#toast button');pg.wait_for_timeout(400);chk(pg.evaluate("state.spend.length")==n1,'tx undo')
    hold('#tx-list .txrow');items=pg.evaluate("[...document.querySelectorAll('#lpm .lpm-i')].map(b=>b.innerText)");mi=[i for i,t in enumerate(items) if 'Move to Fun' in t]
    if mi: c('#lpm [data-lpi="%d"]'%mi[0],500);chk('Fun' in pg.inner_text('#tx-list'),'tx move')
    else: (pg.mouse.click(8,8),pg.wait_for_timeout(300))
    hold('#tx-list .txrow');items=pg.evaluate("[...document.querySelectorAll('#lpm .lpm-i')].map(b=>b.innerText)");ei=[i for i,t in enumerate(items) if 'Edit' in t][0];c('#lpm [data-lpi="%d"]'%ei,500);chk(pg.query_selector('.txed') is not None,'tx edit opens')
    # right-click opens too
    pg.click('#tx-list .txrow',button='right');pg.wait_for_timeout(400);chk(menu(),'right-click opens');(pg.mouse.click(8,8),pg.wait_for_timeout(300))
    pg.keyboard.press('Escape');pg.wait_for_timeout(400)
    if V=='v2':
        if pg.query_selector('#txv.on'): pg.evaluate("document.querySelector('[data-txclose]')&&document.querySelector('[data-txclose]').click()");pg.wait_for_timeout(400)
        hold('.tb[data-tab=money]');chk(menu() and 'Subscriptions' in mtxt(),'money tab jump list');pg.screenshot(path='v2_lp_tab.png');c('#lpm .lpm-i:has-text("Budgets")',800);chk('Budgets' in pg.inner_text('#x-t'),'jump to budgets')
        before=pg.evaluate("state.x2&&state.x2.bud&&state.x2.bud.groc||400")
        hold('#x-body [data-x=bud][data-v=groc][data-w="25"]',1500);after=pg.evaluate("state.x2.bud.groc");chk(after>=before+100,'hold to repeat (%s->%s)'%(before,after))
        c('.sheet.on button.lnk[data-close]',400)
        hold('.tb[data-tab=community]');chk(menu() and 'Share my progress' in mtxt(),'community jump');c('#lpm [data-lpi="0"]',800);chk('Share' in pg.inner_text('#x-t'),'compose opened');c('.sheet.on button.lnk[data-close]',400)
        c('.tb[data-tab=community]',500);c('#pg [data-x=seg][data-v=feed]',400)
        hold('#pg .post');chk(menu() and 'Comment' in mtxt(),'post menu');pg.screenshot(path='v2_lp_post.png');c('#lpm [data-lpi="0"]',400);chk(pg.evaluate("Object.values(state.x2.soc.like).some(Boolean)"),'cheer via hold')
        c('.tb[data-tab=money]',500);c('#pg [data-x=open][data-v=subs]',600);hold('#x-body .xrow[data-v=cancel]');chk(menu() and 'Cancel it for me' in mtxt(),'sub menu');c('#lpm [data-lpi="1"]',400)
        c('.sheet.on button.lnk[data-close]',400)
    chk(not errs,'no page errors '+str(errs[:2]))
    print('PASS',sum(1 for r in R if r[0]),'FAIL',sum(1 for r in R if not r[0]))
