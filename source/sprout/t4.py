import json,os
from playwright.sync_api import sync_playwright
own=open('owner_test.json').read()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':1500});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-state-v1',%s);"%json.dumps(own))
    pg.goto('file://'+os.getcwd()+'/sprout_test.html');pg.wait_for_timeout(3000)
    pg.evaluate("""(()=>{const H=HIST;const add=(d,a,m,c)=>H.push({k:d+m,d,a,m,ac:'x',c,p:0});
    for(let i=0;i<7;i++){const mo=String(3+i).padStart(2,'0');add('2026-'+mo+'-12',-15.49,'NETFLIX.COM','Personal');add('2026-'+mo+'-03',-10.99,'SPOTIFY USA','Personal');add('2026-'+mo+'-05',-60+i,'KROGER 422','Everyday');add('2026-'+mo+'-20',-120,'WELLS FARGO PAYMENT','Bill');add('2026-'+mo+'-28',3000,'PAYROLL','Income')}
    add('2026-09-02',-35,'OVERDRAFT FEE','Bill');add('2026-08-02',-35,'OVERDRAFT FEE','Bill');})()""")
    pg.evaluate("insOpen()");pg.wait_for_timeout(500);pg.screenshot(path='ins2.png')
    print(errs)
