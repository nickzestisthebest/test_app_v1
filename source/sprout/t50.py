import os
from playwright.sync_api import sync_playwright
P=[];F=[]
def chk(c,n):(P if c else F).append(n);print(('PASS ' if c else 'FAIL ')+n)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.__noSeed=true;window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(3200)
    W=pg.wait_for_timeout
    def act(a,w=400):pg.click('#auth [data-au-act=%s]'%a);W(w)
    act('tologin');act('demofill');act('login',3800)
    pg.evaluate("document.querySelectorAll('#tmup').forEach(e=>e.remove())")
    chk(pg.is_visible('#ov .fidcard'),'Home suggests turning on Face ID')
    pg.evaluate("document.querySelector('#ov .fidcard').scrollIntoView({block:'center'})");W(300);pg.screenshot(path='fid_card.png')
    pg.click('#ov .fidcard [data-x=fidon]');W(500);chk(pg.is_visible('#fidov'),'Face ID scan appears');pg.screenshot(path='fid_scan.png');W(1800)
    chk(not pg.query_selector('#fidov') and not pg.query_selector('#ov .fidcard'),'scan finishes and the card goes away')
    chk(pg.evaluate("state.prefs.faceid===true"),'Face ID turned on')
    pg.click('header [data-settings]');W(600);pg.click('#x-body [data-x=signout]');W(3800)
    pg.click('#auth [data-au-act=tologin]');W(400);chk(pg.is_visible('#auth [data-au-act=fidlogin]'),'log in screen offers Face ID');pg.screenshot(path='fid_login.png')
    pg.click('#auth [data-au-act=fidlogin]');W(3500);chk(not pg.query_selector('#auth') and pg.evaluate("state.name")=='Jordan','Face ID logs you in')
    # passcode lock with Face ID
    pg.evaluate("document.querySelectorAll('#tmup').forEach(e=>e.remove())")
    pg.click('header [data-settings]');W(600);pg.click('#x-body [data-x=open][data-v=security]');W(400);pg.fill('#pin-a','1234');pg.fill('#pin-b','1234');pg.click('#x-body [data-x=pinset]');W(500)
    pg.reload();W(3200);chk(pg.is_visible('#lock .lockfid'),'lock screen shows Face ID');W(2600)
    chk(not pg.query_selector('#lock'),'Face ID unlocks the app on its own')
    chk(not errs,'no errors '+str(errs[:2]))
    b.close()
print('PASS',len(P),'FAIL',len(F),F)
