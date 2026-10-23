// ===================== Plan 4: one formula for checking, and every screen reads it =====================
// Left in checking = start + paychecks and other income − must-pays − budgets − goals set aside − extra to debt
//   must-pays = bills + every card and loan minimum + pay-later installments + Cash App Borrow + one-time payments due in the period
//   budgets   = (sum of your category budgets per month) × 12 ÷ 365 × days in the period
//               (when your recent spending runs higher than your budgets, the plan uses the higher number, shown as its own line)
//   goals     = what you set aside each paycheck for your goals (planned to move to savings)
//   extra     = only money above your cushion after all of that, sent to debts in the order you chose
//   interest  = balance × APR × days ÷ 365, added before the minimum
// Net worth = Own − Owe.  Own = checking + savings + investments and other accounts.  Owe = every card and loan + pay-later still due + Cash App Borrow.
const P4={};
{
const r2=x=>Math.round((+x||0)*100)/100;
P4.r2=r2;
const eomT=t=>{const d=new Date(t);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)};P4.eomT=eomT;
P4.g=()=>{const g=LG.st();g.b4=g.b4||{};const b=g.b4;if(b.realistic==null)b.realistic=true;b.carry=b.carry||{};b.goals=b.goals||[];b.acct=b.acct||{};b.dayLog=b.dayLog||{};return b};
P4.gOf=st=>((st&&st.lg&&st.lg.b4)||{});
// ---------- 1. budgets: your category amounts are the only source of truth ----------
// no silent resizing of categories to match a total. The total is the sum of the categories.
B2.scale=()=>{};
B2.pull=()=>{P4.sync()};
// first time: category budgets start from what you actually spend (median of recent months); with no history, from your setup totals
P4.initBudgets=()=>{const b=B2.g();if(b.init||LG.demo()||!state.setup)return;const x=X();let R=null;try{R=P4.recent()}catch(e){}
  if(R&&R.n>=2){BCATS.forEach(c=>{if(x.bud[c[0]]!=null&&x.bud[c[0]]!=='')return;const med=R.cat[c[0]]||0;x.bud[c[0]]=med>0?Math.ceil(med/5)*5:Math.max(10,Math.round(c[2]*0.25/5)*5)})}
  else{const e=+state.everyday||0,f=+state.discReduced||0;['basic','fun'].forEach(kind=>{const tot=kind==='basic'?e:f,L=BCATS.filter(c=>B2.kindOf(c[0])===kind),cur=L.reduce((a,c)=>a+c[2],0);if(!L.length||!(tot>0))return;let left=tot;L.forEach((c,i)=>{const v=i===L.length-1?Math.max(0,Math.round(left)):Math.max(0,Math.round(c[2]*tot/Math.max(1,cur)/5)*5);x.bud[c[0]]=v;left-=v})})}
  b.init=1};
// before every plan: categories are the truth, the totals follow them
P4.sync=()=>{try{B2.sync();P4.initBudgets();if(!LG.demo()&&state.setup){const e=Math.round(B2.sum('basic')),f=Math.round(B2.sum('fun'));state.everyday=e;state.discReduced=f;if(!hasBonus(state))state.discTarget=f}}catch(e){}};
{const _plan=plan;plan=function(){P4.sync();return _plan.apply(this,arguments)}}
P4.budTotal=st=>{st=st||state;try{if(st===state)return r2(BCATS.reduce((a,c)=>a+budLim(c),0))}catch(e){}return r2((+st.everyday||0)+(+st.discReduced||0))};
// spending in a month that counts against budgets (same rule as the Spending screen)
P4.monthTx=mk=>(state.spend||[]).map((s,i)=>Object.assign({i},s)).filter(s=>String(s.d).slice(0,7)===mk&&B2.counts(s)).map(s=>({s,i:s.i,d:s.d,amt:(LG.isRefund(s)?-1:1)*(+s.amt||0),cat:B2.catOf(s),note:s.note||''}));
P4.mk=t=>fd(t).slice(0,7);
P4.monthsBack=n=>{const d=new Date(realDay()),out=[];for(let i=1;i<=n;i++){const m=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-i,1));out.push(fd(m.getTime()).slice(0,7))}return out};
P4.firstTx=()=>{let t=Infinity;(state.spend||[]).forEach(s=>{if(isDate(s.d))t=Math.min(t,pd(s.d))});(HIST||[]).forEach(h=>{if(h&&isDate(h.d))t=Math.min(t,pd(h.d))});return t};
// what you've actually spent per month lately, by category and in total (median of the last full months)
let RCC=null;P4.recent=()=>{const key=(state.spend||[]).length+'|'+realDay()+'|'+BCATS.length+'|'+JSON.stringify(B2.g().rules||{}).length;if(RCC&&RCC.k===key)return RCC.v;const v=P4.recent0();RCC={k:key,v};return v};
P4.recent0=()=>{const first=P4.firstTx(),months=P4.monthsBack(6).filter(mk=>pd(mk+'-01')>=first-31*MS).slice(0,6),by={},tot=[];
  months.forEach(mk=>{const L=P4.monthTx(mk),t={};L.forEach(x=>{t[x.cat]=(t[x.cat]||0)+x.amt});Object.keys(t).forEach(k=>{(by[k]=by[k]||[]).push(r2(t[k]))});tot.push(r2(L.reduce((a,x)=>a+x.amt,0)))});
  const med=a=>{if(!a.length)return 0;const s=a.slice().sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:r2((s[m-1]+s[m])/2)};
  const cat={};Object.keys(by).forEach(k=>cat[k]=med(by[k]));return{months,tot,med:med(tot),cat,n:months.length}};
