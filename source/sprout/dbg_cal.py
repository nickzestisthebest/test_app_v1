import os,csv,json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); pg=b.new_page(viewport={'width':390,'height':844}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto('file://'+os.getcwd()+'/v2_test.html'); pg.wait_for_timeout(2500)
    pg.evaluate(open('seed_real.js').read(), list(csv.DictReader(open('../csvin/tx.csv')))); pg.wait_for_timeout(700); pg.evaluate("__T.closeSheets()"); pg.wait_for_timeout(300)
    pg.evaluate("__T.xOpen('calendar')"); pg.wait_for_timeout(600)
    pd=pg.evaluate("__T.ev(%s)"%json.dumps("fd(rows.find(r=>r.inc>0&&r.d0>realToday()).d0)")); print('payday',pd)
    pg.evaluate("document.querySelector('[data-x=calsel][data-v=\"%s\"]').click()"%pd); pg.wait_for_timeout(600)
    print(pg.evaluate("[document.querySelectorAll('#x-body .c4day').length, document.querySelector('#x-body .c4day')?document.querySelector('#x-body .c4day').innerText.slice(0,300):'none', getComputedStyle(document.querySelector('#x-body .c4day')||document.body).display]"))
    print(errs[:3]); b.close()
