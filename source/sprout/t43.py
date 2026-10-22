import os
from playwright.sync_api import sync_playwright
R=[]
def chk(c,m):R.append(('PASS ' if c else 'FAIL ')+m)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True)
    pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};try{localStorage.setItem('sprout-lp-hint','1')}catch(e){}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400);pg.click('[data-wact=demo2]');pg.wait_for_timeout(5000)
    pg.evaluate("document.getElementById('toast').classList.remove('on','act')")
    cdp=ctx.new_cdp_session(pg);W=pg.wait_for_timeout
    def ctr(sel):
        e=[x for x in pg.query_selector_all(sel) if x.is_visible()][0];bb=e.bounding_box();return bb['x']+bb['width']/2,bb['y']+bb['height']/2
    def item(text):
        for e in pg.query_selector_all('#lpm .lpm-i'):
            if text in e.inner_text():bb=e.bounding_box();return bb['x']+bb['width']/2,bb['y']+bb['height']/2
    def touch(t,x,y):cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[] if t=='touchEnd' else [{'x':x,'y':y,'id':1}]})
    def slide_touch(sel,text,shot=None,end_on_item=True):
        x,y=ctr(sel);touch('touchStart',x,y);W(700)
        tx,ty=item(text) if end_on_item else (40,150)
        for k in range(1,13):
            touch('touchMove',x+(tx-x)*k/12,y+(ty-y)*k/12);W(25)
        W(150)
        hl=pg.evaluate("(document.querySelector('#lpm .lpm-i.hl')||{}).innerText||''")
        if shot:pg.screenshot(path=shot)
        touch('touchEnd',tx,ty);W(900);return hl
    sy=pg.evaluate("scrollY")
    # 1 touch: Community tab -> Leagues
    hl=slide_touch('.tabbar [data-tab=community]','Leagues','lpd_slide.png')
    chk('Leagues' in hl,'touch: option under your finger lights up while sliding ('+hl.split(chr(10))[0]+')')
    chk(pg.evaluate("!document.getElementById('lpm').classList.contains('on')"),'touch: letting go on an option closes the menu')
    chk('Oak League' in pg.inner_text('#pg') or 'League' in pg.inner_text('#pg'),'touch: Leagues opened')
    chk(pg.evaluate("scrollY")==sy,'touch: page did not scroll while sliding')
    # 2 touch: Finances tab -> Budgets
    slide_touch('.tabbar [data-tab=money]','Budgets')
    chk(pg.is_visible('#sh-x') and 'Budgets' in pg.inner_text('#x-t'),'touch: Finances hold, slide to Budgets opens Budgets')
    pg.click('.sheet.on button.lnk[data-close]');W(500)
    # 3 touch: Log + -> Something else
    slide_touch('#open-spend','Something else')
    chk(pg.evaluate("document.getElementById('sh-spend').classList.contains('on')"),'touch: Log hold, slide to Something else opens Add a transaction')
    pg.click('#sh-spend button.lnk[data-close]');W(500)
    # 4 hold and let go without moving: menu stays, tap still works
    x,y=ctr('.tabbar [data-tab=home]');touch('touchStart',x,y);W(700);touch('touchEnd',x,y);W(500)
    chk(pg.evaluate("document.getElementById('lpm').classList.contains('on')"),'touch: plain hold then let go keeps the menu open (old way still works)')
    tx,ty=item('Streak and rewards');pg.touchscreen.tap(tx,ty);W(900)
    chk(pg.evaluate("document.getElementById('sh-streak')&&document.getElementById('sh-streak').classList.contains('on')"),'touch: tapping an option afterwards still works')
    pg.evaluate("document.querySelectorAll('.sheet.on [data-close]').forEach(b=>b.tagName==='BUTTON'&&b.click())");W(500)
    # 5 slide away from options and let go: menu stays open, nothing runs
    slide_touch('.tabbar [data-tab=community]','',None,end_on_item=False)
    chk(pg.evaluate("document.getElementById('lpm').classList.contains('on')") and not pg.is_visible('#sh-x'),'touch: letting go off the options does nothing and keeps the menu open')
    pg.keyboard.press('Escape');W(400)
    # 5b iPhone-style: browser cancels pointer events right after the menu opens; slide must still work
    pg.click('.tabbar [data-tab=home]');W(400)
    x,y=ctr('.tabbar [data-tab=money]');touch('touchStart',x,y);W(700)
    pg.evaluate("window.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1,pointerType:'touch',bubbles:true}));document.body.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1,pointerType:'touch',bubbles:true}))")
    tx,ty=item('Bill calendar')
    for k in range(1,13):touch('touchMove',x+(tx-x)*k/12,y+(ty-y)*k/12);W(25)
    W(120);touch('touchEnd',tx,ty);W(900)
    chk(pg.is_visible('#sh-x') and 'Bill calendar' in pg.inner_text('#x-t'),'touch: still works when the browser cancels pointer events mid-hold (iPhone behavior)')
    pg.click('.sheet.on button.lnk[data-close]');W(500)
    chk(pg.evaluate("!document.documentElement.classList.contains('lp-hold')"),'text selection is re-enabled after letting go')
    # 6 mouse: press, hold, drag to an option
    pg.click('.tabbar [data-tab=home]');W(500)
    x,y=ctr('.tabbar [data-tab=money]');pg.mouse.move(x,y);pg.mouse.down();W(700);tx,ty=item('Subscriptions');pg.mouse.move(tx,ty,steps=10);W(150);pg.mouse.up();W(900)
    chk(pg.is_visible('#sh-x') and 'Subscriptions' in pg.inner_text('#x-t'),'mouse: hold, drag to Subscriptions, release opens it')
    print('\n'.join(R));print('errs',errs)
