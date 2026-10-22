import os, sys
from playwright.sync_api import sync_playwright
pre=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for w in [1280,390]:
        mob=w<500
        ctx=b.new_context(viewport={'width':w,'height':844 if mob else 900},is_mobile=mob,has_touch=mob,color_scheme='dark')
        pg=ctx.new_page();pg.goto('file://'+os.getcwd()+'/qa_std.html');pg.wait_for_timeout(1000)
        pg.add_style_tag(content='.nav{visibility:hidden}')
        for s in ['features','pricing','streak','ask']:
            pg.evaluate(f"document.getElementById('{s}').scrollIntoView()");pg.wait_for_timeout(600)
            if s=='features':
                for c in ['#cats','#debt','.c-e','.c-h','.c-f']:
                    pg.evaluate(f"document.querySelector('{c}').scrollIntoView({{block:'center'}})");pg.wait_for_timeout(400)
                pg.wait_for_timeout(1800)
            pg.query_selector('#'+s).screenshot(path=f'{pre}_{s}_{w}.png')
        ctx.close()
    # short laptop viewport, sticky stages
    for (w,h) in [(1280,720),(1440,800)]:
        ctx=b.new_context(viewport={'width':w,'height':h});pg=ctx.new_page();pg.goto('file://'+os.getcwd()+'/qa_std.html');pg.wait_for_timeout(800)
        for s,f in [('how',.5),('grow',.6)]:
            pg.evaluate(f"(()=>{{const e=document.getElementById('{s}');window.scrollTo(0,e.offsetTop+e.offsetHeight*{f})}})()");pg.wait_for_timeout(900)
            pg.screenshot(path=f'{pre}_{s}_{w}x{h}.png')
        ctx.close()
