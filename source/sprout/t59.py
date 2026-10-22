# The person's own exported transactions, run through the ledger rules: what's income, what's spending, what's just moving money
import os, csv, json, datetime
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'
rows=list(csv.DictReader(open('../csvin/tx.csv')))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
    pg.goto(URL);pg.wait_for_timeout(2500)
    pg.evaluate("""(R)=>{const reg=JSON.parse(localStorage.getItem('sprout-accounts-v1'));reg.list[reg.cur].first='Alex';reg.list[reg.cur].last='Rivera';localStorage.setItem('sprout-accounts-v1',JSON.stringify(reg));
      const labs=[...new Set(R.map(r=>r.Account))],accts=labs.map((l,i)=>{const m=l.match(/^(.*) ••(\\d+)$/);const card=/credit card|savor/i.test(l);return{id:'a'+i,name:m[1],mask:m[2],kind:card?'card':'checking',sub:/savings/i.test(l)?'savings':card?'credit card':'checking',cur:0,avail:0,item:'it'}});
      const H=[],S=[];R.forEach((r,i)=>{const k='csv'+i,a=+r.Amount,card=/credit card|savor/i.test(r.Account);H.push({k,d:r.Date,a,m:r.Description,ac:r.Account,c:r.Category,p:0});
        if(r.Category!=='Skip')S.push({d:r.Date,amt:Math.abs(a),cat:r.Category,note:r.Description.slice(0,60),at:Date.parse(r.Date),tid:k,acct:r.Account,src:'import',kind:r.Category==='Income'?'Other':undefined,card:card||undefined})});
      HIST.length=0;H.forEach(h=>HIST.push(h));Object.assign(state,{setup:true,demo:false,spend:S,link:{on:1,live:1,accts,items:[{item_id:'it',inst:'Bank'}],debtAcct:{},liab:{}},lg:{}});
      __T.LG.after()}""",rows)
    print('pair', pg.evaluate("(()=>{try{__T.LG.pairOwn();return [HIST.filter(h=>h.xm).length,state.spend.filter(s=>s.xt).length]}catch(e){return String(e.stack||e)}})()"))
    out=pg.evaluate("""(()=>{const L=__T.LG,T=Date.UTC(2026,9,20),a=T-29*864e5,sp=state.spend.filter(s=>{const t=Date.parse(s.d);return t>=a&&t<=T}),F=L.flows(sp),M=L.moved(a,T);
      const inc=sp.filter(s=>s.cat==='Income'&&!L.isXfer(s)&&!L.isRefund(s)).sort((x,y)=>y.amt-x.amt).map(s=>[s.d,s.amt,s.note.slice(0,40)]);
      const outs=sp.filter(s=>s.cat!=='Income'&&!L.isXfer(s)).sort((x,y)=>y.amt-x.amt).slice(0,25).map(s=>[s.d,s.amt,s.cat,s.note.slice(0,40),s.xf||'']);
      return{F,M,inc,outs,xt:sp.filter(s=>s.xt).length}})()""")
    print(json.dumps(out['F']),json.dumps(out['M']),'own transfers flagged',out['xt'])
    print('NET',round(out['F']['net']-out['M']['net'],2))
    print('-- counted as income');[print(' ',x) for x in out['inc']]
    print('-- biggest money out');[print(' ',x) for x in out['outs']]
    print('errors',errs[:2]);b.close()
