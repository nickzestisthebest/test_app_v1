import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(5000)
    print(pg.evaluate("""(()=>{const o=document.getElementById('ov'),g=[...document.querySelectorAll('*')].find(e=>e.children.length==0&&/Good afternoon|Good morning|Good evening/.test(e.textContent));let c=g,ch=[];while(c){ch.push((c.id||'')+'.'+c.className);c=c.parentElement}
      return {ovp:!!o.offsetParent,ovpos:getComputedStyle(o).position,ovh:o.offsetHeight,chain:ch.slice(0,6)}})()"""))
    b.close()
