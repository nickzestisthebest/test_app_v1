// ===================== Finances 3: one job per screen, every number from the same facts =====================
// Finances is a short overview. Each card opens one screen: Net worth (with every account), Cash flow
// (checking, this paycheck, next payday, the week ahead, paycheck by paycheck), Debts (the payoff plan),
// Savings and investing, Spending and the Money calendar.
const F3={};
{
const r2=MX.r2;
// ---------- a line chart you can drag across ----------
MX.CH={};let CHN=0;
MX.chart=(pts,o)=>{o=o||{};if(!pts||pts.length<2)return '';const id='c'+(++CHN),W=340,H=o.h||150,pl=4,pr=4,pt=16,pb=20;
  const vs=pts.map(p=>p.v),lo0=Math.min(...vs,o.zero?0:Infinity,o.cush!=null?o.cush:Infinity),hi0=Math.max(...vs,o.zero?0:-Infinity,o.cush!=null?o.cush:-Infinity),pad=(hi0-lo0)*.1||Math.max(1,Math.abs(hi0)*.1),lo=lo0-pad,hi=hi0+pad;
  const t0=pts[0].t,t1=pts[pts.length-1].t,X=t=>pl+(t-t0)/Math.max(1,t1-t0)*(W-pl-pr),Y=v=>pt+(hi-v)/Math.max(1e-9,hi-lo)*(H-pt-pb);
  const seg=(a,b)=>pts.slice(a,b).map((p,i)=>(i?'L':'M')+X(p.t).toFixed(1)+','+Y(p.v).toFixed(1)).join('');
  const split=o.split!=null?Math.max(0,Math.min(pts.length-1,o.split)):pts.length-1,col=o.color||'var(--mxc-line)';
  let s='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true">';
  if(o.zero&&lo<0&&hi>0)s+='<line x1="0" x2="'+W+'" y1="'+Y(0).toFixed(1)+'" y2="'+Y(0).toFixed(1)+'" class="mxz"/>';
  if(o.cush!=null&&o.cush>lo&&o.cush<hi)s+='<line x1="0" x2="'+W+'" y1="'+Y(o.cush).toFixed(1)+'" y2="'+Y(o.cush).toFixed(1)+'" class="mxcu"/>';
  const area=seg(0,pts.length)+'L'+X(t1).toFixed(1)+','+(H-pb)+'L'+X(t0).toFixed(1)+','+(H-pb)+'Z';
  s+='<defs><linearGradient id="g'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".22"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs><path d="'+area+'" fill="url(#g'+id+')" stroke="none"/>';
  s+='<path d="'+seg(0,split+1)+'" fill="none" stroke="'+col+'" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>';
  if(split<pts.length-1)s+='<path d="'+seg(split,pts.length)+'" fill="none" stroke="'+col+'" stroke-width="2.4" stroke-dasharray="5 5" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".85"/>';
  if(o.mark!=null&&pts[o.mark])s+='<circle cx="'+X(pts[o.mark].t).toFixed(1)+'" cy="'+Y(pts[o.mark].v).toFixed(1)+'" r="4" class="mxlow" vector-effect="non-scaling-stroke"/>';
  s+='</svg>';
  const lab=(o.labels||[]).map(l=>'<span style="left:'+((X(l[0])/W)*100).toFixed(1)+'%">'+esc(l[1])+'</span>').join('');
  MX.CH[id]={pts,X,Y,W,H,fmt:o.fmt||money0,split,past:o.past||'',fut:o.fut||''};
  return '<div class="mxc" data-mxc="'+id+'" style="--h:'+H+'px">'+s+'<i class="mxv"></i><i class="mxd"></i><div class="mxtip"></div>'+(lab?'<div class="mxl">'+lab+'</div>':'')+'</div>'};
{const move=(el,cx)=>{const c=MX.CH[el.dataset.mxc];if(!c)return;const rc=el.getBoundingClientRect(),fx=Math.max(0,Math.min(1,(cx-rc.left)/rc.width)),t=c.pts[0].t+fx*(c.pts[c.pts.length-1].t-c.pts[0].t);
    let bi=0,bd=Infinity;c.pts.forEach((p,i)=>{const d=Math.abs(p.t-t);if(d<bd){bd=d;bi=i}});const p=c.pts[bi],x=c.X(p.t)/c.W*100,y=c.Y(p.v)/c.H*100;
    el.classList.add('on');el.querySelector('.mxv').style.left=x+'%';const d=el.querySelector('.mxd');d.style.left=x+'%';d.style.top=y+'%';
    const tip=el.querySelector('.mxtip');tip.innerHTML='<b>'+c.fmt(p.v)+'</b><span>'+(p.lab||sdate(p.t))+(bi>c.split?' · '+(c.fut||'forecast'):c.past&&bi<c.split?' · '+c.past:'')+'</span>';tip.style.left=Math.max(12,Math.min(88,x))+'%'};
  document.addEventListener('pointerdown',e=>{const el=e.target.closest&&e.target.closest('.mxc');if(!el)return;move(el,e.clientX);const mv=ev=>move(el,ev.clientX),up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);setTimeout(()=>el.classList.remove('on'),1600)};addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)})}
