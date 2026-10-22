# Ask can start Cancel for me (claude.ai demo mode): understands the request, checks what Sprout can do, needs a clear yes
import os, json
from playwright.sync_api import sync_playwright
R=[]
def ck(n,c,d=''):R.append(bool(c));print('PASS' if c else 'FAIL',n,'' if c else str(d)[:300])
STUB="""window.localStorage.setItem('sprout-debug','1');window.__ai=[];window.claude={use:async n=>{if(n==='sample')return {limits:async()=>({images:false}),json:async(p)=>{window.__ai.push(p);const note=p.slice(p.lastIndexOf('Their note:')+12);
  if(/go away/i.test(note))return {reply:'Sure.',actions:[{type:'cancel_subscription',name:'Netflix'}]};return {reply:'Stub AI answer.',actions:[]}}};throw new Error('x')}}"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script(STUB)
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(5500)
    W=pg.wait_for_timeout;S=pg.evaluate
    S("window.state.x2.plus={on:1,bill:'yr',start:Date.now()}");W(300)
    subs=S("__S.BR.cancelAsk('cancel').buttons.map(b=>b.label)")
    print('demo subscriptions:',subs)
    def ask(q,w=900):
        pg.evaluate("(q)=>{const i=document.getElementById('cmd-in');i.value=q;const g=document.getElementById('cmd-go');g.disabled=false;g.click()}",q);W(w)
        return pg.evaluate("(()=>{const b=[...document.querySelectorAll('#cmd-out .bub.ai')];const l=b[b.length-1];return l?{t:l.innerText,btn:[...l.querySelectorAll('.askbtns .sbtn')].map(x=>x.textContent)}:{t:'',btn:[]}})()")
    pg.click('#open-ask');W(800)
    a=ask('cancel my Spotify subscription')
    ck('understands "cancel my Spotify subscription"','I can cancel Spotify' in a['t'] and 'Review and cancel' in a['btn'],a)
    ck('says it will ask first','confirm on the next screen' in a['t'],a['t'])
    ck('answered on the phone, no AI call',S("window.__ai.length")==0)
    pg.screenshot(path='../cx_ask.png')
    pg.click('#cmd-out .askbtns [data-x=askgo]');W(1200)
    ck('opens Cancel for me for Spotify',pg.inner_text('#x-t')!='' and 'Spotify' in pg.inner_text('#x-body') and pg.locator('#cx-ok').count()==1,pg.inner_text('#x-body')[:200])
    body=pg.inner_text('#x-body')
    ck('explains: never asks for password','never ask for your Spotify password' in body)
    ck('explains: not affiliated','isn’t affiliated with Spotify' in body)
    ck('explains: refunds up to them','usually aren’t refunded' in body)
    ck('name and email prefilled',S("document.getElementById('cx-email').value.includes('@')"),S("document.getElementById('cx-email').value"))
    pg.screenshot(path='../cx_page.png',full_page=True)
    pg.click('#x-body [data-x=runcancel]');W(1500)
    ck('nothing happens without the box ticked',S("(window.state.x2.subs.spotify||{}).s")!='cancelled' and 'Tick the box' in S("document.getElementById('toast').textContent"))
    pg.check('#cx-ok');pg.click('#x-body [data-x=runcancel]');W(5200)
    st=S("window.state.x2.subs.spotify")
    ck('cancels after a clear yes (demo)',st and st.get('s')=='cancelled',st)
    ck('authorization recorded with its wording and time',st and st.get('auth',{}).get('text','').startswith('I authorize Sprout to contact Spotify') and st['auth'].get('at') and st['auth'].get('v'),st)
    S("window.__T.closeSheets()");W(600);pg.click('#open-ask');W(700)
    a=ask('cancel spotify')
    ck('knows it is already cancelled','already cancelled' in a['t'],a)
    for q,want in [('can you get rid of my netflix','I can cancel Netflix'),('how do I cancel hulu','Hulu'),('unsubscribe from audible','Audible'),
                   ('cancel my rent','can’t cancel rent'),('cancel my car insurance','can’t cancel insurance'),('cancel my phone plan','Lower my bills'),
                   ('cancel peloton','don’t see Peloton among your subscriptions'),('cancel my streaming services','Which one'),('cancel','Nothing changed'),('cancel my subscriptions','Which one')]:
        a=ask(q);ck('"%s"'%q,want in a['t'] or want in ' '.join(a['btn']),a)
    a=ask('lower my internet bill')
    ck('"lower my internet bill" goes to Lower my bills','Open Lower my bills' in a['btn'],a)
    n0=S("window.__ai.length")
    a=ask('Should I cancel Netflix or Hulu?',1500)
    ck('judgment question goes to the AI',S("window.__ai.length")==n0+1 and 'Stub AI' in a['t'],a)
    a=ask('please make the streaming one go away',1500)
    ck('AI-understood cancel goes through the same checks','I can cancel Netflix' in a['t'] and 'Review and cancel' in a['btn'],a)
    ck('AI prompt lists the cancel action',S("window.__ai.length&&window.__ai[window.__ai.length-1].includes('cancel_subscription')"))
    pg.screenshot(path='../cx_ask2.png')
    ck('no errors',not errs,errs[:2])
    b.close()
print(sum(R),'/',len(R))
