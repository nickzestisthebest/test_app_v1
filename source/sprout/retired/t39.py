import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
    pg.click('[data-settings]');pg.wait_for_timeout(600);pg.click('#x-body [data-v=profile]');pg.wait_for_timeout(500)
    print(pg.evaluate("""(()=>{const i=document.getElementById('pf-name'),l=i.parentElement,f=l.parentElement;const c=e=>{const s=getComputedStyle(e);return [e.tagName,e.className,s.display,s.flex,s.height,s.minHeight,s.padding,s.lineHeight].join(' | ')};return [c(i),c(l),c(f)]})()"""))
