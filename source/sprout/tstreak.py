import os,json
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True);pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.__noSeed=true;window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto(URL);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(2600);W=pg.wait_for_timeout
    def act(a,w=350):pg.click('#auth [data-au-act=%s]'%a);W(w)
    def fill(k,v):pg.fill('#au-'+k,v)
    act('tosignup');fill('first','Alex');fill('last','Rivera');fill('email','alex@example.com');fill('pw','Budget!Day42');act('next1')
    pg.fill('#au-dob','1998-03-14');fill('phone','555 867 5309');fill('zip','30301');act('next2')
    for k in ['tos','privacy','esign']:pg.check('#auth input[data-au=%s]'%k)
    act('next3');fill('code',pg.evaluate("document.querySelector('#auth .audemo b').textContent"));act('verify',2200)
    # finish setup quickly with the demo-like plan, then build a streak
    pg.evaluate("document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')")
    pg.evaluate("""(()=>{const td=new Date(),f=d=>new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())).toISOString().slice(0,10),y=new Date(Date.now()-864e5);
      Object.assign(window.state,{setup:true,pay:1800,payFreq:'biweekly',firstPay:f(new Date(Date.now()+5*864e5)),cash:600,everyday:300,discReduced:150,discTarget:150});
      window.state.checkin={last:f(td),streak:6,best:6};window.state.stk={run:5,best:5,last:f(y),log:{},days:{},aw:{},qw:{},savers:1,kept:0,keptAll:0,banked:0,sid:1};
      window.__T.setView('ov')})()""");W(800)
    pg.click('header [data-settings]');W(600);pg.click('#x-body [data-x=back]') if pg.locator('#x-body [data-x=back]').count() else None
    before=pg.evaluate("JSON.stringify({run:state.stk.run,ck:state.checkin})")
    acc=pg.evaluate("JSON.parse(localStorage.getItem('sprout-accounts-v1')).cur")
    saved=pg.evaluate("(()=>{const v=localStorage.getItem('sprout-state-v1::%s');return v?JSON.parse(v).stk:null})()"%acc)
    print('before signout state.stk.run/ck:',before,'| saved copy stk:',json.dumps(saved)[:200])
    pg.evaluate("window.__T.closeSheets()");W(400);pg.click('header [data-settings]');W(600);pg.click('#x-body [data-x=signout]');W(2800)
    act('tologin');fill('email','alex@example.com');fill('pw','Budget!Day42');act('login',2600)
    print('after login stk:',pg.evaluate("JSON.stringify(state.stk&&{run:state.stk.run,last:state.stk.last,best:state.stk.best})"),'checkin:',pg.evaluate("JSON.stringify(state.checkin)"),'setup:',pg.evaluate("state.setup"))
    print('header streak text:',pg.evaluate("(document.getElementById('hd-streak')||{}).innerText"))
    print('errors',errs[:2])
    b.close()
