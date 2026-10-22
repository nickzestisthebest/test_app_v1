// ---------- connected accounts (v2) ----------
// DEMO MODE: this uses a built-in example data source behind one small interface (mockData / mockSync).
// A real aggregator (Plaid, Teller, MX) would replace those two functions and nothing else.
const MOCK_ACCTS={checking:{id:'chk',name:'Checking',mask:'4821',kind:'checking'},cards:{id:'card',name:'Everyday Card',mask:'1203',kind:'card'},loans:{id:'loan',name:'Student Loan',mask:'7790',kind:'loan'},later:{id:'later',name:'Pay-later plans',mask:'',kind:'plans'}};
const ordn=n=>n+(n%100>=11&&n%100<=13?'th':({1:'st',2:'nd',3:'rd'})[n%10]||'th');
const acctLabel=a=>a.name+(a.mask?' ••'+a.mask:'');
const CHK='Checking ••4821',CARD='Everyday Card ••1203';
function mockData(sel){const D=realDay(),out=[];let seed=11;const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296};
  const add=(t,a,m,acct,kind)=>{if(t<=D)out.push({d:fd(t),a:Math.round(a*100)/100,m,acct:acct||CHK,kind:kind||'checking',p:false})};
  const span=92,d0=D-span*MS,start=new Date(d0);
  for(let j=0;j<8;j++)add(D-6*MS-14*j*MS,2050,'ACME CORP PAYROLL');
  let y=start.getUTCFullYear(),mo=start.getUTCMonth();
  for(let i=0;i<5;i++){const at=(day,a,m)=>{const t=Date.UTC(y,mo,Math.min(day,eom(y,mo+1)));if(t>=d0)add(t,a,m)};
    at(1,-1200,'HARBOR PROPERTIES RENT');at(4,-30,'FITZONE GYM');at(5,-15.49,'NETFLIX.COM');at(12,-85.4,'MOBILE PHONE CO');at(20,-(96+Math.round(rnd()*12)),'CITY POWER AND LIGHT');
    if(sel.cards)at(20,-95,'EVERYDAY CARD AUTOPAY');if(sel.loans)at(15,-140,'STUDENT LOAN SERVICER PMT');
    mo++;if(mo>11){mo=0;y++}}
  for(let t=d0;t<=D;t+=(3+Math.floor(rnd()*3))*MS)add(t,-(28+rnd()*62),'KROGER #0422');
  for(let t=D-4*MS;t>=d0;t-=14*MS)add(t,-(47+Math.round(rnd()*4)),'SHELL OIL 5742');
  const eat=['CHIPOTLE 1234','STARBUCKS #5521','DOORDASH*PIZZA','CHICK-FIL-A 0231'];
  for(let t=d0;t<=D;t+=(3+Math.floor(rnd()*2))*MS)add(t,-(7+rnd()*20),eat[Math.floor(rnd()*4)]);
  if(sel.later)[31,17,3].forEach(k=>add(D-k*MS,-40,'KLARNA*HEADPHONES'));
  if(sel.cards)for(let t=d0+5*MS;t<=D;t+=(6+Math.floor(rnd()*5))*MS)add(t,-(12+rnd()*55),['AMAZON MKTPLACE','TARGET 1124','SPOTIFY USA','UBER *TRIP'][Math.floor(rnd()*4)],CARD,'card');
  const pend=[{d:fd(D),a:-5.75,m:'STARBUCKS #5521',t:Date.now()},{d:fd(D),a:-25.1,m:'KROGER #0422',t:Date.now()}];
  pend.forEach(p=>out.push({d:p.d,a:p.a,m:p.m,acct:CHK,kind:'checking',p:true}));
  const liab=[];if(sel.cards)liab.push({name:'Everyday Card',bal:3400,apr:24.9,min:95,day:20,canWait:false});if(sel.loans)liab.push({name:'Student Loan',bal:11500,apr:4.5,min:140,day:15,canWait:true});
  return{txns:out,pending:pend,liab,bal:Math.round((640-pend.reduce((a,p)=>a-p.a,0)*-1)*100)/100,accts:Object.keys(sel).filter(k=>sel[k]).map(k=>MOCK_ACCTS[k])}}
