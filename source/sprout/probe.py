import os, csv, json, sys
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'
rows=list(csv.DictReader(open('../csvin/tx.csv')))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto(URL);pg.wait_for_timeout(2500)
    pg.evaluate(open('t59_seed.js').read(),rows)
    pg.evaluate("""(()=>{Object.assign(state,{cash:0,cashAt:Date.now(),asOf:new Date().toISOString().slice(0,10)});state.link.accts.push({id:'k401',name:'Fidelity 401k',mask:'1234',kind:'invest',sub:'401k',cur:8632,item:'it'});__T.LG.after();__T.closeSheets();window.__T.setView('ov');})()""")
    pg.wait_for_timeout(800)
    pg.screenshot(path='probe/home.png')
    print(pg.evaluate("""(()=>{const q=s=>[...document.querySelectorAll(s)].map(e=>e.outerHTML.slice(0,300));return {hdr:q('header')[0], greet:q('.ovgreet,.greet,[class*=greet]'), ov:[...document.querySelectorAll('#ov > *, .ov > *')].map(e=>e.className).slice(0,30)}})()"""))
    S=pg.evaluate
    S("document.querySelector('.tb[data-tab=money]')&&document.querySelector('.tb[data-tab=money]').click()");pg.wait_for_timeout(700)
    print('tabs',S("[...document.querySelectorAll('.tb')].map(b=>b.dataset.tab+':'+b.textContent.trim())"))
    pg.screenshot(path='probe/fin.png',full_page=True)
    print('fin',S("[...document.querySelectorAll('#pg > *')].map(e=>e.className+'|'+e.textContent.slice(0,60))"))
    print('errors',errs[:3]);b.close()
