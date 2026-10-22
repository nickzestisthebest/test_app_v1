import os,json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
    for t in ['home','money','community']:
        pg.click(f'.tabbar [data-tab={t}]');pg.wait_for_timeout(700)
        r=pg.evaluate("""()=>{const out=[];document.querySelectorAll('section,.card,[data-focus],h1,h2,h3,.sec-h,.lbl').forEach(e=>{if(e.offsetParent===null)return;const t=(e.querySelector&&e.matches('h1,h2,h3,.sec-h,.lbl'))?e.textContent.trim():'';const id=e.id||'';const df=e.getAttribute('data-focus')||'';if(t||id||df)out.push((e.tagName+'#'+id+' ['+df+'] '+t).slice(0,120))});return out}""")
        print('=====',t);print('\n'.join(r))
        pg.screenshot(path=f'tab_{t}.png',full_page=True)
    print(errs)
