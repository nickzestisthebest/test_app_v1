import os,sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3200)
    def c(sel,w=600):
        pg.click(sel);pg.wait_for_timeout(w)
    c('[data-wact=connect]',800)
    for k in ['checking','cards','loans','later']: c('[data-lk=conn][data-v=%s]'%k,1300)
    c('[data-lk=next]',400);c('[data-lk=finish]',2500)
    pg.screenshot(path='x_home.png')
    c('.tb[data-tab=money]');pg.screenshot(path='x_money.png')
    for pgn in ['subs','nego','budgets','networth','credit','vault','calendar','alerts','house','plus']:
        c('.tb[data-tab=money]',300)
        c('#pg [data-x=open][data-v=%s]'%pgn,700);pg.screenshot(path='x_%s.png'%pgn)
        pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    # cancel flow
    c('#pg [data-x=open][data-v=subs]',600);c('[data-x=open][data-v=cancel][data-w=adobe]',500);c('[data-x=runcancel]',4000);pg.screenshot(path='x_cancelled.png');c('[data-x=redir]',300);pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    c('#pg [data-x=open][data-v=nego]',600);c('[data-x=runnego][data-v=phone]',5000);pg.screenshot(path='x_nego_done.png');pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    c('#pg [data-x=open][data-v=vault]',600);c('[data-x=vadd][data-v="100"]',300);c('[data-x=vtog][data-v=pay]',300)
    pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    c('.tb[data-tab=community]',800);pg.screenshot(path='x_feed.png')
    c('[data-x=like]',300);c('[data-x=open][data-v=comments]',600);pg.fill('#cm-in','Nice work!');c('[data-x=cmsend]',300);pg.screenshot(path='x_cm.png');pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    c('[data-x=open][data-v=compose]',600);pg.fill('#cp-txt','Paid $150 to my student loan this month.');pg.screenshot(path='x_compose.png');c('[data-x=cpost]',600);pg.screenshot(path='x_feed2.png')
    c('[data-x=seg][data-v=qa]',500);pg.screenshot(path='x_qa.png');c('[data-x=open][data-v=q]',600);pg.fill('#an-in','Pay the 29 percent card first.');c('[data-x=answer]',300);pg.screenshot(path='x_q.png');pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    c('[data-x=open][data-v=ask]',600);pg.fill('#aq-in','How do I start an emergency fund?');c('[data-x=aqpost]',600)
    c('[data-x=seg][data-v=groups]',500);pg.screenshot(path='x_groups.png');c('[data-x=open][data-v=group][data-w=g2]',600);c('#x-body [data-x=join][data-v=g2]',300);c('[data-x=tick]',300);pg.screenshot(path='x_group.png');pg.click('.sheet.on button.lnk[data-close]');pg.wait_for_timeout(400)
    c('.tb[data-tab=home]',600);pg.screenshot(path='x_home2.png')
    print(errs)
