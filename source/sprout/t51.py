import os
from playwright.sync_api import sync_playwright
P=[];F=[]
def chk(c,n):(P if c else F).append(n);print(('PASS ' if c else 'FAIL ')+n)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};try{localStorage.setItem('sprout-lp-hint','1')}catch(e){}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400);pg.click('[data-wact=demo2]');pg.wait_for_timeout(2500)
    W=pg.wait_for_timeout;txt=lambda:pg.evaluate("document.getElementById('x-body').textContent")
    pg.click('.tb[data-tab=community]');W(600);chk('Guidelines' in pg.evaluate("document.getElementById('pg').textContent"),'Community shows Guidelines link')
    pg.click('#pg [data-x=open][data-v=compose]');W(500);chk('Keep it kind and private' in txt(),'compose shows the rules')
    pg.fill('#cp-txt','Paid off my card! Hit me up at 404-555-0199');pg.click('#x-body [data-x=cpost]');W(500)
    chk('I agree' in txt() and 'Community guidelines' in pg.inner_text('#x-t'),'first post asks to agree to guidelines')
    pg.click('#x-body [data-x=cgagree]');W(700);chk(pg.input_value('#cp-txt').startswith('Paid off'),'back to the post with text kept')
    pg.click('#x-body [data-x=cpost]');W(400);chk('Phone numbers' in txt(),'phone number blocked')
    for bad,why in [('Send me money on cash app me pls','money'),('Check out www.getrich.xyz','Links'),('My card is 4111 1111 1111 1111','card'),('guaranteed returns, invest with me','pitches')]:
        pg.fill('#cp-txt',bad);pg.click('#x-body [data-x=cpost]');W(300);chk(why.lower() in txt().lower(),'blocked: '+bad[:28])
    n=pg.evaluate("state.x2.soc.posts.length");pg.fill('#cp-txt','Paid off my last credit card today!');pg.click('#x-body [data-x=cpost]');W(600)
    chk(pg.evaluate("state.x2.soc.posts.length")==n+1,'a normal post goes through')
    if pg.query_selector('.sheet.on button.lnk[data-close]'):pg.click('.sheet.on button.lnk[data-close]');W(400)
    # messages: block and report
    pg.evaluate("__T.xOpen('chat','maya.pays')");W(600);t=txt();chk('Never send money' in t and 'Block' in t and 'Report' in t,'chat shows safety note, report and block')
    pg.fill('#dm-in','my password is hunter2');pg.click('#x-body [data-x=dmsend]');W(300);chk('passwords' in txt().lower(),'password in DM blocked')
    pg.click('#x-body [data-x=ublock]');W(200);pg.click('#x-body [data-x=ublock]');W(500);chk('You blocked' in txt(),'block works')
    pg.click('#x-body [data-x=uunblock]');W(400);chk('You blocked' not in txt(),'unblock works')
    chk(not errs,'no errors '+str(errs[:2]))
    b.close()
print('PASS',len(P),'FAIL',len(F),F)
