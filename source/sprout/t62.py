# pay-later plans are debt, count toward the right budget, and moving them never changes totals
import os, json
from playwright.sync_api import sync_playwright
URL='file://'+os.getcwd()+'/v2_test.html'
R=[]
TOT='(()=>{const n=netWorth(),F=LG.flows(state.spend);return {L:n.L,N:n.N,out:F.out,avail:availAt(realToday(),state.spend.map(s=>Object.assign({t:pd(s.d)},s))).leftTotal,tot:Object.values(monthSpend()).reduce((a,b)=>a+b,0)}})()'
def ck(n,c,i=''): R.append(('PASS ' if c else 'FAIL ')+n+('' if c else ' '+str(i)[:400]))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':390,'height':844});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL);pg.wait_for_timeout(2500);S=pg.evaluate;W=pg.wait_for_timeout
    S("""(()=>{const T=Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()),f=t=>new Date(t).toISOString().slice(0,10),D=864e5;
      Object.assign(state,{setup:true,demo:false,link:{on:1,live:1,at:Date.now(),accts:[{id:'c1',name:'Checking',kind:'checking',sub:'checking',cur:900,avail:900,item:'i'}],items:[{item_id:'i',inst:'Bank'}],debtAcct:{},liab:{}},pay:1800,payFreq:'biweekly',firstPay:f(T+6*D),asOf:f(T),cash:900,cashAt:Date.now(),cushion:0,everyday:400,discReduced:300,discTarget:300,bills:[],debts:[{name:'Card',bal:1000,apr:20,min:35,day:20}],goals:[]});
      state.sched=[{d:f(T-20*D),name:'Klarna · Bright Smile Dental (1 of 4)',group:'Affirm',amt:60,reserve:false},{d:f(T+10*D),name:'Klarna · Bright Smile Dental (2 of 4)',group:'Affirm',amt:60,reserve:false},{d:f(T+40*D),name:'Klarna · Bright Smile Dental (3 of 4)',group:'Affirm',amt:60,reserve:false},{d:f(T+70*D),name:'Klarna · Bright Smile Dental (4 of 4)',group:'Affirm',amt:60,reserve:false},
        {d:f(T+5*D),name:'Afterpay · Nike (3 of 4)',group:'Affirm',amt:32.5,reserve:false},{d:f(T+19*D),name:'Afterpay · Nike (4 of 4)',group:'Affirm',amt:32.5,reserve:false}];
      const t0=f(T-1*D);state.spend=[{d:t0,amt:60,cat:'Bill',note:'Klarna',tid:'k1',at:1},{d:t0,amt:45,cat:'Everyday',note:'Kroger',tid:'k2',at:1},{d:f(T-2*D),amt:32.5,cat:'Bill',note:'AFTERPAY',tid:'k3',at:1}];
      HIST.length=0;state.spend.forEach(s=>HIST.push({k:s.tid,d:s.d,a:-s.amt,m:s.note,c:s.cat,p:0}));state.lg={};__T.LG.after();})()""")
    W(400)
    pl=S("(()=>{const P=__S.PL.plans();return P.map(p=>[p.store,p.prov,p.left,p.owed,p.cat])})()")
    ck('plans read from the schedule',len(pl)==2,pl)
    dent=[x for x in pl if x[0]=='Bright Smile Dental']
    ck('dental plan: early bank payment marks installment 2 paid, 2 left',dent and dent[0][2]==2 and dent[0][3]==120,pl)
    ck('what you owe includes pay-later',abs(S("__T.ev('totalDebt()')")-(1000+120+32.5))<0.01,S("__T.ev('totalDebt()')"))
    # make a Medical budget, then put the dental plan there
    S("""(()=>{const b=__S.B2.g();b.custom.push({id:'cmed',name:'Medical',limit:100,kind:'basic',words:'dental, dentist, doctor'});__S.B2.sync();__T.ev('plan()')})()""")
    pl=S("__S.PL.plans().map(p=>[p.store,p.cat])")
    ck('a dentist plan goes to Medical on its own',['Bright Smile Dental','cmed'] in pl,pl)
    ms=S("__T.ev('monthSpend()')")
    ck('the Klarna payment counts toward Medical this month',abs(ms.get('cmed',0)-60)<0.01,ms)
    before=S("__T.ev("+json.dumps(TOT)+")")
    S("(()=>{const g=__S.PL.g();const id=__S.PL.plans().find(p=>p.store==='Nike').id;g.cat[id]='shop';__T.ev('plan()')})()")
    ms2=S("__T.ev('monthSpend()')")
    ck('Nike plan counts toward Shopping after you choose it',abs(ms2.get('shop',0)-32.5)<0.01,ms2)
    S("(()=>{const g=__S.PL.g();const id=__S.PL.plans().find(p=>p.store==='Bright Smile Dental').id;g.cat[id]='oth';__T.ev('plan()')})()")
    after=S("__T.ev("+json.dumps(TOT)+")")
    ck('moving plans never changes what you owe, net worth, cash flow or Safe to spend',all(abs(before[k]-after[k])<0.01 for k in ['L','N','out','avail']),(before,after))
    ck('moving plans only moves money between budgets (no duplicates, nothing lost)',abs(after['tot']-before['tot'])<0.01,(before,after))
    # one payment moved on its own
    S("(()=>{const s=state.spend.find(x=>x.tid==='k1');__S.B2.assign(s,'groc')})()")
    ms3=S("__T.ev('monthSpend()')")
    ck('one payment can be moved by itself',abs(ms3.get('groc',0)-105)<0.01 and abs(ms3.get('oth',0))<0.01,ms3)
    ck('moving one Klarna payment does not teach a store rule',S("Object.keys(__S.B2.g().rules).length")==0)
    S("__T.xOpen('paylater')");W(500)
    tx=pg.inner_text('#x-body')
    ck('pay-later page shows what is owed',('you owe on pay-later plans' in tx.lower()) and ('$152.50' in tx),tx[:300])
    pg.screenshot(path='probe/paylater.png',full_page=True)
    ck('no page errors',not errs,errs[:3])
    b.close()
print('\n'.join(R));print(sum(r.startswith('PASS') for r in R),'/',len(R))
