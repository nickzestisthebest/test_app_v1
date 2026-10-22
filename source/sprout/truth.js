// ===================== One set of money facts that every screen reads, so the numbers always tie out =====================
// What you owe is every debt Sprout knows about: cards and loans from your bank, ones you typed in,
// pay-later plans and Cash App Borrow. Net worth, Finances, Debts, Accounts, Home and Ask all use this same list.
const MX={};
{
const r2=x=>Math.round((+x||0)*100)/100;
MX.r2=r2;
MX.KIND={card:'Credit card',loan:'Loan',student:'Student loan',auto:'Auto loan',paylater:'Pay later',borrow:'Cash advance',person:'Owed to someone',other:'Other debt'};
MX.kindOfDebt=d=>{const n=String(d.name||'').toLowerCase(),a=d.acct&&LG.accts().find(x=>x.id===d.acct),sub=String(a&&a.sub||'').toLowerCase();
  if(d.card||(a&&a.kind==='card'))return 'card';if(/student|nelnet|navient|mohela|sallie|aidvantage|fedloan|great lakes|edfinancial/.test(n+' '+sub))return 'student';
  if(/auto|car\b|vehicle|toyota|honda|ford|nissan|ally|carmax|santander consumer/.test(n+' '+sub))return 'auto';
  if(a&&a.kind==='loan')return 'loan';if(/cash app borrow|brigit|dave|earnin|moneylion|cleo|albert|chime spot|klover/.test(n))return 'borrow';
  if(/klarna|affirm|afterpay|sezzle|zip|pay in 4|pay later/.test(n))return 'paylater';
  if(/visa|mastercard|amex|american express|discover|card|capital one|chase|citi|synchrony|barclays/.test(n))return 'card';
  if(/loan|mortgage|lending|finance|credit union|sofi|upstart|lendingclub|avant|oneMain/i.test(n))return 'loan';
  if(/venmo|coinbase|paypal|friend|mom|dad|family|owed to/.test(n))return 'person';return 'other'};
// every debt, one row each. Pay-later and Cash App Borrow come from their payment schedules.
MX.debts=()=>{const out=[];
  (state.debts||[]).forEach(d=>{const b=r2(+d.bal);if(!(b>0.004))return;const k=MX.kindOfDebt(d),apr=+d.apr||0;
    out.push({key:'d:'+d.name,raw:d.name,name:LG.short(d.name),kind:k,bal:b,apr,aprSet:apr>0||!!d.aprZero||k==='person',min:r2(+d.min||0),day:+d.day||0,src:d.acct?'bank':'typed',acct:d.acct||'',extra:d.extra!==false,limit:+d.limit||0,debt:d})});
  try{PL.plans().forEach(p=>{if(!(p.owed>0.004))return;const borrow=/cash app/i.test(p.prov+' '+p.store)||p.items.some(x=>/cash app/i.test(x.name));
    out.push({key:'pl:'+p.id,raw:p.id,name:borrow?'Cash App Borrow':p.store,prov:borrow?'Cash App':p.prov,kind:borrow?'borrow':'paylater',bal:r2(p.owed),apr:0,aprSet:true,min:r2(p.next?p.next.amt:0),next:p.next?p.next.t:0,left:p.left,src:'plan',plan:p,extra:false})})}catch(e){}
  return out.sort((a,b)=>b.bal-a.bal)};
MX.owe=()=>r2(MX.debts().reduce((s,d)=>s+d.bal,0));
MX.byKind=()=>{const g={};MX.debts().forEach(d=>{const k=d.kind==='student'||d.kind==='auto'?'loan':d.kind;(g[k]=g[k]||{k,v:0,n:0}).v+=d.bal;g[k].n++});Object.values(g).forEach(x=>x.v=r2(x.v));return g};
// the order extra money goes to debts: highest rate first unless you chose otherwise
MX.ORD={rate:'Highest rate first',small:'Smallest balance first',mine:'Your own order'};
MX.pref=()=>{const g=LG.st();g.b3=g.b3||{};if(g.b3.extra==null)g.b3.extra=true;if(!MX.ORD[g.b3.order])g.b3.order='rate';g.b3.mine=g.b3.mine||[];return g.b3};
MX.order=st=>{st=st||state;const p=(st.lg&&st.lg.b3)||{},ord=p.order||'rate',mine=p.mine||[];if(p.extra===false)return [];
  const L=(st.debts||[]).filter(d=>d.extra!==false&&+d.bal>0.004);
  return L.slice().sort((a,b)=>{if(ord==='small')return (+a.bal)-(+b.bal);if(ord==='mine'){const ia=mine.indexOf(a.name),ib=mine.indexOf(b.name);return (ia<0?999:ia)-(ib<0?999:ib)}
    return (+b.apr||0)-(+a.apr||0)||(+a.bal)-(+b.bal)})};
// money in a month, from your paycheck
MX.PER={weekly:52,biweekly:26,semimonthly:24,twice:24,monthly:12};
MX.incMo=()=>r2((+state.pay||0)*(MX.PER[state.payFreq]||26)/12);
// what the plan says about the pay period that holds a day: every dollar of the paycheck is accounted for
MX.period=r=>{if(!r)return null;const must=r2(r.bl+r.affOnly+r.one+r.mins),ex=r.ex||{},extra=r2(Object.values(ex).reduce((a,b)=>a+b,0));
  return{d0:r.d0,d1:r.d1,days:r.days,lab:r.lab,start:r2(r.cashIn),inc:r2(r.inc),must,bills:r2(r.bl),mins:r2(r.mins),plans:r2(r.affOnly+r.one),budgets:r2(r.every),wait:r2(r.payAll),paused:r2(r.Rall),extra,ex,end:r2(r.cash),
    // the identity every screen relies on: start + paycheck - must-pays - budgets - can-wait - extra = what's left
    ok:Math.abs(r.cashIn+r.inc-(r.bl+r.affOnly+r.one+r.mins)-r.every-r.payAll-extra-r.cash)<0.02}};
// spending money left for the rest of this pay period: your budget, but never more than checking can cover
MX.left=()=>{try{const T=realToday(),sp=(state.spend||[]).map(s=>Object.assign({t:pd(s.d)},s)),A=availAt(T,sp),r=A.r,inP=s=>s.t>=r.d0&&s.t<r.d1&&(s.cat==='Everyday'||s.cat==='Personal');
    const allow=r2(Math.floor(r.evDay*r.days*100)/100+Math.floor(r.persDay*r.days*100)/100),spent=r2(sp.filter(inP).reduce((a,s)=>a+ +s.amt,0)),budLeft=Math.max(0,r2(allow-spent));
    const C=A.cover,coverLeft=C?Math.max(0,r2(C.free+C.todCash)):Infinity,left=Math.min(budLeft,coverLeft);
    return{allow,spent,budLeft,coverLeft:isFinite(coverLeft)?coverLeft:null,left:r2(left),capped:coverLeft<budLeft-0.004,today:r2(A.leftTotal),todayPer:r2(A.perTotal),d1:A.d1,days:A.daysLeft,A}}catch(e){return null}};
// the same month numbers everywhere: this month's spending in budgets, and what's budgeted
MX.month=()=>{const ms=monthSpend(),spent=r2(BCATS.reduce((a,c)=>a+(ms[c[0]]||0),0)),bud=r2(BCATS.reduce((a,c)=>a+budLim(c),0)),T=realDay(),d=new Date(T),dim=eom(d.getUTCFullYear(),d.getUTCMonth()+1),dl=dim-d.getUTCDate()+1;
  return{spent,bud,left:r2(bud-spent),daysLeft:dl,dim,ms}};
// a check that every place tells the same story (used by tests and by debug mode)
MX.check=()=>{const P=[],eq=(a,b,what)=>{if(Math.abs(a-b)>0.011)P.push(what+': '+a+' vs '+b)};
  try{eq(MX.owe(),r2(totalDebt()),'what you owe vs totalDebt');const n=LG.nw();eq(n.L,MX.owe(),'net worth owe vs debts');eq(n.N,r2(n.A-n.L),'net worth math');
    (rows||[]).slice(0,30).forEach((r,i)=>{const p=MX.period(r);if(!p.ok)P.push('pay period '+i+' does not add up')});
    const m=MX.month();eq(m.spent,r2(BCATS.reduce((a,c)=>a+(m.ms[c[0]]||0),0)),'month spent')}catch(e){P.push('check failed: '+e.message)}return P};
try{if(window.__S)window.__S.MX=MX}catch(e){}
}
