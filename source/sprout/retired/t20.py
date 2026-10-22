import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v1_test.html');pg.wait_for_timeout(3200)
    pg.click('[data-wact=demo]');pg.wait_for_timeout(1200)
    print('fresh demo:',pg.evaluate("__hl(false)"),'| shown:',pg.inner_text('.ovhello h2'))
    seen=set()
    for i in range(8):
        pg.evaluate("__reset()");seen.add(pg.evaluate("__hl(false)[1]"))
    print('variety (8 opens):',seen)
    # simulate over-budget last week: add spending 5 days ago
    pg.evaluate("""(()=>{const MS=864e5,t=Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());for(let i=1;i<=6;i++)state.spend.push({d:new Date(t-i*MS).toISOString().slice(0,10),amt:90,cat:'Personal',note:'Dinner out',at:t-i*MS})})()""")
    pg.evaluate("__reset()");print('over week:',pg.evaluate("__hl(false)"))
    # over today
    pg.evaluate("""(()=>{const t=new Date();state.spend.push({d:new Date(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())).toISOString().slice(0,10),amt:300,cat:'Personal',note:'Shoes',at:Date.now()})})()""")
    pg.evaluate("__reset()");print('over today:',pg.evaluate("__hl(false)"))
    print('short:',pg.evaluate("__hl(true)"))
    # good week: remove the over spending, add small
    pg.evaluate("state.spend=state.spend.filter(s=>s.note!=='Dinner out'&&s.note!=='Shoes');(()=>{const MS=864e5,t=Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());for(let i=1;i<=4;i++)state.spend.push({d:new Date(t-i*MS).toISOString().slice(0,10),amt:6,cat:'Everyday',note:'Coffee',at:t-i*MS})})()")
    pg.evaluate("__reset()");print('under week:',pg.evaluate("__hl(false)"))
    print(errs)
