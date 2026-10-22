import os
from playwright.sync_api import sync_playwright
P=[];F=[]
def chk(c,n):(P if c else F).append(n);print(('PASS ' if c else 'FAIL ')+n)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};try{localStorage.setItem('sprout-lp-hint','1')}catch(e){}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400);pg.click('[data-wact=demo2]');pg.wait_for_timeout(2500)
    W=pg.wait_for_timeout;txt=lambda:pg.evaluate("document.getElementById('x-body').textContent")
    pg.click('.tb[data-tab=money]');W(500);chk('tracked' in pg.evaluate("document.getElementById('pg').textContent"),'Finances tile says tracked')
    pg.click('#pg [data-x=open][data-v=vault]');W(600);t=txt()
    chk('Your money stays at your bank' in t and 'never moves money' in t,'says money stays at the bank')
    chk('My savings' in t and '$2,400' in t,'old vault balance became a tracked account')
    pg.click('#x-body [data-x=svedit][data-v=new]');W(300);pg.fill('#sv-n','Ally Savings');pg.fill('#sv-b','5000');pg.fill('#sv-r','4.2');pg.click('#x-body [data-x=svsave]');W(400)
    t=txt();chk('Ally Savings' in t and '$7,400' in t,'add an account updates the total')
    chk('a month in interest' in t,'shows estimated interest')
    pg.select_option('#sv-acc',index=1);pg.fill('#sv-amt','100');pg.click('#x-body [data-x=svrec][data-v=in]');W(400);chk('$7,500' in txt(),'record a deposit')
    pg.select_option('#sv-acc',index=1);pg.fill('#sv-amt','50');pg.click('#x-body [data-x=svrec][data-v=out]');W(400);chk('$7,450' in txt(),'record a withdrawal')
    before=pg.evaluate("state.x2.vault.al['Japan trip']||0");pg.click('#x-body [data-x=svalloc][data-v="Japan trip"][data-w="25"]');W(300)
    chk(pg.evaluate("state.x2.vault.al['Japan trip']")==before+25,'assign $25 to a goal')
    pg.click('#x-body [data-x=svrem][data-v=week]');W(300);chk(pg.evaluate("!!state.x2.vault.rem.week"),'reminder toggle saved')
    chk('referral fee' in txt() and 'isn’t a recommendation' in txt(),'high-yield card has disclosure')
    pg.click('#x-body button.svacc[data-v=s1]');W(300);pg.click('#x-body [data-x=svdel]');W(200);pg.click('#x-body [data-x=svdel]');W(400);chk('Ally Savings' in txt() and 'My savings' not in txt(),'remove an account (two taps)')
    pg.screenshot(path='sv_page.png',full_page=False)
    chk(not errs,'no errors '+str(errs[:2]))
    b.close()
print('PASS',len(P),'FAIL',len(F),F)
