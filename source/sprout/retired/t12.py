import os,sys
from playwright.sync_api import sync_playwright
V=sys.argv[1]
f={'v1':'v1_test.html','v2':'v2_test.html'}[V]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/'+f);pg.wait_for_timeout(3200)
    def c(sel,w=500): pg.click(sel);pg.wait_for_timeout(w)
    c('[data-wact=demo]',1200)
    pg.screenshot(path=V+'_k0.png')
    print('streak0',pg.evaluate("state.stk&&[state.stk.run,state.stk.savers,JSON.stringify(state.stk.days)]"))
    # check in
    c('.stick [data-stk=checkin]',700)
    c('[data-ck=save]',500);c('[data-ck=next]',900);pg.screenshot(path=V+'_k1.png')
    c('#sh-check [data-close].btn',500) if pg.query_selector('#sh-check [data-close].btn') else None
    print('after ck',pg.evaluate("[state.stk.run,JSON.stringify(state.stk.days)]"))
    # fabricate 13 prior green days + 1 over day 15 ago
    pg.evaluate("""(()=>{const s=state.stk,MS=864e5,t0=Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()),fd=t=>new Date(t).toISOString().slice(0,10);
      for(let i=1;i<=13;i++)s.days[fd(t0-i*MS)]={a:40,s:i==5?55:22,ck:true};s.days[fd(t0-14*MS)]={a:40,s:10,ck:true};s.last=fd(t0-15*MS);s.run=0;s.savers=1;s.log={};s.aw={};
      localStorage.setItem('sprout-state-v1',JSON.stringify(state))})()""")
    pg.reload();pg.wait_for_timeout(4500)
    print('settled',pg.evaluate("[state.stk.run,state.stk.savers,state.stk.best,Math.round(state.stk.kept),JSON.stringify(state.stk.log)]"))
    pg.screenshot(path=V+'_k2.png')
    if pg.query_selector('#stk-cel.on'):
        print('celebration:',pg.inner_text('#stk-cel')[:300]);pg.screenshot(path=V+'_cel.png');c('#stk-cel [data-stk=bank]',800)
        print('banked',pg.evaluate("[state.saved,state.stk.banked,state.stk.kept]"))
    c('.stick [data-stkopen]',800);pg.screenshot(path=V+'_sheet.png',full_page=False)
    pg.evaluate("document.querySelector('#sh-streak .panel').scrollTo(0,900)");pg.wait_for_timeout(300);pg.screenshot(path=V+'_sheet2.png')
    pg.evaluate("document.querySelector('#sh-streak .panel').scrollTo(0,2200)");pg.wait_for_timeout(300);pg.screenshot(path=V+'_sheet3.png')
    if V=='v2':
        c('#sh-streak [data-x=lgopen]',900);pg.screenshot(path='v2_league.png')
    else:
        c('.sheet.on button.lnk[data-close]',500)
    # overspend today
    pg.evaluate("window.scrollTo(0,0)")
    c('#open-spend',600);pg.fill('#sp-amt','500');pg.keyboard.press('Enter');pg.wait_for_timeout(900)
    print('toast',pg.inner_text('#toast'))
    if pg.query_selector('.sheet.on button.lnk[data-close]'): c('.sheet.on button.lnk[data-close]',500)
    if V=='v2': c('.tb[data-tab=home]',600)
    pg.evaluate("window.scrollTo(0,0)");pg.screenshot(path=V+'_over.png')
    print(errs)
