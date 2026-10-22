# A screen recording picked in the scan sheet turns into a few distinct still frames
import os
from playwright.sync_api import sync_playwright
URL = 'file://' + os.getcwd() + '/v2_test.html'
VID = os.path.join(os.getcwd(), '..', 'vid', 'scroll.webm')
R = []
def ck(n, c, info=''): R.append(('PASS ' if c else 'FAIL ') + n + ('' if c else ' ' + str(info)[:300]))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2500); S = pg.evaluate
    S("__T.closeSheets()"); pg.wait_for_timeout(300)
    S("document.querySelector('[data-scan]').click()"); pg.wait_for_timeout(600)
    ck('scan sheet accepts recordings', 'video/*' in (S("document.getElementById('sc-file').accept") or ''), S("document.getElementById('sc-file').accept"))
    ck('scan sheet mentions recordings', 'screen recording' in pg.inner_text('#sc-body'), pg.inner_text('#sc-body')[:200])
    pg.set_input_files('#sc-file', VID)
    for i in range(40):
        pg.wait_for_timeout(500)
        n = S("document.querySelectorAll('#sc-body .scthumbs img').length")
        if n and 'Reading' not in pg.inner_text('#sc-body'): break
    n = S("document.querySelectorAll('#sc-body .scthumbs img').length")
    ck('recording became 3 to 8 still frames', 3 <= n <= 8, n)
    pg.screenshot(path='t58_frames.png')
    ck('no page errors', not errs, errs[:3])
    b.close()
print('\n'.join(R)); print(sum(r.startswith('PASS') for r in R), '/', len(R))
