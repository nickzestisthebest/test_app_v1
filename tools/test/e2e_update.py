"""An open copy of the app notices a new deploy when it comes back to the screen, and loads it.
Run tools/test/run_servers.sh first."""
import os, re
from playwright.sync_api import sync_playwright
BASE = 'http://localhost:3000'
SW = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'sw.js')
TV = re.search(r"const TERMS_V='([^']+)'", open(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'sprout', 'acct.js')).read()).group(1)
SEED = """(()=>{try{const L=localStorage;L.setItem('sprout-debug','1');if(!L.getItem('sprout-accounts-v1'))L.setItem('sprout-accounts-v1',JSON.stringify({cur:'t1',list:{t1:{id:'t1',first:'Nick',last:'S',email:'up@example.com',phone:'(555) 222-3333',dob:'1990-01-01',zip:'30301',salt:'s',pwh:'x',created:1,fidAsked:1,agree:{v:'__TV__',at:1,tos:true,privacy:true,esign:true}}}}));if(!L.getItem('sprout-server-code::t1'))L.setItem('sprout-server-code::t1','owner-code-1234')}catch(e){}})()""".replace('__TV__', TV)
R = []
def ck(n, c, i=''): R.append(('PASS ' if c else 'FAIL ') + n + ('' if c else ' ' + str(i)[:200]))
orig = open(SW).read()
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, service_workers='allow'); ctx.add_init_script(SEED)
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(BASE); pg.wait_for_timeout(7000)
        print('open sheets:', pg.evaluate("[...document.querySelectorAll('.sheet.on')].map(s=>s.id)"))
        pg.evaluate("__S.closeSheets()"); pg.wait_for_timeout(600)
        ck('build id matches the deployed version', pg.evaluate("window.SPROUT_BUILD") in orig)
        pg.evaluate("window.__still=1"); pg.wait_for_timeout(300)
        # same version: coming back to the app does nothing
        pg.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(2500)
        ck('no reload when nothing changed', pg.evaluate("window.__still===1"))
        # a new deploy lands while the app sits in the background
        open(SW, 'w').write(re.sub(r"sprout-[a-f0-9]+", 'sprout-0123456789', orig, count=1))
        pg.evaluate("window.__T0=Date.now();document.dispatchEvent(new Event('visibilitychange'))")
        try: pg.wait_for_function("!window.__still", timeout=8000)
        except Exception: pass
        ck('reloads into the new version when the app comes back', pg.evaluate("!window.__still"))
        pg.wait_for_timeout(4000)
        pg.evaluate("window.__still=2;Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(3000)
        ck('reloads only once if the phone still has the old copy (no loop)', pg.evaluate("window.__still===2"))
        ck('then offers an Update button instead', 'new version of Sprout is ready' in (pg.evaluate("(document.getElementById('toast')||{}).innerText") or ''), pg.evaluate("(document.getElementById('toast')||{}).innerText"))
        ck('no page errors', not errs, errs[:2])
        b.close()
finally:
    open(SW, 'w').write(orig)
print('\n'.join(R)); print(sum(r.startswith('PASS') for r in R), '/', len(R))
