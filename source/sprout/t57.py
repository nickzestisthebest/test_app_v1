# Ledger checks on the phone-only app: paying with a card, refunds, setup step 1 layout, no private messages
import os, re
from playwright.sync_api import sync_playwright
URL = 'file://' + os.getcwd() + '/v2_test.html'
R = []
def ck(n, c, info=''): R.append(('PASS ' if c else 'FAIL ') + n + ('' if c else ' ' + str(info)[:300]))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(2500)
    W = pg.wait_for_timeout; S = pg.evaluate
    S("__T.closeSheets()"); W(300)
    S("""(()=>{const f=d=>new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())).toISOString().slice(0,10),t=new Date();
      Object.assign(state,{setup:true,demo:false,link:null,pay:1800,payFreq:'biweekly',firstPay:f(new Date(Date.now()+6*864e5)),asOf:f(t),cash:5,cashAt:Date.now(),cushion:0,everyday:300,discReduced:150,discTarget:150,bills:[],sched:[],goals:[],saved:0,spend:[],
        debts:[{name:'Discover card',bal:0,apr:24,min:0,day:20,limit:1000}]});window.__T.setView('ov')})()"""); W(400)
    S("__T.closeSheets()"); W(300)
    # ---- the $5 checking, $1,000 card, $250 purchase example ----
    pg.click('#open-spend'); W(500)
    pg.fill('#ql-in', '250 shoes'); W(500)
    pg.click('.l4row [data-l4chip=pw]'); W(300)
    ck('paid-with choices show the card', pg.locator('[data-l4pw="c:Discover card"]').count() == 1, pg.inner_text('#sh-spend')[:300])
    pg.click('[data-l4pw="c:Discover card"]'); W(300)
    pg.click('#l4go'); W(700)
    r = S("(()=>{const L=__T.LG,n=L.nw(),c=L.credit(),s=state.spend[state.spend.length-1];return{N:n.N,C:n.C,owe:n.L,av:c.avail,card:!!s.card,pw:s.paidWith,debt:state.debts[0].bal,hero:(document.querySelector('.ovhero b')||{}).innerText,sub:(document.querySelector('.ovhero .s')||{}).innerText}})()")
    ck('checking stays $5', abs(r['C'] - 5) < .001, r)
    ck('card balance goes up $250', abs(r['debt'] - 250) < .001 and abs(r['owe'] - 250) < .001, r)
    ck('available credit drops to $750', abs(r['av'] - 750) < .001, r)
    ck('net worth drops by $250 (5 - 250)', abs(r['N'] + 245) < .001, r)
    ck('purchase is marked as paid with the card', r['card'] and r['pw'] == 'Discover card', r)
    ck('Safe to spend is limited to what checking has', r['hero'] in ('$5.00','$0.00') or r['hero'].startswith('−'), r['hero'])
    ck('and says checking is the limit', 'checking' in (r['sub'] or '').lower(), r['sub'])
    S("__T.xOpen('safe')"); W(500)
    sb = pg.inner_text('#x-body')
    ck('breakdown counts the card purchase as spent today', 'Card purchases count too' in sb and '$250.00' in sb, sb[-500:])
    ck('breakdown shows the card credit', 'Available credit' in sb and '$750.00' in sb, sb[-400:])
    pg.screenshot(path='t57_safe.png')
    S("__T.closeSheets()"); W(300)
    # deleting the purchase takes it back off the card
    i = S("state.spend.length-1")
    S("window.__T.setView('ov')"); pg.evaluate("document.querySelector('#menu [data-nav=tx]').click()"); W(900)
    pg.evaluate("document.querySelector('[data-txview=list]')&&document.querySelector('[data-txview=list]').click()"); W(400)
    ck('transaction shows what paid for it', 'Discover card' in pg.inner_text('#tx-list'), pg.inner_text('#tx-list')[:200])
    pg.click('#tx-list [data-txe="%d"]' % i); W(300); pg.click('[data-txdel="%d"]' % i); W(200); pg.click('[data-txdel="%d"]' % i); W(500)
    ck('deleting it takes it off the card', abs(S("state.debts[0].bal")) < .001, S("state.debts[0].bal"))
    pg.keyboard.press('Escape'); W(300)
    # ---- refunds lower spending, transfers don't count ----
    f = S("""(()=>{const T=new Date().toISOString().slice(0,10);return __T.LG.flows([{d:T,amt:100,cat:'Personal'},{d:T,amt:30,cat:'Income',kind:'Refund'},{d:T,amt:1000,cat:'Income',kind:'Paycheck'},{d:T,amt:400,cat:'Bill',xf:'cp',xm:1},{d:T,amt:200,cat:'Bill',xf:'cp'}])})()""")
    ck('refund lowers money out, not money in', f['inc'] == 1000 and f['out'] == 270 and f['ref'] == 30, f)
    ck('card payment to a linked card is not counted twice', f['xfer'] == 400 and f['cp'] == 200, f)
    # ---- net worth with no history yet ----
    S("__T.xOpen('networth')"); W(500)
    nb = pg.inner_text('#x-body')
    ck('net worth page is honest about history', 'History starts now' in nb or 'records your net worth each month' in nb, nb[:300])
    ck('no illustration note outside the demo', 'illustration' not in nb, nb[-300:])
    S("__T.closeSheets()"); W(300)
    # ---- setup step 1: the switch keeps its shape and the date box fits ----
    S("document.querySelector('[data-redo]')&&document.querySelector('[data-redo]').click()"); W(900)
    for _ in range(3):
        if pg.locator('.wz-body input.sw[data-w=bonusOn]').count(): break
        pg.click('#wz-next'); W(500)
    sw = S("(()=>{const e=document.querySelector('.wz-body input.sw[data-w=bonusOn]');if(!e)return null;const r=e.getBoundingClientRect();return[r.width,r.height]})()")
    ck('bonus switch is a normal switch', sw and abs(sw[0] - 51) < 2 and abs(sw[1] - 31) < 2, sw)
    dt = S("(()=>{const e=document.querySelector('.wz-body input[type=date]');if(!e)return null;const r=e.getBoundingClientRect(),p=e.closest('label').getBoundingClientRect();return[r.right<=p.right+0.5,r.width]})()")
    ck('payday date box stays inside its card', dt is None or dt[0], dt)
    ck('payday has a hint', 'Tap to pick the date' in pg.inner_text('.wz-body') or dt is None, pg.inner_text('.wz-body')[:200])
    pg.screenshot(path='t57_step1.png', full_page=True)
    S("__T.closeSheets()"); W(300)
    S("(()=>{const c=document.getElementById('wz-close');if(c&&!c.hidden)c.click()})()"); W(400)
    # ---- Community: posts stay, private messages are gone ----
    S("__T.setTab('community')"); W(700)
    ck('no messages button in Community', pg.locator('.dmbtn,[data-x=inbox]').count() == 0)
    S("__T.xOpen('member','maya.pays')"); W(500)
    ck('no Message button on profiles', pg.locator('#x-body [data-x=dm]').count() == 0, pg.inner_text('#x-body')[:200])
    ck('no message badge', S("(()=>{const b=document.getElementById('tb-dm');return !b||b.hidden})()"))
    S("__T.closeSheets()"); W(300)
    ck('no page errors', not errs, errs[:3])
    b.close()
print('\n'.join(R)); print(sum(r.startswith('PASS') for r in R), '/', len(R))
