import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1,color_scheme='light');errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};try{localStorage.setItem('sprout-lp-hint','1')}catch(e){}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(6500)
    pg.evaluate("(()=>{const x=window.state.x2;x.plus={on:1,start:Date.now(),bill:'yr'};x.soc=x.soc||{};x.soc.gAgree=Date.now();x.soc.welx=1})()")
    pg.click('.tabbar [data-tab=money]');pg.wait_for_timeout(500);pg.click('.tabbar [data-tab=home]');pg.wait_for_timeout(900)
    pg.evaluate("const t=document.getElementById('toast');if(t)t.classList.remove('on','act')")
    pg.screenshot(path='/tmp/claude-0/-home-claude/5314556e-0af2-50e5-b390-023f01a81bfc/scratchpad/ph.png',full_page=True)
    print(errs, pg.evaluate("[...document.querySelectorAll('#pg > *, #pg .ovcard')].slice(0,30).map(e=>e.className).join(' | ')"))
    b.close()