P4.spendFloor=st=>{const g=P4.gOf(st||state);if(g.realistic===false)return 0;let R;try{R=P4.recent()}catch(e){return 0}if(R.n<2)return 0;return Math.max(0,r2(R.med-P4.budTotal(st)))};
// one-time repair for budgets that are far below real spending (a budget of $5 for gas when $57 a month is normal)
P4.fixBudgets=()=>{const g=P4.g();if(g.fixed||LG.demo()||!state.setup)return [];let R;try{R=P4.recent()}catch(e){return []}g.fixed=1;if(R.n<2)return [];const x=X(),done=[];
  BCATS.forEach(c=>{const cur=budLim(c),med=R.cat[c[0]]||0;if(med>=20&&cur<med*0.25){const v=Math.ceil(med/5)*5;done.push({id:c[0],name:c[1],from:cur,to:v});x.bud[c[0]]=v}});
  if(done.length){g.fixLog=done;B2.push()}return done};
P4.undoFix=()=>{const g=P4.g(),x=X();(g.fixLog||[]).forEach(f=>{x.bud[f.id]=f.from});g.fixLog=[];B2.push()};
// ---------- 2. rolling budgets: each day adds its share, spending takes from it ----------
P4.dim=T=>{const d=new Date(T);return eom(d.getUTCFullYear(),d.getUTCMonth()+1)};
P4.dom=T=>new Date(T).getUTCDate();
P4.carryOf=(id,mk)=>{const g=P4.g();if(!g.carry[id])return 0;const d=new Date(pd(mk+'-01')),pm=fd(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-1,1)).slice(0,7),c=BCATS.find(z=>z[0]===id);if(!c)return 0;
  const sp=r2(P4.monthTx(pm).filter(t=>t.cat===id).reduce((a,t)=>a+t.amt,0));return r2(budLim(c)-sp)};
// the rolling numbers for one category on day T
P4.roll=(id,T)=>{T=T||realDay();const c=BCATS.find(z=>z[0]===id);if(!c)return null;const mk=P4.mk(T),dim=P4.dim(T),dom=P4.dom(T),lim=r2(budLim(c)+P4.carryOf(id,mk)),per=lim/dim;
  const L=P4.monthTx(mk),spent=r2(L.filter(t=>t.cat===id&&pd(t.d)<=T).reduce((a,t)=>a+t.amt,0)),todaySp=r2(L.filter(t=>t.cat===id&&pd(t.d)===T).reduce((a,t)=>a+t.amt,0));
  // exact cents: the month's shares add up to the budget, the last day takes the rounding
  const share=d=>d>=dim?r2(lim-r2(Math.floor(per*100)/100*(dim-1))):Math.floor(per*100)/100;let built=0;for(let d=1;d<=dom;d++)built=r2(built+share(d));
  const left=r2(built-spent),daysLeft=dim-dom+1,pace=r2(Math.max(0,lim-spent)/daysLeft),back=left<0?Math.min(99,Math.ceil(-left/Math.max(0.01,per))):0;
  return{id,name:c[1],lim,per:r2(per),today:share(dom),built,spent,todaySp,left,pace,daysLeft,dim,dom,back,monthLeft:r2(lim-spent)}};
P4.rollAll=T=>BCATS.map(c=>P4.roll(c[0],T)).filter(Boolean);
P4.rollTotal=T=>{const L=P4.rollAll(T),s=k=>r2(L.reduce((a,x)=>a+x[k],0));return{cats:L,lim:s('lim'),built:s('built'),spent:s('spent'),todaySp:s('todaySp'),left:s('left'),pace:s('pace'),today:s('today'),monthLeft:s('monthLeft'),daysLeft:L[0]?L[0].daysLeft:1,dim:L[0]?L[0].dim:30,dom:L[0]?L[0].dom:1}};
// safe to spend today: the built-up total, never more than checking can cover before payday
{const _av=availAt;availAt=function(T,sp){const A=_av.apply(this,arguments);try{if(T!==realToday())return A;const R=P4.rollTotal(T);A.roll=R;A.budget={per:R.today,left:Math.max(0,R.left)};
    const C=A.cover;let left=Math.max(0,R.left),capped=false,cover=null;if(C){cover=Math.max(0,r2(C.free+(C.todCash||0)));if(cover<left-0.004){left=cover;capped=true}C.capped=capped}
    A.leftTotal=r2(left);A.perTotal=r2(R.today);A.usedToday=R.todaySp;A.capped=capped;A.coverLeft=cover;
    // keep the old two-part shape for anything that still reads it
    const bud=Math.max(0.01,R.lim),e=BCATS.filter(c=>B2.kindOf(c[0])==='basic').reduce((a,c)=>a+budLim(c),0)/bud;A.info={Everyday:{per:r2(A.perTotal*e),left:r2(A.leftTotal*e),tod:0,rest:0},Personal:{per:r2(A.perTotal*(1-e)),left:r2(A.leftTotal*(1-e)),tod:0,rest:0}}}catch(e){}return A}}
