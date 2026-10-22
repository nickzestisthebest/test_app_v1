import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':390,'height':844},record_video_dir='/tmp/claude-0/-home-claude/5314556e-0af2-50e5-b390-023f01a81bfc/scratchpad/site/tf',record_video_size={'width':390,'height':844})
    pg=ctx.new_page();pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(2000)
    pg.evaluate("c=>{const d=document.createElement('div');d.id='syncfx';d.style.cssText='position:fixed;inset:0;z-index:999999;background:'+c;document.body.appendChild(d)}",'#ff00ff')
    pg.screenshot(path='tf.png');pg.wait_for_timeout(600);pg.evaluate("document.getElementById('syncfx').remove()");pg.wait_for_timeout(800)
    pg.close();print(pg.video.path());ctx.close()
