# full-app crawl: tap every button on every screen, page and sheet; fail on errors or broken text
import os,re,sys
from playwright.sync_api import sync_playwright
MODE=sys.argv[1] if len(sys.argv)>1 else 'thriving'
BAD=re.compile(r'\bundefined\b|\bNaN\b|\[object |\bInfinity\b|\$-0\.00')
SKIP={'signout','acctdelgo','wipe','avdel'}
issues=[];clicks=0
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},has_touch=False);errs=[]
    pg.on('pageerror',lambda e:errs.append('JS: '+str(e.stack)[:400]))
    pg.on('console',lambda m:errs.append('C: '+m.text[:160]) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else 0)
    pg.on('dialog',lambda d:d.dismiss())
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};try{localStorage.setItem('sprout-lp-hint','1')}catch(e){}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3300)
    if MODE=='thriving':pg.click('[data-wact=demo2]')
    elif MODE=='starter':pg.click('[data-wact=demo]')
    pg.wait_for_timeout(2500);pg.evaluate("document.body.classList.remove('noai')")
    W=pg.wait_for_timeout
    def badtext():
        t=pg.evaluate("document.body.innerText");m=BAD.findall(t)
        if m:
            i=BAD.search(t).start();return t[max(0,i-60):i+30].replace('\n',' | ')
    def reset():
        pg.keyboard.press('Escape')
        pg.evaluate("""(()=>{try{__T.lpClose()}catch(e){}try{__T.closeSheets()}catch(e){}document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on')});document.body.classList.remove('lock');
          document.querySelectorAll('#lock,.loaderr,.cfm,.modal.on').forEach(e=>e.remove());try{__T.goHome()}catch(e){}window.scrollTo(0,0)})()""");W(250)
    def note(where):
        global errs
        if errs:issues.append((where,'; '.join(dict.fromkeys(errs))[:300]));errs=[]
        bt=badtext()
        if bt:issues.append((where,'bad text: '+bt))
    def vis_buttons(scope):
        return pg.evaluate("""(sc)=>{const r=[];document.querySelectorAll(sc).forEach((root)=>{root.querySelectorAll('button,[data-x],[role=button],summary,a[href^="#"],label.chip,.xtile').forEach(e=>{const b=e.getBoundingClientRect();
          if(b.width<2||b.height<2||e.disabled||e.closest('[hidden]'))return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.pointerEvents==='none')return;
          const k=(e.dataset.x||'')+'|'+(e.dataset.v||'')+'|'+(e.id||'')+'|'+(e.textContent||'').trim().slice(0,30);r.push(k)})});return [...new Set(r)]}""",scope)
    def click_key(scope,k):
        return pg.evaluate("""([sc,k])=>{for(const root of document.querySelectorAll(sc)){for(const e of root.querySelectorAll('button,[data-x],[role=button],summary,a[href^="#"],label.chip,.xtile')){const b=e.getBoundingClientRect();if(b.width<2||e.disabled||e.closest('[hidden]'))continue;
          const kk=(e.dataset.x||'')+'|'+(e.dataset.v||'')+'|'+(e.id||'')+'|'+(e.textContent||'').trim().slice(0,30);if(kk===k){e.scrollIntoView({block:'center'});e.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));return true}}}return false}""",[scope,k])
    def crawl(name,setup,scope,cap=60):
        global clicks
        reset();setup();W(450);note(name+' (open)')
        keys=vis_buttons(scope)[:cap]
        for k in keys:
            if k.split('|')[0] in SKIP:continue
            reset();setup();W(350)
            try: ok=click_key(scope,k)
            except Exception as ex: issues.append((name+' > '+k,'crawler: '+str(ex)[:120]));continue
            clicks+=1;W(450)
            if ok:note(name+' > '+k)
    # main screens
    crawl('Home',lambda:None,'#ov, header.top')
    crawl('Finances',lambda:pg.evaluate("__T.setTab('money')"),'#pg')
    crawl('Community',lambda:pg.evaluate("__T.setTab('community')"),'#pg')
    crawl('Tab bar',lambda:None,'.tabbar')
    # every page in the sheet router
    pages=pg.evaluate("Object.keys(__T.PAGES)")
    NEEDARG={'cancel','negogo','comments','q','group','member','chat','post','sub','bill','debt','goal','cat','merchant','thread','txn','tx','league','buddy'}
    for n in pages:
        if n in NEEDARG:continue
        crawl('Page '+n,lambda n=n:pg.evaluate("__T.xOpen(%r)"%n),'#x-body',40)
    # sheets with their own buttons
    for sid,opener in [('sh-spend','#open-spend'),('sh-ask','#open-ask')]:
        crawl('Sheet '+sid,lambda o=opener:pg.evaluate("document.querySelector(%r)&&document.querySelector(%r).click()"%(o,o)),'#'+sid,40)
    b.close()
print('MODE',MODE,'clicks',clicks,'issues',len(issues))
for w,m in issues:print(' -',w,'::',m)
