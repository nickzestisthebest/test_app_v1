// ===================== Money calendar 4: Pay and Spend tabs, filters that focus, a what-if that says where the money comes from =====================
// The month grid shows money in and out with a dot on days something is due. The day sheet has a Pay tab (everything due,
// or "Nothing due today" with what's next) and a Spend tab (the rolling budget for that day). Below: what-if for that day,
// and the plan paycheck by paycheck, with every row adding up to the cent.
const CAL4={st:{groups:[],tab:null,wi:null,open:{}}};
{
const r2=MX.r2,DY=MS;
CAL4.KN={p:'Payday',b:'Bills',card:'Card and loan',pl:'Pay later',sub:'Subscriptions'};
CAL4.sel=()=>CAL4.st.groups.length?CAL4.st.groups:null;
CAL4.vis=z=>{const s=CAL4.sel();return !s||s.indexOf(z.k)>=0};
CAL4.ordn=n=>n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th');
CAL4.item=z=>{const go=z.k==='p'?'data-x="open" data-v="ypay"':z.k==='pl'?'data-x="open" data-v="paylater"':z.k==='sub'?'data-x="open" data-v="subs"':z.k==='card'?(()=>{const d=MX.debts().find(x=>x.raw===z.raw);return d?'data-x="open" data-v="debt1" data-w="'+esc(d.key)+'"':'data-x="open" data-v="debts"'})():(()=>{const i=(state.bills||[]).findIndex(b=>b.name===z.raw);return i>=0?'data-x="open" data-v="ybill" data-w="'+i+'"':'data-x="open" data-v="yourplan"'})();
  const late=z.k!=='p'&&!z.paid&&z.t<realDay(),status=z.paid?'Paid':late?'Not marked paid':z.t===realDay()?'Due today':'Upcoming',acct=z.k==='card'?'From checking':z.k==='p'?'To checking':'From checking';
  return '<button type="button" class="c2it c4it" '+go+'><span class="c2ic k-'+z.k+'">'+ic(CAL2.ICO[z.k]||'doc')+'</span><span class="c2t"><b>'+esc(z.n)+'</b><small>'+CAL2.KIND[z.k]+' · '+acct+' · <em class="'+(late?'late':z.paid?'paid':'')+'">'+status+'</em></small></span><span class="c2a'+(z.k==='p'?' up':'')+'">'+(z.k==='p'?'+':'−')+money(z.a)+'</span><span class="chev">›</span></button>'};
CAL4.nextDue=(ev,from)=>{let best=null;Object.keys(ev).sort().forEach(k=>{if(k<=from||best)return;const L=ev[k].filter(z=>z.k!=='p'&&CAL4.vis(z));if(L.length)best={k,z:L[0],n:L.length}});
  if(!best){const T=pd(from),L=(rows&&rows.items||[]).filter(x=>x.t>T&&x.a>0.004).sort((a,b)=>a.t-b.t);if(L.length)best={k:fd(L[0].t),z:{n:shortName(L[0].name),a:L[0].a},n:1}}return best};
{const _ev=CAL2.events;CAL2.events=function(){const o=_ev.apply(this,arguments);try{Object.values(o).forEach(L=>L.forEach(z=>{z.n=LG.dedup?LG.dedup(z.n):z.n}))}catch(e){}return o}}
PAGES.calendar=()=>{const T=realDay();if(!CALS||CALS.y==null){const now=new Date(T);CALS={y:now.getUTCFullYear(),m:now.getUTCMonth(),sel:fd(T)}}
  const ev=CAL2.events(CALS.y,CALS.m),B=CAL2.bal(),cush=+state.cushion||0,first=new Date(Date.UTC(CALS.y,CALS.m,1)).getUTCDay(),days=eom(CALS.y,CALS.m+1),tk=fd(T),sel=CAL4.sel();
  Object.keys(ev).forEach(k=>ev[k].forEach(z=>{z.t=pd(k)}));
  let inn=0,outt=0,low=null,mx=1;const net={},dIn={},dOut={};
  for(let d=1;d<=days;d++){const k=CALS.y+'-'+String(CALS.m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),e=(ev[k]||[]).filter(CAL4.vis);let i=0,o=0;e.forEach(z=>{if(z.k==='p')i+=z.a;else o+=z.a});dIn[k]=i;dOut[k]=o;net[k]=i-o;mx=Math.max(mx,i,o);inn+=i;outt+=o;const b=B[k];if(k>=tk&&b!=null&&(!low||b<low.v))low={k,v:b}}
  let g=['S','M','T','W','T','F','S'].map(d=>'<div class="dw">'+d+'</div>').join('');for(let i=0;i<first;i++)g+='<span class="c3o" aria-hidden="true"></span>';
  for(let d=1;d<=days;d++){const k=CALS.y+'-'+String(CALS.m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),e=(ev[k]||[]).filter(CAL4.vis),b=B[k],fut=k>=tk,i=dIn[k],o=dOut[k],due=e.some(z=>z.k!=='p');
    const big=Math.max(i,o),cls=i>0.5&&o>0.5?' both':i>0.5?' in':o>0.5?' out':'',tint=big>0.5?' style="--a:'+Math.min(1,0.3+0.7*big/mx).toFixed(2)+'"':'';
    const lab=(i>0.5?'<span class="c3v up">+'+CAL2.short(i).replace('−','')+'</span>':'')+(o>0.5?'<span class="c3v">−'+CAL2.short(o).replace('−','')+'</span>':'');
    g+='<button data-x="calsel" data-v="'+k+'" class="c3d c4d'+cls+(k===tk?' today':'')+(k===CALS.sel?' sel':'')+(k<tk?' past':'')+'"'+tint+' aria-label="'+esc(fdate(pd(k)))+(e.length?', '+e.length+' item'+(e.length>1?'s':''):'')+(b!=null&&fut?', balance about '+money0(b):'')+'"><span class="c3n">'+d+(due?'<i class="c4due"></i>':'')+'</span>'+lab+'</button>'}
  const ml=new Date(Date.UTC(CALS.y,CALS.m,1)).toLocaleDateString('en-US',{timeZone:'UTC',month:'long',year:'numeric'});
  let h='<div class="c2nav"><button class="sbtn alt" data-x="calnav" data-v="-1" aria-label="Previous month">‹</button><b>'+ml+(sel?' <em class="c4filt">Filtered</em>':'')+'</b><button class="sbtn alt" data-x="calnav" data-v="1" aria-label="Next month">›</button></div>'+
   '<div class="c2sum"><div><span>Coming in</span><b class="up">+'+money0(inn)+'</b></div><div><span>Going out</span><b>'+(outt>0.5?'−':'')+money0(outt)+'</b></div><div><span>Lowest balance</span><b class="'+(low&&low.v<0?'neg':low&&low.v<cush?'warn':'')+'">'+(low?money0(low.v):'–')+'</b>'+(low?'<small>'+sdate(pd(low.k))+'</small>':'')+'</div></div>'+
   '<div class="cal c3 flow c4cal">'+g+'</div>'+
   '<div class="c3leg"><span class="c3sw in"></span>Money in<span class="c3sw out"></span>Money out<span class="c4dueleg"><i class="c4due"></i>Something due</span></div>'+
   '<div class="c3chips chips4"><button type="button" class="chip4'+(!sel?' on':'')+'" data-c4g="all">All</button>'+Object.keys(CAL4.KN).map(k=>'<button type="button" class="chip4'+(!sel||sel.indexOf(k)>=0?' on':'')+'" data-c4g="'+k+'" aria-pressed="'+(!!sel&&sel.indexOf(k)>=0)+'"><i class="k-'+k+'"></i>'+CAL4.KN[k]+'</button>').join('')+'</div>';
  // the day sheet: Pay and Spend
  const s=CALS.sel,st=pd(s),se=(ev[s]||[]).filter(CAL4.vis),sb=B[s],sfut=s>=tk,isT=s===tk,pay=se.filter(z=>z.k==='p'),due=se.filter(z=>z.k!=='p'),dueTot=r2(due.reduce((a,z)=>a+z.a,0));
  const ex=(()=>{const r=(rows||[]).find(r=>r.d0===st);if(!r)return [];return Object.keys(r.ex||{}).filter(k=>r.ex[k]>0.004).map(k=>({raw:k,n:LG.short(shortName(k)),a:r2(r.ex[k])}))})(),gl=(()=>{const r=(rows||[]).find(r=>r.d0===st);return r&&r.goals>0.004?r2(r.goals):0})();
  const tab=CAL4.st.tab&&CAL4.st.tab.d===s?CAL4.st.tab.t:(due.length||ex.length?'pay':'spend');
  const thisYear=new Date(st).getUTCFullYear()===new Date(T).getUTCFullYear(),title=isT?'Today':wdate(st)+(thisYear?'':', '+new Date(st).getUTCFullYear());
  h+='<div class="xcard c3day c4day"><div class="c2dh"><h3>'+title+'</h3>'+(sb!=null&&sfut?'<span class="c2eb'+(sb<0?' neg':sb<cush?' warn':'')+'">'+(sb<0?'Could be ':'About ')+money0(sb)+' at day’s end</span>':'')+'</div>'+
    (pay.length?'<div class="c4in">'+pay.map(CAL4.item).join('')+'</div>':'')+
    '<div class="c4tabs" role="tablist"><button type="button" role="tab" aria-selected="'+(tab==='pay')+'" data-c4tab="pay" data-d="'+s+'">Pay'+(due.length?' <i>'+due.length+'</i>':'')+'</button><button type="button" role="tab" aria-selected="'+(tab==='spend')+'" data-c4tab="spend" data-d="'+s+'">Spend</button></div>';
  if(tab==='pay'){h+='<div class="c4pane">';
    if(due.length)h+='<div class="c4tot"><span>Due this day</span><b>−'+money(dueTot)+'</b></div>'+due.map(CAL4.item).join('');
    else{const nx=CAL4.nextDue(ev,s);h+='<div class="c4calm"><b>Nothing due '+(isT?'today':'this day')+'.</b>'+(nx?'<small>Next up: '+esc(nx.z.n)+', '+money(nx.z.a)+' on '+sdate(pd(nx.k))+(nx.n>1?' and '+(nx.n-1)+' more':'')+'</small>':'<small>Nothing else is scheduled yet.</small>')+'</div>'}
    if(sfut&&(ex.length||gl>0))h+='<div class="c3sec"><b>'+(pay.length?'On payday, from the plan':'From the plan')+'</b>'+(gl>0?'<div class="c3bud"><span>Set aside for goals</span><b>−'+money(gl)+'</b></div>':'')+ex.map(x=>'<button type="button" class="c2it" data-x="open" data-v="debts"><span class="c2ic k-x">'+ic('down')+'</span><span class="c2t"><b>'+esc(x.n)+'</b><small>'+(x.raw==='Savings'?'To savings':'Extra to debt, what’s left after must-pays and budgets')+'</small></span><span class="c2a">−'+money(x.a)+'</span><span class="chev">›</span></button>').join('')+'</div>';
    h+='</div>'}
  else{const R=P4.rollTotal(st),A=isT?MX.left():null,capped=A&&A.capped;
    h+='<div class="c4pane"><div class="c4tot"><span>'+(isT?'Safe to spend today':'Spending room this day')+'</span><b class="'+((capped?A.today:R.left)<0?'neg':'')+'">'+money(capped?A.today:R.left)+'</b></div>'+
      (capped?'<p class="xhint c4why">'+esc(A.why)+' Your budgets add up to '+money(R.left)+' for today.</p>':'')+
      '<div class="c3budl">'+R.cats.map(x=>'<div class="c3bud"><span>'+B2.ICON(x.id)+esc(x.name)+'</span><b class="'+(x.left<0?'neg':'')+'">'+money(x.left)+'</b><small>'+(x.left<0?'over'+(x.back<x.daysLeft?' · back on track in '+x.back+' day'+(x.back===1?'':'s'):' for the rest of the month'):'about '+money(x.pace)+' a day for the rest of the month')+'</small></div>').join('')+'</div>'+
      '<small class="xhint">Each day adds that day’s share of the category budget ('+money0(R.lim)+' a month over '+R.dim+' days). Spend less and it builds up; spend more and the next days catch up.</small></div>'}
  if(sb!=null&&sfut&&sb<cush)h+='<p class="c2warn">'+(sb<0?'Checking could go below zero here if things go as planned.':'This dips under your '+money0(cush)+' cushion.')+'</p>';
  h+='</div>';
  // what if: a purchase on this day
  if(sfut){const W=CAL4.st.wi&&CAL4.st.wi.d===s?CAL4.st.wi:null;
    h+='<div class="xcard c3wi c4wi"><b>What if I spend more on '+sdate(st)+'?</b><div class="c3wir"><label class="pre4"><span>$</span><input id="c3-wi" type="text" inputmode="decimal" placeholder="0" value="'+(W?W.a:'')+'" aria-label="Amount"></label><button type="button" class="sbtn" data-f3="calwi" data-v="'+s+'">See</button></div>'+
      (W&&W.res?CAL4.wiHTML(W.res,s):'')+'</div>'}
  h+=CAL4.byPaycheck();
  return h+'<p class="xhint">Balances are estimates from your plan. <button type="button" class="lnk" data-x="open" data-v="debthow">How this is figured</button></p>'};
// ---------- what if: where the money would come from, and what it changes ----------
P4.whatIfSpend=(dk,amt,o)=>{o=o||{};const T=realToday(),t=pd(dk),cush=+state.cushion||0;
  const run=sched=>{const s2=clone(state);s2.sched=(s2.sched||[]).concat(sched);const E2=eff(s2,s2.whatif);E2.cash=projStart();const R=simulate(E2);return{R,D:daily(R)}};
  const parts=o.split>1?(()=>{const P=payDates(state,t-MS).filter(x=>x>=t).slice(0,o.split);if(P.length<o.split)return null;const each=r2(amt/o.split);return P.map((x,i)=>({d:fd(x),name:'What if',group:'One-time',amt:i===P.length-1?r2(amt-each*(P.length-1)):each}))})():null;
  const sched=parts||[{d:dk,name:'What if',group:'One-time',amt}];
  const A=run(sched),base={R:rows,D:DAILY},np=rows.find(r=>r.inc&&r.d0>t),end=np?np.d0:t+14*MS;
  const win=D=>D.filter(x=>x.t>=t&&x.t<end),lowA=win(A.D).reduce((m,x)=>!m||x.v<m.v?x:m,null),lowB=win(base.D).reduce((m,x)=>!m||x.v<m.v?x:m,null);
  // where it comes from: less extra to debt and goals in the periods from that day on, then the cushion, then short
  const sum=(R,k)=>R.filter(r=>r.d1>t).slice(0,8).reduce((a,r)=>a+(k==='ex'?Object.values(r.ex||{}).reduce((x,y)=>x+y,0):(r.goals||0)),0);
  const dEx=r2(Math.max(0,sum(base.R,'ex')-sum(A.R,'ex'))),dGl=r2(Math.max(0,sum(base.R,'goals')-sum(A.R,'goals')));let rest=r2(amt-dEx-dGl);
  const fromCush=lowA?r2(Math.max(0,Math.min(rest,Math.min(cush,lowB?lowB.v:cush)-Math.max(0,lowA.v)))):0;rest=r2(rest-fromCush);const short=lowA&&lowA.v<0?r2(-lowA.v):0;
  const freeB=F3.free(),freeA=(()=>{const L=MX.debts();if(!L.length)return null;for(const r of A.R.filter(r=>r.d1>T)){if(L.every(d=>F3.left(d,r)<=0.5))return r.d1}return null})();
  const intr=(R)=>r2(R.filter(r=>r.d1>T).slice(0,80).reduce((a,r)=>a+(r.intrSum||0),0)),dIntr=r2(intr(A.R)-intr(base.R));
  const risk=[];win(A.D).forEach(x=>{if(x.v<0)x.ev.forEach(e=>{if(e[1]<0&&e[0]!=='Extra to debt'&&e[0]!=='Set aside for goals')risk.push({n:e[0],t:x.t})})});
  // when it fits without touching the cushion
  let fitsOn=null;if(lowA&&lowA.v<cush){const P=payDates(state,t).slice(0,4);for(const p of P){const r=run([{d:fd(p),name:'What if',group:'One-time',amt}]);const lw=r.D.filter(x=>x.t>=p&&x.t<p+14*MS).reduce((m,x)=>!m||x.v<m.v?x:m,null);if(lw&&lw.v>=cush){fitsOn=p;break}}}
  const head=short>0?'Checking would run short by '+money0(short)+' before payday':lowA&&lowA.v<cush?'Dips under your cushion by '+money0(cush-lowA.v)+' on '+sdate(lowA.t):dEx>0.5||dGl>0.5?'Fits, but uses money planned for '+(dEx>0.5&&dGl>0.5?'goals and extra debt payments':dGl>0.5?'your goals':'extra debt payments'):'Fits';
  const other=r2(Math.max(0,amt-dEx-dGl-fromCush-short));return{amt,dk,head,other,ok:!(short>0||(lowA&&lowA.v<cush)),dEx,dGl,fromCush,short,lowA,lowB,np,freeB:freeB&&!freeB.none?freeB.t:null,freeA,dIntr,risk:risk.slice(0,3),fitsOn,split:parts?parts.length:1,D:A.D.filter(x=>x.t>=T&&x.t<end),D0:base.D.filter(x=>x.t>=T&&x.t<end)}};
CAL4.wiHTML=(r,s)=>{const src=[];if(r.dEx>0.5)src.push(money0(r.dEx)+' less to extra debt payments');if(r.dGl>0.5)src.push(money0(r.dGl)+' less set aside for goals');if(r.fromCush>0.5)src.push(money0(r.fromCush)+' from your cushion');if(r.other>0.5)src.push(money0(r.other)+' from money held for the next bills');if(r.short>0.5)src.push(money0(r.short)+' short');
  const eff=[];if(r.freeB&&r.freeA&&r.freeA!==r.freeB)eff.push('Debt-free date moves from '+F3.mon(r.freeB)+' to '+F3.mon(r.freeA));else if(r.freeB&&!r.freeA)eff.push('Debt-free date moves beyond 3 years');if(Math.abs(r.dIntr)>0.5)eff.push('About '+money0(Math.abs(r.dIntr))+' '+(r.dIntr>0?'more':'less')+' interest over the plan');r.risk.forEach(x=>eff.push(esc(LG.short(shortName(x.n)))+' on '+sdate(x.t)+' would not be covered'));
  const pts=r.D.map(x=>({t:x.t,v:r2(x.v)})),pts0=r.D0.map(x=>({t:x.t,v:r2(x.v)}));
  return '<div class="c4wires '+(r.short>0?'neg':!r.ok?'warn':'ok')+'"><b>'+esc(r.head)+'</b>'+(r.split>1?'<small>Split over '+r.split+' paychecks</small>':'')+
    (src.length?'<div class="c4src"><span>Where the '+money0(r.amt)+' comes from</span>'+src.map(x=>'<em>'+x+'</em>').join('')+'</div>':'')+
    (eff.length?'<div class="c4src"><span>What it changes</span>'+eff.map(x=>'<em>'+x+'</em>').join('')+'</div>':'<div class="c4src"><span>What it changes</span><em>Nothing else in the plan moves.</em></div>')+
    (r.fitsOn?'<p class="xhint">On or after '+sdate(r.fitsOn)+' (payday) it fits without touching the cushion.</p>':'')+
    (pts.length>1?'<div class="c4mini">'+C4.time({h:120,zero:true,cush:+state.cushion||0,today:realToday(),series:[{pts:pts0,color:'var(--muted)',dash:true,width:1.6},{pts,color:r.short>0?'var(--mxc-bad)':'var(--mxc-line)',area:true}],fmt:money0})+'<small class="xhint">Checking until payday: dashed is the plan now, solid is with this spend.</small></div>':'')+
    '<label class="c4split"><input type="checkbox" data-c4split="'+s+'"'+(r.split>1?' checked':'')+'> Split it over 3 paychecks</label></div>'};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-f3=calwi]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const a=parseAmt((document.getElementById('c3-wi')||{}).value);if(!(a>0)){toast('Type an amount first');return}
  const sp=CAL4.st.wi&&CAL4.st.wi.split;CAL4.st.wi={d:b.dataset.v,a:String(a),split:sp,res:P4.whatIfSpend(b.dataset.v,a,{split:sp?3:1})};xRender()},true);
