import json,os
from playwright.sync_api import sync_playwright
own=open('owner_test.json').read()
FAKE_PDF="""
window.pdfjsLib={GlobalWorkerOptions:{},getDocument:()=>({promise:Promise.resolve({numPages:1,getPage:async()=>({getTextContent:async()=>({items:window.__items})})})})};
"""
lines=open('wf.txt').read().split('\n')
items=[];y=800
for l in lines:
    y-=12
    if not l.strip(): continue
    import re
    parts=re.split(r'\s{2,}',l.strip())
    x=10
    for p in parts:
        items.append({'str':p,'transform':[1,0,0,1,x,y]});x+=100
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':1400})
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m: errs.append('C:'+m.text) if m.type=='error' else None)
    pg.add_init_script("""window.__calls=[];window.claude={use:async(n)=>{if(n==='sample')return {limits:async()=>({images:true}),json:async(pr)=>{window.__calls.push(pr.slice(0,40));return {rows:[
 {date:'2026-09-24',desc:'Online Transfer to Wells Fargo Active Cash VISA',amount:-149,pending:false},
 {date:'2026-09-23',desc:'Purchase 365 Market',amount:-3.90,pending:false},
 {date:'2026-09-14',desc:'Money Transfer From Qc Clearing LLC FL',amount:54.37,pending:true}]}}};throw new Error('x')}};
 localStorage.setItem('sprout-state-v1',%s);""" % json.dumps(own))
    pg.add_init_script("window.__items=%s;"%json.dumps(items)+FAKE_PDF)
    pg.goto('file://'+os.getcwd()+'/sprout_test.html')
    pg.wait_for_timeout(3500)
    def imp(path=None,paste=None,acct='Capital One checking',kind='checking'):
        pg.evaluate("openSheet('sh-import');imOpen()")
        pg.wait_for_timeout(300)
        pg.fill('#im-acct',acct)
        pg.evaluate("IM.acct=%s;IM.kind=%s"%(json.dumps(acct),json.dumps(kind)))
        if path: pg.set_input_files('#im-file',path)
        else:
            pg.fill('#im-paste',paste);pg.click('[data-im=paste]')
        pg.wait_for_timeout(1200)
    imp('cap.csv')
    print('REVIEW1',pg.evaluate("IM.rows.map(r=>[r.m.slice(0,22),r.a,r.cat,r.matched?r.note:'',r.dup||''].join('|'))"))
    pg.screenshot(path='im_review.png')
    pg.click('[data-im=apply]');pg.wait_for_timeout(500)
    print('RESULT',pg.evaluate("IM.result"),'paid',pg.evaluate("Object.keys(state.paid)"))
    # dedupe re-import
    imp('cap.csv')
    print('DUP',pg.evaluate("IM.rows.filter(r=>r.dup).length+'/'+IM.rows.length"))
    # wells headerless
    imp('wf.csv',acct='Wells Fargo')
    print('WF',pg.evaluate("IM.rows.map(r=>[r.m.slice(0,22),r.a,r.cat].join('|'))"))
    pg.click('[data-im=apply]');pg.wait_for_timeout(300)
    # card csv
    imp('card.csv',acct='Apple Card',kind='card')
    print('CARD',pg.evaluate("[IM.flip,IM.rows.map(r=>[r.m.slice(0,18),r.a,r.cat].join('|'))]"))
    pg.click('[data-im=apply]');pg.wait_for_timeout(300)
    # pending then posted
    imp('pend.csv',acct='Capital One checking');pg.click('[data-im=apply]');pg.wait_for_timeout(300)
    print('PEND',pg.evaluate("state.spend.filter(s=>s.pending).map(s=>s.note+s.amt)"))
    imp('post.csv',acct='Capital One checking')
    print('POST',pg.evaluate("IM.rows.map(r=>[r.m,r.replaces||''].join('|'))"))
    pg.click('[data-im=apply]');pg.wait_for_timeout(300)
    print('AFTER',pg.evaluate("state.spend.filter(s=>/chipotle/i.test(s.note)).map(s=>[s.note,s.pending||false,s.amt].join('|'))"),'hist',pg.evaluate("HIST.length"))
    # pdf
    pdf=open('/tmp/x.pdf','wb');pdf.write(b'%PDF-1.4');pdf.close()
    imp('/tmp/x.pdf',acct='Wells Fargo checking')
    print('PDF',pg.evaluate("IM.rows.map(r=>[r.m.slice(0,26),r.a,r.cat,r.p].join('|'))"),pg.evaluate("window.__calls"))
    pg.screenshot(path='im_pdf.png')
    pg.evaluate("closeSheets()")
    # insights
    pg.evaluate("insOpen()");pg.wait_for_timeout(500);pg.screenshot(path='ins.png')
    # transactions list
    print('ERR',errs)
    print('TXN',pg.evaluate("state.spend.length"))
