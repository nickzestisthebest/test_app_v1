import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':1280,'height':800})
    pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(800)
    print(pg.evaluate("""(()=>{const a=document.querySelector('.ctas .btn');const sh=[...document.styleSheets].find(s=>{try{return s.cssRules.length>20}catch(e){return false}});const rules=[...sh.cssRules].map(r=>r.cssText);
      for(let i=rules.length-1;i>=0;i--){const t=sh.cssRules[i].cssText;sh.deleteRule(i);const h=a.getBoundingClientRect().height;if(h<100){return 'culprit: '+t.slice(0,300)}}return 'none'})()"""))