document.addEventListener('change',e=>{const c=e.target.closest&&e.target.closest('[data-c4split]');if(!c)return;const W=CAL4.st.wi;if(!W)return;W.split=c.checked;W.res=P4.whatIfSpend(W.d,+W.a,{split:c.checked?3:1});xRender()});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-c4tab]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();CAL4.st.tab={d:b.dataset.d,t:b.dataset.c4tab};xRender()},true);
// chips: tap focuses, more taps add, All resets (with Undo)
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-c4g]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const g=b.dataset.c4g,prev=CAL4.st.groups.slice();
  if(g==='all'){if(prev.length){CAL4.st.groups=[];D4.undo('Showing everything',()=>{CAL4.st.groups=prev;xRender()})}}
  else if(!CAL4.st.groups.length)CAL4.st.groups=[g];else{const i=CAL4.st.groups.indexOf(g);if(i<0)CAL4.st.groups.push(g);else CAL4.st.groups.splice(i,1)}
  xRender()},true);
// the filter resets when you leave the calendar
{const _xo=xOpen;xOpen=function(p,a){if(p==='calendar'){CALS=null;CAL4.st.groups=[];CAL4.st.tab=null}return _xo.apply(this,arguments)}}
// ---------- by paycheck: one row per pay period, every row adds up ----------
CAL4.byPaycheck=()=>{const T=realToday(),R=(rows||[]).filter(r=>r.d1>T&&(r.inc>0||r.d0<=T)).slice(0,6);if(!R.length)return '';
  const SEG=[['must','Must-pays','s-must'],['budgets','Budgets','s-bud'],['goals','Goals','s-goal'],['extra','Extra to debt','s-extra'],['end','Left','s-end']];
  return '<div class="xcard c4pp"><div class="f3ch"><h3>By paycheck</h3><span class="xhint">'+R.length+' period'+(R.length===1?'':'s')+'</span></div><div class="f3leg">'+SEG.map(s=>'<span><i class="'+s[2]+'"></i>'+s[1]+'</span>').join('')+'</div>'+
    R.map(r=>{const p=MX.period(r),k=fd(r.d0),open=!!CAL4.st.open[k],cur=r.d0<=T&&r.d1>T,daysLeft=Math.max(0,Math.round((r.d1-T)/MS)),v={must:p.must,budgets:p.budgets,goals:p.goals,extra:p.extra,end:Math.max(0,p.end)},tt=Math.max(.01,Object.values(v).reduce((a,b)=>a+b,0));
      const lowD=DAILY.filter(x=>x.t>=Math.max(r.d0,T)&&x.t<r.d1).reduce((m,x)=>!m||x.v<m.v?x:m,null);
      return '<div class="f3ppr c4ppr'+(open?' open':'')+(cur?' cur':'')+'"><button type="button" class="f3pph" data-c4pp="'+k+'" aria-expanded="'+open+'"><span class="f3ppd"><b>'+sdate(r.d0)+' to '+sdate(r.d1-MS)+'</b><small>'+(p.inc>0?'+'+money0(p.inc)+' in':'until payday')+(cur?' · '+daysLeft+' day'+(daysLeft===1?'':'s')+' left':'')+'</small></span><span class="b3stack">'+SEG.map(s=>v[s[0]]>0.004?'<i class="'+s[2]+'" style="width:'+(v[s[0]]/tt*100).toFixed(1)+'%"></i>':'').join('')+'</span><span class="f3ppe'+(p.end<0?' neg':'')+'">'+money0(p.end)+'<small>'+(p.end<0?'short':'left')+'</small></span></button>'+
        (open?'<div class="c4ppx"><div class="c4ppl"><span>Start</span><b>'+money(p.start)+'</b></div>'+(p.inc>0?'<div class="c4ppl"><span>Paycheck</span><b>+'+money(p.inc)+'</b></div>':'')+'<div class="c4ppl"><span>Must-pays<small>'+[p.bills>0.004?'bills '+money0(p.bills):'',p.mins>0.004?'minimums '+money0(p.mins):'',p.plans>0.004?'pay later and one-time '+money0(p.plans):''].filter(Boolean).join(' · ')+'</small></span><b>−'+money(p.must)+'</b></div><div class="c4ppl"><span>Budgets<small>'+p.days+' days'+(p.floor>0.004?' · includes '+money0(p.floor)+' because recent spending runs above your budgets':'')+'</small></span><b>−'+money(p.budgets)+'</b></div>'+(p.goals>0.004?'<div class="c4ppl"><span>Set aside for goals</span><b>−'+money(p.goals)+'</b></div>':'')+'<div class="c4ppl"><span>Extra to debt<small>'+Object.keys(p.ex).filter(x=>p.ex[x]>0.004).map(x=>esc(LG.short(shortName(x)))+' '+money0(p.ex[x])).join(' · ')+'</small></span><b>−'+money(p.extra)+'</b></div><div class="c4ppl end"><span>Left in checking'+(lowD?'<small>lowest '+money0(lowD.v)+' on '+sdate(lowD.t)+'</small>':'')+'</span><b class="'+(p.end<0?'neg':'')+'">'+money(p.end)+'</b></div>'+
          (rows.items.filter(x=>x.t>=r.d0&&x.t<r.d1&&x.a>0.004).length?'<details class="c4ppi"><summary>Items in this period</summary>'+rows.items.filter(x=>x.t>=r.d0&&x.t<r.d1&&x.a>0.004).sort((a,b)=>a.t-b.t).map(x=>'<div class="c4ppl"><span>'+sdate(x.t)+' · '+esc(LG.short(shortName(x.name)))+'</span><b>−'+money(x.a)+'</b></div>').join('')+'</details>':'')+'</div>':'')+'</div>'}).join('')+
    '<p class="xhint">Start + paycheck − must-pays − budgets − goals − extra = left, to the cent. <button type="button" class="lnk" data-x="open" data-v="debthow">How this is figured</button></p></div>'};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-c4pp]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();CAL4.st.open[b.dataset.c4pp]=!CAL4.st.open[b.dataset.c4pp];xRender()},true);
try{if(window.__S)window.__S.CAL4=CAL4}catch(e){}
}