function mockSync(){const L=state.link,M=L.mock,D=realDay(),now=Date.now(),out=[],keep=[];
  (M.pending||[]).forEach(p=>{if(now-p.t>60000)out.push({d:p.d,a:p.a,m:p.m.replace(/ *#\d+/,'')+' STORE',p:false});else keep.push(p)});
  const pool=[['CHIPOTLE 1234',-(9+Math.floor(Math.random()*10))],['SHELL OIL 5742',-46],['KROGER #0422',-(20+Math.floor(Math.random()*40))],['STARBUCKS #5521',-5.75]],pk=pool[Math.floor(Math.random()*pool.length)];
  const np={d:fd(D),a:pk[1],m:pk[0],t:now};keep.push(np);out.push({d:np.d,a:np.a,m:np.m,p:true});M.bal=Math.round((M.bal+np.a)*100)/100;M.pending=keep;return out}

// ---------- detect a plan from transaction history ----------
const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
const tidy=m=>{const t=String(m||'').replace(/[#*]/g,' ').replace(/\b\d{2,}\b/g,' ').replace(/\s+/g,' ').trim().toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());return t.slice(0,24)};
function cadOf(ds){if(ds.length<2)return null;const g=[];for(let i=1;i<ds.length;i++)g.push(Math.round((pd(ds[i])-pd(ds[i-1]))/MS));const m=med(g);return m>=6&&m<=8?['weekly',7]:m>=13&&m<=15?['2w',14]:m>=26&&m<=35?['monthly',30]:null}
function nextAfter(last,cad){let t=last;const td=fd(realDay());let n=0;while(t<=td&&n++<60)t=cad[0]==='monthly'?addMonths(t,1):addDays(t,cad[1]);return t}
function detectPlan(D){const tx=D.txns.filter(t=>!t.p&&t.kind==='checking'),span=Math.max(30,Math.round((realDay()-Math.min(...tx.map(t=>pd(t.d))))/MS));
  const grp={},ing={};tx.forEach(t=>{const k=mkey(t.m);if(!k)return;(t.a<0?grp:ing)[k]=((t.a<0?grp:ing)[k]||[]).concat(t)});
  const F={pay:null,bills:[],plans:[],debts:D.liab.map(d=>Object.assign({on:true},d)),everyday:0,fun:0,bal:D.bal};
  let bestP=null;Object.keys(ing).forEach(k=>{const L=ing[k].sort((a,b)=>a.d<b.d?-1:1);if(L.length<3)return;const am=L.map(x=>x.a),md=med(am);if(md<300||(Math.max(...am)-Math.min(...am))/md>.12)return;const cad=cadOf(L.map(x=>x.d));if(!cad)return;const tot=md*L.length;if(!bestP||tot>bestP.tot)bestP={tot,pay:md,cad,last:L[L.length-1].d,name:tidy(L[L.length-1].m)}});
  if(bestP)F.pay={name:bestP.name,amt:bestP.pay,freq:bestP.cad[0]==='2w'?'biweekly':bestP.cad[0],next:nextAfter(bestP.last,bestP.cad),on:true};
  const used=new Set(),SUB=/netflix|spotify|hulu|disney|youtube|prime|gym|fitness|insurance|rent|phone|mobile|power|electric|internet|water/i,PLAN=/klarna|affirm|afterpay|cash ?app/i;
  Object.keys(grp).forEach(k=>{const L=grp[k].sort((a,b)=>a.d<b.d?-1:1),m=L[L.length-1].m,cad=cadOf(L.map(x=>x.d));if(!cad)return;const am=L.map(x=>-x.a),md=med(am),spread=(Math.max(...am)-Math.min(...am))/md;
    if(/autopay|pmt|payment|loan servicer/i.test(m)&&!PLAN.test(m)){used.add(k);return}
    if(PLAN.test(m)){if(L.length>=2){F.plans.push({name:tidy(m),amt:md,freq:cad[0]==='monthly'?'monthly':'2w',next:nextAfter(L[L.length-1].d,cad),left:3,canWait:/klarna|cash/i.test(m),on:true,unsure:true});used.add(k)}return}
    if(RX_EVERY.test(m)&&!/gym|fitness|insurance|rent|phone|power|electric/i.test(m))return;
    const sub=SUB.test(m);if(cad[0]==='monthly'&&L.length>=2&&spread<=(sub?.15:.05)||sub&&L.length>=3&&spread<=.15){const days=L.map(x=>+x.d.slice(8));
      F.bills.push(cad[0]==='monthly'?{name:tidy(m),amt:Math.round(md*100)/100,cad:'monthly',day:med(days),on:true,unsure:!sub}:{name:tidy(m),amt:Math.round(md*100)/100,cad:cad[0],next:nextAfter(L[L.length-1].d,cad),on:true,unsure:!sub});used.add(k)}});
  let e=0,f=0;tx.forEach(t=>{if(t.a>=0||used.has(mkey(t.m)))return;const m=t.m;if(/autopay|pmt|transfer|zelle|rent/i.test(m))return;if(RX_EVERY.test(m))e-=t.a;else f-=t.a});
  F.everyday=Math.ceil(e/span*30/10)*10;F.fun=Math.ceil(f/span*30/10)*10;return F}

// ---------- connect flow UI ----------
let LK={step:'connect',sel:{checking:false,cards:false,loans:false,later:false},busy:null,data:null,found:null};
function lkOpen(){LK={step:'connect',sel:{checking:!!(state.link&&state.link.sel&&state.link.sel.checking),cards:!!(state.link&&state.link.sel&&state.link.sel.cards),loans:!!(state.link&&state.link.sel&&state.link.sel.loans),later:!!(state.link&&state.link.sel&&state.link.sel.later)},busy:null,data:null,found:null};lkRender();openSheet('sh-link')}
const LK_ROWS=[['checking','Checking and savings','Your paycheck, bills and daily spending'],['cards','Credit cards','Balances, rates and minimums'],['loans','Loans','Student, car or personal'],['later','Pay-later plans','Buy now, pay later payments']];
function lkRender(){const B=$('#lk-body');if(!B||B===DUMMY)return;let x='';
  if(LK.step==='connect'){const n=Object.values(LK.sel).filter(Boolean).length;
    x='<p class="note" style="margin:0">Connect once and Sprout keeps your numbers up to date on its own. You can add or remove accounts any time.</p>'+
    '<div class="lkdemo"><b>Demo mode.</b> These are example accounts so you can try the whole flow. Real bank connections come with the full release.</div>'+
    LK_ROWS.map(r=>{const on=LK.sel[r[0]],bz=LK.busy===r[0];return '<div class="lkrow"><div class="lki">'+({checking:'▣',cards:'▭',loans:'▤',later:'○'})[r[0]]+'</div><div class="lkt"><b>'+r[1]+'</b><small>'+(on?'Connected • example account':r[2])+'</small></div>'+(on?'<span class="lkok">✓ Connected</span>':'<button type="button" class="btn sm'+(bz?' alt':'')+'" data-lk="conn" data-v="'+r[0]+'"'+(LK.busy?' disabled':'')+'>'+(bz?'Connecting…':'Connect')+'</button>')+'</div>'}).join('')+
    '<p class="note" style="margin:0">Connections are read-only: Sprout can see balances and transactions but can never move money.</p>'+
    '<div class="row"><button type="button" class="btn" data-lk="next"'+(LK.sel.checking?'':' disabled')+'>Continue</button></div>'+(LK.sel.checking?'':'<p class="note" style="margin:0">Connect your checking account to continue. It is how Sprout sees your paycheck and bills.</p>')+
    '<button type="button" class="lnk" data-lk="manual" style="align-self:center">I’d rather type it in myself</button>';
  }else if(LK.step==='found'){const F=LK.found;
    const ck=(grp,i,on)=>'<input type="checkbox" data-lkf="'+grp+':'+i+'"'+(on?' checked':'')+'>';
    x='<p class="note" style="margin:0">From your recent activity. Untick anything that is wrong. You can change all of this later.</p>'+
    '<section class="ixc"><h4>Paycheck</h4>'+(F.pay?'<label class="lkc">'+ck('pay',0,F.pay.on)+'<span><b>'+money0(F.pay.amt)+'</b> '+({weekly:'every week',biweekly:'every 2 weeks',monthly:'every month'})[F.pay.freq]+'<small>Next on '+fdate(pd(F.pay.next))+'</small></span></label>':'<p class="note" style="margin:0">No regular paycheck found. You can add it in Edit numbers.</p>')+'</section>'+
    '<section class="ixc"><h4>Bills that repeat</h4>'+(F.bills.length?F.bills.map((b,i)=>'<label class="lkc">'+ck('bill',i,b.on)+'<span>'+esc(b.name)+(b.unsure?' <em class="lkns">Not sure</em>':'')+'<small>'+(b.cad==='monthly'?'Around the '+ordn(b.day):'Every '+(b.cad==='weekly'?'week':'2 weeks'))+'</small></span><b>'+money(b.amt)+'</b></label>').join(''):'<p class="note" style="margin:0">None found.</p>')+'</section>'+
    (F.plans.length?'<section class="ixc"><h4>Pay-later plans</h4>'+F.plans.map((b,i)=>'<label class="lkc">'+ck('plan',i,b.on)+'<span>'+esc(b.name)+' <em class="lkns">About '+b.left+' left</em><small>'+(b.freq==='monthly'?'Monthly':'Every 2 weeks')+', next '+sdate(pd(b.next))+'</small></span><b>'+money(b.amt)+'</b></label>').join('')+'</section>':'')+
    (F.debts.length?'<section class="ixc"><h4>What you owe</h4>'+F.debts.map((d,i)=>'<label class="lkc">'+ck('debt',i,d.on)+'<span>'+esc(d.name)+'<small>'+d.apr+'% APR · minimum '+money0(d.min)+(d.canWait?' · can wait':'')+'</small></span><b>'+money0(d.bal)+'</b></label>').join('')+'</section>':'')+
    '<section class="ixc"><h4>Your spending so far</h4><p class="note" style="margin:0">About <b>'+money0(F.everyday)+'</b> a month on basics (groceries, gas) and <b>'+money0(F.fun)+'</b> on fun. Sprout uses this for your daily number.</p></section>'+
    '<div class="row"><button type="button" class="btn" data-lk="finish">Looks right, start</button><button type="button" class="btn alt" data-lk="back">Back</button></div>';
  }
  B.innerHTML=x}
function lkBuildState(){const F=LK.found,D=LK.data,prev=state;const W=blankW();W.name=state.name||'';
  if(F.pay&&F.pay.on){W.pay=F.pay.amt;W.freq=F.pay.freq;W.nextPay=F.pay.next}
  W.cash=D.bal;W.cushion=+state.cushion||100;
  F.bills.filter(b=>b.on).forEach(b=>W.bills.push(b.cad==='monthly'?{name:b.name,amt:b.amt,freq:'monthly',day:b.day,next:''}:{name:b.name,amt:b.amt,freq:b.cad==='weekly'?'weekly':'2w',next:b.next}));
  F.debts.filter(d=>d.on).forEach(d=>W.debts.push({name:d.name,bal:d.bal,apr:d.apr,min:d.min,day:d.day,canWait:!!d.canWait,extra:!d.canWait}));
  F.plans.filter(p=>p.on).forEach(p=>W.plans.push({name:p.name,amt:p.amt,freq:p.freq,next:p.next,left:p.left,canWait:p.canWait,last:''}));
  W.everyday=F.everyday;W.fun=F.fun;W.savings=0;W.goals=[];
  const s=toState(W,prev);return s}
async function lkFinish(){const D=LK.data,F=LK.found;state=lkBuildState();state.cashAt=Date.now();state.asOf=todayStr;
  state.link={on:1,at:Date.now(),sel:Object.assign({},LK.sel),accts:D.accts,mock:{pending:D.pending.map(p=>({d:p.d,a:p.a,m:p.m,t:p.t})),bal:D.bal}};
  const byAcct={};D.txns.forEach(t=>{(byAcct[t.acct]=byAcct[t.acct]||{kind:t.kind,rows:[]}).rows.push({d:t.d,a:t.a,m:t.m,p:t.p})});
  editors();plan();
  Object.keys(byAcct).forEach(ac=>{const g=byAcct[ac];importCommit(buildReview(g.rows,ac,g.kind==='card'?'card':'checking',false))});
  state.cash=D.bal;state.cashAt=Date.now();state.checkin=state.checkin||{};
  editors();plan();queueSave();histSave();closeSheets();setTimeout(()=>{toast('You’re all set. Sprout will keep itself up to date.');confetti()},350)}
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-lk]');if(!b)return;const a=b.dataset.lk;
  if(a==='conn'){LK.busy=b.dataset.v;lkRender();await new Promise(r=>setTimeout(r,RM?50:900));LK.sel[LK.busy]=true;LK.busy=null;lkRender()}
  else if(a==='next'){LK.data=mockData(LK.sel);LK.found=detectPlan(LK.data);LK.step='found';lkRender()}
  else if(a==='back'){LK.step='connect';lkRender()}
  else if(a==='finish')lkFinish();
  else if(a==='manual'){closeSheets();setTimeout(()=>openWizard(false),300)}});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.lkf||!LK.found)return;const[g,i]=t.dataset.lkf.split(':'),F=LK.found,it=g==='pay'?F.pay:F[{bill:'bills',plan:'plans',debt:'debts'}[g]][+i];if(it)it.on=t.checked});

// ---------- sync + accounts ----------
let syncing=false;
async function lkSync(){if(!(state.link&&state.link.on)||syncing)return;syncing=true;const chip=document.querySelector('[data-sync]');if(chip)chip.classList.add('busy');
  await new Promise(r=>setTimeout(r,RM?50:900));
  try{const raw=mockSync(),res=importCommit(buildReview(raw,CHK,'checking',false));state.cash=state.link.mock.bal;state.cashAt=Date.now();state.asOf=todayStr;state.link.at=Date.now();plan();queueSave();
    toast(res.added||res.repl?'Synced: '+res.added+' new'+(res.repl?', '+res.repl+' pending now posted':''):'Already up to date')}catch(err){toast('Couldn’t sync just now. Try again in a moment.')}
  syncing=false;if(document.getElementById('sh-accts')&&!document.getElementById('sh-accts').hidden)acctsRender()}
const agoTxt=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'};
function syncChip(){const L=state.link;
  if(L&&L.on)return '<button class="syncchip" data-sync aria-label="Sync now"><i></i><span>Synced '+agoTxt(L.at)+'</span><em>Sync now</em></button>';
  return '<button class="syncchip off" data-lkopen><i></i><span>Not connected</span><em>Connect accounts</em></button>'}
function acctsRender(){const B=$('#ac-body');if(!B||B===DUMMY)return;const L=state.link;
  if(!(L&&L.on)){B.innerHTML='<p class="note" style="margin:0">No accounts connected yet. Connect them and Sprout keeps your numbers up to date on its own.</p><div class="row"><button type="button" class="btn" data-lkopen>Connect accounts</button></div>';return}
  B.innerHTML='<div class="lkdemo"><b>Demo mode.</b> Example accounts. Real bank connections come with the full release.</div>'+L.accts.map(a=>'<div class="lkrow"><div class="lki">'+({checking:'▣',card:'▭',loan:'▤',plans:'○'})[a.kind]+'</div><div class="lkt"><b>'+esc(acctLabel(a))+'</b><small>Read-only · synced '+agoTxt(L.at)+'</small></div><span class="lkok">✓</span></div>').join('')+
    '<div class="row"><button type="button" class="btn" data-sync>'+(syncing?'Syncing…':'Sync now')+'</button><button type="button" class="btn alt" data-lkopen>Add accounts</button></div>'+
    '<p class="note" style="margin:0">Sprout also syncs when you open it. Pending charges count right away and are swapped for the final charge when they post.</p>'+
    '<button type="button" class="lnk" data-lkoff style="align-self:flex-start;color:var(--bad)">Disconnect all accounts</button>'}
function acctsOpen(){acctsRender();openSheet('sh-accts')}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-sync],[data-lkopen],[data-lkoff]');if(!t)return;
  if(t.hasAttribute('data-sync')){e.preventDefault();lkSync()}
  else if(t.hasAttribute('data-lkopen')){closeSheets();setTimeout(lkOpen,280)}
  else if(t.hasAttribute('data-lkoff')){if(t.dataset.arm){state.link=null;queueSave();plan();acctsRender();toast('Disconnected. Your history is kept.')}else{t.dataset.arm='1';t.textContent='Tap again to disconnect'}}});
