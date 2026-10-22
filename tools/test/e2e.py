"""End-to-end test of the installed app against stand-in Plaid / Anthropic / Upstash (tools/test/mock.mjs).
Run tools/test/run_servers.sh first."""
import json, re, sys, time, urllib.request, urllib.error
from playwright.sync_api import sync_playwright

BASE = 'http://localhost:3000'; MOCK = 'http://127.0.0.1:4010'
TV = re.search(r"const TERMS_V='([^']+)'", open('../sprout/acct.js').read()).group(1)
SEED = """(()=>{try{const L=localStorage;L.setItem('sprout-debug','1');if(!L.getItem('sprout-accounts-v1'))L.setItem('sprout-accounts-v1',JSON.stringify({cur:'t1',list:{t1:{id:'t1',first:'Nick',last:'S',email:'n@example.com',phone:'(555) 222-3333',dob:'1990-01-01',zip:'30301',salt:'s',pwh:'x',created:1,fidAsked:1,agree:{v:'__TV__',at:1,tos:true,privacy:true,esign:true}}}}))}catch(e){}})()""".replace('__TV__', TV)
R = []
import atexit
atexit.register(lambda: print('\n'.join(R) + '\n' + str(sum(r.startswith('PASS') for r in R)) + ' / ' + str(len(R)) + ' passed'))
def ck(name, cond, info=''):
    R.append(('PASS ' if cond else 'FAIL ') + name + (' ' + str(info)[:300] if not cond and info != '' else ''))
def mock(path, body=None):
    req = urllib.request.Request(MOCK + path, data=json.dumps(body).encode() if body is not None else None, headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read() or b'{}')
def kv(*cmd):
    req = urllib.request.Request(MOCK + '/kv', data=json.dumps(list(cmd)).encode(), headers={'Authorization': 'Bearer kvtoken'})
    return json.loads(urllib.request.urlopen(req).read())

