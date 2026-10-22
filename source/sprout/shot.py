# screenshots of chosen screens with a seed: python3 shot.py [seed] name:js ...   (js opens the screen)
import os, csv, sys
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'; rows=list(csv.DictReader(open('../csvin/tx.csv')))
seed=sys.argv[1]; os.makedirs('shots22',exist_ok=True); theme=os.environ.get('THEME','light')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); pg=b.new_page(viewport={'width':390,'height':int(os.environ.get('H','844'))},color_scheme=theme); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL); pg.wait_for_timeout(2500)
    pg.evaluate(open('nick_seed.js' if seed=='nick' else 'seed_%s.js'%seed).read(), rows); pg.wait_for_timeout(600)
    if theme=='dark': pg.evaluate("document.documentElement.dataset.theme='dark'")
    for a in sys.argv[2:]:
        n,js=a.split(':',1); pg.evaluate("__T.closeSheets()"); pg.wait_for_timeout(350)
        for part in js.split(';;'):
            pg.evaluate("(()=>{"+part+"})()"); pg.wait_for_timeout(500)
        pg.wait_for_timeout(300); full=os.environ.get('FULL')
        if full: pg.locator('#x-body').screenshot(path='shots22/%s.png'%n) if pg.is_visible('#x-body') else pg.screenshot(path='shots22/%s.png'%n,full_page=True)
        else: pg.screenshot(path='shots22/%s.png'%n)
    print('ERRS',errs[:3]); b.close()
