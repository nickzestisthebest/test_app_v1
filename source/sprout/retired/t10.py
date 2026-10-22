import os,sys
from playwright.sync_api import sync_playwright
STUB="""window.__calls=0;const fake=Object.assign(async()=>({text:''}),{json:async(p)=>{if(p.includes('STRINGS:')){window.__calls++;const arr=JSON.parse(p.split('STRINGS:\\n')[1]);return {t:arr.map(s=>'¡'+s)}}return {}},limits:async()=>({images:false})});
window.claude={use:async(n)=>{if(n==='sample')return fake;throw new Error('x')}};"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script(STUB)
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
    def c(sel,w=500): pg.click(sel);pg.wait_for_timeout(w)
    c('[data-wact=connect]',800)
    for k in ['checking','cards','loans']: c('[data-lk=conn][data-v=%s]'%k,1300)
    c('[data-lk=next]',400);c('[data-lk=finish]',2500)
    c('header [data-settings]',700);pg.screenshot(path='s_settings.png')
    c('#x-body [data-x=open][data-v=appearance]',500);c('#x-body [data-x=theme][data-v=dark]',500);pg.screenshot(path='s_appear_dark.png')
    c('.sheet.on button.lnk[data-close]',500);pg.evaluate("window.scrollTo(0,0)");pg.screenshot(path='d_home.png')
    pg.evaluate("window.scrollTo(0,700)");pg.wait_for_timeout(300);pg.screenshot(path='d_home2.png');pg.evaluate("window.scrollTo(0,0)")
    c('.tb[data-tab=money]');pg.screenshot(path='d_money.png')
    c('#pg [data-x=open][data-v=credit]',600);pg.screenshot(path='d_credit.png');c('.sheet.on button.lnk[data-close]')
    c('.tb[data-tab=community]');pg.screenshot(path='d_comm.png')
    c('.tb[data-tab=home]');c('#open-menu',500);pg.screenshot(path='d_menu.png');pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    if pg.query_selector('#menu.on'): c('#menu [data-menuclose]',400)
    c('#open-spend',600);pg.screenshot(path='d_log.png');c('.sheet.on button.lnk[data-close]')
    c('.hdstreak',700);pg.screenshot(path='d_streak.png');c('.sheet.on button.lnk[data-close]')
    # language
    c('header [data-settings]',600);c('#x-body [data-x=open][data-v=language]',500);c('#x-body [data-x=lang][data-v=es]',2500)
    pg.screenshot(path='l_lang.png');c('.sheet.on button.lnk[data-close]',600);pg.wait_for_timeout(1500);pg.screenshot(path='l_home.png')
    print('calls',pg.evaluate('window.__calls'))
    c('.tb[data-tab=money]',1500);pg.screenshot(path='l_money.png')
    # hide balances
    c('header [data-settings]',600);pg.click('#x-body [data-x=pref][data-v=hidebal]');pg.wait_for_timeout(500);c('.sheet.on button.lnk[data-close]',600);pg.screenshot(path='h_money.png')
    # back to english
    c('header [data-settings]',600);c('#x-body [data-x=open][data-v=language]',500);c('#x-body [data-x=lang][data-v=en]',800);c('.sheet.on button.lnk[data-close]',600);pg.screenshot(path='l_back_en.png')
    print('still marked', pg.evaluate("document.body.innerText.includes('¡')"))
    # passcode
    c('header [data-settings]',600);c('#x-body [data-x=open][data-v=security]',500);pg.fill('#pin-a','1234');pg.fill('#pin-b','1234');c('#x-body [data-x=pinset]',400)
    print('lock',pg.evaluate("state.prefs.lock"))
    pg.reload();pg.wait_for_timeout(3500);pg.screenshot(path='lock.png')
    for d in '1235': c('[data-pin="%s"]'%d,100)
    pg.wait_for_timeout(500);print('locked after wrong',pg.query_selector('#lock') is not None)
    for d in '1234': c('[data-pin="%s"]'%d,100)
    pg.wait_for_timeout(600);print('unlocked',pg.query_selector('#lock') is None, 'theme',pg.evaluate("document.documentElement.dataset.theme"))
    print(errs)
