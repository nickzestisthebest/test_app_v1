import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); pg=b.new_page(viewport={'width':390,'height':844}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append('console:'+m.text) if m.type in('error','warning') else None)
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html'); pg.wait_for_timeout(2500)
    pg.evaluate("__T.closeSheets()"); pg.wait_for_timeout(300)
    pg.evaluate("__T.ev(\"openSheet('sh-spend')\")"); pg.wait_for_timeout(600)
    print(pg.evaluate("[document.getElementById('ql-in').tagName, !!document.getElementById('l4go'), document.getElementById('sh-spend').dataset.l4]"))
    pg.fill('#ql-in','12 at chipotle and 40 gas yesterday'); pg.wait_for_timeout(600)
    print(pg.evaluate("[document.getElementById('ql-out').innerText.slice(0,200), (document.getElementById('l4go')||{}).outerHTML]"))
    print(errs[:6]); b.close()