F3.seg=(name,opts,cur)=>'<div class="mxseg" role="tablist">'+opts.map(o=>'<button type="button" role="tab" aria-selected="'+(o[0]===cur)+'" data-f3="'+name+'" data-v="'+o[0]+'">'+o[1]+'</button>').join('')+'</div>';
F3.st={range:'1m',debt:'',open:{}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-f3]');if(!b)return;e.preventDefault();const k=b.dataset.f3,v=b.dataset.v;
  if(k==='range')F3.st.range=v;else if(k==='debt')F3.st.debt=F3.st.debt===v?'':v;else if(k==='order'){MX.pref().order=v;plan();queueSave()}else if(k==='extra'){MX.pref().extra=!MX.pref().extra;plan();queueSave()}
  else if(k==='pp'){F3.st.open[v]=!F3.st.open[v]}else if(k==='up'||k==='dn'){const p=MX.pref(),L=MX.order(Object.assign({},state,{lg:Object.assign({},state.lg,{b3:Object.assign({},p,{order:'mine'})})})).map(d=>d.name);
    if(!p.mine.length||p.order!=='mine'){p.mine=MX.order().map(d=>d.name)}const m=p.mine.length?p.mine:L,i=m.indexOf(v),j=i+(k==='up'?-1:1);if(i>=0&&j>=0&&j<m.length){[m[i],m[j]]=[m[j],m[i]]}p.mine=m;p.order='mine';plan();queueSave()}
  if(typeof xRender==='function')xRender()});
// ---------- what you owe over time, from the plan ----------
F3.left=(d,r)=>{if(d.src!=='plan')return d.raw in r.bal?Math.max(0,r.bal[d.raw]):d.bal;const p=d.plan,fut=p.items.filter(x=>!x.done&&x.t>=r.d1).reduce((a,x)=>a+x.amt,0);
  if(d.kind==='borrow')return Math.min(d.bal,r2(fut+(r.Rall||0)));return r2(fut)};
