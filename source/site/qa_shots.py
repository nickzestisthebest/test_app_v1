import os, sys
from playwright.sync_api import sync_playwright
# usage: python3 qa_shots.py PREFIX [widths...]
# renders a standards-mode copy of bonsai_site.html (doctype + viewport, like the published wrapper)
pre = sys.argv[1] if len(sys.argv) > 1 else 'qa'
widths = [int(w) for w in sys.argv[2:]] or [1280, 390]
src = open('bonsai_site.html').read()
open('qa_std.html', 'w').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + src)
SECS = ['hero', 'marquee', 'spend', 'snap', 'ask', 'tour', 'how', 'grow', 'streak', 'community', 'features', 'privacy', 'pricing', 'join', 'footer']
SEL = {'hero': '.hero', 'marquee': '.marquee', 'footer': 'footer'}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for w in widths:
        mob = w < 500
        ctx = b.new_context(viewport={'width': w, 'height': 844 if mob else 900}, is_mobile=mob, has_touch=mob, device_scale_factor=1)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + os.getcwd() + '/qa_std.html'); pg.wait_for_timeout(1200)
        sw = pg.evaluate('document.documentElement.scrollWidth')
        over = pg.evaluate('''()=>{const W=innerWidth,out=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>W+1){let p=e.parentElement,clip=false;while(p&&p!==document.body){const o=getComputedStyle(p);if(/hidden|clip/.test(o.overflowX)){clip=true;break}p=p.parentElement}if(!clip)out.push((e.className||e.tagName)+':'+Math.round(r.right))}});return out.slice(0,8)}''')
        print(w, 'scrollWidth', sw, 'overflowing', over, 'errors', errs)
        pg.add_style_tag(content='.nav{visibility:hidden}')
        for s in SECS:
            sel = SEL.get(s, '#' + s)
            if s in ('how', 'grow'):
                pg.evaluate(f"(()=>{{const e=document.querySelector('{sel}');window.scrollTo(0,e.offsetTop+e.offsetHeight*.45)}})()"); pg.wait_for_timeout(900)
                pg.screenshot(path=f'{pre}_{s}_{w}.png')
                continue
            pg.evaluate(f"document.querySelector('{sel}').scrollIntoView()"); pg.wait_for_timeout(1500 if s in ('features', 'spend', 'streak') else 700)
            if s == 'features':
                # make sure every bento card animation has fired
                for c in ['#cats', '#debt', '.c-e', '.c-h', '.c-f']:
                    pg.evaluate(f"document.querySelector('{c}').scrollIntoView({{block:'center'}})"); pg.wait_for_timeout(500)
                pg.wait_for_timeout(1800)
            pg.query_selector(sel).screenshot(path=f'{pre}_{s}_{w}.png')
        ctx.close()
