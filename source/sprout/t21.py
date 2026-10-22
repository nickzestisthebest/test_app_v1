import os,sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v1_test.html');pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo]');pg.wait_for_timeout(1200)
    for t in ['#m-spend','#m-per']:
        pg.evaluate("document.querySelector('#ov [data-goto=\"%s\"]').scrollIntoView({block:'center'})"%t);pg.click('#ov [data-goto="%s"]'%t);pg.wait_for_timeout(700)
        pg.screenshot(path='pp_%s.png'%t[3:],full_page=True)
        pg.click('#fbar .fback');pg.wait_for_timeout(400)
