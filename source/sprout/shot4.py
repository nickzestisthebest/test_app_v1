# screenshots of pages on a seed: python3 shot4.py <seed> <page[:arg]> [page...]  (writes s4_<page>.png)
import os, csv, sys
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'; rows=list(csv.DictReader(open('../csvin/tx.csv')))
seed=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); pg=b.new_page(viewport={'width':390,'height':int(os.environ.get('VH','844'))},device_scale_factor=2); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL); pg.wait_for_timeout(2500)
    if seed!='none': pg.evaluate(open('seed_%s.js'%seed).read(), rows); pg.wait_for_timeout(700)
    pg.evaluate("__T.closeSheets();document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')"); pg.wait_for_timeout(300)
    for a in sys.argv[2:]:
        page,_,arg=a.partition(':')
        if page.startswith('tab='): pg.evaluate("__T.goHome()" if page[4:]=='home' else "__T.setTab(%r)"%page[4:]); pg.wait_for_timeout(600); pg.screenshot(path='s4_'+page[4:]+'.png',full_page=True); continue
        pg.evaluate("__T.xOpen(%r,%s)"%(page, repr(arg) if arg else 'undefined')); pg.wait_for_timeout(900)
        pg.screenshot(path='s4_'+page+'.png',full_page=True)
        try: print(page,'h=',pg.evaluate("document.querySelector('#x-body').scrollHeight"))
        except Exception as e: print(page,'ERR',e)
    print('ERRS',errs[:5]); b.close()