MX.left=()=>{try{const T=realToday(),sp=(state.spend||[]).map(s=>Object.assign({t:pd(s.d)},s)),A=availAt(T,sp),R=A.roll||P4.rollTotal(T),r=A.r;
    const allow=r2(R.lim),spent=r2(R.spent),budLeft=Math.max(0,R.monthLeft),C=A.cover,coverLeft=C?Math.max(0,r2(C.free+(C.todCash||0))):null,left=coverLeft==null?budLeft:Math.min(budLeft,coverLeft);
    return{allow,spent,budLeft,coverLeft,left:r2(left),capped:!!A.capped,today:r2(A.leftTotal),todayPer:r2(A.perTotal),d1:A.d1,days:A.daysLeft,A,roll:R,why:A.capped?(coverLeft<=0.004?'Checking can’t cover more spending before payday on '+sdate(A.d1)+', after what’s due and your cushion.':'Limited by what checking can cover until payday on '+sdate(A.d1)+'.'):''}}catch(e){return null}};
LG.heroSub=A=>{if(A&&A.capped)return (A.coverLeft<=0.004?'Checking can’t cover more before payday':'Limited by what checking can cover until payday')+' · Why?';const R=A&&A.roll;if(!R)return '';return 'Today’s share '+money(R.today)+(R.todaySp>0?' · spent '+money(R.todaySp):'')+' · '+money0(R.monthLeft)+' left this month'};
// ---------- 3. goals: budget lines you fund each paycheck ----------
P4.goals=()=>P4.g().goals;
P4.goalPer=(gl,st,asOf)=>{st=st||state;asOf=asOf==null?realToday():asOf;const freq=st.payFreq||'biweekly',perYr=MX.PER[freq]||26,days=365/perYr;
  if(gl.mode==='week')return r2((+gl.amt||0)*days/7);if(gl.mode==='month')return r2((+gl.amt||0)*12/365*days);
  if(gl.mode==='date'){const t=isDate(gl.date)?pd(gl.date):0,need=Math.max(0,(+gl.target||0)-P4.goalSaved(gl));if(!t||t<=asOf)return r2(need);const n=payDates(st,asOf).filter(x=>x<=t).length;return n?r2(Math.ceil(need/n*100)/100):r2(need)}
  return r2(+gl.amt||0)};
P4.goalSaved=gl=>r2((+gl.moved||0)+(+gl.aside||0));
P4.goalDone=gl=>+gl.target>0&&P4.goalSaved(gl)>=+gl.target-0.004;
// when a goal is reached on the plan, and the pace line
P4.goalPace=gl=>{const per=P4.goalPer(gl),saved=P4.goalSaved(gl),need=Math.max(0,(+gl.target||0)-saved);if(need<=0.004)return{t:realToday(),done:true,per};if(!(per>0))return{t:null,per};
  const P=payDates(state,realToday());let acc=0,t=null;for(const d of P){acc+=per;if(acc>=need-0.004){t=d;break}}return{t,per,need,behind:gl.date&&t&&t>pd(gl.date)?Math.round((t-pd(gl.date))/MS/30.44):0}};
// ---------- 4. debts: rates, dedupe, and the order extra money goes ----------
MX.ORD={rate:'Highest rate first',small:'Smallest balance first',mine:'My order',split:'Split evenly'};
MX.pref=()=>{const g=LG.st();g.b3=g.b3||{};if(g.b3.extra==null)g.b3.extra=true;if(!MX.ORD[g.b3.order])g.b3.order='rate';g.b3.mine=g.b3.mine||[];return g.b3};
// a card's rate, worked out from the interest it actually charged (your own number, labeled as an estimate)
P4.rateEst=d=>{try{if(!d.acct&&!d.name)return null;const I=RC.interest();const hit=I.find(i=>i.acct&&(d.acct&&LG.accts().some(a=>a.id===d.acct&&LG.label(a)===i.acct)||String(i.acct).toLowerCase().indexOf(String(d.name||'').toLowerCase().replace(/\s*••.*$/,'').slice(0,8))>=0));
    if(!hit||!(+d.bal>0)||!(hit.mo>0))return null;const apr=r2(hit.mo*12/+d.bal*100);return apr>0&&apr<60?apr:null}catch(e){return null}};
