import os
from playwright.sync_api import sync_playwright
R=[]
def ck(n,c,d=''):R.append(bool(c));print('PASS' if c else 'FAIL',n,d)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(5500)
    W=pg.wait_for_timeout
    pg.evaluate("window.state.x2.plus={on:0,bill:'yr'}")
    vis=lambda s:[e for e in pg.query_selector_all(s) if e.is_visible()]
    ck('starts on Free',not pg.evaluate("window.__T.plusIs()"))
    pg.click('.tabbar [data-tab=money]');W(700)
    chips=pg.evaluate("[...document.querySelectorAll('#pg .xtile')].filter(t=>t.querySelector('.pchip')).map(t=>t.dataset.v).sort().join(',')")
    ck('Plus chips on nego, credit, partner only',chips=='credit,house,nego',chips)
    # credit teaser -> trial -> unlocked
    pg.click('#pg .xtile[data-v=credit]');W(900)
    ck('credit shows teaser',len(vis('#x-body .tierwall'))==1)
    pg.screenshot(path='../tier_credit.png')
    pg.click('#x-body [data-x=plusgo][data-v=credit]');W(700)
    ck('paywall speaks to credit','credit score' in pg.inner_text('#x-body .plhero').lower())
    ck('compare table on paywall',pg.locator('#x-body .plcmp').count()==1)
    pg.click('#x-body .plcmp summary');W(300);pg.screenshot(path='../tier_pay.png',full_page=False)
    pg.click('#x-body [data-x=pstart]');W(1400)
    ck('back on credit, unlocked',pg.locator('#x-body .tierwall').count()==0 and 'Credit' in pg.inner_text('#sh-x .xh, #sh-x h2, #sh-x') )
    ck('on Plus now',pg.evaluate("window.__T.plusIs()"))
    pg.evaluate("window.__T.closeSheets()");W(600)
    pg.click('.tabbar [data-tab=home]');W(300);pg.click('.tabbar [data-tab=money]');W(600)
    ck('no chips on Plus',pg.locator('#pg .pchip').count()==0)
    # back to free
    pg.evaluate("window.state.x2.plus={on:0,bill:'yr'}");pg.click('.tabbar [data-tab=home]');W(600)
    # score breakdown lock
    pg.click('.ovscore');W(1200)
    ck('score detail locked on Free',pg.evaluate("document.getElementById('health').classList.contains('plock')") and pg.locator('#health .tierwall').count()==1)
    ck('biggest boost still free',pg.locator('#health .hlever').count()==1)
    pg.locator('#health').screenshot(path='../tier_score.png')
    # Ask: a Plus feature
    pg.evaluate("window.scrollTo(0,0);document.body.classList.remove('noai')");W(200)
    pg.click('#open-ask');W(700)
    ck('ask meter says Plus','comes with Plus' in pg.inner_text('#askmeter'))
    ck('ask preview card shown',len(vis('#cmd-out .askprev'))==1)
    pg.evaluate("(()=>{const b=document.getElementById('cmd-box');b.classList.remove('hide');b.hidden=false;b.style.display='';const na=document.getElementById('cmd-na');if(na)na.classList.add('hide')})()");W(200)
    pg.evaluate("(()=>{const i=document.getElementById('cmd-in');i.value='How much can I spend today?';const g=document.getElementById('cmd-go');g.disabled=false;g.click()})()");W(500)
    ck('question on Free shows the Plus card, not a second one',len(vis('#cmd-out .tierwall'))==1 and 'nudge' in pg.get_attribute('#cmd-out .askprev','class'))
    ck('nothing sent or counted',pg.evaluate("!(window.state.x2.meter&&window.state.x2.meter.ask&&window.state.x2.meter.ask.n)") and pg.locator('#cmd-out .bub.me').count()==0)
    pg.screenshot(path='../tier_ask.png')
    pg.evaluate("window.__T.closeSheets()");W(600)
    # scans: 10 a month
    pg.click('#open-spend');W(800);pg.click('#sh-spend .scanbtn');W(900)
    ck('scan meter shown','10 of 10' in pg.inner_text('#sc-body'))
    pg.evaluate("(()=>{const d=new Date();window.state.x2.meter.scan={p:d.getFullYear()+'-'+(d.getMonth()+1),n:10}})()")
    pg.evaluate("document.querySelector('[data-scex=cash]').click()");W(600)
    ck('11th scan shows wall','free scans' in pg.inner_text('#sc-body') and len(vis('#sc-body .tierwall'))==1)
    ck('manual entry still offered','by hand' in pg.inner_text('#sc-body'))
    pg.screenshot(path='../tier_scan.png')
    pg.evaluate("window.__T.closeSheets()");W(600)
    # linked accounts: 2 on free
    pg.evaluate("window.state.link=null");pg.click('[data-settings]');W(600);pg.click('#x-body [data-x=nav][data-v=accts]');W(1000)
    lk=vis('[data-lkopen]')
    if lk:lk[0].click();W(900)
    btns=pg.evaluate("[...document.querySelectorAll('[data-lk=conn]')].filter(b=>b.offsetParent).map(b=>b.dataset.v)")
    print('conn buttons',btns)
    for v in btns[:2]:
        pg.click('[data-lk=conn][data-v="%s"]'%v);W(1300)
    if len(btns)>2:
        pg.click('[data-lk=conn][data-v="%s"]'%btns[2]);W(900)
        ck('3rd account shows inline note',len(vis('#lk-body .lkcap'))==1 and not pg.evaluate("!!(window.state.link&&0)"))
        pg.screenshot(path='../tier_link.png')
        ck('3rd not connected',pg.locator('[data-lk=conn][data-v="%s"]'%btns[2]).count()==1)
        pg.click('#lk-body [data-x=plusgo]');W(900)
        ck('note opens Plus',pg.evaluate("!document.getElementById('sh-x').hidden") and 'every account' in pg.inner_text('#x-body').lower())
    else: ck('found 3 account types',False,btns)
    ck('no errors',not errs,errs[:3])
    b.close()
print(sum(R),'/',len(R))
