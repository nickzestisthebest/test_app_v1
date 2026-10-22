# accounts with a (fake) cloud database: Apple/Google sign-in, data saved per account, stay signed in, demo account
import os,json
from playwright.sync_api import sync_playwright
P=[];F=[];CLOUD={}
def chk(c,n):(P if c else F).append(n);print(('PASS ' if c else 'FAIL ')+n)
INIT="""window.__noSeed=true;
const DB={doc:p=>({get:async()=>{const v=await window.__dbget(p);return {exists:v!==null,data:()=>JSON.parse(v)}},set:async o=>{await window.__dbset(p,JSON.stringify(o))},update:async o=>{},delete:async()=>{await window.__dbset(p,null)},onSnapshot:()=>()=>{}})};
const USER={id:async()=>'u_test',me:async()=>({id:'u_test'}),isOwner:async()=>true};
window.claude={use:async n=>{if(n==='db')return DB;if(n==='user')return USER;throw new Error('x')}};"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.expose_function('__dbget',lambda path:CLOUD.get(path))
    def dbset(path,v):
        if v is None:CLOUD.pop(path,None)
        else:CLOUD[path]=v
    pg.expose_function('__dbset',dbset)
    pg.add_init_script(INIT)
    URL='file://'+os.getcwd()+'/v2_test.html'
    pg.goto(URL);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(3200)
    W=pg.wait_for_timeout;q=lambda s:pg.evaluate("(()=>{const e=document.querySelector(%r);return e?e.textContent:''})()"%s)
    def act(a,w=400):pg.click('#auth [data-au-act=%s]'%a);W(w)
    def closew():
        W(900);pg.evaluate("document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')")
    reg=lambda:json.loads(CLOUD.get('data/users/u_test/sprout_accounts','{}'))
    chk(pg.is_visible('#auth .ssob.apple') and pg.is_visible('#auth .ssob.google'),'welcome has Apple and Google')
    # ---- Google sign-up ----
    pg.click('#auth .ssob.google');W(400);chk(pg.is_visible('#auth .ssosh'),'Google sheet opens')
    pg.fill('#au-sfirst','Alex');pg.fill('#au-slast','Rivera');pg.fill('#au-semail','alex@gmail.com');act('ssogo')
    t=q('#auth');chk('A bit about you' in t and 'Signed in with Google' in t,'Google goes straight to step 2')
    pg.fill('#au-dob','1998-03-14');pg.fill('#au-phone','4045550199');pg.fill('#au-zip','30301');act('next2')
    for k in ['tos','privacy','esign']:pg.check('#auth input[data-au=%s]'%k)
    act('next3',2600)
    chk(not pg.query_selector('#auth'),'account created without a password or email code')
    me=pg.evaluate("(()=>{const R=JSON.parse(localStorage.getItem('sprout-accounts-v1'));return R.list[R.cur]})()")
    chk(me['prov']=='google' and not me.get('pwh') and me['email']=='alex@gmail.com','account is a Google account')
    aid=me['id'];W(1500)
    chk(reg().get('cur')==aid and aid in reg()['list'],'account and session saved to the cloud')
    # ---- data saved under the account ----
    W(600);pg.evaluate("document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')")
    closew();pg.click('header [data-settings]');W(600);pg.click('#x-body [data-x=open][data-v=profile]');W(400);pg.fill('#pf-name','Alexy');pg.click('#x-body [data-x=pfsave]');W(1800)
    st=CLOUD.get('data/users/u_test/a_%s_state'%aid);chk(st is not None and json.loads(st).get('name')=='Alexy','profile change saved to this account in the cloud')
    # ---- stay signed in, even if this device's storage is wiped ----
    pg.reload();W(3400);chk(not pg.query_selector('#auth') and pg.evaluate("state.name")=='Alexy','reopening keeps you signed in')
    pg.evaluate("localStorage.clear()");pg.reload();W(3600)
    chk(not pg.query_selector('#auth') and pg.evaluate("state.name")=='Alexy','still signed in with data after device storage is cleared')
    # ---- sign out ----
    pg.evaluate("document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')")
    closew();pg.click('header [data-settings]');W(600);pg.click('#x-body [data-x=open][data-v=acctinfo]');W(400);chk('Sign in with Google' in q('#x-body'),'settings shows Google sign-in')
    pg.click('#x-body [data-x=back]');W(300);pg.click('#x-body [data-x=signout]');W(3600)
    chk(pg.is_visible('#auth .auw'),'sign out shows the welcome screen');chk(reg().get('cur') is None,'cloud session cleared on sign out')
    pg.reload();W(3400);chk(pg.is_visible('#auth .auw'),'stays signed out after reopening')
    # ---- Google again logs straight in ----
    pg.click('#auth .ssob.google');W(300);pg.fill('#au-sfirst','Alex');pg.fill('#au-slast','Rivera');pg.fill('#au-semail','alex@gmail.com');act('ssogo',3000)
    chk(not pg.query_selector('#auth') and pg.evaluate("state.name")=='Alexy','returning Google user logs straight in with their data')
    closew();pg.click('header [data-settings]');W(600);pg.click('#x-body [data-x=signout]');W(3600)
    # ---- password log-in on a Google account explains what to do ----
    act('tologin');pg.fill('#au-email','alex@gmail.com');pg.fill('#au-pw','whatever1');act('login',800);chk('Continue with Google' in q('#auth'),'password log-in points to Google')
    # ---- a Google account adds a password, then logs in with just email ----
    act('home');pg.click('#auth .ssob.google');W(300);pg.fill('#au-sfirst','Alex');pg.fill('#au-slast','Rivera');pg.fill('#au-semail','alex@gmail.com');act('ssogo',3000)
    closew();pg.click('header [data-settings]');W(600);chk('Add a password' in q('#x-body'),'settings offers Add a password');pg.click('#x-body [data-x=open][data-v=pwchange]');W(400)
    pg.fill('#pw-new','weak');pg.fill('#pw-new2','weak');pg.click('#x-body [data-x=pwsave]');W(600);chk('needs everything' in q('#toast'),'weak password refused in settings')
    pg.fill('#pw-new','Green!Leaf2026');pg.fill('#pw-new2','Green!Leaf2026');pg.click('#x-body [data-x=pwsave]');W(1200);chk('Password added' in q('#toast'),'password added to Google account')
    pg.click('#x-body [data-x=signout]');W(3600)
    act('tologin');pg.fill('#au-email','alex@gmail.com');pg.fill('#au-pw','Green!Leaf2026');act('login',3000)
    chk(not pg.query_selector('#auth') and pg.evaluate("state.name")=='Alexy','Google account now logs in with email and password too')
    closew();pg.click('header [data-settings]');W(600);pg.click('#x-body [data-x=signout]');W(3600);act('tologin')
    # ---- demo account ----
    act('demofill');act('login',3600)
    chk(not pg.query_selector('#auth') and pg.evaluate("state.name")=='Jordan' and pg.evaluate("!!state.setup"),'demo account logs in with a full example plan')
    W(1500);demo=CLOUD.get('data/users/u_test/a_demo_state');chk(demo is not None,'demo account data saved under its own account')
    chk(json.loads(CLOUD.get('data/users/u_test/a_%s_state'%aid))['name']=='Alexy','other account data untouched')
    closew();pg.click('header [data-settings]');W(600);pg.click('#x-body [data-x=signout]');W(3600)
    # ---- Apple with Hide My Email ----
    pg.click('#auth .ssob.apple');W(300);pg.fill('#au-sfirst','Ava');pg.fill('#au-slast','Lee');pg.fill('#au-semail','ava@icloud.com');pg.click('#auth input[data-au=shide][value="1"]');act('ssogo')
    chk('privaterelay.appleid.com' in q('#auth'),'Hide My Email gives a private relay address')
    act('back');chk(pg.is_visible('#auth .auw'),'back from Apple step returns to welcome')
    pg.screenshot(path='t47_welcome.png')
    chk(not errs,'no errors '+str(errs[:2]))
    b.close()
print('PASS',len(P),'FAIL',len(F),F)
