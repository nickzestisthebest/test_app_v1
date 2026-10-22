import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':1280,'height':800})
    pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(800)
    print(pg.evaluate("""(()=>{const c=document.querySelector('.ctas');const r=[];c.style.display='block';r.push(c.getBoundingClientRect().height);c.style.display='flex';c.style.flexWrap='nowrap';r.push(c.getBoundingClientRect().height);c.style.flexWrap='';
      const a=c.children[0];r.push(getComputedStyle(a).transition);r.push(getComputedStyle(a).borderRadius);r.push(JSON.stringify(a.getClientRects().length));return r})()"""))
