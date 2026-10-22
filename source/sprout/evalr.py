# evaluate JS expressions against the realistic seed: python3 evalr.py "expr" ...
import os, csv, sys, json
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'; rows=list(csv.DictReader(open('../csvin/tx.csv')))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); pg=b.new_page(viewport={'width':390,'height':844}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL); pg.wait_for_timeout(2500)
    if os.environ.get('SEED','real')!='none': pg.evaluate(open('seed_%s.js'%os.environ.get('SEED','real')).read() if os.environ.get('SEED','real')!='nick' else open('nick_seed.js').read(), rows); pg.wait_for_timeout(600)
    for e in sys.argv[1:]:
        try: print(json.dumps(pg.evaluate("(()=>{return __T.ev(%s)})()"%json.dumps(e)),indent=None)[:6000])
        except Exception as x: print('ERR',str(x)[:300])
    print('ERRS',errs[:3]); b.close()
