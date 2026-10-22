import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(2500)
    pg.evaluate("document.querySelector('.leftc').scrollIntoView({block:'center'})");pg.wait_for_timeout(400);pg.screenshot(path='ez_left.png')
    pg.click('.leftc');pg.wait_for_timeout(600);print('budgets:', pg.evaluate("[document.getElementById('x-t').textContent, document.getElementById('sh-x').hidden, document.body.className]"));pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    pg.evaluate("document.body.classList.remove('noai')");pg.click('#open-ask');pg.wait_for_timeout(600);print('chips:',pg.evaluate("[...document.querySelectorAll('#cmd-ex .chip')].map(c=>c.textContent)"));pg.screenshot(path='ez_ask.png');pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    pg.click('.tabbar [data-tab=community]');pg.wait_for_timeout(600);pg.screenshot(path='ez_comm.png')
    pg.click('#pg [data-x=welx]');pg.wait_for_timeout(300);print('welcome dismissed:',pg.query_selector('.welc') is None)
    pg.click('#pg [data-x=seg][data-v=qa]');pg.wait_for_timeout(400);print('qa has new:', 'never made a budget' in pg.inner_text('#pg'))
    print(errs)
