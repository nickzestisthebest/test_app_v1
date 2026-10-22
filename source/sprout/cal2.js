// ===================== Money calendar: paydays, bills, subscriptions and pay-later, with your balance for each day =====================
// Days where checking would dip under your cushion are marked, so a tight week shows up before it happens.
const CAL2={};
{
const DY=MS,r2=x=>Math.round((+x||0)*100)/100;
const key=t=>fd(t);
// everything with a date in a month: what the plan sets aside, paydays, card due dates and subscriptions
CAL2.events=(y,m)=>{const out={},add=(t,e)=>{const d=new Date(t);if(d.getUTCFullYear()!==y||d.getUTCMonth()!==m)return;(out[key(t)]=out[key(t)]||[]).push(e)};
  (rows&&rows.items||[]).forEach(x=>{if(!(x.a>0.004))return;const pl=typeof PL!=='undefined'&&PL.isPL({name:x.name,group:x.g});
    add(x.t,{n:pl?PL.parse(x.name).prov+' · '+PL.parse(x.name).store:shortName(x.name),a:r2(x.a),k:pl?'pl':x.g==='Debt min'?'card':'b',g:x.g,raw:x.name,paid:!!(state.paid||{})[payKey({t:x.t,name:x.name})]})});
  try{payDates(state,Date.UTC(y,m,1)-DY).forEach(t=>{if(+state.pay>0)add(t,{n:'Payday',a:+state.pay,k:'p'})})}catch(e){}
  // subscriptions that aren't already a bill in your plan come out of your spending money
  try{detectSubs().forEach(s=>{if(!s.next||(typeof RC!=='undefined'&&RC.inPlan({name:s.name,raw:s.raw||s.name,typ:s.price,day:new Date(s.next).getUTCDate(),billType:''})))return;
    const per=s.cad==='yearly'?365:s.cad==='every 3 months'?91:s.cad==='weekly'?7:s.cad==='every 2 weeks'?14:0;let t=s.next;const st=Date.UTC(y,m,1),en=Date.UTC(y,m+1,1);
    if(per){while(t>=st+per*DY)t-=per*DY;while(t<st)t+=per*DY;for(;t<en;t+=per*DY)add(t,{n:s.name,a:r2(s.price),k:'sub'})}
    else{const d=new Date(s.next).getUTCDate();const t2=Date.UTC(y,m,Math.min(d,eom(y,m+1)));if(t2>=realDay()-40*DY)add(t2,{n:s.name,a:r2(s.price),k:'sub'})}})}catch(e){}
  Object.values(out).forEach(L=>L.sort((a,b)=>(a.k==='p'?-1:0)-(b.k==='p'?-1:0)||b.a-a.a));return out};
// what checking should look like at the end of each day, from the same plan as your daily number
CAL2.bal=()=>{const o={};(DAILY||[]).forEach(d=>{o[key(d.t)]=d.v});return o};
CAL2.short=v=>{const a=Math.abs(v),s=v<0?'−':'';return a>=10000?s+'$'+Math.round(a/1000)+'k':a>=1000?s+'$'+(a/1000).toFixed(1).replace(/\.0$/,'')+'k':s+'$'+Math.round(a)};
TITLES.calendar='Money calendar';
CAL2.ICO={p:'money',b:'doc',pl:'cal',card:'card',sub:'repeat'};
CAL2.KIND={p:'Paycheck',b:'Bill',pl:'Pay later',card:'Card or loan payment',sub:'Subscription'};
PAGES.calendar=()=>{const now=new Date(realDay());if(!CALS)CALS={y:now.getUTCFullYear(),m:now.getUTCMonth(),sel:fd(realDay())};
  const ev=CAL2.events(CALS.y,CALS.m),B=CAL2.bal(),cush=+state.cushion||0,first=new Date(Date.UTC(CALS.y,CALS.m,1)).getUTCDay(),days=eom(CALS.y,CALS.m+1),tk=fd(realDay());
  let g=['S','M','T','W','T','F','S'].map(d=>'<div class="dw">'+d+'</div>').join('');for(let i=0;i<first;i++)g+='<button class="o" tabindex="-1" aria-hidden="true"></button>';
  let low=null,inn=0,outt=0;
  for(let d=1;d<=days;d++){const k=CALS.y+'-'+String(CALS.m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),e=ev[k]||[],b=B[k],fut=k>=tk;
    e.forEach(z=>{if(z.k==='p')inn+=z.a;else outt+=z.a});
    const st=b==null||!fut?'':b<0?' neg':b<cush?' tight':'';if(fut&&b!=null&&(!low||b<low.v))low={k,v:b};
    g+='<button data-x="calsel" data-v="'+k+'" class="c2d'+(k===tk?' today':'')+(k===CALS.sel?' sel':'')+(k<tk?' past':'')+st+'" aria-label="'+esc(fdate(pd(k)))+(e.length?', '+e.length+' item'+(e.length>1?'s':''):'')+(b!=null&&fut?', balance about '+money0(b):'')+'"><span class="c2n">'+d+'</span>'+
      (e.length?'<span class="dots">'+e.slice(0,3).map(z=>'<i class="k-'+z.k+'"></i>').join('')+'</span>':'')+(b!=null&&fut?'<span class="c2b">'+CAL2.short(b)+'</span>':'')+'</button>'}
  const se=ev[CALS.sel]||[],sb=B[CALS.sel],sfut=CALS.sel>=tk;
  const item=z=>{const go=z.k==='p'?'data-x="open" data-v="ypay"':z.k==='pl'?'data-x="open" data-v="paylater"':z.k==='sub'?'data-x="open" data-v="subs"':z.k==='card'?'data-x="open" data-v="yourplan"':(()=>{const i=(state.bills||[]).findIndex(b=>b.name===z.raw);return i>=0?'data-x="open" data-v="ybill" data-w="'+i+'"':'data-x="open" data-v="yourplan"'})();
    return '<button type="button" class="c2it" '+go+'><span class="c2ic k-'+z.k+'">'+ic(CAL2.ICO[z.k]||'doc')+'</span><span class="c2t"><b>'+esc(z.n)+'</b><small>'+CAL2.KIND[z.k]+(z.paid?' · Paid':z.k==='sub'?' · From your spending money':z.k==='p'?'':' · Set aside before it’s due')+'</small></span><span class="c2a'+(z.k==='p'?' up':'')+'">'+(z.k==='p'?'+':'')+money(z.a)+'</span><span class="chev">›</span></button>'};
  const ml=new Date(Date.UTC(CALS.y,CALS.m,1)).toLocaleDateString('en-US',{timeZone:'UTC',month:'long',year:'numeric'});
  return '<div class="c2nav"><button class="sbtn alt" data-x="calnav" data-v="-1" aria-label="Previous month">‹</button><b>'+ml+'</b><button class="sbtn alt" data-x="calnav" data-v="1" aria-label="Next month">›</button></div>'+
   '<div class="c2sum"><div><span>Coming in</span><b class="up">+'+money0(inn)+'</b></div><div><span>Going out</span><b>−'+money0(outt)+'</b></div><div><span>Lowest balance</span><b class="'+(low&&low.v<0?'neg':low&&low.v<cush?'warn':'')+'">'+(low?money0(low.v):'—')+'</b>'+(low?'<small>'+sdate(pd(low.k))+'</small>':'')+'</div></div>'+
   '<div class="cal c2">'+g+'</div>'+
   '<div class="c2leg"><span><i class="k-p"></i>Payday</span><span><i class="k-b"></i>Bill</span><span><i class="k-pl"></i>Pay later</span><span><i class="k-card"></i>Card or loan</span><span><i class="k-sub"></i>Subscription</span></div>'+
   '<div class="xcard c2day"><div class="c2dh"><h3>'+fdate(pd(CALS.sel))+'</h3>'+(sb!=null&&sfut?'<span class="c2eb'+(sb<0?' neg':sb<cush?' warn':'')+'">'+(sb<0?'Could be ':'About ')+money0(sb)+' at day’s end</span>':'')+'</div>'+
   (sb!=null&&sfut&&sb<cush?'<p class="c2warn">'+(sb<0?'Checking could go below zero here if things go as planned.':'This dips under your '+money0(cush)+' cushion.')+' Moving a payment or spending a little less before it helps.</p>':'')+
   (se.length?se.map(item).join(''):'<small class="xhint">Nothing due this day.</small>')+'</div>'+
   '<small class="xhint">Balances are estimates from your plan: what you have now, minus what’s due and your daily spending, plus paychecks. Tap anything to change it.</small>'};
try{if(window.__S)window.__S.CAL2=CAL2}catch(e){}
}
