import os,sys
from playwright.sync_api import sync_playwright
for f in ['v1_test.html','v2_test.html']:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/'+f);pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo]');pg.wait_for_timeout(1200)
    pg.click('#open-menu');pg.wait_for_timeout(500);pg.click('#menu [data-nav=tx]');pg.wait_for_timeout(900)
    print(f,'add btn',pg.evaluate("(()=>{const b=document.querySelector('#tx-add');if(!b)return 'none';const r=b.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return b.outerHTML.slice(0,120)+' | top:'+(e&&(e.id||e.className))})()"))
    try:
        pg.click('#tx-add',timeout=3000);pg.wait_for_timeout(700)
    except Exception as e: print('click fail',str(e)[:300])
    print(f,'sheet on',pg.evaluate("document.getElementById('sh-spend').classList.contains('on')"),'top at center:',pg.evaluate("(()=>{const e=document.elementFromPoint(195,500);return e&&(e.id||e.className)})()"))
    pg.screenshot(path=f+'_txadd.png')
    n=pg.evaluate("state.spend.length");pg.fill('#sp-amt','12.50');pg.fill('#sp-note','Test lunch');pg.click('#sp-form [data-cat=Everyday]');pg.wait_for_timeout(800)
    print(f,'logged',pg.evaluate("state.spend.length")==n+1,'in list','Test lunch' in pg.inner_text('#tx-list'))
    print(errs)
