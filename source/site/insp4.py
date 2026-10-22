import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':1280,'height':800})
    pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(800)
    print(pg.evaluate("(()=>{const c=document.querySelector('.ctas');c.style.alignItems='flex-start';const s=getComputedStyle(c);return [s.minHeight,s.paddingTop,s.paddingBottom,s.flexDirection,s.flexWrap,s.rowGap,s.columnGap,s.fontSize,s.lineHeight,s.writingMode,s.height]})()"))
