import os,json
from playwright.sync_api import sync_playwright
R=[]
def chk(c,m):R.append(('PASS ' if c else 'FAIL ')+m)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};try{localStorage.setItem('sprout-lp-hint','1')}catch(e){}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(2500)
    W=pg.wait_for_timeout
    # ---- matcher cases ----
    T="new Date().toISOString().slice(0,10)"
    cases=[
     ('Cash App screenshot vs bank CASH APP*ALEX R (next day)',"{amt:25,d:'2026-10-12',name:'Alex R.',via:'cashapp',who:'Alex R.',kind:'p2p',named:true}","{amt:25,d:'2026-10-13',name:'CASH APP*ALEX R',kind:'bank',named:true}",True),
     ('Venmo vs bank VENMO *JORDAN K (2 days)',"{amt:60,d:'2026-10-10',name:'Jordan K.',via:'venmo',who:'Jordan K.',kind:'p2p',named:true}","{amt:60,d:'2026-10-12',name:'VENMO *JORDAN KIM',kind:'bank',named:true}",True),
     ('Receipt before tip vs bank with tip',"{amt:31.4,d:'2026-10-11',name:'Taco Mama',kind:'receipt',named:true}","{amt:37.05,d:'2026-10-12',name:'TACO MAMA ATL GA',kind:'bank',named:true}",True),
     ('Cash App instant fee (1.5%)',"{amt:100,d:'2026-10-11',name:'Rent split',via:'cashapp',who:'Sam',kind:'p2p',named:true}","{amt:101.5,d:'2026-10-11',name:'CASH APP*SAM T',kind:'bank',named:true}",True),
     ('Hand-logged Lunch vs bank CHIPOTLE (only candidate)',"{amt:14.2,d:'2026-10-12',name:'Lunch',kind:'',named:false}","{amt:14.2,d:'2026-10-12',name:'CHIPOTLE 1234',kind:'bank',named:true}",True),
     ('Venmo screenshot vs Cash App bank charge, same $ same day',"{amt:25,d:'2026-10-12',name:'Alex R.',via:'venmo',who:'Alex R.',kind:'p2p',named:true}","{amt:25,d:'2026-10-12',name:'CASH APP*BOB',kind:'bank',named:true}",False),
     ('Receipt Taco Mama vs bank SHELL OIL same $ same day',"{amt:25,d:'2026-10-12',name:'Taco Mama',kind:'receipt',named:true}","{amt:25,d:'2026-10-12',name:'SHELL OIL 5742',kind:'bank',named:true}",False),
     ('Same coffee price 4 days apart',"{amt:5.75,d:'2026-10-08',name:'Starbucks',kind:'',named:true}","{amt:5.75,d:'2026-10-12',name:'STARBUCKS #5521',kind:'bank',named:true}",False),
     ('Same coffee, bank posts 2 days later',"{amt:5.75,d:'2026-10-10',name:'Starbucks',kind:'',named:true}","{amt:5.75,d:'2026-10-12',name:'STARBUCKS #5521',kind:'bank',named:true}",True),
     ('Amount off by $8, not a receipt',"{amt:40,d:'2026-10-12',name:'Kroger',kind:'',named:true}","{amt:48,d:'2026-10-12',name:'KROGER #0422',kind:'bank',named:true}",False)]
    for name,a,bb,want in cases:
        sc=pg.evaluate(f"window.__sp.sameScore({a},{bb})")
        chk((sc>=(3.6 if 'only candidate' in name else 4.5)) if want else sc<3.6,f'{name} -> {"merge" if want else "keep separate"} (score {sc:.1f})')
    for m,want in [('CASH APP*ADD CASH',True),('VENMO TOP UP',True),('INSTANT TRANSFER TO CASH APP',True),('CASH APP*ALEX R',False),('KROGER #0422',False)]:
        c=pg.evaluate(f"window.__sp.categorize({json.dumps(m)},-100).cat")
        chk((c=='Skip')==want,f'"{m}" treated as {"moving own money (not spending)" if want else "spending"} ({c})')
    # ---- flow 1: screenshot first, bank catches up later ----
    pg.click('#open-spend');W(700)
    chk(pg.is_visible('#sh-spend .scanbtn'),'Log sheet shows Scan a screenshot')
    pg.screenshot(path='sc_log.png')
    pg.click('#sh-spend .scanbtn');W(800);chk(pg.is_visible('#sh-scan .scdrop'),'scan sheet opens');pg.screenshot(path='sc_pick.png')
    n0=pg.evaluate("1")
    pg.click('[data-scex=cash]');W(300);pg.screenshot(path='sc_read.png');W(1300);pg.screenshot(path='sc_review_cash.png')
    chk('Alex R.' in pg.inner_text('#sc-body') and 'Add 1 transaction' in pg.inner_text('#sc-body'),'Cash App example read: 1 new')
    pg.click('[data-scgo]');W(700)
    pg.click('.tabbar [data-tab=money]');W(400);pg.click('#pg [data-x=nav][data-v=tx]');W(1200)
    pg.click('[data-txview=list]');W(600)
    txt=pg.inner_text('#tx-list');chk('Alex R.' in txt and 'From a screenshot' in txt,'screenshot entry in Transactions')
    cnt0=txt.count('$25.00')
    pg.evaluate("document.querySelectorAll('[data-home]')[0].click()");W(600)
    pg.evaluate("window.scrollTo(0,0)");W(300);pg.click('.syncchip');W(2200)
    pg.click('.tabbar [data-tab=money]');W(400);pg.click('#pg [data-x=nav][data-v=tx]');W(1200);pg.click('[data-txview=list]');W(600)
    txt2=pg.inner_text('#tx-list');pg.screenshot(path='sc_tx_matched.png')
    chk(txt2.count('Alex R.')==1 and 'CASH APP' not in txt2,'after bank sync the $25 to Alex is still counted once')
    chk('Matched to' in txt2,'entry now shows Matched to your bank')
    # ---- flow 2: receipt before tip, bank posts with tip ----
    pg.evaluate("document.querySelectorAll('[data-home]')[0].click()");W(500)
    pg.click('#open-spend');W(600);pg.click('#sh-spend .scanbtn');W(700);pg.click('[data-scex=receipt]');W(1500)
    chk('Taco Mama' in pg.inner_text('#sc-body'),'receipt example read');pg.click('[data-scgo]');W(600)
    pg.evaluate("window.scrollTo(0,0)");W(300);pg.click('.syncchip');W(2200)
    tm=pg.evaluate("(()=>{const r=[...document.querySelectorAll('.txt b')];return 0})()")
    pg.click('.tabbar [data-tab=money]');W(400);pg.click('#pg [data-x=nav][data-v=tx]');W(1200);pg.click('[data-txview=list]');W(600)
    t3=pg.inner_text('#tx-list');chk(t3.count('Taco Mama')==1 and '$37.05' in t3 and 'TACO MAMA' not in t3,'receipt counted once at the real charged amount with tip ($37.05)')
    # ---- flow 3: bank first, then a card-app screenshot of the same purchases ----
    pg.evaluate("document.querySelectorAll('[data-home]')[0].click()");W(500)
    pg.click('#open-spend');W(600);pg.click('#sh-spend .scanbtn');W(700);pg.click('[data-scex=card]');W(1500)
    body=pg.inner_text('#sc-body');pg.screenshot(path='sc_review_card.png')
    chk('already counted' in body,'card screenshot: items already in Sprout recognized')
    chk('Shell Oil' in body and 'Add 1 transaction' in body,'card screenshot: only the new purchase gets added')
    chk('moving your own money' in body,'Cash App add cash skipped as a transfer')
    pg.click('[data-scgo]');W(700)
    # ---- split a wrong match ----
    pg.click('.tabbar [data-tab=money]');W(400);pg.click('#pg [data-x=nav][data-v=tx]');W(1200);pg.click('[data-txview=list]');W(600)
    rows=pg.query_selector_all('#tx-list .txrow');k=None
    for i,r in enumerate(rows):
        if 'Matched to' in r.inner_text():k=i;break
    chk(k is not None,'found a matched transaction')
    if k is not None:
        n1=len(rows);rows[k].click();W(500);pg.screenshot(path='sc_split.png')
        chk(pg.query_selector('[data-txsplit]') is not None,'editor offers Not the same')
        pg.click('[data-txsplit]');W(700)
        n2=len(pg.query_selector_all('#tx-list .txrow'));chk(n2==n1+1,f'Not the same splits into two ({n1}->{n2})')
    print('\n'.join(R));print('errs',errs)