P4.linkedNames=()=>LG.accts().filter(a=>LG.type(a)==='card'||LG.type(a)==='loan').map(a=>({a,w:(String(a.inst||'')+' '+String(a.name||'')).toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>3)}));
P4.isDup=d=>{if(d.acct)return false;const n=String(d.name||'').toLowerCase(),L=P4.linkedNames();return L.some(x=>x.w.some(w=>n.indexOf(w)>=0)&&Math.abs((+x.a.cur||0)-(+d.bal||0))<=Math.max(25,0.15*(+d.bal||0)))};
MX.debts0=MX.debts;
MX.debts=()=>{const out=[],ov=P4.g().acct||{};
  (state.debts||[]).forEach(d=>{const b=r2(+d.bal);if(!(b>0.004))return;if(P4.isDup(d))return;if(d.acct&&ov[d.acct]==='hide')return;const k=MX.kindOfDebt(d);let apr=+d.apr||0,aprSet=apr>0||!!d.aprZero||k==='person',aprEst=false;
    if(!aprSet&&k==='card'){const e=P4.rateEst(d);if(e!=null){apr=e;aprEst=true}}
    out.push({key:'d:'+d.name,raw:d.name,name:LG.short(d.name),kind:k,bal:b,apr,aprSet,aprEst,aprKnown:aprSet||aprEst,min:r2(+d.min||0),day:+d.day||0,src:d.acct?'bank':'typed',acct:d.acct||'',extra:d.extra!==false,limit:+d.limit||0,debt:d})});
  try{PL.plans().forEach(p=>{if(!(p.owed>0.004))return;const borrow=/cash app/i.test(p.prov+' '+p.store)||p.items.some(x=>/cash app/i.test(x.name));
    out.push({key:'pl:'+p.id,raw:p.id,name:borrow?'Cash App Borrow':P4.cleanStore(p.store),prov:borrow?'Cash App':(p.prov||''),kind:borrow?'borrow':'paylater',bal:r2(p.owed),apr:0,aprSet:true,aprKnown:true,min:r2(p.next?p.next.amt:0),next:p.next?p.next.t:0,left:p.left,src:'plan',plan:p,extra:false})})}catch(e){}
  return out.sort((a,b)=>b.bal-a.bal)};
