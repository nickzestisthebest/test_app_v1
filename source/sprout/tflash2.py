import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
    pg=ctx.new_page();pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400);pg.click('[data-wact=demo2]');pg.wait_for_timeout(3000)
    pg.evaluate("c=>{const d=document.createElement('div');d.id='syncfx';d.style.cssText='position:fixed;inset:0;z-index:999999;background:'+c;document.body.appendChild(d)}",'#ff00ff')
    pg.wait_for_timeout(200);pg.screenshot(path='tf2.png')
    print(pg.evaluate("(()=>{const d=document.getElementById('syncfx');const r=d.getBoundingClientRect();const s=getComputedStyle(d);return [r.width,r.height,s.display,s.visibility,s.opacity,document.elementFromPoint(200,400).id||document.elementFromPoint(200,400).className]})()"))
