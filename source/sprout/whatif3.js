// ===================== What if: switches for a tight stretch, showing only the math =====================
// Each switch reruns your plan as if that change happened and shows what it does to your lowest balance.
// They describe options, they never tell you what to do. Nothing changes at your bank.
const WI={};
{
const r2=MX.r2;
WI.np=st=>{const T=realToday();return payDates(st,T-MS).find(t=>t>T)||T+14*MS};
// the switches that fit your own numbers
WI.list=st=>{st=st||state;const L=[],T=realToday(),np=WI.np(st),np2=payDates(st,np).find(t=>t>np)||np+14*MS,funMo=+st.discReduced||0,basMo=+st.everyday||0,hz=fd(horizonT(st));
  if(funMo>0)L.push(['w3fun','What if you spent nothing on fun until '+sdate(np2)+'?','Your Fun budgets ('+money0(funMo)+' a month) set to $0 for about four weeks. Basics stay.']);
  if(basMo>0)L.push(['w3bas','What if basics cost 20% less until '+sdate(np2)+'?','Groceries, gas and everyday needs at '+money0(basMo*0.8)+' a month instead of '+money0(basMo)+' for about four weeks.']);
  (st.debts||[]).filter(d=>+d.min>0&&+d.day>0).forEach(d=>{const due=monthly(+d.day,T,np-MS);if(!due.length)return;
    L.push(['w3due:'+d.name,'What if '+LG.short(shortName(d.name))+' were due after payday?','Its '+money0(+d.min)+' minimum on '+sdate(due[0])+' lands on '+sdate(np+MS)+' instead. Many lenders let you pick a due date; ask yours before counting on it.'])});
  const mp=MX.pref();if(mp.extra!==false)L.push(['w3noex','What if nothing extra went to debt for a month?','Only minimums for about four weeks. What’s left stays in checking.']);
  const sv=LG.nw().S;if(sv>1)L.push(['w3sav','What if you moved '+money0(Math.min(sv,Math.max(50,WI.short(st))))+' from savings to checking?','Uses money you already have saved. It counts as moving your own money, not income.']);
  if(+st.cushion>0)L.push(['w3cush','What if your cushion were $0 for now?','Your '+money0(+st.cushion)+' safety money is counted as spendable until '+sdate(np2)+'.']);
  // one-time and can-wait items you could move
  const seen={};(st.sched||[]).forEach(x=>{if(x.reserve||seen[x.name]||x.d<st.asOf||x.d>=hz)return;if(x.group==='One-time'||x.group==='Cash App'||x.group==='Klarna'){seen[x.name]=1;
    L.push(['push:'+x.name,'What if “'+LG.short(shortName(x.name))+'” moved to '+sdate(pd(hz))+'?',money0(+x.amt)+' moves later. '+(x.group==='One-time'?'Only if the person or company agrees.':'Pay-later and cash-advance companies may charge late fees.')])}});
  (st.bills||[]).filter(b=>b.type==='monthly').forEach(b=>{const due=monthly(+b.day,T,np-MS);if(!due.length||!/gym|stream|netflix|hulu|spotify|music|prime|disney|max|youtube|subscription|membership|club/i.test(b.name))return;
    L.push(['w3skip:'+b.name,'What if you paused '+LG.short(b.name)+' this month?','Skips the '+money0(+b.amt)+' on '+sdate(due[0])+'. Some services let you pause instead of cancel.'])});
  return L.slice(0,12)};
// how short the plan runs right now, for sizing a savings move
WI.short=st=>{try{const m=metrics(rows,E);return m.low<0?Math.ceil(-m.low/10)*10+(+st.cushion||0):0}catch(e){return 0}};
// the plan as if: applied on top of Sprout's own what-if handling
{const _eff=eff;eff=function(st,w){const s=_eff.apply(this,arguments);w=w||{};try{const T=realToday(),np=WI.np(st),np2=payDates(st,np).find(t=>t>np)||np+14*MS;
    // spending less for a while: each day until then gets back what wasn't spent
    const back=(perDay,label)=>{s.sched=s.sched||[];for(let t=T;t<np2;t+=MS)s.sched.push({d:fd(t),name:label,group:'One-time',amt:-r2(perDay)})};
    if(w.w3fun)back((+st.discReduced||0)*12/365,'What if: no fun spending');
    if(w.w3bas)back((+st.everyday||0)*0.2*12/365,'What if: basics 20% less');
    Object.keys(w).forEach(k=>{if(!w[k])return;
      if(k.indexOf('w3due:')===0){const d=(s.debts||[]).find(x=>x.name===k.slice(6));if(d){const due=monthly(+d.day,T,np-MS);due.forEach(t=>{s.skipMins=(s.skipMins||[]).concat([d.name+'|'+fd(t)]);s.sched.push({d:fd(np+MS),name:d.name+' (moved)',group:'One-time',amt:+d.min})})}}
      if(k.indexOf('w3skip:')===0){const b=(s.bills||[]).find(x=>x.name===k.slice(7));if(b){const due=monthly(+b.day,T,np-MS);if(due.length){s.paid=Object.assign({},s.paid||{},{[fd(due[0])+'|'+b.name]:true})}}}
      if(k.indexOf('push:')===0){const nm=k.slice(5),hz=fd(horizonT(s));(s.sched||[]).forEach(x=>{if(x.name===nm&&!x.reserve&&x.d<hz&&x.d>=s.asOf)x.d=hz})}});
    if(w.w3noex){s.lg=Object.assign({},s.lg||{});s.lg.b3=Object.assign({},(s.lg&&s.lg.b3)||{},{extra:false})}
    if(w.w3sav){const sv=LG.nw().S,a=Math.min(sv,Math.max(50,WI.short(st)));s.cash=r2((+s.cash||0)+a)}
    if(w.w3cush)s.cushion=0}catch(e){}return s}}
TITLES.whatif='What if';
PAGES.whatif=()=>{const w=state.whatif||{},L=WI.list(state),base=metrics(simulate(eff(state,{})),state),now=metrics(rows,E),on=Object.keys(w).filter(k=>w[k]);
  const hz=horizonT(state),until=hasBonus(state)?'before your bonus on '+sdate(hz):'over the next six weeks';
  let h='<div class="f3hero"><span class="k">Lowest balance '+(on.length?'with your what-ifs':'on your plan')+'</span><b class="'+(now.low<0?'neg':'')+'">'+money0(now.low)+'</b><span class="d">Checking at its lowest point '+until+(on.length?'. Without them: '+money0(base.low):'')+'.</span></div>';
  h+='<p class="xhint">Flip a switch to see what it would do to your plan. These show the math only. They aren’t recommendations, and nothing changes at your bank.</p>';
  h+='<div class="xcard wi3">'+(L.length?L.map(t=>{const only=metrics(simulate(eff(state,{[t[0]]:true})),state),dl=r2(only.low-base.low);
    return '<label class="wi3r"><span class="wi3t"><b>'+esc(t[1])+'</b><small>'+esc(t[2])+'</small><em class="'+(dl>0.5?'up':'')+'">'+(dl>0.5?'Lowest point: '+money0(base.low)+' → '+money0(only.low):'Little change to your lowest point')+'</em></span><input class="sw" type="checkbox" data-w="'+esc(t[0])+'"'+(w[t[0]]?' checked':'')+' aria-label="'+esc(t[1])+'"></label>'}).join(''):'<p class="xhint" style="margin:0">Nothing to try right now. Add bills, debts and your paycheck in Your plan and switches show up here.</p>')+'</div>'+
   (on.length?'<button type="button" class="btn alt" data-wi3clear>Turn all off</button>':'')+
   '<p class="xhint">Not financial advice. Check with a lender before changing a due date, and with a pay-later company before moving a payment.</p>';
  return h};
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.w==null||!document.getElementById('sh-x')||document.getElementById('sh-x').hidden)return;if(!t.closest('.wi3'))return;state.whatif=Object.assign({},state.whatif||{},{[t.dataset.w]:t.checked});if(!t.checked)delete state.whatif[t.dataset.w];plan();queueSave();setTimeout(()=>{try{xRender()}catch(_){}},0)});
document.addEventListener('click',e=>{if(!(e.target.closest&&e.target.closest('[data-wi3clear]')))return;state.whatif={};plan();queueSave();xRender()});
// the "short before payday" note on Home opens this
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.ovalert[data-goto="#guide"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();xOpen('whatif')},true);
try{if(window.__S)window.__S.WI=WI}catch(e){}
}
