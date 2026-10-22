import os, csv, json, sys
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'
rows=list(csv.DictReader(open('../csvin/tx.csv')))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':390,'height':844});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto(URL);pg.wait_for_timeout(2500)
    pg.evaluate(open('t59_seed.js').read(),rows)
    S=pg.evaluate
    S("__T.closeSheets()");pg.wait_for_timeout(300)
    for code in sys.argv[1:]:
        r=S(code);pg.wait_for_timeout(900)
        if r is not None: print(json.dumps(r)[:3000])
    pg.screenshot(path='probe/p2.png',full_page=False)
    print('errors',errs[:3]);b.close()