F3.debtRows=()=>{const L=MX.debts(),T=realToday(),R=(rows||[]).filter(r=>r.d1>T);return{L,R}};
F3.free=()=>{const {L,R}=F3.debtRows();if(!L.length)return {t:realToday(),none:true};for(const r of R){if(L.every(d=>F3.left(d,r)<=0.5))return {t:r.d1}}return null};
F3.payoff=d=>{const {R}=F3.debtRows();for(const r of R){if(F3.left(d,r)<=0.5)return r.d1}return null};
F3.mon=t=>new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',year:'numeric'});
F3.interest=()=>r2(MX.debts().reduce((a,d)=>a+d.bal*(d.apr||0)/100/12,0));
TITLES.debts='Debts';
PAGES.debts=()=>{const {L,R}=F3.debtRows(),tot=MX.owe(),pref=MX.pref(),ord=MX.order(E),firstN=ord[0]&&ord[0].name,fr=F3.free(),sel=L.find(d=>d.key===F3.st.debt);
  if(!L.length)return '<div class="xhero"><span class="k">You owe</span><b>$0</b><span class="d">No debts. Add a card or loan in Your plan if you have one.</span></div>';
  const G=MX.byKind(),KN={card:'Cards',loan:'Loans',paylater:'Pay later',borrow:'Cash advance',person:'People',other:'Other'};
  const pts=[{t:realToday(),v:sel?sel.bal:tot,lab:'Today'}].concat(R.slice(0,80).map(r=>({t:r.d1,v:r2(sel?F3.left(sel,r):L.reduce((a,d)=>a+F3.left(d,r),0))})));
  let cut=pts.findIndex((p,i)=>i>0&&p.v<=0.5);const P=cut>0?pts.slice(0,cut+1):pts;
  const yr=t=>new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',month:'short'})+(new Date(t).getUTCMonth()===0||t===P[0].t?' ’'+String(new Date(t).getUTCFullYear()).slice(2):'');
  const labs=[];const span=P[P.length-1].t-P[0].t;[0,.33,.66,1].forEach(f=>{const t=P[0].t+span*f;labs.push([t,yr(t)])});
  let h='<div class="f3hero debt"><span class="k">You owe</span><b>'+money0(tot)+'</b><span class="d">'+(fr&&!fr.none?'Debt-free by '+F3.mon(fr.t)+' on this plan':'Not paid off within 3 years at this pace')+'</span>'+
    '<div class="f3chips">'+Object.values(G).sort((a,b)=>b.v-a.v).map(g=>'<span>'+KN[g.k]+' <b>'+money0(g.v)+'</b></span>').join('')+'</div></div>';
  h+='<div class="xcard f3chart"><div class="f3ch"><h3>'+(sel?esc(sel.name):'All debts')+'</h3>'+(sel?'<button type="button" class="lnk" data-f3="debt" data-v="'+esc(sel.key)+'">Show all</button>':'<span class="xhint">Tap a debt below to see just that one</span>')+'</div>'+
    MX.chart(P,{h:160,color:'var(--mxc-debt)',labels:labs,fut:'on this plan'})+
    '<p class="xhint" style="margin:0">From your plan: minimums on everything, then '+(pref.extra===false?'nothing extra (turned off).':'what’s left after must-pays and budgets goes to '+(firstN?esc(LG.short(firstN)):'your debts')+' first.')+' Interest is included.</p></div>';
  h+='<div class="xcard"><h3>Where extra money goes</h3><label class="srow lgtog"><span class="slab">Send what’s left to debt<small>After must-pays and your budgets. Off keeps it in checking.</small></span><input type="checkbox" class="sw" data-f3="extra" data-v="1"'+(pref.extra!==false?' checked':'')+'></label>'+
    (pref.extra!==false?F3.seg('order',[['rate','Highest rate'],['small','Smallest balance'],['mine','My order']],pref.order)+'<p class="xhint" style="margin:0">'+(pref.order==='rate'?'Highest rate first usually means the least interest overall.':pref.order==='small'?'Smallest balance first clears whole accounts sooner.':'Use the arrows to set the order.')+' Pay-later plans and Cash App Borrow follow their own schedules.</p>':'')+'</div>';
  const mi=F3.interest();
  h+='<div class="f3list">'+L.map(d=>{const po=F3.payoff(d),isF=d.debt&&d.debt.name===firstN&&pref.extra!==false,on=sel&&sel.key===d.key,ri=ord.findIndex(x=>d.debt&&x.name===d.debt.name);
    const sub=[MX.KIND[d.kind]+(d.prov&&d.kind==='paylater'?' · '+esc(d.prov):''),d.src==='plan'?(d.left?d.left+' payment'+(d.left===1?'':'s')+' left':''):(d.aprSet?(d.apr?d.apr+'% APR':'No interest'):'<em class="f3warn">Rate not set</em>'),d.min>0?'min '+money0(d.min)+(d.day?' on the '+ordn(d.day):''):''].filter(Boolean).join(' · ');
    return '<div class="f3d'+(on?' on':'')+'"><button type="button" class="f3db" data-f3="debt" data-v="'+esc(d.key)+'" aria-pressed="'+!!on+'"><span class="f3k k-'+d.kind+'">'+ic(d.kind==='card'?'card':d.kind==='paylater'?'cal':d.kind==='borrow'?'money':d.kind==='person'?'users':'doc')+'</span><span class="f3t"><b>'+esc(d.name)+(isF?' <em class="f3first">Extra goes here first</em>':'')+'</b><small>'+sub+'</small><small>'+(po?'Paid off '+F3.mon(po):'Beyond 3 years at this pace')+'</small></span><span class="f3a">'+money0(d.bal)+'</span></button>'+
      (pref.order==='mine'&&ri>=0&&pref.extra!==false?'<span class="f3ord"><button type="button" class="sbtn alt" data-f3="up" data-v="'+esc(d.debt.name)+'" aria-label="Move up">↑</button><button type="button" class="sbtn alt" data-f3="dn" data-v="'+esc(d.debt.name)+'" aria-label="Move down">↓</button></span>':'')+
      (on?'<div class="f3dx">'+(d.src==='plan'?'<button type="button" class="lnk" data-x="open" data-v="paylater">See the payment schedule ›</button>':'<button type="button" class="lnk" data-x="open" data-v="ydebt" data-w="'+(state.debts||[]).indexOf(d.debt)+'">'+(d.aprSet?'Edit this debt':'Add the interest rate')+' ›</button>')+(d.apr?'<small>About '+money(d.bal*d.apr/100/12)+' a month in interest right now.</small>':'')+'</div>':'')+'</div>'}).join('')+'</div>';
  return h+(mi>0.5?'<p class="xhint">All together, about '+money0(mi)+' a month goes to interest at today’s balances.</p>':'')+'<p class="xhint">Estimates from your plan. Your lenders’ statements are the final word. Not financial advice.</p>'};
