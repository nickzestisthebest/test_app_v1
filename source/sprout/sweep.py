# screenshots of every main screen at phone size, light and dark, for a visual sweep
import os, csv, sys
from playwright.sync_api import sync_playwright
URL = 'file://' + os.getcwd() + '/v2_test.html'
rows = list(csv.DictReader(open('../csvin/tx.csv')))
os.makedirs('sweep', exist_ok=True)
theme = sys.argv[1] if len(sys.argv) > 1 else 'light'
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg = b.new_page(viewport={'width': 390, 'height': 844}, color_scheme=theme); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL); pg.wait_for_timeout(2500); S = pg.evaluate; W = pg.wait_for_timeout
    S(open('nick_seed.js').read(), rows); W(500)
    S("(()=>{__S.RC.usePay(__S.RC.pay());state.cash=1240;state.cashAt=Date.now();state.x2.plus={on:1,bill:'yr'};__T.ev('plan()')})()"); W(400)
    if theme == 'dark': S("document.documentElement.dataset.theme='dark'")
    S("__T.closeSheets()"); W(300)
    def shot(n): pg.screenshot(path='sweep/%s_%s.png' % (theme, n))
    S("document.querySelector('.tabbar [data-tab=home]').click()"); W(700); S("window.scrollTo(0,0)"); shot('01_home')
    S("window.scrollTo(0,700)"); W(300); shot('02_home2')
    S("document.querySelector('.tabbar [data-tab=money]').click()"); W(700); S("window.scrollTo(0,0)"); shot('03_fin')
    S("window.scrollTo(0,800)"); W(300); shot('04_fin2')
    for page in ['yourplan', 'accounts', 'paylater', 'subs', 'budgets', 'settings', 'credit', 'networth', 'safe']:
        S("__T.closeSheets()"); W(300); S("__T.xOpen('%s')" % page); W(600); shot('10_' + page)
    S("__T.closeSheets()"); W(300); S("__S.SP.open('ins')"); W(900); shot('20_spend')
    S("document.querySelector('[data-txview=list]').click()"); W(600); shot('21_spend_list')
    S("__T.closeSheets()"); W(300); S("document.getElementById('open-spend')&&document.getElementById('open-spend').click()"); W(700); shot('30_log')
    S("__T.closeSheets()"); W(300); S("document.getElementById('open-ask').click()"); W(700); shot('31_ask')
    S("__T.closeSheets()"); W(300); S("__T.ev(\"toastAct('Added 27 upcoming payments to your plan','Undo',()=>{})\")"); W(400); shot('32_toast')
    print('errors', errs[:3]); b.close()
