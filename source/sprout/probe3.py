import os, csv, json, sys
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'
rows=list(csv.DictReader(open('../csvin/tx.csv')))
shots=sys.argv[1:] or ['fin','home','plan','ins','pl','acc','vault']
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL);pg.wait_for_timeout(2500);S=pg.evaluate;W=pg.wait_for_timeout
    S(open('nick_seed.js').read(),rows);S("__T.closeSheets()");W(400)
    def sheet(name,arg=None):
        S("__T.closeSheets()");W(300);S("__T.xOpen(%s%s)"%(json.dumps(name),(','+json.dumps(arg)) if arg else ''));W(600)
        h=S("document.querySelector('#sh-x .panel').scrollHeight");pg.set_viewport_size({'width':390,'height':max(844,min(4000,h+80))});W(300)
        pg.screenshot(path='probe/s_'+name+'.png');pg.set_viewport_size({'width':390,'height':844})
    for s in shots:
        if s=='fin':
            S("__T.setTab('money')");W(700);pg.screenshot(path='probe/s_fin.png',full_page=True)
        elif s=='home':
            S("__T.goHome&&__T.goHome()");S("window.__T.setView('ov')");W(700);pg.screenshot(path='probe/s_home.png',full_page=True)
        elif s=='plan': sheet('yourplan')
        elif s=='pl': sheet('paylater')
        elif s=='acc': sheet('accounts')
        elif s=='vault': sheet('vault')
        elif s=='ins':
            S("__T.ev(\"SP.open('ins')\")");W(900);h=S("document.querySelector('#txv').scrollHeight");pg.set_viewport_size({'width':390,'height':max(844,min(4000,h))});W(300);pg.screenshot(path='probe/s_ins.png');pg.set_viewport_size({'width':390,'height':844});S("__T.ev('closeTx()')");W(300)
        else: sheet(s)
    print('errors',errs[:4]);b.close()
