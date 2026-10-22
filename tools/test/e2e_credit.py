"""Credit reports read on the real server path, personal details kept off it, and Face ID with a real passkey.
Run tools/test/run_servers.sh first."""
import os, re, json, urllib.request
from playwright.sync_api import sync_playwright
from reportlab.pdfgen import canvas
BASE = 'http://localhost:3000'; MOCK = 'http://127.0.0.1:4010'
HERE = os.path.dirname(os.path.abspath(__file__))
TV = re.search(r"const TERMS_V='([^']+)'", open(os.path.join(HERE, '..', '..', '..', 'sprout', 'acct.js')).read()).group(1)
SEED = """(()=>{try{const L=localStorage;L.setItem('sprout-debug','1');if(!L.getItem('sprout-accounts-v1'))L.setItem('sprout-accounts-v1',JSON.stringify({cur:'t1',list:{t1:{id:'t1',first:'Nick',last:'S',email:'credit@example.com',phone:'(555) 222-3333',dob:'1990-01-01',zip:'30301',salt:'s',pwh:'x',created:1,fidAsked:1,agree:{v:'__TV__',at:1,tos:true,privacy:true,esign:true}}}}));if(!L.getItem('sprout-server-code::t1'))L.setItem('sprout-server-code::t1','free-code-5678')}catch(e){}})()""".replace('__TV__', TV)
R = []
def ck(n, c, i=''): R.append(('PASS ' if c else 'FAIL ') + n + ('' if c else ' ' + str(i)[:300]))
def mock(path, body=None):
    req = urllib.request.Request(MOCK + path, data=json.dumps(body).encode() if body is not None else None, headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read() or b'{}')
# a small report PDF with things that must never leave the phone
pdf = os.path.join(HERE, 'shots_out_report.pdf')
c = canvas.Canvas(pdf)
lines = ['TransUnion Personal Credit Report', 'Name: Nick S   SSN: 123-45-6789   Date of birth: 01/01/1990', 'Address: 100 Peachtree St, Atlanta GA',
         'Account: DISCOVER IT   Account number 6011 2233 4455 1234   Opened 06/2018   Credit limit $3,000   Balance $1,650   Pay status: Current',
         'Account: NELNET   Student loan   Opened 09/2015   Original amount $22,000   Balance $11,800   30 days late: 2 (11/2023)',
         'Inquiries that may affect your score: CAPITAL ONE  ' + '09/2026', 'Promotional inquiries (do not affect your score): many lenders'] * 3
y = 800
for l in lines:
    c.drawString(40, y, l); y -= 18