P4.cleanStore=s=>{let t=String(s||'').replace(/^#?\d{3,}\s*/,'').replace(/\s+#?\d{3,}$/,'').replace(/\s+/g,' ').trim();if(t===t.toUpperCase()&&/[A-Z]{3}/.test(t))t=t.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
  t=t.replace(/\bCl\b$/,'Clinic').replace(/\bMed\b/,'Medical').replace(/\bSvcs?\b/,'Services').replace(/\bCtr\b/,'Center');return t||'Pay later'};
MX.noRate=()=>MX.debts().filter(d=>!d.aprKnown&&d.src!=='plan');
// extra money order. Unknown rates go last under Highest rate first (they can't be placed), split shares by balance.
// a card's estimated rate (from its own interest charges) counts in the order and in interest, labeled as an estimate
let ESTC=null;P4.estMap=()=>{const k=(state.spend||[]).length+'|'+(state.debts||[]).map(d=>d.name+':'+d.apr+':'+d.bal).join(',');if(ESTC&&ESTC.k===k)return ESTC.v;const m={};ESTC={k,v:m};try{MX.debts().forEach(d=>{if(d.aprEst)m[d.raw]=d.apr})}catch(e){}return m};
P4.aprOf=d=>{const a=+d.apr||0;if(a>0||d.aprZero)return a;return P4.estMap()[d.name]||0};
MX.order=st=>{st=st||state;const p=(st.lg&&st.lg.b3)||{},ord=p.order||'rate',mine=p.mine||[];if(p.extra===false)return [];
  const L=(st.debts||[]).filter(d=>d.extra!==false&&+d.bal>0.004&&!(st===state&&P4.isDup(d)));
  const known=d=>P4.aprOf(d)>0||!!d.aprZero;
  return L.slice().sort((a,b)=>{if(ord==='small'||ord==='split')return (+a.bal)-(+b.bal);if(ord==='mine'){const ia=mine.indexOf(a.name),ib=mine.indexOf(b.name);return (ia<0?999:ia)-(ib<0?999:ib)}
    return (known(b)?1:0)-(known(a)?1:0)||P4.aprOf(b)-P4.aprOf(a)||(+a.bal)-(+b.bal)})};
F3.interest=()=>r2(MX.debts().filter(d=>d.aprKnown).reduce((a,d)=>a+d.bal*(d.apr||0)/100/12,0));
// ---------- 5. the engine ----------
MUSTG.length=0;['Bill','Affirm','One-time','Debt min','Klarna','Cash App','Skip min'].forEach(g=>MUSTG.push(g));WAITG.length=0;
LG.MUST=new Set(MUSTG);
simulate=function(st){
  const asOf=pd(st.asOf),bonusD=hasBonus(st)?pd(st.bonusDate):Infinity,g4=P4.gOf(st);
  const ev=[{t:asOf,inc:0,lab:'Today'}];
  const got=st.gotPay||{};payDates(st,asOf).forEach(t=>{if(!got[fd(t)])ev.push({t,inc:+st.pay,lab:'Paycheck'})});if(typeof JOB!=='undefined')JOB.addInc(ev,st,asOf);
  if(bonusD>asOf&&bonusD<Infinity)ev.push({t:bonusD,inc:+st.bonus,lab:'Bonus'});
  ev.sort((a,b)=>a.t-b.t);
  const END=ev[ev.length-1].t+14*MS,items=[];
  (st.bills||[]).forEach(b=>{if(b.type==='monthly'){const from=Math.max(asOf,b.from?pd(b.from):asOf),step=Math.max(1,Math.round(+b.months||1)),anc=b.anchor&&isDate(b.anchor)?new Date(pd(b.anchor)):null;monthly(+b.day,from,END).filter(t=>{if(step===1||!anc)return true;const d=new Date(t),k=(d.getUTCFullYear()-anc.getUTCFullYear())*12+d.getUTCMonth()-anc.getUTCMonth();return ((k%step)+step)%step===0}).forEach(t=>items.push({t,name:b.name,g:'Bill',a:+b.amt}))}
    else{const e=Math.max(1,+b.every);let t=pd(b.first);if(isNaN(t))return;while(t<asOf)t+=e*MS;while(t<=END){items.push({t,name:b.name,g:'Bill',a:+b.amt});t+=e*MS}}});
  (st.debts||[]).forEach(d=>{if(+d.day&&+d.min>0)monthly(+d.day,asOf,END).forEach(t=>{if((st.skipMins||[]).includes(d.name+'|'+new Date(t).toISOString().slice(0,10)))return;items.push({t,name:d.name,g:'Debt min',a:+d.min})})});
  (st.sched||[]).forEach(s=>{const t=pd(s.d);if(!isNaN(t)&&t>=asOf)items.push({t,name:s.name,g:s.group,a:+s.amt,reserve:!!s.reserve})});
  {const pk=st.paid||{};for(let i=items.length-1;i>=0;i--)if(pk[payKey(items[i])])items.splice(i,1)}
  const floorMo=P4.spendFloor(st);
  const per=ev.map((e,i)=>{const d1=i+1<ev.length?ev[i+1].t:e.t+14*MS,days=Math.round((d1-e.t)/MS),inw=x=>x.t>=e.t&&x.t<d1,sum=g=>items.filter(x=>inw(x)&&x.g===g).reduce((s,x)=>s+x.a,0);
    const disc=e.t<bonusD?+st.discReduced||0:+st.discTarget||0,everyBud=Math.ceil(r6(((+st.everyday||0)+disc)*12/365*days)),everyFloor=Math.ceil(r6(floorMo*12/365*days));
    return{e,d0:e.t,d1,days,inc:e.inc,bills:sum('Bill'),aff:sum('Affirm'),kl:sum('Klarna'),ca:sum('Cash App'),one:sum('One-time'),every:everyBud+everyFloor,everyBud,everyFloor,schmin:sum('Debt min')+sum('Skip min'),inw,
      mins:n=>items.filter(x=>inw(x)&&(x.g==='Debt min'||x.g==='Skip min')&&x.name===n).reduce((s,x)=>s+x.a,0)}});
  const bal={},apr={};(st.debts||[]).forEach(d=>{bal[d.name]=Math.max(0,+d.bal);apr[d.name]=P4.aprOf(d)/100});
  let cash=+st.cash;const rows=[],CUSH=+st.cushion||0,goals=(g4.goals||[]).filter(x=>!x.paused&&!x.done),gsaved={};goals.forEach(x=>gsaved[x.id]=P4.goalSaved(x));
  const capMo=+g4.cap>0?+g4.cap:0,order=MX.order(st),ord=((st.lg&&st.lg.b3)||{}).order||'rate';
  per.forEach((q,i)=>{
    const ai={},mn={},intr={};(st.debts||[]).forEach(d=>{const n=d.name;ai[n]=bal[n]>0?ceil2(bal[n]*(1+apr[n]*q.days/365)):0;intr[n]=r2(ai[n]-bal[n]);mn[n]=Math.min(ai[n],q.mins(n))});
    const mins=r2(Object.values(mn).reduce((a,b)=>a+b,0)),cashIn=cash,plans=q.aff+q.kl+q.ca+q.one,must=r2(q.bills+plans+mins);
    const M=r2(cash+q.inc-must-q.every);
    // goals: set aside after must-pays and budgets, never below the cushion
    const gl={};let gTot=0,room=Math.max(0,M-CUSH);goals.forEach(x=>{const per=P4.goalPer(x,st,q.d0),need=Math.max(0,(+x.target||0)-(gsaved[x.id]||0)),a=r2(Math.min(room,per,need));if(a>0.004){gl[x.id]=a;gTot=r2(gTot+a);room-=a;gsaved[x.id]=r2((gsaved[x.id]||0)+a)}});
    const S=r2(M-gTot);
    const reserve=items.filter(x=>x.reserve&&x.t>=q.d1).reduce((s,x)=>s+x.a,0);
    let nxt=0;if(i+1<per.length){const n=per[i+1];nxt=Math.max(0,n.bills+n.aff+n.kl+n.ca+n.one+n.every+n.schmin-n.inc)}
    const hold=CUSH+reserve+nxt;let avail=Math.max(S-hold,0);if(capMo)avail=Math.min(avail,r2(capMo*12/365*q.days));const ex={};let a;
    a=Math.min(avail,Math.ceil(r6((+st.savings||0)*12/365*q.days)));if(a>0){ex['Savings']=r2(a);avail-=a}
    const live=order.filter(d=>(d.name in ai)&&ai[d.name]-mn[d.name]>0.004);
    if(ord==='split'&&live.length){const tot=live.reduce((s,d)=>s+ai[d.name]-mn[d.name],0);let left=avail;live.forEach((d,k)=>{const n=d.name,share=k===live.length-1?left:Math.min(left,r2(avail*(ai[n]-mn[n])/tot));a=r2(Math.min(share,ai[n]-mn[n]));if(a>0.004){ex[n]=(ex[n]||0)+a;left=r2(left-a)}});avail=left}
    else live.forEach(d=>{const n=d.name;a=r2(Math.min(avail,Math.max(0,ai[n]-mn[n])));if(a>0.004){ex[n]=(ex[n]||0)+a;avail=r2(avail-a)}});
    const paid={};(st.debts||[]).forEach(d=>{const n=d.name;paid[n]=r2(mn[n]+(ex[n]||0));bal[n]=r2(ai[n]-paid[n])});
    const exSum=r2(Object.values(ex).reduce((a,b)=>a+b,0));cash=r2(S-exSum);
    rows.push({d0:q.d0,d1:q.d1,days:q.days,cashIn,bl:q.bills,every:q.every,everyBud:q.everyBud,everyFloor:q.everyFloor,affOnly:q.aff+q.kl+q.ca,one:q.one,persDay:(q.d0<bonusD?+st.discReduced||0:+st.discTarget||0)*12/365,evDay:(+st.everyday||0)*12/365,lab:q.e.lab,inc:q.inc,spend:q.bills+q.every,aff:plans,mins,kl:q.kl,ca:q.ca,pay:0,R:0,carriedIn:0,M,S,hold,ex,gl,goals:gTot,cash,bal:Object.assign({},bal),intr,intrSum:r2(Object.values(intr).reduce((a,b)=>a+b,0)),paid,
      allShort:M,stPay:0,stR:0,payAll:0,Rall:0,must});
  });
  rows.items=items;return rows;
};
// the identity every screen relies on
MX.period=r=>{if(!r)return null;const ex=r.ex||{},extra=r2(Object.values(ex).reduce((a,b)=>a+b,0)),must=r2(r.must!=null?r.must:r.bl+r.affOnly+r.one+r.mins);
  return{d0:r.d0,d1:r.d1,days:r.days,lab:r.lab,start:r2(r.cashIn),inc:r2(r.inc),must,bills:r2(r.bl),mins:r2(r.mins),plans:r2(r.affOnly+r.one),budgets:r2(r.every),budgetsBud:r2(r.everyBud!=null?r.everyBud:r.every),floor:r2(r.everyFloor||0),goals:r2(r.goals||0),gl:r.gl||{},wait:0,paused:0,extra,ex,end:r2(r.cash),intr:r2(r.intrSum||0),
    ok:Math.abs(r.cashIn+r.inc-must-r.every-(r.goals||0)-extra-r.cash)<0.02}};
// day by day checking: must-pays on their dates, budgets spread over the days, goals and extra on payday
daily=function(R){R=R||rows;const out=[];
  R.forEach(r=>{const its=R.items.filter(x=>x.t>=r.d0&&x.t<r.d1&&Math.abs(x.a)>0.004),exSum=r2(Object.values(r.ex||{}).reduce((a,b)=>a+b,0)),gSum=r2(r.goals||0),perDay=r.every/r.days;let c=r.cashIn;
    for(let t=r.d0;t<r.d1;t+=MS){const ev=[];
      if(t===r.d0){if(r.inc){c+=r.inc;ev.push([r.lab==='Bonus'?'Bonus':'Paycheck',r.inc])}if(gSum>0.004){c-=gSum;ev.push(['Set aside for goals',-gSum])}if(exSum>0.004){c-=exSum;ev.push([Object.keys(r.ex).some(k=>k!=='Savings')?'Extra to debt':'To savings',-exSum])}}
      its.filter(x=>x.t===t).forEach(x=>{c-=x.a;ev.push([x.name,-x.a])});
      c-=perDay;out.push({t,v:c,ev,spend:perDay})}});
  return out};
// ---------- 6. net worth = own − owe ----------
P4.acctOv=a=>(P4.g().acct||{})[a.id]||'';
P4.sideOf=a=>{const o=P4.acctOv(a);if(o)return o;const t=LG.type(a),v=+a.cur||0;if(t==='card'||t==='loan')return v<0?'own':'owe';if(t==='cash')return (LG.bal(a)<0)?'owe':'own';if(t==='savings'||t==='invest')return 'own';if(t==='other')return v>0?'own':(v<0?'owe':'ask');return 'ask'};
P4.unknownAccts=()=>LG.accts().filter(a=>P4.sideOf(a)==='ask');
P4.sides=()=>{const own=[],owe=[],hid=[],seen={};
  if(LG.live())LG.accts().forEach(a=>{const side=P4.sideOf(a),t=LG.type(a),nm=NW3.cleanName?NW3.cleanName(a):String(a.name||'Account');
    if(side==='hide'){hid.push({a,name:nm});return}if(side==='ask')return;
    if(t==='card'||t==='loan'){const v=+a.cur||0;if(v<0)own.push({k:'credit',name:nm+' (credit balance)',v:r2(-v),a});return}
    if(t==='cash'){const v=r2(LG.bal(a));if(v<0)owe.push({k:'over',name:nm+' (overdrawn)',v:r2(-v),a});else own.push({k:'cash',name:nm,v,a});seen.cash=1;return}
    if(t==='savings'){own.push({k:'savings',name:nm,v:r2(LG.bal(a)),a});seen.sav=1;return}
    if(t==='invest'||t==='other'){if(side==='owe'){owe.push({k:'other',name:nm,v:r2(Math.abs(+a.cur||0)),a});return}own.push({k:'invest',name:nm,v:r2(+a.cur||0),a})}});
  if(!seen.cash){const c=r2(estCash());if(c<0)owe.push({k:'over',name:'Checking (overdrawn)',v:r2(-c)});else own.push({k:'cash',name:'Checking',v:c})}
  else{const adj=r2(estCash()-r2(LG.of('cash').reduce((a,x)=>a+LG.bal(x),0)));if(Math.abs(adj)>0.004){if(adj<0)owe.push({k:'over',name:'Spent, not yet at the bank',v:r2(-adj)});else own.push({k:'cash',name:'Logged money in, not yet at the bank',v:adj})}}
  if(!seen.sav&&+state.saved>0)own.push({k:'savings',name:'Savings',v:r2(+state.saved)});
  MX.debts().forEach(d=>{const kind=d.kind==='borrow'?'borrow':(d.src==='plan'?'paylater':(d.kind==='card'?'card':'loan'));owe.push({k:kind,name:d.name,v:d.bal,d})});
  const s=L=>r2(L.reduce((a,x)=>a+x.v,0));return{own,owe,hid,ownTot:s(own),oweTot:s(owe),net:r2(s(own)-s(owe))}};
LG.nw=()=>{const S0=P4.sides(),C=r2(S0.own.filter(x=>x.k==='cash').reduce((a,x)=>a+x.v,0)),S=r2(S0.own.filter(x=>x.k==='savings').reduce((a,x)=>a+x.v,0)),I=r2(S0.own.filter(x=>x.k==='invest'||x.k==='credit').reduce((a,x)=>a+x.v,0));
  return{C,S,I,A:S0.ownTot,L:S0.oweTot,N:S0.net,own:S0.ownTot,owe:S0.oweTot,sides:S0}};
netWorth=function(){return LG.nw()};
// ---------- 7. the road ahead: net worth month by month, from the same plan ----------
P4.ahead=(R,months)=>{R=R||rows;months=months||24;const n=LG.nw(),T=realToday(),L=MX.debts(),out=[],by={};let moved=0;
  (R||[]).filter(r=>r.d1>T).forEach(r=>{const mk=P4.mk(r.d1-MS);const extraD=r2(Object.keys(r.ex||{}).filter(k=>k!=='Savings').reduce((a,k)=>a+r.ex[k],0)),sav=r2((r.ex||{}).Savings||0);
    const o=by[mk]=by[mk]||{mk,t:eomT(r.d1-MS),inc:0,must:0,bud:0,goals:0,extra:0,sav:0,intr:0,end:null,bal:null,plans:0};o.inc=r2(o.inc+r.inc);o.must=r2(o.must+(r.must||0));o.bud=r2(o.bud+r.every);o.goals=r2(o.goals+(r.goals||0));o.extra=r2(o.extra+extraD);o.sav=r2(o.sav+sav);o.intr=r2(o.intr+(r.intrSum||0));o.end=r.cash;o.bal=r.bal;o.r=r});
  let gcum=0,scum=0;Object.values(by).sort((a,b)=>a.t-b.t).slice(0,months).forEach(o=>{gcum=r2(gcum+o.goals);scum=r2(scum+o.sav);
    const debts=r2(L.reduce((a,d)=>a+F3.left(d,o.r),0)),own=r2(Math.max(0,o.end)+n.S+n.I+gcum+scum),owe=r2(debts+Math.max(0,-o.end));
    out.push(Object.assign(o,{debts,own,owe,v:r2(own-owe),out:r2(o.must+o.bud)}))});
  return out};
F3.nwPts=()=>{let S=[];try{S=LG.series()}catch(e){}const past=S.slice(-7).map(s=>({t:Date.UTC(s.d.getUTCFullYear(),s.d.getUTCMonth()+1,0),v:s.v,lab:s.m+' '+s.y}));
  const n=LG.nw();if(past.length)past[past.length-1]={t:realToday(),v:n.N,lab:'Today'};
  const fut=P4.ahead(rows,12).map(o=>({t:o.t,v:o.v,lab:sdate(o.t)}));return{past,fut,all:past.concat(fut),split:past.length-1}};
// lighter and heavier months: how the road ahead changes if spending runs like your lower or higher months
P4.band=()=>{try{const R=P4.recent();if(R.n<3)return null;const s=R.tot.slice().sort((a,b)=>a-b),lo=s[Math.floor((s.length-1)*0.25)],hi=s[Math.ceil((s.length-1)*0.75)],bud=P4.budTotal()+P4.spendFloor();
    const run=mo=>{const s2=clone(state);s2.lg=clone(state.lg||{});s2.lg.b4=Object.assign({},s2.lg.b4||{},{realistic:false});const d=mo-((+s2.everyday||0)+(+s2.discReduced||0));s2.everyday=Math.max(0,(+s2.everyday||0)+d);const E2=eff(s2,s2.whatif);E2.cash=projStart();return P4.ahead(simulate(E2),12)};
    const L=run(Math.min(lo,bud)),H=run(Math.max(hi,bud));return{lo:L,hi:H,loMo:r2(Math.min(lo,bud)),hiMo:r2(Math.max(hi,bud))}}catch(e){return null}};
// compare the strategies on the same money
MX.compare=()=>{const out={},T=realToday();Object.keys(MX.ORD).forEach(k=>{try{const s2=clone(state);s2.lg=clone(state.lg||{});s2.lg.b3=Object.assign({},s2.lg.b3||{},{order:k,extra:true});const E2=eff(s2,s2.whatif);E2.cash=projStart();const R=simulate(E2).filter(r=>r.d1>T),L=MX.debts().filter(d=>d.src!=='plan');
    let free=null,first=null,intr=0;for(const r of R){intr=r2(intr+(r.intrSum||0));if(!first){const f=L.find(d=>r.bal[d.raw]<=0.5&&d.bal>0.5);if(f)first={name:f.name,t:r.d1}}if(L.every(d=>!(d.raw in r.bal)||r.bal[d.raw]<=0.5)){free=r.d1;break}}
    out[k]={free,first,intr}}catch(e){out[k]={err:1}}});return out};
// how much goes to extra right now (a month's worth from the next periods)
MX.extraMo=()=>{const T=realToday(),R=(rows||[]).filter(r=>r.d1>T&&r.lab!=='Today').slice(0,3);if(!R.length)return 0;const days=R.reduce((a,r)=>a+r.days,0),ex=R.reduce((a,r)=>a+Object.keys(r.ex||{}).filter(k=>k!=='Savings').reduce((s,k)=>s+r.ex[k],0),0);return r2(ex/Math.max(1,days)*365/12)};
// ---------- 8. one check that everything agrees ----------
MX.check=()=>{const P=[],eq=(a,b,what)=>{if(Math.abs(a-b)>0.011)P.push(what+': '+a+' vs '+b)};
  try{const n=LG.nw(),S=P4.sides();eq(n.N,r2(n.A-n.L),'net worth math');eq(S.ownTot,r2(S.own.reduce((a,x)=>a+x.v,0)),'own list');eq(S.oweTot,r2(S.owe.reduce((a,x)=>a+x.v,0)),'owe list');eq(n.L,r2(MX.owe()+S.owe.filter(x=>x.k==='over'||x.k==='other').reduce((a,x)=>a+x.v,0)),'owe vs debts');
    (rows||[]).slice(0,40).forEach((r,i)=>{const p=MX.period(r);if(!p.ok)P.push('pay period '+i+' does not add up')});
    const R=P4.rollTotal(realToday());eq(R.lim,P4.budTotal(),'rolling total vs budgets');
    BCATS.forEach(c=>{const x=P4.roll(c[0],Date.UTC(new Date(realDay()).getUTCFullYear(),new Date(realDay()).getUTCMonth()+1,0));if(x&&Math.abs(x.built-x.lim)>0.011)P.push('month shares of '+c[1]+' do not add up')});
    const m=MX.month();eq(m.spent,r2(BCATS.reduce((a,c)=>a+(m.ms[c[0]]||0),0)),'month spent')}catch(e){P.push('check failed: '+e.message)}return P};
try{if(window.__S)window.__S.P4=P4}catch(e){}
}
