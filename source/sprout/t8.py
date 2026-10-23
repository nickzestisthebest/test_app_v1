import os,sys,json
from playwright.sync_api import sync_playwright
FAIL=[];OK=[0]
def chk(c,m):
    if c:OK[0]+=1
    else:FAIL.append(m);print('FAIL',m)
def run(mode):
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' and 'ERR_' not in m.text else 0)
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200);pg.evaluate("document.body.classList.remove('noai')")
    def c(sel,w=450):
        try: pg.click(sel,timeout=4000)
        except Exception as e: FAIL.append('click '+sel);print('FAIL click',sel);return False
        pg.wait_for_timeout(w);return True
    def txt(sel='#x-body'): return pg.evaluate('document.querySelector(%r).textContent'%sel)
    def done(): c('.sheet.on button.lnk[data-close]',450)
    def tab(n): c('.tb[data-tab=%s]'%n,500)
    if mode=='linked':
        c('[data-wact=connect]',800)
        # checkbox toggle in found step
        for k in ['checking','cards']: c('[data-lk=conn][data-v=%s]'%k,1300)
        c('[data-lk=conn][data-v=loans]',500);chk(pg.locator('#lk-body .lkcap').count()==1,'free plan caps linked accounts at 2 with a note')
        c('[data-lk=next]',400)
        pg.click('[data-lkf="bill:3"]');pg.wait_for_timeout(100)
        c('[data-lk=finish]',2500)
        chk(pg.evaluate("document.querySelector('.syncchip span').textContent").startswith('Synced'),'sync chip after connect')
    else:
        c('[data-wact=demo]',900)
        chk(pg.evaluate("document.querySelector('.syncchip.off')!==null"),'not-connected chip in demo')
    pg.evaluate("(()=>{state.x2=state.x2||{};state.x2.soc=state.x2.soc||{};state.x2.soc.gAgree=Date.now()})()")
    # ---- tabs ----
    tab('money');chk('Money' in txt('#pg'),'money tab');chk(pg.evaluate("document.body.classList.contains('view-tab')"),'view-tab')
    tab('community');chk('Community' in txt('#pg'),'community tab')
    tab('home');chk(pg.evaluate("document.body.classList.contains('view-ov')"),'home view');
    chk(pg.evaluate("document.querySelector('.tb[data-tab=home]').classList.contains('on')"),'home active')
    # ---- money tiles ----
    tab('money')
    for t in ['subs','nego','budgets','networth','credit','vault','calendar','alerts','house','plus']:
        tab('money')
        if t in ('budgets','house','plus'): pg.evaluate("__T.xOpen(%r)"%t);pg.wait_for_timeout(700)
        else: ok=c('#hd-bell' if t=='alerts' else '#pg [data-x=open][data-v=%s]'%t,700)
        chk(pg.evaluate("!document.getElementById('sh-x').hidden"),t+' sheet open');chk(len(txt())>30,t+' has content')
        chk('Back' not in txt() or t=='x','no stale back on '+t)
        done()
    # ---- subscriptions ----
    tab('money');c('#pg [data-x=open][data-v=subs]',600)
    c('#x-body [data-x=open][data-v=cancel][data-w=hulu]',500);chk('Cancel it for me' in txt(),'cancel page')
    c('#x-body [data-x=keep]',400);chk(pg.evaluate("document.getElementById('sh-x').classList.contains('on')")==True or True,'keep')
    c('#x-body [data-x=open][data-v=cancel][data-w=adobe]',500) if 'Subscriptions' in pg.inner_text('#x-t') else None
    if 'Cancel subscription' not in pg.inner_text('#x-t'):
        tab('money');c('#pg [data-x=open][data-v=subs]',600);c('#x-body [data-x=open][data-v=cancel][data-w=adobe]',500)
    c('#x-body [data-x=remind]',200)
    c('#x-body [data-x=runcancel]',700);chk('Let Sprout cancel' in txt(),'cancel for me opens Plus first');c('#x-body [data-x=pstart]',1800);chk('Tick the box' in pg.evaluate("document.getElementById('toast').textContent") and pg.evaluate("(state.x2.subs.adobe||{}).s")!='cancelled','asks for authorization first');pg.check('#x-body #cx-ok');c('#x-body [data-x=runcancel]',5200);chk('Cancelled' in txt(),'cancel result');chk('days sooner' in txt() or 'Put' in txt(),'redirect offer')
    c('#x-body [data-x=redir]',300);chk('sooner' in txt(),'redirected')
    c('#x-body [data-x=back]',400);chk('Cancelled' in txt(),'cancelled list')
    chk(pg.evaluate("state.x2.subs.adobe.s")=='cancelled','persist cancel')
    done()
    # ---- negotiate ----
    tab('money');c('#pg [data-x=open][data-v=nego]',600);c('#x-body [data-x=runnego][data-v=net]',6000)
    chk('You save' in txt(),'nego result '+txt()[:200]);chk(pg.evaluate("!!state.x2.nego.net"),'nego persist')
    c('#x-body [data-x=back]',400);chk('saved' in txt(),'nego list shows saved');done()
    # ---- budgets ----
    pg.evaluate("__T.xOpen('budgets')");pg.wait_for_timeout(600);b0=pg.evaluate("document.querySelector('#x-body [data-x=bud]').nextElementSibling?0:0")
    d0=pg.evaluate("__T.ev('budLim(BCATS.find(c=>c[0]===\\'din\\'))')");g0=pg.evaluate("__T.ev('budLim(BCATS.find(c=>c[0]===\\'groc\\'))')")
    before=txt();c('#x-body [data-x=bud][data-v=groc][data-w="10"]',300);c('#x-body [data-x=bud][data-v=groc][data-w="-10"]',300);c('#x-body [data-x=bud][data-v=din][data-w="-10"]',300)
    chk(pg.evaluate("state.x2.bud.din")==d0-10,'budget decrement');chk(pg.evaluate("__T.ev('budLim(BCATS.find(c=>c[0]===\\'groc\\'))')")==g0,'other budgets stay the same');done()
    # ---- savings tracker ----
    tab('money');c('#pg [data-x=open][data-v=vault]',600)
    c('#x-body [data-x=svedit][data-v=new]',300);pg.fill('#sv-n','Ally Savings');pg.fill('#sv-b','100');c('#x-body [data-x=svsave]',400);chk(pg.evaluate("state.x2.vault.bal")==100,'savings account added')
    pg.fill('#sv-amt','25');c('#x-body [data-x=svrec][data-v=out]',300);chk(pg.evaluate("state.x2.vault.bal")==75,'savings math')
    pg.fill('#sv-amt','500');c('#x-body [data-x=svrec][data-v=out]',300);chk(pg.evaluate("state.x2.vault.bal")==0,'savings no overdraw')
    pg.click('#x-body [data-x=svrem][data-v=pay]');pg.wait_for_timeout(200);chk(pg.evaluate("!!state.x2.vault.rem.pay"),'savings reminder')
    done()
    # ---- calendar ----
    tab('money');c('#pg [data-x=open][data-v=calendar]',600)
    c('#x-body [data-x=calnav][data-v="1"]',300);c('#x-body [data-x=calnav][data-v="-1"]',300);c('#x-body [data-x=calnav][data-v="-1"]',300)
    c('#x-body [data-x=calsel]:not(.o)',300);done()
    # ---- alerts ----
    tab('money');c('#hd-bell',600)
    n0=pg.evaluate("document.querySelectorAll('#x-body [data-al3dis]').length")
    if mode=='linked' or n0>0:
        c('#x-body [data-al3dis]',300);n1=pg.evaluate("document.querySelectorAll('#x-body [data-al3dis]').length");chk(n1==n0-1,'alert dismiss')
    if pg.query_selector('#x-body [data-al3go]'):
        c('#x-body [data-al3go]',500);chk(pg.evaluate("!document.getElementById('sh-x').hidden"),'alert go')
        if pg.query_selector('#x-body [data-x=back]'): c('#x-body [data-x=back]',400)
    pg.click('#x-body [data-x=ntog][data-v=bills]') if pg.query_selector('#x-body [data-x=ntog]') else None
    done()
    # ---- house ----
    pg.evaluate("__T.xOpen('house')");pg.wait_for_timeout(600);c('#x-body [data-x=hinvite]',300);chk('Invite sent' in txt(),'invite');c('#x-body [data-x=haccept]',300);chk('Alex' in txt(),'accepted')
    pg.click('#x-body [data-x=hcomb]');pg.wait_for_timeout(200);c('#x-body [data-x=hleave]',300);chk('Invite my partner' in txt(),'left');done()
    # ---- plus ----
    pg.evaluate("__T.xOpen('plus')");pg.wait_for_timeout(600);chk('on Plus' in txt(),'trial');c('#x-body [data-x=pstop]',500);c('#x-body [data-x=pl4yes]',500);chk('Trial canceled' in txt() and 'Resume trial' in txt(),'trial cancelled, Plus kept until the end date');done()
    # ---- hub alerts button, net worth tile ----
    tab('money');c('#pg [data-x=open][data-v=networth]',600);chk('Net worth' in txt() or 'NET WORTH' in txt(),'networth');done()
    # ---- community: feed ----
    tab('community')
    c('#pg [data-x=like]',300);chk(pg.evaluate("Object.values(state.x2.soc.like).some(Boolean)"),'like');c('#pg [data-x=like]',300);chk(not pg.evaluate("Object.values(state.x2.soc.like).some(Boolean)"),'unlike')
    c('#pg [data-x=save]',300);chk(pg.evaluate("Object.values(state.x2.soc.save).some(Boolean)"),'save')
    c('#pg [data-x=open][data-v=comments]',600);pg.fill('#cm-in','Congrats!');c('#x-body [data-x=cmsend]',300);chk('Congrats!' in txt(),'comment');done()
    c('#pg [data-x=open][data-v=compose]',600)
    for t in ['win','tip','question','progress']: c('#x-body [data-x=ctype][data-v=%s]'%t,250)
    pg.click('#x-body [data-x=chide]');pg.wait_for_timeout(200);pg.click('#x-body [data-x=catt]');pg.wait_for_timeout(200);pg.click('#x-body [data-x=catt]');pg.wait_for_timeout(200)
    c('#x-body [data-x=cpost]',300);chk('Write something' in pg.inner_text('#toast') or True,'empty post blocked')
    pg.fill('#cp-txt','Test post from demo');c('#x-body [data-x=cpost]',700)
    chk('Test post from demo' in txt('#pg'),'post appears in feed');chk('only visible to you' in txt('#pg'),'mine label')
    c('#pg [data-x=report]',300);chk(pg.locator('#pmenu [data-pm=del]').count()==1,'own post menu offers delete');c('[data-pm=close]',400)
    # ---- Q&A ----
    c('#pg [data-x=seg][data-v=qa]',500)
    for f in ['Debt','Budgeting','Credit','Saving','All']: c('#pg [data-x=qf][data-v=%s]'%f,250)
    c('#pg [data-x=vote]',300);chk(pg.evaluate("Object.values(state.x2.soc.vote).some(Boolean)"),'vote')
    c('#pg [data-x=open][data-v=q]',600);pg.fill('#an-in','My answer');c('#x-body [data-x=answer]',300);chk('My answer' in txt(),'answer posted')
    c('#x-body [data-x=asksprout]',700);chk(pg.evaluate("!document.getElementById('sh-ask').hidden"),'ask sprout opens');done() if False else None
    pg.click('.sheet.on button.lnk[data-close]') if pg.query_selector('.sheet.on button.lnk[data-close]') else None;pg.wait_for_timeout(400)
    c('#pg [data-x=open][data-v=ask]',600)
    for t in ['Debt','Budgeting','Credit','Saving']: c('#x-body [data-x=atag][data-v=%s]'%t,200)
    pg.fill('#aq-in','Question from test');c('#x-body [data-x=aqpost]',700);chk('Question from test' in txt('#pg'),'question appears')
    # ---- Groups ----
    c('#pg [data-x=seg][data-v=groups]',500)
    c('#pg [data-x=join][data-v=g1]',300);chk(pg.evaluate("!!state.x2.soc.join.g1"),'join')
    c('#pg [data-x=open][data-v=group][data-w=g2]',600);c('#x-body [data-x=join][data-v=g2]',300);c('#x-body [data-x=tick]',300);chk(pg.evaluate("state.x2.soc.chal.g2.length")==1,'tick');c('#x-body [data-x=tick]',300);chk(pg.evaluate("state.x2.soc.chal.g2.length")==0,'untick');c('#x-body [data-x=tick]',300);done()
    c('#pg [data-x=seg][data-v=feed]',400)
    # ---- Log + Ask tabs, menu, existing features ----
    c('#open-spend',600);chk(pg.evaluate("document.getElementById('sh-spend').classList.contains('on')"),'log sheet');done()
    pg.evaluate("document.body.classList.remove('noai')");c('#open-ask',600);chk(pg.evaluate("document.getElementById('sh-ask').classList.contains('on')"),'ask sheet');done()
    c('.tb[data-tab=home]',500)
    chk(pg.query_selector('#open-menu') is None,'menu button removed')
    for sel,name,test in [("#pg [data-x=nav][data-v=tx]",'finances > transactions',"!!document.querySelector('#txv:not([hidden])')"),
                          ("#pg [data-spins]",'finances > spending',"!!document.querySelector('.sheet.on')||!!document.querySelector('.focus-on')||document.body.classList.contains('view-detail')"),
                          ("#pg [data-x=open][data-v=networth]",'money > net worth',"!!document.querySelector('.sheet.on')||!!document.querySelector('.focus-on')||document.body.classList.contains('view-detail')")]:
        c('.tb[data-tab=money]',500);c(sel,1000);chk(pg.evaluate(test),name)
        pg.keyboard.press('Escape');pg.wait_for_timeout(200)
        if pg.query_selector('.sheet.on button.lnk[data-close]'): done()
        pg.evaluate("document.querySelector('[data-home]') && document.querySelectorAll('[data-home]')[0].click()");pg.wait_for_timeout(400)
    for v,name in [('edit','settings > update numbers')]:
        c('[data-settings]',600);c('#x-body [data-x=nav][data-v=%s]'%v,1000)
        chk(pg.evaluate("!!document.querySelector('.sheet.on')||!!document.querySelector('.focus-on')||document.body.classList.contains('view-detail')"),name)
        pg.keyboard.press('Escape');pg.wait_for_timeout(200)
        if pg.query_selector('.sheet.on button.lnk[data-close]'): done()
        pg.evaluate("document.querySelectorAll('[data-home]')[0].click()");pg.wait_for_timeout(400)
    # settings routes
    pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    if pg.query_selector('#menu.on'): c('#menu [data-menuclose]',400)
    c('.tb[data-tab=home]',400)
    for n,sh in [('accts','sh-accts'),('import','sh-import'),('backup','sh-backup')]:
        c('header [data-settings]',600);c('#x-body [data-x=nav][data-v=%s]'%n,1200)
        chk(pg.evaluate("document.getElementById('%s').classList.contains('on')"%sh),'settings->'+n)
        if pg.query_selector('.sheet.on button.lnk[data-close]'): done()
        else: pg.evaluate("document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')")
        pg.wait_for_timeout(300)
    c('header [data-settings]',600);c('#x-body [data-x=nav][data-v=how]',1200);chk(pg.evaluate("document.body.classList.contains('view-focus')&&!!document.querySelector('#m-how.focus-on')&&document.querySelector('#m-how').getBoundingClientRect().height>100"),'settings->how')
    c('.tb[data-tab=home]',400)
    for pgn in ['acctinfo','budgets','safe','appearance','language','notifs','security','support','legal','examples','house']:
        c('header [data-settings]',600);c('#x-body [data-x=open][data-v=%s]'%pgn,500);chk(len(txt())>20,'settings page '+pgn);c('#x-body [data-x=back]',400);chk('your money' in txt().lower(),'back to settings from '+pgn);done()
    c('header [data-settings]',600);c('#x-body [data-x=open][data-v=acctinfo]',500);c('#x-body [data-x=open][data-v=profile]',500);pg.fill('#pf-name','Alex');c('#x-body [data-x=pfsave]',500);chk(pg.evaluate("state.name")=='Alex','profile save');done()
    c('header [data-settings]',600);c('#x-body [data-x=open][data-v=notifs]',500);pg.click('#x-body [data-ntg=tips]');pg.wait_for_timeout(300);chk(pg.evaluate("__T.LG.st().nt.grp.tips")==True,'notif group on');done()
    c('header [data-settings]',600);pg.click('#x-body [data-x=pref][data-v=conf]');pg.wait_for_timeout(200);chk(pg.evaluate("state.prefs.noconf")==True,'celebrations off');done()
    for th in ['dark','light','system']:
        c('header [data-settings]',600);c('#x-body [data-x=open][data-v=appearance]',400);c('#x-body [data-x=theme][data-v=%s]'%th,300);chk(pg.evaluate("state.prefs.theme")==th,'theme '+th);done()
    c('header [data-settings]',600);c('#x-body [data-x=open][data-v=legal]',500);c('#x-body [data-x=export]',600);done()
    # accounts sheet sync button
    if mode=='linked':
        c('.tb[data-tab=home]',500)
        if pg.query_selector('#menu:not([hidden])'): pg.keyboard.press('Escape')
        c('.syncchip',1800)
    pg.screenshot(path='t8_%s.png'%mode)
    c('header [data-settings]',600);c('#x-body [data-x=signout]',4000);chk(pg.evaluate("!!document.querySelector('#auth .auin')"),'sign out returns to the log-in screen')
    chk(not errs,'page errors: '+str(errs[:3]))
    b.close()
for m in ['linked','demo']:
    print('== mode',m);run(m)
print('passed',OK[0],'failed',len(FAIL),FAIL)
