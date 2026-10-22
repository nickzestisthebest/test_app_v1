import os
from playwright.sync_api import sync_playwright
R=[]
def chk(c,m):R.append(('PASS ' if c else 'FAIL ')+m)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for name,vp in [('desk',{'width':1280,'height':800}),('mob',{'width':390,'height':844})]:
        pg=b.new_page(viewport=vp);errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'fonts.g' not in m.text and 'ERR_' not in m.text else None)
        pg.goto('file://'+os.getcwd()+'/bonsai_site.html');pg.wait_for_timeout(1500)
        chk(pg.evaluate("document.documentElement.scrollWidth")<=vp['width'],name+' no horizontal scroll')
        chk(pg.evaluate("document.querySelectorAll('#bonsai svg').length")==5,name+' 5 plant stages')
        chk(pg.evaluate("document.querySelectorAll('#qs button').length")==6,name+' 6 example questions')
        chk(pg.evaluate("document.querySelectorAll('video').length")==0,name+' no video elements')
        y0=pg.evaluate("getComputedStyle(document.querySelector('.hero .adem img.tall')).transform");pg.wait_for_timeout(3500);y1=pg.evaluate("getComputedStyle(document.querySelector('.hero .adem img.tall')).transform")
        chk(y0!=y1,name+' hero demo scrolls smoothly');chk(pg.evaluate("document.querySelector('.hero .adem img.tall').naturalWidth")==780,name+' hero demo image loaded')
        chk(pg.evaluate("!/bonsai/i.test(document.body.innerText)"),name+' no bonsai text visible')
        if name=='desk':
            for h in ['tour','how','snap','ask','community','pricing']:
                pg.click(f'a[href="#{h}"] >> nth=0');pg.wait_for_timeout(1800)
                top=pg.evaluate(f"document.getElementById('{h}').getBoundingClientRect().top");chk(abs(top)<140,f'nav #{h} scrolls (top={top:.0f})')
        # grow animation
        pg.evaluate("document.getElementById('grow').scrollIntoView()");pg.wait_for_timeout(400)
        g=pg.evaluate("document.getElementById('grow')");h=pg.evaluate("document.getElementById('grow').offsetHeight")
        pg.evaluate("window.scrollTo(0,document.getElementById('grow').offsetTop+document.getElementById('grow').offsetHeight*.9)");pg.wait_for_timeout(900)
        chk(pg.inner_text('#g-name')!='Seed',name+' plant grows on scroll ('+pg.inner_text('#g-name')+')')
        pg.evaluate("document.getElementById('ask').scrollIntoView()");pg.wait_for_timeout(2200)
        chk(len(pg.inner_text('#chlog'))>40,name+' ask demo auto-plays')
        pg.click('#qs [data-q="3"]');pg.wait_for_timeout(1400);chk('$100 a paycheck' in pg.inner_text('#chlog'),name+' tapping a question answers it')
        pg.query_selector('#ask').screenshot(path=f'ask_{name}.png')
        pg.evaluate("document.getElementById('spend').scrollIntoView()");pg.wait_for_timeout(1600)
        chk(pg.evaluate("document.getElementById('spcard').classList.contains('on')"),name+' spend card animates');pg.query_selector('#spend').screenshot(path=f'spend_{name}.png')
        pg.evaluate("document.getElementById('community').scrollIntoView()");pg.wait_for_timeout(700);chk(pg.evaluate("document.querySelectorAll('.cpost').length")==4,name+' community posts');pg.query_selector('#community').screenshot(path=f'comm_{name}.png')
        pg.evaluate("document.getElementById('tour').scrollIntoView()");pg.wait_for_timeout(800)
        chk(pg.evaluate("document.querySelectorAll('.hlpill').length")==5,name+' 5 highlight tabs')
        pg.wait_for_timeout(2500);chk(pg.evaluate("document.querySelectorAll('#tour .adem .dl.on').length")>=1 and pg.evaluate("document.querySelector('.hlpill.on')!==null"),name+' highlight demo running')
        pg.click('.hlpill[data-i="4"]');pg.wait_for_timeout(1200);chk('Never alone' in pg.inner_text('.hlcap.on') and pg.evaluate("document.querySelector('#tour .adem img').src.includes('comm_tall')"),name+' tab switches demo + caption')
        pg.screenshot(path=f'hl_{name}.png')
        pg.screenshot(path=f'tour_{name}.png')
        pg.evaluate("document.getElementById('snap').scrollIntoView()");pg.wait_for_timeout(3200)
        chk(pg.evaluate("document.getElementById('snap').classList.contains('on')"),name+' merge animation runs')
        chk(pg.evaluate("[...document.querySelectorAll('#snap .adem .dl')].filter(l=>l.classList.contains('on')).length>=1&&document.querySelector('#snap .adem img').naturalWidth===780"),name+' screenshot demo running')
        pg.query_selector('#snap').screenshot(path=f'snap_{name}.png')
        # pricing toggle
        pg.evaluate("document.getElementById('pricing').scrollIntoView()");pg.wait_for_timeout(500)
        y=pg.inner_text('#price');pg.click('#bill-m');pg.wait_for_timeout(300);m=pg.inner_text('#price');pg.click('#bill-y');pg.wait_for_timeout(300)
        chk(y!=m and pg.inner_text('#price')==y,name+f' pricing toggle ({y.strip()} / {m.strip()})')
        # press-and-hold card
        pg.evaluate("document.querySelector('.c-g').scrollIntoView({block:'center'})");pg.wait_for_timeout(900)
        pg.query_selector('.c-g').screenshot(path=f'cg_{name}.png')
        # waitlist
        pg.evaluate("document.getElementById('join').scrollIntoView()");pg.wait_for_timeout(500)
        pg.click('#join-form button[type=submit]');pg.wait_for_timeout(300);bad=pg.inner_text('#join-note')
        pg.fill('#join-email','test@example.com');pg.click('#join-form button[type=submit]');pg.wait_for_timeout(500);ok=pg.inner_text('#join-note')
        chk(bad!=ok and ok.strip()!='',name+f' waitlist form ("{bad.strip()[:40]}" -> "{ok.strip()[:50]}")')
        pg.click('a[href="#join"].btn >> nth=0') if name=='mob' else None
        chk(not errs,name+' no errors '+str(errs[:3]))
        pg.close()
    print('\n'.join(R))
