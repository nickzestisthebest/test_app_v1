import os
from playwright.sync_api import sync_playwright
P=[];F=[]
def chk(c,n):(P if c else F).append(n);print(('PASS ' if c else 'FAIL ')+n)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};try{localStorage.setItem('sprout-lp-hint','1')}catch(e){}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400);pg.click('[data-wact=demo]');pg.wait_for_timeout(3000)
    W=pg.wait_for_timeout;txt=lambda s='#x-body':pg.evaluate("(document.querySelector(%r)||{}).textContent||''"%s)
    pg.evaluate("document.getElementById('toast').classList.remove('on')")
    chk(not pg.query_selector('#ov .plcard'),'Today has no Plus sales card (Plus lives in Settings)')
    pg.evaluate("__T.xOpen('plus')");W(700);t=txt();chk('in possible savings' in t and 'Start my free week' in t,'paywall: personal headline and trial button');chk('Estimates, not guarantees' in t and 'does not guarantee any savings' in t,'paywall disclaimers')
    pg.click('#x-body [data-x=legaldoc][data-v=est]');W(500);chk('not guaranteed' in txt(),'How we estimate explains it');pg.click('#x-body [data-x=back]');W(400)
    pg.click('#x-body .pllinks [data-v=tos]');W(500);t2=txt();chk('Estimates are not guarantees' in t2 and 'arbitration' in t2 and 'Limits on our liability' in t2,'Terms open from the paywall');pg.click('#x-body [data-x=back]');W(400)
    chk('renews automatically' in t and 'Restore purchases' in t,'paywall has auto-renew terms and restore')
    pg.screenshot(path='pl_wall.png',full_page=False);pg.evaluate("document.querySelector('#sh-x .panel').scrollTop=2000");W(300);pg.screenshot(path='pl_wall2.png')
    pg.click('#x-body [data-x=pbill][data-v=mo]');W(300);chk('$6.99 a month' in txt(),'switching to monthly updates the terms')
    pg.click('.sheet.on button.lnk[data-close]');W(400)
    # moment of intent: cancel a subscription
    pg.click('.tb[data-tab=money]');W(500);pg.click('#pg [data-x=open][data-v=subs]');W(600);pg.click('[data-x=open][data-v=cancel][data-w=adobe]');W(500)
    pg.check('#x-body #cx-ok');W(100)
    pg.click('#x-body [data-x=runcancel]');W(600);t=txt();chk('Let Sprout cancel Adobe' in t,'tapping Cancel for me opens Plus with that subscription')
    pg.click('#x-body [data-x=pstart]');W(5500);chk('Cancelled' in txt(),'after starting the trial the cancel carries on and finishes (the tick is remembered)')
    pg.click('.sheet.on button.lnk[data-close]');W(400)
    pg.click('.tb[data-tab=home]');W(500);chk(not pg.query_selector('.plcard'),'home card gone once on Plus')
    pg.click('header [data-settings]');W(600);chk('Free trial until' in txt(),'settings shows Plus trial at the top')
    pg.click('#x-body .plset');W(500);chk('You’re on Plus' in txt(),'Plus page shows status');pg.click('#x-body [data-x=pstop]');W(500)
    pg.click('.sheet.on button.lnk[data-close]');W(400)
    # snooze
    chk(not pg.query_selector('#ov .plcard'),'no Plus sales card on Today')
    # updated terms: an account that agreed to an older version is asked again
    pg.evaluate("(()=>{const R=JSON.parse(localStorage.getItem('sprout-accounts-v1'));R.list[R.cur].agree.v='2026-10-01';localStorage.setItem('sprout-accounts-v1',JSON.stringify(R))})()")
    pg.reload();W(4600);chk(pg.is_visible('#tmup'),'older agreement: updated Terms prompt appears')
    pg.click('#tmup [data-x=tmagree]');W(300);chk(pg.is_visible('#tmup'),'cannot continue without agreeing')
    pg.check('#tm-ok');pg.click('#tmup [data-x=tmagree]');W(500);chk(not pg.query_selector('#tmup'),'agreeing closes it')
    chk(pg.evaluate("(()=>{const R=JSON.parse(localStorage.getItem('sprout-accounts-v1'));return R.list[R.cur].agree.v})()")!='2026-10-01','new agreement recorded')
    pg.reload();W(4600);chk(not pg.query_selector('#tmup'),'not asked again')
    chk(not errs,'no errors '+str(errs[:2]))
    b.close()
print('PASS',len(P),'FAIL',len(F),F)
