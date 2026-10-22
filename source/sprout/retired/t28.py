import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(1500)
    # render every stage side by side
    html=pg.evaluate("""(()=>{const out=[];const s=state.stk;for(const [st,b] of [[0,0],[1,3],[2,8],[3,40],[3,70],[4,120]]){s.best=b;out.push('<div style="width:300px;display:inline-block;background:linear-gradient(var(--sky),var(--mintcream));margin:4px;border-radius:16px">'+document.querySelector('#ov svg[aria-label^="Your"]').outerHTML.replace(/.*/s,'')+'</div>')}return ''})()""")
    pg.evaluate("document.querySelector('[aria-label=\"Your Sprout\"]').scrollIntoView({block:'center'})");pg.wait_for_timeout(500)
    el=pg.query_selector('[aria-label="Your Sprout"]');el.screenshot(path='tree_card.png')
    print(errs)
