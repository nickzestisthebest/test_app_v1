import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':1280,'height':800})
    pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(800)
    print(pg.evaluate("(()=>{const c=document.querySelector('.ctas');c.style.alignItems='flex-start';const a=c.children[0];const r=a.getBoundingClientRect();const cs=getComputedStyle(a);return [r.height,cs.paddingTop,cs.fontSize,cs.lineHeight,cs.minHeight,cs.blockSize,a.scrollHeight]})()"))
    print(pg.evaluate("(()=>{const a=document.querySelector('.nav .btn');return a.getBoundingClientRect().height})()"))
