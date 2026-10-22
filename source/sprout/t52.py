import os,json,time
from playwright.sync_api import sync_playwright
P=[];F=[]
def chk(c,n):(P if c else F).append(n);print(('PASS ' if c else 'FAIL ')+n)
DAY=86400000
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.__noSeed=true;window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(3200)
    W=pg.wait_for_timeout;q=lambda s:pg.evaluate("(document.querySelector(%r)||{}).textContent||''"%s)
    reg=lambda:pg.evaluate("JSON.parse(localStorage.getItem('sprout-accounts-v1'))")
    def act(a,w=400):pg.click('#auth [data-au-act=%s]'%a);W(w)
    def closew():
        W(900);pg.evaluate("document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock');document.querySelectorAll('#tmup').forEach(e=>e.remove())")
    def signout():
        closew();pg.click('header [data-settings]');W(600);pg.click('#x-body [data-x=signout]');W(3800)
    def signup(first,last,email,dob,phone,code='',expect_ok=True):
        act('tosignup');pg.fill('#au-first',first);pg.fill('#au-last',last);pg.fill('#au-email',email);pg.fill('#au-pw','Budget!Day42');act('next1')
        pg.fill('#au-dob',dob);pg.fill('#au-phone',phone);pg.fill('#au-zip','30301');act('next2')
        if 'The fine print' not in q('#auth'):return q('#auth')
        for k in ['tos','privacy','esign']:pg.check('#auth input[data-au=%s]'%k)
        if code:pg.fill('#au-ref',code)
        act('next3')
        if 'Check your email' not in q('#auth'):return q('#auth')
        pg.fill('#au-code',pg.evaluate("document.querySelector('#auth .audemo b').textContent"));act('verify',3000);return 'ok'
    # A signs up
    chk(signup('Alex','Rivera','alex@example.com','1998-03-14','4045550101')=='ok','A signs up')
    R=reg();A=R['list'][R['cur']];code=A['ref'];chk(code.startswith('SPRT-') and len(code)==11,'A has a referral code '+code)
    closew();pg.click('header [data-settings]');W(600);chk('Invite friends' in q('#x-body'),'Settings has Invite friends')
    pg.click('#x-body .refset');W(500);chk(code in q('#x-body'),'Invite page shows the code')
    signout()
    # bad code
    t=signup('Ava','Lee','ava@example.com','1990-01-01','2125550199','SPRT-NOPE00');chk('couldn’t find that code' in t,'unknown code rejected')
    pg.fill('#au-ref',code.lower());act('next3');pg.fill('#au-code',pg.evaluate("document.querySelector('#auth .audemo b').textContent"));act('verify',3200)
    R=reg();B=R['list'][R['cur']];now=time.time()*1000
    chk(B.get('refBy')==A['id'],'B is linked to A')
    chk(abs(B.get('plusFree',0)-(now+30*DAY))<5*60000,'B got exactly one free month')
    chk(pg.evaluate("__T.plusIs()"),'B is on Plus')
    closew();pg.click('header [data-settings]');W(600);pg.click('#x-body .plset');W(500);chk('free' in q('#x-body').lower() and 'doesn’t renew' in q('#x-body'),'Plus page shows free time that doesn’t renew')
    pf=B['plusFree'];pg.reload();W(3600);R=reg();chk(R['list'][R['cur']]['plusFree']==pf,'reopening does not add another month')
    signout()
    # A logs back in and gets their month once
    act('tologin');pg.fill('#au-email','alex@example.com');pg.fill('#au-pw','Budget!Day42');act('login',3600)
    R=reg();A=R['list'][R['cur']];now=time.time()*1000
    chk(abs(A.get('plusFree',0)-(now+30*DAY))<5*60000,'A got exactly one free month')
    pf=A['plusFree'];pg.reload();W(3600);R=reg();chk(R['list'][R['cur']]['plusFree']==pf,'A does not get it twice')
    signout()
    # one account per person
    t=signup('Sam','Ray','sam@example.com','1992-02-02','4045550101');chk('already on a Sprout account' in t,'same phone blocked')
    act('back');act('home') if pg.query_selector('#auth [data-au-act=home]') else None
    pg.goto('file://'+os.getcwd()+'/v2_test.html');W(3200)
    chk(signup('nick','SZE','nick2@example.com','1998-03-14','4045550177',code)=='ok','someone with the same name and birthday can still sign up')
    R=reg();D=R['list'][R['cur']];chk(not D.get('plusFree') and D['rw'][0].get('pending'),'but their referral bonus waits for review')
    A=[x for x in R['list'].values() if x['email']=='alex@example.com'][0];chk(A['rw'][-1].get('pending') and A['rw'][-1]['months']==0,'and the referrer’s bonus too')
    signout()
    pg.goto('file://'+os.getcwd()+'/v2_test.html');W(3200)
    # yearly cap: give A 12 referral months this year, then a new friend joins
    pg.evaluate("""(()=>{const R=JSON.parse(localStorage.getItem('sprout-accounts-v1'));const a=Object.values(R.list).find(x=>x.email==='alex@example.com');
      for(let i=0;i<11;i++)a.rw.push({id:'fake'+i,kind:'ref',months:1,why:'x',at:Date.now()-i*864e5,applied:Date.now()});localStorage.setItem('sprout-accounts-v1',JSON.stringify(R))})()""")
    chk(signup('Kim','Ono','kim@example.com','1991-07-07','6175550123',code)=='ok','C signs up with A’s code')
    R=reg();A=[x for x in R['list'].values() if x['email']=='alex@example.com'][0];last=A['rw'][-1]
    chk(last['months']==0 and 'limit' in last['why'],'A hits the 12-month yearly limit')
    C=R['list'][R['cur']];chk(C.get('plusFree',0)>time.time()*1000,'new friend still gets their month')
    # free time runs out
    pg.evaluate("(()=>{const R=JSON.parse(localStorage.getItem('sprout-accounts-v1'));R.list[R.cur].plusFree=Date.now()-1000;localStorage.setItem('sprout-accounts-v1',JSON.stringify(R))})()")
    chk(not pg.evaluate("__T.plusIs()"),'Plus ends when the free time runs out')
    chk(not errs,'no errors '+str(errs[:2]))
    b.close()
print('PASS',len(P),'FAIL',len(F),F)
