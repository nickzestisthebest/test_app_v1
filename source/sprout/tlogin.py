from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,service_workers='block');pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:3000');pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(3000);W=pg.wait_for_timeout
    def act(a,w=400):pg.click('#auth [data-au-act=%s]'%a);W(w)
    def fill(k,v):pg.fill('#au-'+k,v)
    print('auth shown',pg.locator('#auth').count())
    act('tosignup');fill('first','Alex');fill('last','Rivera');fill('email','Alex.Test@Example.com ');fill('pw','Budget!Day42');act('next1')
    pg.fill('#au-dob','1998-03-14');fill('phone','555 867 5309');fill('zip','30301');act('next2')
    for k in ['tos','privacy','esign']:pg.check('#auth input[data-au=%s]'%k)
    act('next3');code=pg.evaluate("(document.querySelector('#auth .audemo b')||{}).textContent");print('code shown',code);fill('code',code or '');act('verify',2500)
    print('signed in',pg.evaluate("JSON.parse(localStorage.getItem('sprout-accounts-v1')||'{}').cur"))
    pg.evaluate("document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')")
    pg.evaluate("document.querySelector('header [data-settings]').click()");W(700);pg.evaluate("document.querySelector('#x-body [data-x=signout]').click()");W(3000)
    act('tologin');fill('email','nick.test@example.com');fill('pw','Budget!Day42');act('login',3000)
    print('after login cur',pg.evaluate("JSON.parse(localStorage.getItem('sprout-accounts-v1')||'{}').cur"),'| err:',pg.evaluate("(document.querySelector('#auth .auerr, #auth [role=alert]')||{}).innerText"))
    print('errors',errs[:3]);b.close()
