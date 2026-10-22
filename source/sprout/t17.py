import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1800)
    print('cel',pg.evaluate("!!document.querySelector('#stk-cel.on')"))
    pg.screenshot(path='th_home.png')
    for y,n in [(560,'th_home2'),(1150,'th_home3')]:
        pg.evaluate("window.scrollTo(0,%d)"%y);pg.wait_for_timeout(400);pg.screenshot(path=n+'.png')
    pg.evaluate("window.scrollTo(0,0)")
    print(pg.evaluate("[state.cash,state.stk.run,state.stk.savers,JSON.stringify(state.stk.days[new Date().toISOString().slice(0,10)])]"))
    pg.click('.tb[data-tab=money]');pg.wait_for_timeout(600);pg.screenshot(path='th_money.png')
    pg.click('#hd-streak');pg.wait_for_timeout(700);pg.screenshot(path='th_streak.png')
    pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    pg.click('header [data-settings]');pg.wait_for_timeout(500);pg.click('#x-body [data-x=open][data-v=examples]');pg.wait_for_timeout(400);pg.click('#x-body [data-x=loadex][data-v=start]');pg.wait_for_timeout(1200)
    print('start cash',pg.evaluate("state.cash"))
    pg.click('header [data-settings]');pg.wait_for_timeout(500);pg.click('#x-body [data-x=open][data-v=examples]');pg.wait_for_timeout(400);pg.click('#x-body [data-x=loadex][data-v=thriving]');pg.wait_for_timeout(1200)
    print('back',pg.evaluate("state.cash"),errs)
