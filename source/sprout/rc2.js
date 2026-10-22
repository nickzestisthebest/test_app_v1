// ===================== Recurring, round two: the charges the first pass missed =====================
// Small Apple charges that skip a month, the same exact price month after month, interest your cards charge,
// payments to cards Sprout can't see, and the places you spend at all the time.
{
const DY=MS,r2=MX.r2;
const mid=a=>{if(!a.length)return 0;const s=a.slice().sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2};
const APPLEP=new Set([0.99,1.99,2.99,3.99,4.99,5.99,6.99,7.99,9.99,10.99,11.99,12.99,14.99,16.99,19.99,22.99,29.99,32.95,37.95]);
const isApple=m=>/^\s*apple(\.com)?(\/bill)?\s*$|apple\.com\/bill|\bitunes\b|apple services/i.test(m)&&!/apple ?card|apple ?cash|apple ?pay later/i.test(m);
const rowsOut=()=>(HIST||[]).filter(h=>h&&!h.p&&isDate(h.d)&&+h.a<0).map(h=>({t:pd(h.d),d:h.d,a:-(+h.a),m:String(h.m||''),x:h.x||'',c:h.c,ac:h.ac||'',k:h.k}));
const near=(a,b)=>Math.abs(a-b)<=0.011;
RC.extra=()=>{const T=realDay(),R=rowsOut(),out=[],have=new Set();try{(RC.all0?RC.all0():[]).forEach(s=>have.add(s.key+'|'+Math.round(s.typ)))}catch(e){}
  // 1. Apple charges at Apple's usual prices (iCloud, Apple Music, apps), even when a month is skipped
  const ap={};R.filter(r=>isApple(r.m)&&APPLEP.has(r2(r.a))).forEach(r=>{(ap[r2(r.a)]=ap[r2(r.a)]||[]).push(r)});
  Object.keys(ap).forEach(p=>{const L=ap[p].sort((a,b)=>a.t-b.t),last=L[L.length-1];if(L.length<2||T-last.t>75*DY)return;const gaps=L.slice(1).map((r,i)=>(r.t-L[i].t)/DY);if(!gaps.every(g=>g>=25&&g<=70))return;
    const day=new Date(last.t).getUTCDate();let nx=last.t;while(nx<=T)nx+=30*DY;
    out.push({id:'apple-'+Math.round(+p*100),key:'m:apple',kind:'sub',name:'Apple '+money(+p)+' plan',raw:last.m,cat:'Apple (iCloud, Music or an app)',price:+p,typ:+p,cad:'monthly',per:30.44,amt:+p,n:L.length,last:last.t,next:nx,day,hike:0,vary:false,conf:0.62,known:true,rows:L.map(r=>r.k).filter(Boolean),first:L[0].t,why:'Charged '+money(+p)+' by Apple '+L.length+' times. That’s one of Apple’s subscription prices.'})});
  // 2. the same exact price from the same place, about a month apart (one skipped month is fine)
  const by={};R.forEach(r=>{if(/^(cp|cpin|own|wallet|invest|save|borrow|p2p|atm|loan)$/.test(r.x)||RC.NOTSUB.test(r.m)||RC.BNPL.test(r.m)||isApple(r.m)||r.a>100)return;const k=RC.key({m:r.m});if(!k)return;(by[k+'|'+r2(r.a)]=by[k+'|'+r2(r.a)]||[]).push(r)});
  Object.keys(by).forEach(k=>{const L=by[k].sort((a,b)=>a.t-b.t),last=L[L.length-1],key=k.split('|')[0];if(L.length<2||T-last.t>45*DY)return;if(have.has(key+'|'+Math.round(last.a)))return;
    const gaps=L.slice(1).map((r,i)=>(r.t-L[i].t)/DY);if(!gaps.every(g=>(g>=25&&g<=36)||(g>=55&&g<=70)))return;if(L.length===2&&gaps[0]>36)return;
    let nx=last.t;while(nx<=T)nx+=30*DY;
    out.push({id:'m2-'+key.slice(2).replace(/[^a-z0-9]+/g,'-')+'-'+Math.round(last.a*100),key,kind:'sub',name:RC.nice(last.m),raw:last.m,cat:'Other',price:r2(last.a),typ:r2(last.a),cad:'monthly',per:30.44,amt:r2(last.a),n:L.length,last:last.t,next:nx,day:new Date(last.t).getUTCDate(),hike:0,vary:false,conf:L.length>=3?0.7:0.56,known:false,rows:L.map(r=>r.k).filter(Boolean),first:L[0].t,why:'The same '+money(last.a)+' charge '+L.length+' times, about a month apart.'})});
  return out};
RC.interest=()=>{const T=realDay(),G={};rowsOut().forEach(r=>{if(!/interest charge|purchase interest|interest charged|finance charge/i.test(r.m)||T-r.t>200*DY)return;(G[r.ac||'card']=G[r.ac||'card']||[]).push(r)});
  return Object.keys(G).map(ac=>{const L=G[ac].sort((a,b)=>a.t-b.t),recent=L.filter(r=>T-r.t<=95*DY);if(!recent.length)return null;const per=r2(recent.reduce((s,r)=>s+r.a,0)/Math.max(1,Math.min(3,new Set(recent.map(r=>r.d.slice(0,7))).size)));
    return{id:'int-'+ac.replace(/[^a-z0-9]+/gi,'-').toLowerCase(),name:'Interest on '+LG.short(ac.replace(/\s*[.•x*#]{2,}\s*\d*\s*$/,'').replace(/\s*\*\*\d+/,'')),acct:ac,mo:per,last:L[L.length-1],n:L.length}}).filter(Boolean).sort((a,b)=>b.mo-a.mo)};
// payments from checking to a card Sprout can't see
RC.cardPays=()=>{const T=realDay(),G={};(HIST||[]).forEach(h=>{if(!h||h.p||!isDate(h.d)||+h.a>=0)return;const m=String(h.m||'');if(T-pd(h.d)>100*DY)return;
    const cp=h.x==='cp'||/apple ?card|chase credit|credit crd|crd pmt|card ?pmt|card payment|epay|amex epayment|discover e-?payment|citi card|synchrony|capital one (mobile|online) pmt/i.test(m);if(!cp)return;
    const nm=/apple ?card/i.test(m)?'Apple Card':/chase/i.test(m)?'Chase card':/amex|american express/i.test(m)?'American Express':/discover/i.test(m)?'Discover card':/citi/i.test(m)?'Citi card':/capital one/i.test(m)?'Capital One card':/synchrony/i.test(m)?'Synchrony card':RC.nice(m);
    (G[nm]=G[nm]||[]).push({t:pd(h.d),a:-(+h.a)})});
  return Object.keys(G).map(nm=>{const L=G[nm],mos=new Set(L.map(r=>fd(r.t).slice(0,7))).size,tot=L.reduce((s,r)=>s+r.a,0),linked=(state.debts||[]).some(d=>RC.sim(d.name,nm)||(/apple/i.test(nm)&&/apple/i.test(d.name))||(/chase/i.test(nm)&&/chase/i.test(d.name)));
    return{id:'cp-'+nm.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name:nm,mo:r2(tot/Math.max(1,Math.min(3,mos))),n:L.length,known:linked}}).filter(x=>x.n>=2).sort((a,b)=>b.mo-a.mo)};
// places you spend at all the time: worth knowing, not a subscription
RC.habits=()=>{const T=realDay(),G={};(state.spend||[]).forEach(s=>{if(!s||!isDate(s.d)||!(s.cat==='Everyday'||s.cat==='Personal')||LG.isXfer(s)||s.xf==='p2p'||s.xf==='wallet'||s.xf==='invest')return;const t=pd(s.d);if(T-t>60*DY)return;const m=String(s.note||'');if(RC.BNPL.test(m)||/transfer|cash app|apple cash|venmo|zelle|paypal|kalshi|polymarket|robinhood|coinbase/i.test(m))return;
    let k=RC.nice(m);if(!k||k==='Payment')k=tidy(m).replace(/^\d+\s*/,'')||'Purchase';(G[k]=G[k]||[]).push({t,a:+s.amt})});
  return Object.keys(G).map(k=>{const L=G[k],tot=L.reduce((s,r)=>s+r.a,0);return{name:k,n:L.length,mo:r2(tot/2),avg:r2(tot/L.length)}}).filter(x=>x.n>=5).sort((a,b)=>b.mo-a.mo).slice(0,6)};
// fold the new finds into the list every screen reads
if(!RC.all0){RC.all0=RC.all;let C2=null;RC.all=function(){const base=RC.all0.apply(this,arguments);const k=(HIST?HIST.length:0)+'|'+base.length+'|'+realDay();if(C2&&C2.k===k)return C2.v;let ex=[];try{ex=RC.extra()}catch(e){}
  const v=base.concat(ex.filter(e=>!base.some(b=>b.id===e.id||(b.key===e.key&&Math.abs(b.typ-e.typ)<=Math.max(1,e.typ*0.05)))));C2={k,v};return v};
  const _rs=RC.reset;RC.reset=function(){C2=null;return _rs.apply(this,arguments)}}
// ---------- the Subscriptions screen: what else repeats, and adding one yourself ----------
{const _sp=PAGES.subs;PAGES.subs=function(){let h=_sp.apply(this,arguments);try{const I=RC.interest(),C=RC.cardPays(),H=RC.habits();let x='';
    x+='<button type="button" class="btn alt" data-x="open" data-v="subadd">+ Add a subscription or bill</button>';
    if(I.length){const tot=r2(I.reduce((s,i)=>s+i.mo,0));x+='<div class="xcard"><div class="svh"><h3>Interest your cards charge</h3><b>'+money(tot)+'/mo</b></div><small class="xhint">This is added to your card balances each month, so it’s already in what you owe.</small>'+I.map(i=>'<div class="rcx"><span>'+esc(i.name)+'<small>About '+money(i.mo)+' a month · last '+sdate(i.last.t)+'</small></span></div>').join('')+'</div>'}
    if(C.length)x+='<div class="xcard"><div class="svh"><h3>Payments to cards</h3></div><small class="xhint">Money from checking to cards that aren’t linked. '+(C.some(c=>!c.known)?'Add a card so Sprout counts what you owe on it.':'')+'</small>'+C.map(c=>'<div class="rcx"><span>'+esc(c.name)+'<small>About '+money0(c.mo)+' a month · '+c.n+' payments</small></span>'+(c.known?'<em class="rcok">In your plan</em>':'<button type="button" class="sbtn alt" data-x="open" data-v="ydebt" data-w="new">Add card</button>')+'</div>').join('')+'</div>';
    if(H.length)x+='<div class="xcard"><div class="svh"><h3>Places you go often</h3></div><small class="xhint">Not subscriptions, just regular spending in the last two months.</small>'+H.map(s=>'<div class="rcx"><span>'+esc(s.name)+'<small>'+s.n+' times · about '+money(s.avg)+' each</small></span><b>'+money0(s.mo)+'/mo</b></div>').join('')+'</div>';
    const i=h.lastIndexOf('<p class="xhint">');h=i>0?h.slice(0,i)+x+h.slice(i):h+x}catch(e){}return h}}
TITLES.subadd='Add a subscription';
PAGES.subadd=()=>'<div class="xf b2form"><label class="f">Name<input id="sa-n" type="text" maxlength="40" placeholder="Like Netflix or Gym"></label><label class="f">Amount<div class="pre"><span>$</span><input id="sa-a" type="text" inputmode="decimal" placeholder="0.00"></div></label>'+
  '<label class="f">Day of the month it renews<input id="sa-d" type="number" inputmode="numeric" min="1" max="31" placeholder="15"></label><p class="xhint" style="margin:0">Sprout sets money aside for it before each renewal, and lists it with your subscriptions.</p><button type="button" class="btn" data-saadd>Add</button></div>';
document.addEventListener('click',e=>{if(!(e.target.closest&&e.target.closest('[data-saadd]')))return;const n=String(($('#sa-n').value||'')).trim().slice(0,40),a=parseAmt($('#sa-a').value),d=Math.min(31,Math.max(1,Math.round(+$('#sa-d').value||1)));
  if(!n){toast('Give it a name');return}if(!(a>0)){toast('Add the amount');return}state.bills=(state.bills||[]).concat([{name:n,amt:r2(a),type:'monthly',day:d,sub:1,src:'manual'}]);RC.reset();plan();queueSave();xBack();toast('Added '+n)});
// subscriptions you added yourself show up with the ones Sprout found
{const _ds=detectSubs;detectSubs=function(){const L=_ds.apply(this,arguments);try{const T=realDay();(state.bills||[]).filter(b=>b.sub&&b.type==='monthly').forEach(b=>{if(L.some(s=>RC.sim(s.name,b.name)))return;const d=new Date(T);let nx=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),Math.min(+b.day||1,eom(d.getUTCFullYear(),d.getUTCMonth()+1)));if(nx<T){nx=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,Math.min(+b.day||1,eom(d.getUTCFullYear(),d.getUTCMonth()+2)))}
    L.push({id:'bill-'+String(b.name).toLowerCase().replace(/[^a-z0-9]+/g,'-'),name:b.name,cat:'Added by you',price:+b.amt,cad:'monthly',amt:+b.amt,n:0,next:nx,hike:0,known:true,maybe:false,once:false,raw:b.name,last:0})})}catch(e){}return L}}
try{if(window.__S)window.__S.RC=RC}catch(e){}
}