mock('/reset', {})
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, service_workers='allow')
    ctx.add_init_script(SEED)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    W = pg.wait_for_timeout
    S = lambda js: pg.evaluate(js)
    def ask(q, wait=1500):
        pg.evaluate("(q)=>{const i=document.getElementById('cmd-in');i.value=q;const g=document.getElementById('cmd-go');g.disabled=false;g.click()}", q); W(wait)
        return pg.evaluate("(()=>{const b=[...document.querySelectorAll('#cmd-out .bub.ai')];return b.length?b[b.length-1].innerText:''})()")

    # ---- first launch: the app finds the server and asks for the access code ----
    pg.goto(BASE); W(4500)
    ck('server found', S("window.__S&&window.__S.LIVE.st&&window.__S.LIVE.st.ready===true"))
    ck('setup offers the real bank connection', pg.locator('[data-wact=connect]').inner_text() == 'Connect my bank')
    pg.click('[data-wact=connect]'); W(1200)
    ck('asks for the access code first', pg.inner_text('#x-t') == 'Bank sync and AI' and pg.locator('#lv-code').count() == 1, pg.inner_text('#x-t'))
    pg.screenshot(path='shots/01_code.png')
    pg.fill('#lv-code', 'nope-wrong-code'); pg.click('[data-x=lvsave]'); W(1200)
    ck('wrong code refused', 'didn’t work' in pg.inner_text('#x-body'), pg.inner_text('#x-body')[-200:])
    pg.fill('#lv-code', 'free-code-5678'); pg.click('[data-x=lvsave]'); W(5000)
    ck('free code accepted', S("__S.LIVE.st.code==='ok'&&__S.LIVE.st.tier==='free'"))
    ck('Plus comes from the server, not the phone', S("(()=>{return !document.querySelector('#health')||true})()") and not S("window.__S&&__S.LIVE.st.plus"))

    # ---- connect a bank through Plaid's hosted page ----
    S("__S.closeSheets()"); W(400); S("__S.lkOpen()"); W(1500)
    body = pg.inner_text('#lk-body')
    ck('connect screen in test mode', 'Connect a bank' in body and 'user_good' in body, body[:300])
    pg.screenshot(path='shots/02_connect.png')
    pg.click('[data-lv=add]')
    pg.wait_for_url(re.compile(r'.*plaid=done.*|.*localhost:3000/$'), timeout=15000); W(1500)
    for i in range(40):
        if 'Paycheck' in (pg.inner_text('#lk-body') if pg.locator('#lk-body').count() else ''): break
        W(500)
    body = pg.inner_text('#lk-body')
    ck('came back and read the accounts', 'paycheck' in body.lower() and 'bills that repeat' in body.lower(), body[:400])
    ck('paycheck found from bank data', '$2,150' in body, body[:300])
    ck('credit card found with its real rate', '24.99% APR' in body and 'minimum $35' in body, body[body.find('What you owe'):][:200])
    ck('rent found as a bill', 'Harbor' in body)
    pg.screenshot(path='shots/03_found.png', full_page=True)
    pg.click('[data-lk=finish]'); W(2500)
    st = S("(()=>{const s=__S.st();return{live:!!(s.link&&s.link.live),n:s.spend.length,cash:s.cash,debts:s.debts.map(d=>[d.name,d.bal,d.apr,d.min]),pfd:s.spend.filter(x=>x.pfd).length,pend:s.spend.filter(x=>x.pending).length,cats:s.spend.reduce((a,x)=>(a[x.cat]=(a[x.cat]||0)+1,a),{}),pmap:Object.keys(s.link.pmap||{}).length,skipCardPay:s.spend.filter(x=>/card payment|payment thank/i.test(x.note)&&!(x.xf==='cp'&&x.xm)).length}})()")
    ck('linked for real', st['live'])
    ck('transactions imported', st['n'] > 80, st)
    ck('checking balance from bank', abs(st['cash'] - 1840.22) < 0.01, st['cash'])
    ck('debt from the credit card', any(d[0].startswith('Platypus Credit Card') and abs(d[1] - 1250.4) < .01 and d[2] == 24.99 for d in st['debts']), st['debts'])
    ck('bank categories kept', st['pfd'] > 50, st['pfd'])
    ck('card payments not double counted', st['skipCardPay'] == 0, st['skipCardPay'])
    ck('pending charge counted', st['pend'] == 1, st['pend'])
    ck('recent ids tracked for updates', st['pmap'] > 10, st['pmap'])
    pg.screenshot(path='shots/04_home.png')

    # ---- insights from real data, no demo alerts ----
    A = S("__S.alerts().map(a=>a.id+' | '+a.t)")
    ids = ' '.join(A)
    ck('double charge spotted', 'brdup-' in ids, A)
    ck('fee spotted', 'brfee-' in ids, A)
    ck('big purchase spotted', 'brbig-' in ids, A)
    ck('Netflix price increase spotted', any('Netflix went up $2.50' in a for a in A), A)
    ck('no made-up demo alerts', 'dupe |' not in ids and 'Chipotle charged $14.20 twice on the same day. Tap' not in ids, A)
    subs = S("(()=>{try{return __S.BR.answer('what subscriptions do I have').items.map(i=>i.name)}catch(e){return String(e)}})()")
    ck('subscriptions found from bank data', isinstance(subs, list) and any('Netflix' in s for s in subs) and any('Spotify' in s for s in subs), subs)
    bud = S("__S.BR.answer('where does my money go').reply")
    ck('budget categories use bank categories', 'Groceries' in bud and 'Eating out' not in bud and 'Dining' in bud, bud)

    # ---- Ask on the free plan: Plus only, nothing sent ----
    S("__S.closeSheets()"); W(400); pg.click('#open-ask'); W(800)
    ck('free plan sees Ask preview', pg.locator('#cmd-out .askprev').count() == 1)
    ask('How much can I spend today?', 800)
    ck('free question not sent to AI', mock('/stats')['anthropic'] == 0)
    pg.screenshot(path='shots/05_ask_free.png')
    S("__S.closeSheets()"); W(300)

    # ---- owner code: instant answers on the phone first, AI only when needed ----
    S("localStorage.setItem('sprout-server-code::t1','owner-code-1234')"); pg.reload(); W(5000)
    ck('owner code gives Plus', S("__S.LIVE.st.plus===true&&__S.LIVE.st.tier==='owner'"))
    S("__S.closeSheets()"); W(400); pg.click('#open-ask'); W(800)
    ck('no Plus preview for Plus', pg.locator('#cmd-out .askprev').count() == 0)
    a1 = ask('How much can I spend today?')
    ck('daily number answered on the phone', 'today' in a1 and '$' in a1 and mock('/stats')['anthropic'] == 0, a1)
    a2 = ask('What bills are due in the next 2 weeks?')
    ck('bills answered on the phone', ('due' in a2 or 'Nothing is due' in a2) and mock('/stats')['anthropic'] == 0, a2)
    a3 = ask('I spent $14 on lunch')
    ck('logging works on the phone', 'log' in a3.lower() and pg.locator('#cmd-apply').count() == 1 and mock('/stats')['anthropic'] == 0, a3)
    pg.click('#cmd-apply'); W(600)
    ck('logged spend applied', S("__S.st().spend.some(s=>s.note==='Lunch'&&s.amt===14)"))
    a4 = ask('Can I afford $80 for dinner on Friday?')
    ck('what-if answered on the phone', 'dinner' in a4.lower() and mock('/stats')['anthropic'] == 0, a4)
    pg.screenshot(path='shots/06_ask_local.png')
    a5 = ask('Should I open a high yield savings account or pay down my card faster?', 3000)
    s5 = mock('/stats')
    ck('open question goes to the AI', s5['anthropic'] == 1 and 'AI here' in a5, (s5['anthropic'], a5))
    L5 = s5.get('lastAI') or {'model': None, 'max_tokens': None, 'system': [{}], 'user': ''}
    ck('cheapest model, short answers', L5['model'] == 'claude-haiku-5-5' and L5['max_tokens'] == 700, L5['model'])
    ck('instructions marked for prompt caching', (L5['system'] or [{}])[0].get('cache_control') == {'type': 'ephemeral'})
    ck('AI gets the phone-made summary', 'Spending summary (worked out on the phone)' in L5['user'])
    a6 = ask('Is it smarter to put extra money toward savings or my credit card this month?', 3000)
    s6 = mock('/stats')
    ck('second AI question reads instructions from cache', s6['anthropic'] == 2 and s6['cacheReads'] >= 1, (s6['anthropic'], s6['cacheReads']))
    spent = float(kv('GET', 'spend:' + time.strftime('%Y-%m'))['result'] or 0)
    ck('AI cost tracked and tiny', 0 < spent < 0.01, spent)
    pg.screenshot(path='shots/07_ask_ai.png')

    # ---- monthly budget reached: AI pauses, phone answers keep working ----
    kv('SET', 'spend:' + time.strftime('%Y-%m'), '999')
    a7 = ask('What do you think about my spending habits overall?', 2500)
    ck('AI pauses at the budget', 'resting until next month' in a7 and mock('/stats')['anthropic'] == 2, a7)
    a8 = ask('How much did I spend on groceries this month?')
    ck('phone answers still work', 'groceries' in a8.lower() and '$' in a8, a8)
    kv('SET', 'spend:' + time.strftime('%Y-%m'), '0.001')
    S("__S.closeSheets()"); W(400)

    # ---- Cancel for me, for real: Ask starts it, the person authorizes, the owner works the request ----
    def api(path, body, code):
        r = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers={'x-sprout-code': code, 'Content-Type': 'application/json'})
        try: return json.loads(urllib.request.urlopen(r).read())
        except urllib.error.HTTPError as e: return json.loads(e.read() or b'{}')
    pg.click('#open-ask'); W(700)
    a = ask('cancel my netflix')
    ck('live: Ask offers to cancel Netflix', 'I can cancel Netflix' in a, a)
    pg.click('#cmd-out .askbtns [data-x=askgo]'); W(1300)
    body = pg.inner_text('#x-body')
    ck('live: no demo label on a real request', 'Demo mode' not in body and pg.locator('#cx-ok').count() == 1, body[-300:])
    pg.check('#cx-ok'); pg.click('#x-body [data-x=runcancel]'); W(2000)
    req = S("(window.__S.st().x2.subs.netflix||{}).req||null")
    ck('live: request sent to your server', req and req.get('status') == 'requested', req)
    ck('live: status screen shown', 'Request sent' in pg.inner_text('#x-body'), pg.inner_text('#x-body')[:200])
    raw = kv('HGETALL', 'rq:all')['result']
    ck('live: name and email encrypted at rest', raw and 'n@example.com' not in json.dumps(raw) and 'I authorize Sprout to contact Netflix' in json.dumps(raw), raw[:2] if raw else raw)
    pg.screenshot(path='shots/09_cancel_sent.png')
    # the owner sees it and marks it done
    pg.reload(); W(4500); S("__S.closeSheets()"); W(300)
    ck('owner: told a request is waiting', any(i.startswith('cqopen-') for i in S("__S.alerts().map(a=>a.id)")))
    S("__S.xGo('cq')"); W(1500)
    q = pg.inner_text('#x-body')
    ck('owner: queue shows who and what they agreed to', 'Cancel Netflix' in q and 'n@example.com' in q and 'I authorize Sprout' in q, q[:300])
    pg.screenshot(path='shots/10_queue.png')
    pg.click('#x-body [data-x=cqset][data-w=done]'); W(1500)
    S("__S.closeSheets()"); W(300); pg.click('.syncchip[data-sync]'); W(3500)
    ck('live: phone learns it is cancelled', S("(__S.st().x2.subs.netflix||{}).s") == 'cancelled', S("__S.st().x2.subs.netflix"))
    # withdraw before work starts
    pg.click('#open-ask'); W(700); ask('cancel spotify'); S("(()=>{const b=[...document.querySelectorAll('#cmd-out .bub.ai')];b[b.length-1].querySelector('.askbtns [data-x=askgo]').click()})()"); W(1300)
    pg.check('#cx-ok'); pg.click('#x-body [data-x=runcancel]'); W(2000)
    pg.click('#x-body [data-x=cxwithdraw]'); W(1500)
    ck('live: request can be withdrawn', not S("(__S.st().x2.subs.spotify||{}).req") and any(json.loads(v)['status'] == 'withdrawn' for v in kv('HGETALL', 'rq:all')['result'][1::2]))
    S("__S.closeSheets()"); W(400)
    # billed through Apple: only they can cancel it
    pg.click('#open-ask'); W(700)
    a = ask('cancel my apple subscription')
    ck('Apple-billed: shows the official steps and link', 'billed through Apple' in a and S("(()=>{const b=[...document.querySelectorAll('#cmd-out .bub.ai')];return !!b[b.length-1].querySelector('a[href=\"https://apps.apple.com/account/subscriptions\"]')})()"), a)
    S("__S.closeSheets()"); W(400)
    # the server's own rules
    good = {'op': 'create', 'kind': 'cancel', 'sub_id': 'x', 'service': 'Hulu', 'amount': 17.99, 'account_name': 'A B', 'account_email': 'a@b.co', 'consent': {'text': 'I authorize Sprout to contact Hulu on my behalf to cancel this subscription.', 'at': int(time.time() * 1000), 'v': '1'}}
    ck('server: Free plan cannot send requests', api('/api/requests', good, 'plus-code-9999').get('ok') and api('/api/requests', dict(good, sub_id='y'), 'free-code-5678').get('error') in ('plus_required',), 'free')
    ck('server: no request without the authorization', api('/api/requests', dict(good, sub_id='z', consent={'text': 'ok', 'at': 1}), 'owner-code-1234').get('error') == 'missing_consent')
    ck('server: only the owner sees the queue', api('/api/requests', {'op': 'queue'}, 'plus-code-9999').get('error') == 'owner_only')

    # ---- syncing new activity: pending charge posts, new purchase arrives, balance updates ----
    mock('/control?op=activity', {})
    before = S("__S.st().spend.length")
    pg.click('.syncchip[data-sync]'); W(3500)
    st2 = S("(()=>{const s=__S.st();return{n:s.spend.length,cash:s.cash,pub:s.spend.filter(x=>x.note&&/publix/i.test(x.note)).length,pend:s.spend.filter(x=>x.pending).length,sb:s.spend.filter(x=>/starbucks/i.test(x.note)&&x.d===(()=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())).toISOString().slice(0,10)})()).length}})()")
    ck('new purchase synced', st2['pub'] == 1, st2)
    ck('pending charge replaced by the posted one', st2['pend'] == 0 and st2['sb'] >= 1, st2)
    ck('balance updated', abs(st2['cash'] - 1771.29) < .01, st2['cash'])
    pg.click('.syncchip[data-sync]'); W(2500)
    ck('second sync adds nothing', S("__S.st().spend.length") == st2['n'])

    # ---- the bank needs a new sign-in ----
    mock('/control?op=relink', {'on': True})
    pg.click('.syncchip[data-sync]'); W(2500)
    ck('relink shows up as an alert', any(a.startswith('relink-') for a in S("__S.alerts().map(a=>a.id)")))
    S("__S.closeSheets()"); W(300)
    S("__S.xGo('alerts')"); W(900)
    pg.click('#x-body [data-x=alertgo][data-v=lvbanks]'); W(1200)
    ck('Reconnect button shown', pg.locator('#ac-body [data-lv=fix]').count() == 1, pg.inner_text('#ac-body')[:200] if pg.locator('#ac-body').count() else '')
    pg.screenshot(path='shots/08_relink.png')
    pg.click('#ac-body [data-lv=fix]')
    pg.wait_for_url(re.compile(r'.*localhost:3000/.*'), timeout=15000); W(6000)
    ck('reconnected and synced', S("(__S.st().link.relink||[]).length===0"), S("__S.st().link.relink"))

    # ---- how well the phone answers different wordings ----
    QS = [('how much can i spend today', 'today'), ("what's my safe to spend?", 'today'), ('How much can I spend on groceries this week?', 'today'), ('how much do I have left to spend', 'today'),
          ('Can I afford a $300 phone?', 'afford'), ('can i spend 50 on dinner tomorrow', 'afford'), ('What if I buy $120 shoes this weekend?', 'afford'), ('should i buy a $900 tv', 'afford'),
          ('When do I get paid?', 'payday'), ('How much will I have on payday?', 'payday'), ('when is my next paycheck', 'payday'),
          ('What bills are due this week?', 'bills'), ('what do i owe before payday', 'bills'), ('any payments due tomorrow?', 'bills'), ('bills due next month', 'bills'),
          ('How much did I spend on groceries this month?', 'spent'), ('how much have i spent at starbucks', 'spent'), ('what did I spend on gas last month', 'spent'), ('How much did I spend in September?', 'spent'), ('how much did i spend on food this week', 'spent'), ('total spending this month', 'spent'),
          ('what were my biggest purchases this month', 'biggest'), ('Where does my money go?', 'breakdown'), ('what do I spend the most on', 'breakdown'),
          ('What subscriptions do I have?', 'subs'), ('what am i paying for every month', 'subs'),
          ('How much should I save for a $1,200 trip by March?', 'save'), ('how much do i need to save for a $600 laptop', 'save'),
          ('When will I be debt free?', 'debt'), ('how much do i owe on my cards', 'debt'),
          ('Am I on track this month?', 'track'), ('am i over budget', 'track'), ('compare this month to last month', 'compare'), ('am i spending more than last month', 'compare'),
          ('How much do I make a month?', 'income'), ('any weird charges?', 'odd'), ('was I double charged anywhere', 'odd'), ('am i paying any fees', 'odd'),
          ("what's my checking balance", 'balance'), ('I spent 23 at kroger yesterday', 'log'), ('spent $12 on lunch and $40 on gas', 'log'), ('my checking is $640', 'balance-set'),
          ('hi', 'help'), ('Should I pay off my card or build savings first?', None), ('Explain how my budget score works', None), ('Write me a plan to save for a house', 'plan')]
    out = pg.evaluate("(qs)=>qs.map(q=>{const r=__S.BR.answer(q);return [q,r?r.intent:null,r?(r.reply+(r.items?' ['+r.items.length+' items]':'')+(r.actions&&r.actions.length?' '+JSON.stringify(r.actions):'')):'(goes to AI)']})", [q for q, _ in QS])
    miss = [(o[0], o[1], e) for o, (q, e) in zip(out, QS) if o[1] != e]
    ck('phone understands %d of %d wordings' % (len(QS) - len(miss), len(QS)), not miss, miss)
    open('shots/brain_answers.txt', 'w').write('\n\n'.join('Q: %s\n[%s] %s' % tuple(o) for o in out))

    # ---- installable app ----
    ck('manifest linked', S("!!document.querySelector('link[rel=manifest]')"))
    pg.reload(); W(3000)
    ck('works offline (service worker active)', S("!!(navigator.serviceWorker&&navigator.serviceWorker.controller)"))
    ck('no page errors', not errs, errs[:3])
    b.close()

