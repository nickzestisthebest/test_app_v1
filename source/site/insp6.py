import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':1280,'height':800})
    pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(800)
    print(pg.evaluate("""(()=>{const c=document.querySelector('.ctas');const a=c.children[0];const R=x=>{const r=x.getBoundingClientRect();return [Math.round(r.top),Math.round(r.height),Math.round(r.width)]};
      return [R(c),R(a),R(c.children[1]),R(c.previousElementSibling),R(c.nextElementSibling),getComputedStyle(a).height,getComputedStyle(a).maxHeight,getComputedStyle(a).paddingBlock, getComputedStyle(a).aspectRatio, getComputedStyle(a).fontFamily]})()"""))
