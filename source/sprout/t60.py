# Budgets you can shape, the new Settings, and the "set up first" notes
import os
from playwright.sync_api import sync_playwright
URL = 'file://' + os.getcwd() + '/v2_test.html'
R = []
def ck(n, c, i=''): R.append(('PASS ' if c else 'FAIL ') + n + ('' if c else ' ' + str(i)[:300]))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto(URL); pg.wait_for_timeout(2500); W = pg.wait_for_timeout; S = pg.evaluate
    S("__T.closeSheets()"); W(300)
    # nothing set up yet: Ask says so
    S("document.getElementById('open-ask').click()"); W(600)
    ck('Ask says what to add for exact answers', 'for exact answers' in pg.inner_text('#sh-ask'), pg.inner_text('#sh-ask')[:200])
    S("__T.closeSheets()"); W(300)
    S("""(()=>{const f=d=>new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())).toISOString().slice(0,10),t=f(new Date());
      Object.assign(state,{setup:true,demo:false,link:null,pay:1800,payFreq:'biweekly',firstPay:f(new Date(Date.now()+6*864e5)),asOf:t,cash:900,cashAt:Date.now(),cushion:0,everyday:500,discReduced:300,discTarget:300,bills:[{name:'Rent',amt:1200,type:'monthly',day:1}],sched:[],goals:[],
        spend:[{d:t,amt:60,cat:'Everyday',note:'Kroger',at:1},{d:t,amt:40,cat:'Everyday',note:'Petco',at:1,card:true},{d:t,amt:25,cat:'Personal',note:'Chipotle',at:1},{d:t,amt:10,cat:'Income',kind:'Refund',refund:1,note:'Kroger',at:1},{d:t,amt:500,cat:'Bill',xf:'cp',xm:1,note:'Card payment',at:1}],x2:Object.assign(state.x2||{},{bud:{}})});__T.plan&&0;window.__T.setView('ov')})()""")
    W(400)
    S("__T.xOpen('budgets')"); W(600)
    bb = pg.inner_text('#x-body')
    ck('budgets follow the plan: $800 a month', 'of $800' in bb, bb[:400])
    ms = S("(()=>{const m=__T.LG&&window.__S?null:null;return null})()")
    # add a custom category
    pg.click('[data-b2new]'); W(400)
    pg.fill('#b2-name', 'Pets'); pg.fill('#b2-amt', '80'); pg.fill('#b2-words', 'petco, chewy'); pg.click('[data-b2save=new]'); W(600)
    bb = pg.inner_text('#x-body')
    ck('new category shows up', 'Pets' in bb and '$40 spent' in bb, bb[:800])
    ck('card purchase counts toward the budget', '$40 spent' in bb)
    ck('month total now includes Pets', 'of $880' in bb, bb[:300])
    ck('Safe to spend money follows the budget', S("state.everyday") == 580, S("state.everyday"))
    ck('refund comes off groceries, card payment never counts', '$50 spent' in bb, bb)
    # open Groceries, split it, move a purchase
    pg.click('[data-b2cat=groc] >> nth=0'); W(500)
    pg.click('#x-body [data-v=budedit]'); W(500)
    pg.fill('#b2-sn', 'Kroger'); pg.fill('#b2-sa', '200'); pg.fill('#b2-sw', 'kroger'); pg.click('[data-b2subadd=groc]'); W(400)
    gb = pg.inner_text('#x-body')
    ck('a part of a budget tracks its own spending', 'Kroger' in gb and '$50 of $200' in gb, gb[:900])
    S("__T.ev(\"xGo('budcat','groc')\")"); W(400)
    ck('the category shows its parts first', 'Kroger' in pg.inner_text('#x-body') and 'PARTS' in pg.inner_text('#x-body').upper(), pg.inner_text('#x-body')[:400])
    pg.click('.b3grp >> nth=0'); W(400)
    ck('a part opens its purchases', 'KROGER' in pg.inner_text('#x-body').upper())
    pg.select_option('[data-b2move] >> nth=0', 'din')
    W(400)
    ck('moving a purchase teaches Sprout the store', S("(()=>{const g=state.lg.bud;return Object.values(g.rules).length>=1})()"))
    pg.screenshot(path='t60_budcat.png', full_page=True)
    S("__T.closeSheets()"); W(300)
    # settings: calmer, export lives in Privacy and terms
    S("document.querySelector('header [data-settings]').click()"); W(600)
    st = pg.inner_text('#x-body')
    ck('settings has clear groups', all(g in st.upper() for g in ['YOUR MONEY', 'APP', 'PRIVACY AND DATA', 'HELP']), st[:400])
    ck('export moved out of the main list', 'Export my data' not in st)
    pg.screenshot(path='t60_settings.png', full_page=True)
    pg.click('#x-body [data-v=legal]'); W(500)
    ck('a copy of your data is in Privacy and terms', 'Download a copy of my data' in pg.inner_text('#x-body'))
    S("__T.closeSheets()"); W(300)
    # transactions: friendlier names
    S("document.querySelector('#menu [data-nav=tx]').click()"); W(900)
    seg = pg.inner_text('#tx-seg')
    ck('tabs are By category and All transactions', 'By category' in seg and 'All transactions' in seg, seg)
    pg.screenshot(path='t60_tx.png')
    ck('generic tips are gone', S("document.body.innerHTML.indexOf('Other ways to close a gap')") < 0)
    ck('no page errors', not errs, errs[:3])
    b.close()
print('\n'.join(R)); print(sum(r.startswith('PASS') for r in R), '/', len(R))
