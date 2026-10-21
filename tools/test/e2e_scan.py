"""Scanning several screenshots of a pay-later "Upcoming" screen at once.
Run tools/test/run_servers.sh first."""
import os, re, json, urllib.request
from playwright.sync_api import sync_playwright
BASE = 'http://localhost:3000'; MOCK = 'http://127.0.0.1:4010'
HERE = os.path.dirname(os.path.abspath(__file__))
TV = re.search(r"const TERMS_V='([^']+)'", open(os.path.join(HERE, '..', '..', '..', 'sprout', 'acct.js')).read()).group(1)
SEED = """(()=>{try{const L=localStorage;L.setItem('sprout-debug','1');if(!L.getItem('sprout-accounts-v1'))L.setItem('sprout-accounts-v1',JSON.stringify({cur:'t1',list:{t1:{id:'t1',first:'Nick',last:'S',email:'scan@example.com',phone:'(555) 222-3333',dob:'1990-01-01',zip:'30301',salt:'s',pwh:'x',created:1,fidAsked:1,agree:{v:'__TV__',at:1,tos:true,privacy:true,esign:true}}}}));if(!L.getItem('sprout-server-code::t1'))L.setItem('sprout-server-code::t1','__CODE__')}catch(e){}})()""".replace('__TV__', TV)
R = []
def ck(n, c, i=''): R.append(('PASS ' if c else 'FAIL ') + n + ('' if c else ' ' + str(i)[:300]))
def mock(path, body=None):
    req = urllib.request.Request(MOCK + path, data=json.dumps(body).encode() if body is not None else None, headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read() or b'{}')
def kv(*cmd):
    req = urllib.request.Request(MOCK + '/kv', data=json.dumps(list(cmd)).encode(), headers={'Authorization': 'Bearer kvtoken'})
    return json.loads(urllib.request.urlopen(req).read())['result']
SHOTS = [os.path.join(HERE, 'shots_in', f) for f in sorted(os.listdir(os.path.join(HERE, 'shots_in')))]
mock('/reset', {})
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for code, label in [('free-code-5678', 'free')]:
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, service_workers='block'); ctx.add_init_script(SEED.replace('__CODE__', code))
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(BASE); pg.wait_for_timeout(5000)
        pg.evaluate("""(()=>{const s=__S.st(),f=d=>new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())).toISOString().slice(0,10);Object.assign(s,{setup:true,pay:1600,payFreq:'biweekly',firstPay:f(new Date(Date.now()+9*864e5)),cash:900,cashAt:Date.now(),cushion:100,everyday:300,discReduced:150,discTarget:150,sched:[]});__S.closeSheets();__S.plan()})()""")
        pg.wait_for_timeout(600)
        pg.evaluate("document.querySelector('[data-scan]').click()"); pg.wait_for_timeout(700)
        pg.set_input_files('#sc-file', SHOTS)
        for i in range(60):
            pg.wait_for_timeout(500)
            if pg.locator('#sc-body [data-scgo]').count(): break
        body = pg.inner_text('#sc-body')
        ck('five screenshots read together', 'upcoming payments' in body.lower(), body[:300])
        n = pg.locator('#sc-body .lgplan .scrow').count()
        ck('the same rows on every screenshot are listed once', n == 12, n)
        ck('upcoming payments show their installment', 'Payment 2 of 6' in body and 'Klarna · Audi South Atlanta' in body, body[:500])
        ck('the purchase that already happened is a transaction', pg.locator('#sc-body .scrow').count() == 13)
        go = pg.inner_text('#sc-body [data-scgo]')
        ck('button says what it adds', go == 'Add 1 transaction and 12 upcoming', go)
        pg.screenshot(path=os.path.join(HERE, '..', '..', 'shots', 's01_review.png'), full_page=True)
        pg.click('#sc-body [data-scgo]'); pg.wait_for_timeout(800)
        st = pg.evaluate("(()=>{const s=__S.st();return{sched:s.sched.map(x=>[x.d,x.name,x.group,x.amt]),spend:s.spend.filter(x=>x.src==='shot').map(x=>[x.note,x.amt,x.d])}})()")
        ck('upcoming payments added to the plan as must-pay', len(st['sched']) == 12 and all(x[2] == 'Affirm' for x in st['sched']), st['sched'][:3])
        ck('none of them counted as spending', len(st['spend']) == 1 and st['spend'][0][0].startswith('Target'), st['spend'])
        due = pg.evaluate("(()=>{const sp=__S.st().spend.map(x=>Object.assign({t:Date.parse(x.d)},x));__S.xGo('safe');return document.getElementById('x-body').innerText})()")
        ck('Safe to spend sets them aside before payday', 'Klarna' in due, due[:600])
        stats = mock('/stats')
        uid_keys = [k for k in stats['kvKeys'] if re.match(r'n:[^:]+:scan:\d{4}-\d{2}$', k)]
        cnt = int(kv('GET', uid_keys[0])) if uid_keys else -1
        ck('five screenshots count as one scan', cnt == 1, (uid_keys, cnt))
        # scanning again doesn't add the same payments twice
        pg.evaluate("__S.closeSheets()"); pg.wait_for_timeout(500)
        pg.evaluate("document.querySelector('[data-scan]').click()"); pg.wait_for_timeout(700)
        pg.set_input_files('#sc-file', SHOTS[:2])
        for i in range(60):
            pg.wait_for_timeout(500)
            if pg.locator('#sc-body [data-scgo]').count(): break
        body2 = pg.inner_text('#sc-body')
        ck('second scan knows they are already in the plan', '12 already in your plan' in body2, body2[:400])
        ck('no page errors', not errs, errs[:3])
        ctx.close()
    b.close()
print('\n'.join(R)); print(sum(r.startswith('PASS') for r in R), '/', len(R))