const ordn=n=>n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th');
// ---------- cash flow ----------
TITLES.cashflow='Cash flow';
F3.RANGE=[['2w','2W',14],['1m','1M',30],['3m','3M',91],['6m','6M',182],['pay','Until payday',0]];
PAGES.cashflow=()=>{const T=realToday(),est=estCash(),{np,low}=lowBeforePay(),cush=+E.cushion||0,ml=MX.left();
  const rg=F3.RANGE.find(x=>x[0]===F3.st.range)||F3.RANGE[1],end=rg[0]==='pay'?(np?np.d0:T+14*MS):T+rg[2]*MS,P=DAILY.filter(d=>d.t>=T&&d.t<=end).map(d=>({t:d.t,v:r2(d.v)}));
  const lp=P.length?P.reduce((a,b)=>b.v<a.v?b:a):null,mi=lp?P.indexOf(lp):null;
  let h='<div class="f3hero cash"><span class="k">Checking now</span><b class="'+(est<0?'neg':'')+'">'+money(est)+'</b><span class="d">'+esc((typeof F2!=='undefined'&&F2.chkLabel())||'From your last check-in')+'</span>'+
    '<div class="f3chips"><span>Next payday <b>'+(np?sdate(np.d0)+' · +'+money0(np.inc):'not set')+'</b></span>'+(low?'<span class="'+(low.v<0?'neg':low.v<cush?'warn':'')+'">Lowest before then <b>'+money0(low.v)+'</b></span>':'')+'</div></div>';
  h+='<div class="xcard"><div class="f3ch"><h3>Checking ahead</h3></div>'+F3.seg('range',F3.RANGE.map(x=>[x[0],x[1]]),rg[0])+MX.chart(P,{h:150,zero:true,cush,mark:mi,color:lp&&lp.v<0?'var(--mxc-bad)':'var(--mxc-line)',labels:P.length?[[P[0].t,'Today'],[P[P.length-1].t,sdate(P[P.length-1].t)]]:[],fut:'estimate'})+
    '<p class="xhint" style="margin:0">Your balance at the end of each day if you spend your daily amount and bills go out on time. The dashed line is your '+money0(cush)+' cushion.</p></div>';
  // this pay period: spending money is never more than checking can cover
  if(ml){h+='<div class="xcard f3left"><h3>Spending money until '+sdate(ml.d1)+'</h3><div class="f3big"><b class="'+(ml.left<=0.004?'zero':'')+'">'+money(ml.left)+'</b><span>'+(ml.capped?(ml.left<=0.004?'Checking can’t cover more spending before payday, after what’s due.':'Limited by checking: that’s what’s left after what’s due and your cushion.'):'Left in your budget for '+ml.days+' day'+(ml.days===1?'':'s'))+'</span></div>'+
    '<div class="f3two"><div><small>Your budget for these days</small><b>'+money(ml.allow)+'</b></div><div><small>Spent so far</small><b>'+money(ml.spent)+'</b></div>'+(ml.coverLeft!=null?'<div><small>Checking can cover</small><b>'+money(ml.coverLeft)+'</b></div>':'')+'</div>'+
    (ml.capped?'<button type="button" class="lnk" data-x="open" data-v="safe">Why is it '+money0(ml.left)+'? ›</button>':'')+'</div>'}
  const cur=rows.find(r=>r.d0<=T&&r.d1>T);if(cur&&cur.lab==='Today')h+=B3.flowHTML(cur,{title:'Now until '+sdate(cur.d1)});
  const nx=B3.next();if(nx&&nx!==cur)h+=B3.flowHTML(nx);
  // the week ahead
  const wk=rows.items.filter(x=>x.t>=T&&x.t<T+7*MS&&x.a>0.004).sort((a,b)=>a.t-b.t),wait=x=>x.g==='Klarna'||x.g==='Cash App'||x.g==='Skip min';
  h+='<div class="xcard"><div class="f3ch"><h3>Next 7 days</h3><span class="xhint">'+money(wk.reduce((a,x)=>a+x.a,0))+'</span></div>'+(wk.length?wk.map(x=>'<div class="f3wk"><div class="dchip"><b>'+new Date(x.t).getUTCDate()+'</b><span>'+new Date(x.t).toLocaleDateString('en-US',{timeZone:'UTC',month:'short'})+'</span></div><div class="f3t"><b>'+esc(LG.short(shortName(x.name)))+'</b><small>'+(wait(x)?'Can wait if money is tight':'Must pay')+'</small></div><b class="f3a">'+money(x.a)+'</b>'+payBtn(x)+'</div>').join(''):'<p class="xhint" style="margin:0">Nothing due in the next 7 days.</p>')+
    '<button type="button" class="lnk" data-x="open" data-v="calendar">See it on the money calendar ›</button></div>';
  // paycheck by paycheck
  const pp=rows.filter(r=>r.d0>=T&&r.inc>0).slice(0,8);
  if(pp.length){h+='<div class="xcard f3pp"><h3>Paycheck by paycheck</h3><div class="f3leg">'+B3.SEG.map(s=>'<span><i class="s-'+s[0]+'"></i>'+s[1]+'</span>').join('')+'</div>'+pp.map(r=>{const p=MX.period(r),v={must:p.must,budgets:p.budgets,wait:p.wait,extra:p.extra,end:Math.max(0,p.end)},tt=Math.max(.01,Object.values(v).reduce((a,b)=>a+b,0)),k=fd(r.d0),open=!!F3.st.open[k];
      return '<div class="f3ppr'+(open?' open':'')+'"><button type="button" class="f3pph" data-f3="pp" data-v="'+k+'" aria-expanded="'+open+'"><span class="f3ppd"><b>'+sdate(r.d0)+'</b><small>+'+money0(p.inc)+'</small></span><span class="b3stack">'+B3.SEG.map(s=>v[s[0]]>0.004?'<i class="s-'+s[0]+'" style="width:'+(v[s[0]]/tt*100).toFixed(1)+'%"></i>':'').join('')+'</span><span class="f3ppe'+(p.end<0?' neg':'')+'">'+money0(p.end)+'<small>'+(p.extra>0.5?money0(p.extra)+' to debt':p.end<0?'short':'left')+'</small></span></button>'+(open?B3.flowHTML(r,{noLinks:true}):'')+'</div>'}).join('')+'</div>'}
  return h+'<p class="xhint">Estimates from your plan. Your bank’s numbers are the final word.</p>'};
