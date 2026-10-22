import os
from playwright.sync_api import sync_playwright
# Extra QA checks for the cross-browser / charts pass. Loads bonsai_site.html in standards mode
# (doctype + viewport, like the published wrapper) and in quirks mode (raw file, like tsite.py).
R = []
def chk(c, m): R.append(('PASS ' if c else 'FAIL ') + m)
src = open('bonsai_site.html').read()
open('qa_std.html', 'w').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + src)
STD = 'file://' + os.getcwd() + '/qa_std.html'
SPANS = {1280: [3, 3, 2, 2, 2, 2, 2, 2, 6, 6], 768: [3, 3, 3, 3, 3, 3, 3, 3, 6, 6], 390: [6] * 10}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for w in [360, 390, 768, 1024, 1280, 1440]:
        mob = w < 500
        ctx = b.new_context(viewport={'width': w, 'height': 844 if mob else 900}, is_mobile=mob, has_touch=mob)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(STD); pg.wait_for_timeout(700)
        H = pg.evaluate('document.body.scrollHeight')
        for y in range(0, H, 700): pg.evaluate(f"window.scrollTo({{top:{y},behavior:'instant'}})"); pg.wait_for_timeout(40)
        pg.wait_for_timeout(500)
        sw = pg.evaluate('document.documentElement.scrollWidth')
        over = pg.evaluate('''()=>{const W=innerWidth,out=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>W+1){let p=e.parentElement,clip=false;while(p&&p!==document.body){if(/hidden|clip/.test(getComputedStyle(p).overflowX)){clip=true;break}p=p.parentElement}if(!clip)out.push(e.className||e.tagName)}});return out.slice(0,5)}''')
        chk(sw <= w and not over, f'{w}: no horizontal overflow (scrollWidth {sw}, overflowing {over})')
        kids = pg.evaluate("[...document.querySelector('.bento').children].map(c=>c.classList.contains('card')?parseInt(getComputedStyle(c).gridColumnStart.replace('span ',''))||0:-1)")
        chk(len(kids) == 10 and -1 not in kids, f'{w}: .bento has 10 cards as direct children')
        if w in SPANS: chk(kids == SPANS[w], f'{w}: bento spans {kids}')
        # rows balanced: cards that share a row have equal heights
        rows = pg.evaluate("(()=>{const m={};[...document.querySelectorAll('.bento>.card')].forEach(c=>{const r=c.getBoundingClientRect();const k=Math.round(r.top);(m[k]=m[k]||[]).push(Math.round(r.height))});return Object.values(m)})()")
        chk(all(max(r) - min(r) <= 1 for r in rows), f'{w}: bento rows have equal card heights')
        if not mob:
            nav = pg.evaluate("document.querySelector('.nav .wrap').scrollHeight<=61&&document.querySelector('.nav .btn').offsetHeight<60")
            chk(nav, f'{w}: nav fits on one line')
        chk(not errs, f'{w}: no script errors {errs[:2]}')
        ctx.close()
    # short laptop screens: sticky stages fit below the nav
    for (w, h) in [(1280, 720), (1440, 800)]:
        pg = b.new_page(viewport={'width': w, 'height': h}); pg.goto(STD); pg.wait_for_timeout(500)
        for sid in ['how', 'grow']:
            pg.evaluate(f"(()=>{{const e=document.getElementById('{sid}');window.scrollTo({{top:e.getBoundingClientRect().top+scrollY+e.offsetHeight*.5,behavior:'instant'}})}})()"); pg.wait_for_timeout(400)
            r = pg.evaluate(f"(()=>{{const s=document.querySelector('#{sid} .stick');let t=1e9,bt=0;s.querySelectorAll('*').forEach(e=>{{const r=e.getBoundingClientRect();if(r.height&&getComputedStyle(e).position!=='absolute'){{t=Math.min(t,r.top);bt=Math.max(bt,r.bottom)}}}});return [Math.round(t),Math.round(bt)]}})()")
            chk(r[0] >= 60 and r[1] <= h, f'{w}x{h}: #{sid} sticky content fits ({r[0]}..{r[1]})')
        pg.close()
    # fallbacks: content visible without animation support, no crashes on older APIs
    for name, init, rm in [('reduced motion', '', 'reduce'), ('no IntersectionObserver', 'delete window.IntersectionObserver;', 'no-preference'),
                           ('no MediaQueryList.addEventListener (Safari 13)', 'delete MediaQueryList.prototype.addEventListener;', 'no-preference'),
                           ('no ResizeObserver', 'delete window.ResizeObserver;', 'no-preference')]:
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, reduced_motion=rm); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        if init: pg.add_init_script(init)
        pg.goto(STD); pg.wait_for_timeout(800)
        vis = pg.evaluate("""(()=>{const q=s=>document.querySelector(s),cs=e=>getComputedStyle(e);const ln=q('#dplot .line');
          const anim=document.documentElement.classList.contains('anim');
          return anim || (cs(ln).strokeDashoffset==='0px' && parseFloat(cs(q('.hbars u')).width)>20 && parseFloat(cs(q('.sprow u')).width)>20 && cs(q('.hold-menu')).opacity==='1')})()""")
        chk(vis and not errs, f'{name}: loads without errors, charts visible {errs[:1]}')
        ctx.close()
    # background tab: the Ask demo stops while hidden and resumes after
    HIDE = "(h=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>h});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>h?'hidden':'visible'});document.dispatchEvent(new Event('visibilitychange'))})"
    pg = b.new_page(viewport={'width': 1280, 'height': 900}); pg.goto(STD); pg.wait_for_timeout(500)
    pg.evaluate("document.getElementById('ask').scrollIntoView()"); pg.wait_for_timeout(2500)
    pg.evaluate(HIDE + '(true)'); a = pg.inner_html('#chlog'); pg.wait_for_timeout(7000); a2 = pg.inner_html('#chlog')
    pg.evaluate(HIDE + '(false)'); pg.wait_for_timeout(2600); a3 = pg.inner_html('#chlog')
    chk(a == a2 and 'typing' not in a2 and a3 != a2, 'ask demo pauses in a hidden tab and resumes')
    pg.close()
print('\n'.join(R)); print(sum(r.startswith('PASS') for r in R), '/', len(R), 'passed')
