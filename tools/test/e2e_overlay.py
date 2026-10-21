"""Connecting a bank with Plaid's sign-in as an overlay inside Sprout (Plaid Link is stood in for here).
Run tools/test/run_servers.sh first."""
import os, re, json, urllib.request
from playwright.sync_api import sync_playwright
BASE='http://localhost:3000'; MOCK='http://127.0.0.1:4010'
HERE=os.path.dirname(os.path.abspath(__file__))
TV=re.search(r"const TERMS_V='([^']+)'",open(os.path.join(HERE,'..','..','..','sprout','acct.js')).read()).group(1)
SEED="""(()=>{try{const L=localStorage;L.setItem('sprout-debug','1');if(!L.getItem('sprout-accounts-v1'))L.setItem('sprout-accounts-v1',JSON.stringify({cur:'t1',list:{t1:{id:'t1',first:'Ov',last:'L',email:'ov@example.com',phone:'(555) 222-3333',dob:'1990-01-01',zip:'30301',salt:'s',pwh:'x',created:1,fidAsked:1,agree:{v:'__TV__',at:1,tos:true,privacy:true,esign:true}}}}));if(!L.getItem('sprout-server-code::t1'))L.setItem('sprout-server-code::t1','owner-code-1234')}catch(e){}})()""".replace('__TV__',TV)
# Plaid Link stand-in: opens, "signs in", and hands back a public token like the real overlay does
FAKE="""window.Plaid={create:o=>({open:()=>{window.__opened=(window.__opened||0)+1;setTimeout(()=>o.onSuccess(window.__pt,{institution:{name:'First Platypus Bank'}}),300)}})};"""
R=[]
def ck(n,c,i=''):R.append(('PASS ' if c else 'FAIL ')+n+('' if c else ' '+str(i)[:300]))
def mock(path,body=None):
    req=urllib.request.Request(MOCK+path,data=json.dumps(body).encode() if body is not None else None,headers={'Content-Type':'application/json'});return json.loads(urllib.request.urlopen(req).read() or b'{}')
mock('/reset',{})
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,service_workers='block');ctx.add_init_script(SEED);ctx.add_init_script(FAKE)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));W=pg.wait_for_timeout;S=pg.evaluate
    pg.goto(BASE);W(5000);S("__S.closeSheets()");W(400);S("__S.lkOpen()");W(1500)
    pt=mock('/control?op=public',{})['public_token'];pg.evaluate("t=>{window.__pt=t}",pt)
    url0=pg.url;pg.click('[data-lv=add]')
    for i in range(40):
        W(500)
        if pg.locator('#lk-body').count() and 'Paycheck' in pg.inner_text('#lk-body'):break
    ck('Plaid opened as an overlay, the app never left the page',S("window.__opened")==1 and pg.url.split('?')[0]==url0.split('?')[0],(S("window.__opened"),pg.url))
    ck('bank read after the overlay closed','paycheck' in pg.inner_text('#lk-body').lower(),pg.inner_text('#lk-body')[:200])
    ck('Plaid page still offered as a fallback',S("__S.LV&&1")==1)
    pg.click('[data-lk=finish]');W(2500)
    ck('linked for real',S("!!(__S.st().link&&__S.st().link.live&&__S.st().spend.length>50)"))
    ck('no page errors',not errs,errs[:3]);b.close()
print('\n'.join(R));print(sum(r.startswith('PASS') for r in R),'/',len(R))