c.save()
mock('/reset', {})
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, service_workers='block'); ctx.add_init_script(SEED)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_timeout(5000)
    pg.evaluate("""(()=>{const s=__S.st();Object.assign(s,{setup:true,pay:1600,payFreq:'biweekly',cash:900,cashAt:Date.now(),cushion:100,everyday:300,discReduced:150,discTarget:150});__S.closeSheets();__S.plan()})()""")
    pg.wait_for_timeout(500)
    pg.evaluate("__S.xGo('credit')"); pg.wait_for_timeout(600)
    ck('credit page starts with how to get the free report', 'AnnualCreditReport.com' in pg.inner_text('#x-body'))
    # the phone loads its PDF reader from cdnjs; this sandbox can't reach it, so the same library is served locally
    PJ = '/opt/npm-tools/node_modules/pdfjs-dist/build/'
    pg.route('**/__pdfjs/*', lambda r: r.fulfill(status=200, headers={'content-type': 'text/javascript'}, body=open(PJ + r.request.url.rsplit('/', 1)[1], 'rb').read()))
    pg.evaluate("(async()=>{const m=await import('/__pdfjs/pdf.min.mjs');m.GlobalWorkerOptions.workerSrc='/__pdfjs/pdf.worker.min.mjs';window.pdfjsLib=m})()"); pg.wait_for_timeout(800)
    pg.set_input_files('#cr-file', [pdf])
    for i in range(60):
        pg.wait_for_timeout(500)
        if 'Discover It' in pg.inner_text('#x-body'): break
    body = pg.inner_text('#x-body')
    ck('the report is read on the server and shown', 'Discover It' in body and 'Nelnet' in body, body[:400])
    ck('card usage from the report', 'Card usage is 55%' in body, body[:600])
    ck('late payments from the report', '2 late payments' in body)
    st = mock('/stats'); sent = st.get('creditText', '')
    ck('the server got the report text', 'DISCOVER IT' in sent, sent[:200])
    ck('the Social Security number never left the phone', '123-45-6789' not in sent and '6789' not in sent, sent[:300])
    ck('full account numbers never left the phone', '6011 2233 4455' not in sent and '****1234' in sent, sent[:300])
    ck('the student loan is offered as a debt Sprout didn’t know about', 'Not in Sprout yet'.upper() in body.upper())
    # a score screenshot
    pg.set_input_files('#cr-file', [os.path.join(HERE, '..', '..', 'public', 'icons', 'icon-192.png')])
    for i in range(60):
        pg.wait_for_timeout(500)
        if '702' in pg.inner_text('#x-body'): break
    body = pg.inner_text('#x-body')
    ck('a score screenshot adds the score', '702' in body and 'FICO 8' in body, body[:300])
    pg.screenshot(path=os.path.join(HERE, '..', '..', 'shots', 'cr01.png'), full_page=True)
    keys = [k for k in mock('/stats')['kvKeys'] if re.match(r'n:[^:]+:credit:\d{4}-\d{2}$', k)]
    ck('reading reports is counted against the monthly limit', len(keys) == 1, keys)
    pg.evaluate("__S.closeSheets()"); pg.wait_for_timeout(400)
    # ---- Face ID with a real passkey (a virtual authenticator stands in for the iPhone)
    cdp = ctx.new_cdp_session(pg); cdp.send('WebAuthn.enable')
    au = cdp.send('WebAuthn.addVirtualAuthenticator', {'options': {'protocol': 'ctap2', 'transport': 'internal', 'hasResidentKey': True, 'hasUserVerification': True, 'isUserVerified': True}})['authenticatorId']
    ck('this phone can do Face ID', pg.evaluate("(async()=>{__S.PK.ok=null;return await __S.PK.can()})()"))
    pg.evaluate("(async()=>{const a=__S.acct();window.__r1=await __S.PK.check(a).then(()=>1).catch(e=>'x '+e.name)})()"); pg.wait_for_timeout(1500)
    ck('turning on Face ID makes a passkey', pg.evaluate("window.__r1") == 1 and len(cdp.send('WebAuthn.getCredentials', {'authenticatorId': au})['credentials']) == 1, pg.evaluate("window.__r1"))
    ck('Sprout remembers which passkey is this account’s', pg.evaluate("!!JSON.parse(localStorage.getItem('sprout-accounts-v1')).fidc.t1"))
    pg.evaluate("(async()=>{const a=__S.acct();window.__r2=await __S.PK.check(a).then(()=>1).catch(e=>'x '+e.name)})()"); pg.wait_for_timeout(1500)
    ck('opening Sprout checks the same passkey', pg.evaluate("window.__r2") == 1 and len(cdp.send('WebAuthn.getCredentials', {'authenticatorId': au})['credentials']) == 1)
    cdp.send('WebAuthn.setUserVerified', {'authenticatorId': au, 'isUserVerified': False})
    pg.evaluate("(async()=>{const a=__S.acct();window.__r3=await __S.PK.check(a).then(()=>1).catch(e=>'x '+e.name)})()"); pg.wait_for_timeout(2500)
    ck('if Face ID fails, it doesn’t unlock', pg.evaluate("window.__r3") != 1, pg.evaluate("window.__r3"))
    ck('no page errors', not errs, errs[:3])
    ctx.close(); b.close()
os.remove(pdf)
print('\n'.join(R)); print(sum(r.startswith('PASS') for r in R), '/', len(R))
