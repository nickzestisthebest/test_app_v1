import os
from playwright.sync_api import sync_playwright
R=[]
def ck(n,c,d=''):R.append(c);print('PASS' if c else 'FAIL',n,d)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};window.__mod=1")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(6000)
    pg.click('.tabbar [data-tab=community]');pg.wait_for_timeout(800)
    if pg.query_selector('#pg [data-x=welx]'):pg.click('#pg [data-x=welx]');pg.wait_for_timeout(400)
    n0=pg.locator('#pg .post').count()
    other=pg.evaluate("[...document.querySelectorAll('#pg .post [data-x=report]')].map(b=>b.dataset.v).find(v=>!v.startsWith('u'))")
    sel='#pg .post [data-x=report][data-v="%s"]'%other
    pg.click(sel);pg.wait_for_timeout(400)
    ck('menu opens, post stays',pg.locator('#pmenu .pmbox').is_visible() and pg.locator('#pg .post').count()==n0)
    pg.screenshot(path='../pm1.png')
    pg.click('#pmenu .pmbg',position={'x':200,'y':100});pg.wait_for_timeout(400)
    ck('tap outside closes, nothing hidden',pg.query_selector('#pmenu') is None and pg.locator('#pg .post').count()==n0)
    pg.click(sel);pg.wait_for_timeout(300);pg.click('[data-pm=report]');pg.wait_for_timeout(200)
    ck('reasons shown',pg.locator('[data-pm=reason]').count()==6);pg.screenshot(path='../pm2.png')
    pg.click('[data-pm=reason][data-v=scam]');pg.wait_for_timeout(300)
    ck('thanks shown',pg.locator('.pmdone').is_visible())
    pg.click('[data-pm=close]');pg.wait_for_timeout(400)
    ck('reported post hidden',pg.locator(sel).count()==0 and pg.locator('#pg .post').count()==n0-1)
    ck('report stored',pg.evaluate("window.state.x2.soc.reports.length")==1)
    # hide + undo
    o2=pg.evaluate("[...document.querySelectorAll('#pg .post [data-x=report]')].map(b=>b.dataset.v).find(v=>!v.startsWith('u'))")
    pg.click('#pg .post [data-x=report][data-v="%s"]'%o2);pg.wait_for_timeout(300);pg.click('[data-pm=hide]');pg.wait_for_timeout(300)
    ck('hide works',pg.locator('#pg .post').count()==n0-2)
    pg.click('#toast .tbtn');pg.wait_for_timeout(300)
    ck('undo works',pg.locator('#pg .post').count()==n0-1)
    # own post
    mine=pg.evaluate("(()=>{const p=window.state.x2.soc.posts;return p.length?p[0].id:null})()")
    print('mine',mine)
    # moderator queue
    pg.click('[data-settings]');pg.wait_for_timeout(600)
    ck('settings has Review reports',pg.locator('#x-body [data-v=modq]').count()==1)
    pg.click('#x-body [data-v=modq]');pg.wait_for_timeout(700);pg.screenshot(path='../pm3.png')
    ck('queue lists report',pg.locator('#x-body .mq').count()==1)
    pg.click('#x-body [data-x=mqdo][data-w=removed]');pg.wait_for_timeout(500)
    ck('resolved',pg.evaluate("window.state.x2.soc.reports[0].status")=='removed' and pg.locator('#x-body .mq').count()==0)
    # private messages are gone, so there is nothing to report there
    pg.evaluate("window.__T.closeSheets()");pg.wait_for_timeout(500)
    pg.click('.tabbar [data-tab=community]');pg.wait_for_timeout(500)
    ck('no messages inbox in Community',pg.locator('#pg [data-x=inbox]').count()==0)
    ck('no errors',not errs,errs)
    b.close()
print(sum(R),'/',len(R))
