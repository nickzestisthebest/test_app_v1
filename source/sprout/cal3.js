// ===================== Money calendar 3: each day's plan, and the month at a glance =====================
// Every day shows what comes in and goes out. Tap a day for its plan: what to pay, what goes to debt,
// how much you can spend in each budget, and roughly where checking ends up.
const CAL3={view:'flow',off:{},wi:null};
{
const r2=MX.r2,DY=MS;
CAL3.KC={p:'Payday',b:'Bills',card:'Card and loan',pl:'Pay later',sub:'Subscriptions'};
CAL3.dayBudget=()=>{const L=B3.cats();return L.map(x=>({id:x.id,name:x.name,per:r2(x.lim*12/365)})).filter(x=>x.per>0.004)};
// the plan row (pay period) a day belongs to
CAL3.row=t=>(rows||[]).find(r=>t>=r.d0&&t<r.d1);
CAL3.isDebt=k=>(state.debts||[]).some(d=>d.name===k);
CAL3.extraOn=t=>{const r=(rows||[]).find(r=>r.d0===t);if(!r)return [];return Object.keys(r.ex||{}).filter(k=>r.ex[k]>0.004).map(k=>({raw:k,n:LG.short(shortName(k)),a:r2(r.ex[k])}))};
CAL3.wait=g=>g==='Klarna'||g==='Cash App'||g==='Skip min';
PAGES.calendar=()=>{const T=realDay();if(!CALS||CALS.y==null){const now=new Date(T);CALS={y:now.getUTCFullYear(),m:now.getUTCMonth(),sel:fd(T)}}
  const ev=CAL2.events(CALS.y,CALS.m),B=CAL2.bal(),cush=+state.cushion||0,first=new Date(Date.UTC(CALS.y,CALS.m,1)).getUTCDay(),days=eom(CALS.y,CALS.m+1),tk=fd(T),flow=CAL3.view==='flow';
  const vis=z=>!CAL3.off[z.k];
  // the month: in, out, lowest; and how strong each day's color is
  let inn=0,outt=0,low=null,mx=1;const net={};
  for(let d=1;d<=days;d++){const k=CALS.y+'-'+String(CALS.m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),e=(ev[k]||[]).filter(vis),n=e.reduce((a,z)=>a+(z.k==='p'?z.a:-z.a),0);net[k]=n;mx=Math.max(mx,Math.abs(n));
    e.forEach(z=>{if(z.k==='p')inn+=z.a;else outt+=z.a});const b=B[k];if(k>=tk&&b!=null&&(!low||b<low.v))low={k,v:b}}
  const dailyAll=CAL3.dayBudget().reduce((a,x)=>a+x.per,0),futDays=(()=>{let n=0;for(let d=1;d<=days;d++){const k=CALS.y+'-'+String(CALS.m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');if(k>=tk)n++}return n})();
  let g=['S','M','T','W','T','F','S'].map(d=>'<div class="dw">'+d+'</div>').join('');for(let i=0;i<first;i++)g+='<span class="c3o" aria-hidden="true"></span>';
  const weeks=[];let wk={in:0,out:0,from:1};
  for(let d=1;d<=days;d++){const k=CALS.y+'-'+String(CALS.m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),e=(ev[k]||[]).filter(vis),b=B[k],fut=k>=tk,n=net[k];
    e.forEach(z=>{if(z.k==='p')wk.in+=z.a;else wk.out+=z.a});
    let tint='';if(flow){if(Math.abs(n)>0.5){const s=Math.min(1,0.25+0.75*Math.abs(n)/mx);tint=' style="--a:'+s.toFixed(2)+'"';}}
    const cls=flow?(n>0.5?' in':n<-0.5?' out':''):(b==null||!fut?'':b<0?' neg':b<cush?' warn':' ok');
    const lab=flow?(Math.abs(n)>0.5?(n>0?'+':'−')+CAL2.short(Math.abs(n)).replace('−',''):''):(b!=null&&fut?CAL2.short(b):'');
    g+='<button data-x="calsel" data-v="'+k+'" class="c3d'+cls+(k===tk?' today':'')+(k===CALS.sel?' sel':'')+(k<tk?' past':'')+'"'+tint+' aria-label="'+esc(fdate(pd(k)))+(e.length?', '+e.length+' item'+(e.length>1?'s':''):'')+(b!=null&&fut?', balance about '+money0(b):'')+'"><span class="c3n">'+d+'</span>'+
      (e.length?'<span class="c3i">'+[...new Set(e.map(z=>z.k))].slice(0,3).map(kk=>'<i class="k-'+kk+'"></i>').join('')+'</span>':'')+(lab?'<span class="c3v">'+lab+'</span>':'')+'</button>';
    const wd=(first+d-1)%7;if(wd===6||d===days){weeks.push(Object.assign({},wk,{to:d}));wk={in:0,out:0,from:d+1}}}
  const ml=new Date(Date.UTC(CALS.y,CALS.m,1)).toLocaleDateString('en-US',{timeZone:'UTC',month:'long',year:'numeric'}),mon=new Date(Date.UTC(CALS.y,CALS.m,1)).toLocaleDateString('en-US',{timeZone:'UTC',month:'short'});
  let h='<div class="c2nav"><button class="sbtn alt" data-x="calnav" data-v="-1" aria-label="Previous month">‹</button><b>'+ml+'</b><button class="sbtn alt" data-x="calnav" data-v="1" aria-label="Next month">›</button></div>'+
   '<div class="c2sum"><div><span>Coming in</span><b class="up">+'+money0(inn)+'</b></div><div><span>Bills and payments</span><b>'+(outt>0.5?'−':'')+money0(outt)+'</b></div><div><span>Lowest balance</span><b class="'+(low&&low.v<0?'neg':low&&low.v<cush?'warn':'')+'">'+(low?money0(low.v):'–')+'</b>'+(low?'<small>'+sdate(pd(low.k))+'</small>':'')+'</div></div>'+
   (futDays&&dailyAll>0?'<p class="xhint c3sp">Plus your everyday budgets, about '+money0(dailyAll)+' a day ('+money0(dailyAll*futDays)+' for the rest of '+mon+').</p>':'')+
   F3.seg('calview',[['flow','In and out'],['bal','Balance']],CAL3.view)+
   '<div class="cal c3'+(flow?' flow':' bal')+'">'+g+'</div>'+
   '<div class="c3leg">'+(flow?'<span class="c3sw in"></span>Money in<span class="c3sw out"></span>Money out<span class="c3hint">Stronger color, bigger amount</span>':'<span class="c3sw ok"></span>Above cushion<span class="c3sw warn"></span>Under '+money0(cush)+'<span class="c3sw neg"></span>Below $0')+'</div>'+
   '<div class="c3chips">'+Object.keys(CAL3.KC).map(k=>'<button type="button" class="c3chip'+(CAL3.off[k]?' off':'')+'" data-f3="calk" data-v="'+k+'" aria-pressed="'+!CAL3.off[k]+'"><i class="k-'+k+'"></i>'+CAL3.KC[k]+'</button>').join('')+'</div>';
  // the selected day's plan
  const s=CALS.sel,st=pd(s),se=(ev[s]||[]).filter(vis),sb=B[s],sfut=s>=tk,r=CAL3.row(st),ex=CAL3.extraOn(st),isT=s===tk;
  const pay=se.filter(z=>z.k==='p'),must=se.filter(z=>z.k!=='p'&&z.k!=='sub'&&!CAL3.wait(z.g)),wt=se.filter(z=>z.k!=='p'&&CAL3.wait(z.g)),subs=se.filter(z=>z.k==='sub');
  const item=z=>{const go=z.k==='p'?'data-x="open" data-v="ypay"':z.k==='pl'?'data-x="open" data-v="paylater"':z.k==='sub'?'data-x="open" data-v="subs"':z.k==='card'?'data-x="open" data-v="debts"':(()=>{const i=(state.bills||[]).findIndex(b=>b.name===z.raw);return i>=0?'data-x="open" data-v="ybill" data-w="'+i+'"':'data-x="open" data-v="yourplan"'})();
    return '<button type="button" class="c2it" '+go+'><span class="c2ic k-'+z.k+'">'+ic(CAL2.ICO[z.k]||'doc')+'</span><span class="c2t"><b>'+esc(z.n)+'</b><small>'+CAL2.KIND[z.k]+(z.paid?' · Paid':'')+'</small></span><span class="c2a'+(z.k==='p'?' up':'')+'">'+(z.k==='p'?'+':'−')+money(z.a)+'</span><span class="chev">›</span></button>'};
  let A=null;if(isT){try{A=MX.left()}catch(e){}}
  const per=CAL3.dayBudget();
  h+='<div class="xcard c3day"><div class="c2dh"><h3>'+(isT?'Today':wdate(st))+'</h3>'+(sb!=null&&sfut?'<span class="c2eb'+(sb<0?' neg':sb<cush?' warn':'')+'">'+(sb<0?'Could be ':'About ')+money0(sb)+' at day’s end</span>':'')+'</div>'+
   (pay.length?'<div class="c3sec"><b>Money in</b>'+pay.map(item).join('')+'</div>':'')+
   (must.length?'<div class="c3sec"><b>Pay</b>'+must.map(item).join('')+'</div>':'')+
   (ex.length&&sfut?'<div class="c3sec"><b>'+(ex.every(x=>CAL3.isDebt(x.raw))?'Extra to debt':'Extra to goals and debt')+'</b>'+ex.map(x=>'<button type="button" class="c2it" data-x="open" data-v="debts"><span class="c2ic k-x">'+ic('down')+'</span><span class="c2t"><b>'+esc(x.n)+'</b><small>'+(CAL3.isDebt(x.raw)?'What’s left after must-pays and budgets':'Toward your goal or savings')+'</small></span><span class="c2a">−'+money(x.a)+'</span><span class="chev">›</span></button>').join('')+'</div>':'')+
   (wt.length?'<div class="c3sec"><b>Can wait if money is tight</b>'+wt.map(item).join('')+'</div>':'')+
   (subs.length?'<div class="c3sec"><b>Renews</b>'+subs.map(item).join('')+'<small class="xhint">Subscriptions come out of your spending money.</small></div>':'')+
   (sfut&&per.length?'<div class="c3sec"><b>'+(isT?'You can spend today':'Spend up to')+'</b>'+(isT&&A?'<div class="c3bud tot"><span>Safe to spend today</span><b>'+money(Math.max(0,A.today))+'</b></div>':'')+
     (isT&&A&&A.capped?'<small class="xhint">Checking can’t cover your full budget today, so Safe to spend is lower than your categories add up to.</small>':'<div class="c3budl">'+per.map(x=>'<div class="c3bud"><span>'+B2.ICON(x.id)+esc(x.name)+'</span><b>'+money(x.per)+'</b></div>').join('')+'</div><small class="xhint">'+(isT?'Your budget for one day in each category. ':'Your budget for one day in each category. ')+'Spend less and the rest rolls forward.'+(!isT&&sb!=null&&sb<0?' Checking may not cover all of it that day.':'')+'</small>')+'</div>':'')+
   (!se.length&&!(ex.length&&sfut)&&!(sfut&&per.length)?'<small class="xhint">Nothing due this day.</small>':'')+
   (sb!=null&&sfut&&sb<cush?'<p class="c2warn">'+(sb<0?'Checking could go below zero here if things go as planned.':'This dips under your '+money0(cush)+' cushion.')+'</p>':'')+'</div>';
  // what if: a purchase on this day
  if(sfut)h+='<div class="xcard c3wi"><b>What if I spend more on '+sdate(st)+'?</b><div class="c3wir"><div class="pre"><span>$</span><input id="c3-wi" type="text" inputmode="decimal" placeholder="0" value="'+(CAL3.wi&&CAL3.wi.d===s?CAL3.wi.a:'')+'"></div><button type="button" class="sbtn" data-f3="calwi" data-v="'+s+'">See</button></div>'+
    (CAL3.wi&&CAL3.wi.d===s&&CAL3.wi.res?'<p class="c3wires '+(CAL3.wi.res.low<0?'neg':CAL3.wi.res.low<cush?'warn':'ok')+'">'+CAL3.wi.res.txt+'</p>':'')+'</div>';
  // weeks
  const curM=CALS.y===new Date(T).getUTCFullYear()&&CALS.m===new Date(T).getUTCMonth(),today=new Date(T).getUTCDate();
  h+='<div class="xcard c3wk"><b>By week</b>'+weeks.filter(w=>!curM||w.to>=today).map(w=>'<div class="c3wkr"><span>'+mon+' '+w.from+'–'+w.to+'</span><b class="up">'+(w.in>0.5?'+'+money0(w.in):'–')+'</b><b>'+(w.out>0.5?'−'+money0(w.out):'–')+'</b></div>').join('')+'</div>';
  return h+'<small class="xhint">Balances are estimates from your plan: what you have now, minus what’s due and your daily spending, plus paychecks. Tap anything to change it.</small>'};
CAL3.whatIf=(d,a)=>{const s2=clone(state);s2.sched=(s2.sched||[]).concat([{d,name:'What if',group:'One-time',amt:a}]);const E2=eff(s2,s2.whatif);E2.cash=projStart();const r2_=simulate(E2),D2=daily(r2_);
  const T=realToday(),np=r2_.find(r=>r.inc&&r.d0>pd(d)),pre=D2.filter(x=>x.t>=T&&(!np||x.t<np.d0));const lp=pre.length?pre.reduce((m,x)=>x.v<m.v?x:m):null;
  const before=DAILY.filter(x=>x.t>=T&&(!np||x.t<np.d0)).reduce((m,x)=>!m||x.v<m.v?x:m,null);
  if(!lp)return{low:0,txt:'Sprout can’t see far enough ahead for this day.'};
  return{low:lp.v,txt:'Spending '+money(a)+' that day, checking’s lowest point before '+(np?'payday on '+sdate(np.d0):'your next payday')+' would be about '+money0(lp.v)+' on '+sdate(lp.t)+(before?' (instead of '+money0(before.v)+')':'')+'.'+(lp.v<0?' That’s below zero.':lp.v<(+state.cushion||0)?' That’s under your cushion.':'')}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-f3=calview],[data-f3=calk],[data-f3=calwi]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const k=b.dataset.f3;
  if(k==='calview')CAL3.view=b.dataset.v;else if(k==='calk')CAL3.off[b.dataset.v]=!CAL3.off[b.dataset.v];
  else{const a=parseAmt((document.getElementById('c3-wi')||{}).value);if(!(a>0)){toast('Type an amount first');return}CAL3.wi={d:b.dataset.v,a:String(a),res:CAL3.whatIf(b.dataset.v,a)}}
  xRender()},true);
// the calendar always opens on today
{const _xo=xOpen;xOpen=function(p,a){if(p==='calendar'){CALS=null}return _xo.apply(this,arguments)}}
try{if(window.__S)window.__S.CAL3=CAL3}catch(e){}
}
