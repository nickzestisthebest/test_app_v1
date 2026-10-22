import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':1280,'height':800})
    pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(800)
    print(pg.evaluate("""(()=>{const e=document.querySelector('.ctas');const out=[];for(const sh of document.styleSheets){let rs;try{rs=sh.cssRules}catch(_){continue}for(const r of rs){if(r.selectorText){try{if(e.matches(r.selectorText))out.push(r.cssText.slice(0,140))}catch(_){}}}}
     const p=e.parentElement;return [out,p.getBoundingClientRect().height,getComputedStyle(p).display]})()"""))