// ---------- Finances overview ----------
F3.nwPts=()=>{let S=[];try{S=LG.series()}catch(e){}const past=S.slice(-7).map(s=>({t:Date.UTC(s.d.getUTCFullYear(),s.d.getUTCMonth()+1,0),v:s.v,lab:s.m+' '+s.y}));
  const n=LG.nw();if(past.length)past[past.length-1]={t:realToday(),v:n.N,lab:'Today'};
  // ahead: checking from the plan, savings and investments held, debts from the plan
  const {L,R}=F3.debtRows(),fut=[];R.forEach((r,i)=>{if(i%2||fut.length>=12)return;fut.push({t:r.d1,v:r2(Math.max(0,r.cash)+n.S+n.I-L.reduce((a,d)=>a+F3.left(d,r),0))})});
  return{past,fut,all:past.concat(fut),split:past.length-1}};
F3.card=(cls,go,inner)=>'<button type="button" class="f3c '+cls+'" '+go+'>'+inner+'</button>';
F3.moneyHTML=()=>{const n=LG.nw(),tot=MX.owe(),est=estCash(),{np,low}=lowBeforePay(),cush=+E.cushion||0,M=MX.month(),fr=F3.free(),nb=RC.newBills(),g=LG.st();let h='';
  if(nb.length&&!(g.nbSeen&&g.nbSeen===nb.map(s=>s.id).join('|')))h+='<div class="b2gap fbills"><b>Sprout found '+nb.length+' bill'+(nb.length>1?'s':'')+' in your history</b><span>'+esc(nb.slice(0,3).map(s=>s.name+' about '+money0(s.typ)+'/mo').join(', '))+'. Add '+(nb.length>1?'them':'it')+' so your daily number leaves room before each one is due.</span><div class="b2gapb"><button type="button" class="sbtn" data-x="open" data-v="yfound">Review</button><button type="button" class="sbtn alt" data-nbno>Not now</button></div></div>';
  h+=B2.gapHTML()+'<div class="pgh f3pgh"><div><h1>Finances</h1><small>Your whole picture</small></div></div>';
  // net worth
  const W=F3.nwPts(),first=W.past[0],chg=first?r2(n.N-first.v):0,own=Math.max(0,n.own),ow=tot,sum=Math.max(1,own+ow);
  h+=F3.card('f3nw','data-x="open" data-v="networth"','<div class="f3nwt"><span class="k">Net worth</span><span class="chev">›</span></div><b class="f3nwv'+(n.N<0?' neg':'')+'">'+money0(n.N)+'</b>'+
    (first?'<span class="f3pill '+(chg>=0?'up':'dn')+'">'+(chg>=0?'▲ ':'▼ ')+money0(Math.abs(chg))+' since '+esc(first.lab.split(' ')[0])+'</span>':'')+
    (W.all.length>2?MX.chart(W.all,{h:84,split:W.split,color:n.N<0&&chg<0?'var(--mxc-bad)':'var(--mxc-good)',past:'',fut:'on this plan'}):'')+
    '<div class="f3oo"><i class="o" style="width:'+(own/sum*100).toFixed(1)+'%"></i><i class="w" style="width:'+(ow/sum*100).toFixed(1)+'%"></i></div><div class="f3ool"><span><i class="o"></i>Own '+money0(own)+'</span><span><i class="w"></i>Owe '+money0(ow)+'</span></div>');
  // cash flow
  const P=DAILY.filter(d=>d.t>=realToday()&&d.t<=realToday()+14*MS).map(d=>({t:d.t,v:d.v}));
  h+=F3.card('f3cf wide','data-x="open" data-v="cashflow"','<div class="f3nwt"><span class="k">Cash flow</span><span class="chev">›</span></div><div class="f3cfr"><div><small>Checking</small><b class="'+(est<0?'neg':'')+'">'+money(est)+'</b></div><div><small>Next payday</small><b>'+(np?sdate(np.d0):'Not set')+'</b>'+(np?'<small class="up">+'+money0(np.inc)+'</small>':'')+'</div><div><small>Lowest before payday</small><b class="'+(low&&low.v<0?'neg':low&&low.v<cush?'warn':'')+'">'+(low?money0(low.v):'–')+'</b>'+(low?'<small>'+sdate(low.t)+'</small>':'')+'</div></div>'+(P.length>2?MX.chart(P,{h:56,zero:true,color:low&&low.v<0?'var(--mxc-bad)':'var(--mxc-line)'}):''));
  // debts and savings side by side
  let sv=0;try{const S=SV();sv=r2(n.S+n.I)}catch(e){sv=r2(n.S+n.I)}
  h+='<div class="f3grid">'+F3.card('f3dt','data-x="open" data-v="debts"','<div class="f3nwt"><span class="k">Debts</span><span class="chev">›</span></div><b class="f3mid">'+money0(tot)+'</b><small>'+(tot<=0?'Nothing owed':fr&&!fr.none?'Debt-free by '+F3.mon(fr.t):'Owed in total')+'</small>')+
    F3.card('f3sv','data-x="open" data-v="vault"','<div class="f3nwt"><span class="k">Savings and investing</span><span class="chev">›</span></div><b class="f3mid">'+money0(sv)+'</b><small>'+(n.I>0?money0(n.S)+' saved · '+money0(n.I)+' invested':'Across your accounts')+'</small>')+'</div>';
  // spending this month, with insights
  try{h+=SP.card()}catch(e){}
  // money calendar: the next two weeks at a glance
  h+=F3.calCard();
  // tools
  h+=F3.tools();
  return h};
