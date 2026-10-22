import json,os
from playwright.sync_api import sync_playwright
own=open('owner_test.json').read()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page()
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-state-v1',%s);"%json.dumps(own))
    pg.goto('file://'+os.getcwd()+'/sprout_test.html');pg.wait_for_timeout(3000)
    print(pg.evaluate("[categorize({d:'2026-10-05',a:-200,m:'ONLINE TRANSFER TO CAPITAL ONE',p:false},'checking',new Set()), JSON.stringify(state.rules), Object.keys(state.accts||{})]"))
