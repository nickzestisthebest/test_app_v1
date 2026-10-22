import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':1000,'height':560},device_scale_factor=1.5)
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
    pg.evaluate("""(()=>{const s=state.stk,old=s.best;let h='';for(const [st,b] of [[0,0],[1,3],[2,8],[3,20],[3,70],[4,120]]){s.best=b;h+='<div style="width:300px;display:inline-block;vertical-align:top;background:linear-gradient(#dff3e6,#f6fbf8);margin:6px;border-radius:16px;overflow:hidden">'+__tree(st)+'</div>'}s.best=old;
      const d=document.createElement('div');d.id='grid';d.style.cssText='position:fixed;inset:0;z-index:999;background:#fff;padding:8px';d.innerHTML=h;document.body.appendChild(d)})()""")
    pg.wait_for_timeout(300);pg.screenshot(path='tree_grid.png')