F3.calCard=()=>{const T=realToday(),B=CAL2.bal(),cush=+E.cushion||0;let ev={};try{const d=new Date(T);Object.assign(ev,CAL2.events(d.getUTCFullYear(),d.getUTCMonth()));const d2=new Date(T+14*MS);if(d2.getUTCMonth()!==d.getUTCMonth())Object.assign(ev,CAL2.events(d2.getUTCFullYear(),d2.getUTCMonth()))}catch(e){}
  let s='';for(let i=0;i<14;i++){const t=T+i*MS,k=fd(t),e=ev[k]||[],b=B[k],net=e.reduce((a,z)=>a+(z.k==='p'?z.a:-z.a),0);
    s+='<span class="f3cd'+(b!=null&&b<0?' neg':b!=null&&b<cush?' warn':'')+(i===0?' today':'')+'"><small>'+new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'narrow'})+'</small><b>'+new Date(t).getUTCDate()+'</b><i class="'+(net>0.5?'in':net<-0.5?'out':'')+'"></i></span>'}
  const n7=rows.items.filter(x=>x.t>=T&&x.t<T+14*MS&&x.a>0.004).length;
  return F3.card('f3cal wide','data-x="open" data-v="calendar"','<div class="f3nwt"><span class="k">Money calendar</span><span class="chev">›</span></div><small class="f3cals">'+n7+' payment'+(n7===1?'':'s')+' and '+((rows||[]).filter(r=>r.inc>0&&r.d0>=T&&r.d0<T+14*MS).length)+' payday'+(((rows||[]).filter(r=>r.inc>0&&r.d0>=T&&r.d0<T+14*MS).length)===1?'':'s')+' in the next two weeks</small><div class="f3cdays">'+s+'</div>')};
F3.tools=()=>{let T={n:0,mo:0};try{T=subTotals()}catch(e){}const al=(()=>{try{return alerts().length}catch(e){return 0}})(),plus=typeof plusIs==='function'&&plusIs();
  const need=[];if(al)need.push(['alerts','bell',al+' alert'+(al>1?'s':'')+' to review','Price changes, double charges and more']);
  const row=(go,ico,t,s,tag)=>'<button type="button" class="f3tr" '+go+'><span class="f3ti">'+ic(ico)+'</span><span class="f3t"><b>'+t+(tag?' <em class="f3tag">'+tag+'</em>':'')+'</b><small>'+s+'</small></span><span class="chev">›</span></button>';
  return (need.length?'<div class="f3need">'+need.map(x=>'<button type="button" class="f3nd" data-x="open" data-v="'+x[0]+'">'+ic(x[1])+'<span><b>'+x[2]+'</b><small>'+x[3]+'</small></span><span class="chev">›</span></button>').join('')+'</div>':'')+
   '<div class="f3tools"><h3>Tools</h3><div class="f3tg">'+
   row('data-x="nav" data-v="tx"','money','Transactions','Search, edit and sort')+
   row('data-x="open" data-v="subs"','repeat','Subscriptions',T.n?T.n+' active · '+money0(T.mo)+'/mo':'Find what renews')+
   row('data-x="open" data-v="nego"','phone','Lower my bills','We negotiate for you',plus?'':'Plus')+'</div><div class="f3tg">'+
   row('data-x="open" data-v="budgets"','pie','Budgets',(()=>{const M=MX.month();return M.left>=0?money0(M.left)+' left this month':money0(-M.left)+' over this month'})())+
   row('data-x="open" data-v="yourplan"','doc','Your plan','Paycheck, bills, debts and balances')+
   row('data-x="open" data-v="credit"','gauge','Credit','Your score and what moves it',plus?'':'Plus')+
   row('data-x="open" data-v="house"','users','Partner','Share with someone',plus?'':'Plus')+'</div>'+
   '<button type="button" class="f3plus" data-x="open" data-v="plus"><b>Sprout Plus</b><span>'+(plus?'On. See what Plus adds':'See what’s free and what Plus adds')+'</span><span class="chev">›</span></button></div>'};
// Finances is drawn from these facts only (other modules' older cards are left out on purpose)
moneyHTML=function(){try{return F3.moneyHTML()}catch(e){try{console.warn('finances',e)}catch(_){}return '<div class="pgh"><div><h1>Finances</h1></div></div><p class="xhint">Something went wrong drawing this page. Pull to refresh.</p>'}};
// old shortcuts into the long scrolling plan now open the matching screen
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-goto]');if(!b)return;const g=b.dataset.goto,m={'#debt-rows':'debts','#m-per':'cashflow','#m-spend':'cashflow','#upc-mini':'cashflow','.port':'cashflow'}[g];if(!m)return;e.preventDefault();e.stopImmediatePropagation();xOpen(m)},true);
try{if(window.__S)window.__S.F3=F3}catch(e){}
}
