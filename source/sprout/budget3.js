// ===================== Budgets 3: fixed amounts you choose, in a clear order of money =====================
// 1. Must-pays come first: bills, card and loan minimums, pay-later payments.
// 2. Then your budgets: a fixed amount for each category. Changing one never changes another.
// 3. What's left after that isn't spending money. It goes to extra debt payments (highest rate first, unless you
//    pick another order), or stays in checking if you turn that off. Nothing makes you spend the whole paycheck.
const B3={};
{
const r2=MX.r2;
PAGES.budcat0=PAGES.budcat;
// your category amounts are the source of truth. The Basics and Fun totals behind Safe to spend are their sums.
// If a total is changed somewhere else (setup, Your plan, Ask), the categories are resized to match once.
B2.pull=()=>{if(LG.demo()||!state.setup)return;const b=B2.g(),e=Math.round(+state.everyday||0),f=Math.round(+state.discReduced||0);
  if(!b.init){b.init=1;if(e>0)B2.scale('basic',e);if(f>0)B2.scale('fun',f)}
  else if(b.lp){if(e!==b.lp.e&&e>0)B2.scale('basic',e);if(f!==b.lp.f&&f>0)B2.scale('fun',f)}
  const se=Math.round(B2.sum('basic')),sf=Math.round(B2.sum('fun'));state.everyday=se;state.discReduced=sf;if(!hasBonus(state))state.discTarget=sf;b.lp={e:se,f:sf}};
B2.push=()=>{if(LG.demo())return;const e=Math.round(B2.sum('basic')),f=Math.round(B2.sum('fun'));if(e!==Math.round(+state.everyday||0)||f!==Math.round(+state.discReduced||0)){const b=B2.g();state.everyday=e;state.discReduced=f;if(!hasBonus(state))state.discTarget=f;b.lp={e,f};plan();queueSave()}};
B3.col=p=>p>1.0001?'over':p>=0.85?'near':'ok';
B3.bar=(p,cls)=>'<div class="b3bar '+(cls||B3.col(p))+'"><i style="width:'+Math.max(p>0?3:0,Math.min(100,Math.round(p*100)))+'%"></i></div>';
B3.ring=(p,txt,sub)=>{const c=B3.col(p),pc=Math.max(0,Math.min(1,p));return '<div class="b3ring '+c+'"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="t" cx="32" cy="32" r="27"/><circle class="f" cx="32" cy="32" r="27" pathLength="100" style="stroke-dasharray:'+(pc*100).toFixed(1)+' 100"/></svg><span><b>'+txt+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span></div>'};
// ---------- where a paycheck goes, straight from the plan ----------
B3.next=()=>{const T=realToday();return (rows||[]).find(r=>r.lab!=='Today'&&r.d0>=T&&r.inc>0)||(rows||[])[0]};
B3.SEG=[['must','Must-pays','Bills, card and loan minimums, pay-later'],['budgets','Your budgets','Spending money for these days'],['wait','Can-wait payments','Paid when there’s room'],['extra','Extra to debt','What’s left, sent to debt'],['end','Stays in checking','Your cushion and anything held for later']];
B3.flowHTML=(r,opts)=>{opts=opts||{};const p=MX.period(r);if(!p)return '';const ex=Object.keys(p.ex).filter(k=>p.ex[k]>0.004).sort((a,b)=>p.ex[b]-p.ex[a]);
  const v={must:p.must,budgets:p.budgets,wait:p.wait,extra:p.extra,end:Math.max(0,p.end)},tot=Math.max(0.01,Object.values(v).reduce((a,b)=>a+b,0)),pref=MX.pref();
  const lines=[];
  if(Math.abs(p.start)>0.004)lines.push(['start',p.start>0?'Already in checking':'Starting short',(p.start>0?'+':'−')+money(Math.abs(p.start))]);
  if(p.inc>0.004)lines.push(['inc',p.lab==='Bonus'?'Bonus':'Paycheck','+'+money(p.inc)]);
  lines.push(['must','Must-pays','−'+money(p.must),[p.bills>0.004?'Bills '+money0(p.bills):'',p.mins>0.004?'Minimums '+money0(p.mins):'',p.plans>0.004?'Pay later and one-time '+money0(p.plans):''].filter(Boolean).join(' · ')]);
  lines.push(['budgets','Your budgets','−'+money(p.budgets),p.days+' days of '+money0((r.persDay+r.evDay)*365/12)+' a month']);
  if(p.wait>0.004||p.paused>0.004)lines.push(['wait','Can-wait payments',p.wait>0.004?'−'+money(p.wait):money(0),p.paused>0.004?money0(p.paused)+' still waits for more room':'']);
  lines.push(['extra',ex.length&&!ex.every(k=>(state.debts||[]).some(d=>d.name===k))?'Extra to goals and debt':'Extra to debt',p.extra>0.004?'−'+money(p.extra):money(0),ex.length?ex.slice(0,3).map(k=>esc(shortName(LG.short(k)))+' '+money0(p.ex[k])).join(' · '):(pref.extra===false?'Turned off. What’s left stays in checking.':'Nothing left over this time')]);
  lines.push(['end','Left in checking',(p.end<0?'−':'')+money(Math.abs(p.end)),p.end<0?'Short. See what can move.':'Your '+money0(+E.cushion||0)+' cushion and money held for the next bills']);
  return '<div class="xcard b3flow"><div class="b3fh"><h3>'+(opts.title||('Your '+sdate(p.d0)+' '+(p.lab==='Bonus'?'bonus':'paycheck')))+'</h3><span>'+sdate(p.d0)+' to '+sdate(p.d1-MS)+'</span></div>'+
   '<div class="b3stack">'+B3.SEG.map(s=>v[s[0]]>0.004?'<i class="s-'+s[0]+'" style="width:'+(v[s[0]]/tot*100).toFixed(2)+'%" title="'+s[1]+'"></i>':'').join('')+'</div>'+
   lines.map(l=>'<div class="b3fl l-'+l[0]+'"><i></i><span>'+l[1]+(l[3]?'<small>'+l[3]+'</small>':'')+'</span><b'+(l[0]==='end'&&p.end<0?' class="neg"':'')+'>'+l[2]+'</b></div>').join('')+
   (opts.noLinks?'':'<div class="b3fa"><button type="button" class="lnk" data-x="open" data-v="debts">Debt order: '+MX.ORD[MX.pref().order].toLowerCase()+' ›</button></div>')+'</div>'};
// ---------- Budgets ----------
B3.cats=()=>{const ms=monthSpend();return BCATS.map((c,i)=>{const l=budLim(c),sp=r2(ms[c[0]]||0);return{c,id:c[0],name:c[1],lim:l,sp,p:l>0?sp/l:(sp>0?2:0),left:r2(l-sp),kind:B2.kindOf(c[0]),i}})};
B3.dayLeft=()=>{const d=new Date(realDay());return eom(d.getUTCFullYear(),d.getUTCMonth()+1)-d.getUTCDate()+1};
PAGES.budgets=()=>{B2.sync();B2.pull();const M=MX.month(),L=B3.cats(),dl=B3.dayLeft(),demo=LG.demo(),pref=MX.pref(),nx=B3.next(),mo=new Date(realDay()).toLocaleDateString('en-US',{timeZone:'UTC',month:'long'});
  const p=M.bud>0?M.spent/M.bud:0;
  let h='<div class="b3hero">'+B3.ring(p,Math.round(p*100)+'%','used')+'<div><span class="k">'+mo+' budget</span><b>'+money0(M.spent)+' <small>of '+money0(M.bud)+'</small></b><span class="d">'+(M.left>=0?money0(M.left)+' left · '+dl+' day'+(dl===1?'':'s')+' to go':money0(-M.left)+' over · '+dl+' day'+(dl===1?'':'s')+' to go')+'</span></div></div>'+B2.gapHTML();
  h+='<div class="b3list">'+L.map(x=>{const per=x.left>0?x.left/dl:0;return '<div class="b3row'+(x.p>1.0001?' over':'')+'"><button type="button" class="b3open" data-b2cat="'+esc(x.id)+'"><span class="b3ic">'+B2.ICON(x.id)+'</span><span class="b3t"><b>'+esc(x.name)+'</b><small>'+(x.left>=0?money0(x.left)+' left'+(per>=1?' · '+money0(per)+' a day':''):money0(-x.left)+' over')+'</small></span></button>'+
    '<div class="b3amt"><button type="button" class="b3pm" data-x="bud" data-v="'+esc(x.id)+'" data-w="-10" aria-label="Lower '+esc(x.name)+' by $10">−</button><button type="button" class="b3val" data-x="open" data-v="budedit" data-w="'+esc(x.id)+'" aria-label="Type the amount for '+esc(x.name)+'">'+money0(x.lim)+'</button><button type="button" class="b3pm" data-x="bud" data-v="'+esc(x.id)+'" data-w="10" aria-label="Raise '+esc(x.name)+' by $10">+</button></div><button type="button" class="b3foot" data-b2cat="'+esc(x.id)+'" aria-label="See '+esc(x.name)+'">'+B3.bar(x.p)+'<span><b>'+money0(x.sp)+'</b> spent of '+money0(x.lim)+'</span><span class="chev">›</span></button></div>'}).join('')+'</div>'+
   '<button type="button" class="btn alt b2add" data-b2new>+ Add a category</button>';
  h+='<p class="xhint b3why">Each budget is a fixed amount. Changing one never changes the others. Basics '+money0(B2.sum('basic'))+' and Fun '+money0(B2.sum('fun'))+' a month set your daily Safe to spend.'+(pref.extra!==false?' Spending less than a budget isn’t lost: it stays in checking and your plan sends it to debt on payday.':'')+'</p>';
  if(!demo&&state.setup&&nx&&+state.pay>0)h+=B3.flowHTML(nx);
  return h+'<p class="xhint">Bills, minimums and pay-later payments aren’t in these budgets, because your plan sets money aside for them first. <button type="button" class="lnk" data-x="open" data-v="rules">Stores Sprout has learned</button></p>'};
TITLES.budedit='Edit budget';TITLES.budsub='Purchases';
// ---------- one category: its parts or stores, then the purchases ----------
B3.tx=id=>B2.monthTx().filter(t=>t.cat===id).sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:b.amt-a.amt);
B3.merch=t=>{let n='';try{n=RC.nice(t.note)}catch(e){}if(!n||n==='Payment')n=tidy(t.note).replace(/^\d+\s*/,'');return n||'Purchase'};
B3.nm=n=>{const t=tidy(n||'');return t||'Purchase'};
B3.txRow=(t,id)=>'<div class="b3tx"><div><b>'+esc(B3.nm(t.note))+'</b><small>'+sdate(pd(t.d))+(t.s.card?' · Card':'')+(t.s.pending?' · Pending':'')+'</small></div><label class="b3mv"><span class="b3chip">'+esc(((BCATS.find(z=>z[0]===id)||[])[1]||'Move'))+' ▾</span><span class="sr">Move to another category</span><select data-b2move="'+t.i+'" aria-label="Move to another category">'+BCATS.map(z=>'<option value="'+esc(z[0])+'"'+(z[0]===id?' selected':'')+'>'+esc(z[1])+'</option>').join('')+'</select></label><span class="b3ta'+(t.amt<0?' pos':'')+'">'+(t.amt<0?'+':'')+money(Math.abs(t.amt))+'</span></div>';
PAGES.budcat=id=>{B2.sync();const c=BCATS.find(z=>z[0]===id);if(!c)return '<p class="xhint">That category is gone.</p>';
  const b=B2.g(),T=B3.tx(id),parts=b.subs[id]||[],sp=r2(T.reduce((a,t)=>a+t.amt,0)),lim=budLim(c),dl=B3.dayLeft(),left=r2(lim-sp),p=lim>0?sp/lim:(sp>0?2:0);
  let h='<div class="b3hero">'+B3.ring(p,money0(Math.max(0,sp)),'of '+money0(lim))+'<div><span class="k">'+B2.ICON(id)+esc(c[1])+'</span><b>'+(left>=0?money0(left)+' <small>left</small>':money0(-left)+' <small>over</small>')+'</b><span class="d">'+T.length+' purchase'+(T.length===1?'':'s')+' this month'+(left>0&&dl>0?' · about '+money0(left/dl)+' a day':'')+'</span></div></div>';
  const groups=[];
  if(parts.length){const g={};T.forEach(t=>{const s=B2.subOf(t,id)||'_';(g[s]=g[s]||[]).push(t)});
    parts.forEach(x=>{const L=g[x.id]||[],v=r2(L.reduce((a,t)=>a+t.amt,0));groups.push({k:'s:'+x.id,name:x.name,v,n:L.length,lim:+x.limit||0})});
    if(g._)groups.push({k:'s:_',name:'Not in a part',v:r2(g._.reduce((a,t)=>a+t.amt,0)),n:g._.length,lim:0})}
  else{const g={};T.forEach(t=>{const m=B3.merch(t);(g[m]=g[m]||[]).push(t)});Object.keys(g).forEach(m=>groups.push({k:'m:'+m,name:m,v:r2(g[m].reduce((a,t)=>a+t.amt,0)),n:g[m].length,lim:0}));groups.sort((a,b)=>b.v-a.v)}
  if(T.length){const mx=Math.max(1,...groups.map(g=>Math.abs(g.v)));
    h+='<div class="xcard"><h3>'+(parts.length?'Parts':'Where it went')+'</h3>'+groups.map(g=>'<button type="button" class="b3grp" data-x="open" data-v="budsub" data-w="'+esc(id+'|'+g.k)+'"><span class="b3t"><b>'+esc(g.name)+'</b><small>'+g.n+' purchase'+(g.n===1?'':'s')+(g.lim?' · '+money0(g.v)+' of '+money0(g.lim):'')+'</small>'+(g.lim?B3.bar(g.v/g.lim):'<div class="b3bar plain"><i style="width:'+Math.max(3,Math.round(Math.abs(g.v)/mx*100))+'%"></i></div>')+'</span><span class="b3ga">'+money(g.v)+'</span><span class="chev">›</span></button>').join('')+
      '<button type="button" class="lnk b3all" data-x="open" data-v="budsub" data-w="'+esc(id+'|all')+'">See all '+T.length+' purchases ›</button></div>'}
  else h+='<div class="xcard"><p class="xhint" style="margin:0">Nothing in '+esc(c[1])+' yet this month.</p></div>';
  return h+'<button type="button" class="btn alt" data-x="open" data-v="budedit" data-w="'+esc(id)+'">Edit amount, name or parts</button>'};
PAGES.budsub=arg=>{const [id,k]=String(arg||'').split('|');const c=BCATS.find(z=>z[0]===id);if(!c)return '<p class="xhint">That category is gone.</p>';
  let T=B3.tx(id),title=c[1];
  if(k&&k.indexOf('s:')===0){const sid=k.slice(2);T=T.filter(t=>(B2.subOf(t,id)||'_')===sid);const pt=(B2.g().subs[id]||[]).find(x=>x.id===sid);title=sid==='_'?c[1]+': not in a part':(pt?pt.name:c[1])}
  else if(k&&k.indexOf('m:')===0){const m=k.slice(2);T=T.filter(t=>B3.merch(t)===m);title=m}
  const v=r2(T.reduce((a,t)=>a+t.amt,0));
  return '<div class="b3subh"><span class="b3ic">'+B2.ICON(id)+'</span><div><b>'+esc(title)+'</b><small>'+esc(c[1])+' · this month</small></div><span class="b3ga">'+money(v)+'</span></div>'+
   '<div class="xcard b3txl">'+(T.length?T.map(t=>B3.txRow(t,id)).join(''):'<p class="xhint" style="margin:0">Nothing here this month.</p>')+'</div>'+
   '<p class="xhint">Moving a purchase changes only which budget it counts toward. Your totals, checking and net worth stay the same, and Sprout files that store there from now on.</p>'};
// typing an amount (and the old editing form, with parts)
PAGES.budedit=id=>{const h=PAGES.budcat0?PAGES.budcat0(id):'';const i=h.indexOf('<div class="xcard xf b2form">');if(i<0)return h;const j=h.indexOf('<div class="xcard"><h3>In this category');return h.slice(i,j>0?j:h.length)};
// ---------- the plus and minus buttons move only that category, in $10 steps, down to $0 ----------
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=bud]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  const c=BCATS.find(z=>z[0]===b.dataset.v);if(!c)return;const x=X();x.bud[c[0]]=Math.max(0,Math.round((budLim(c)+ +b.dataset.w)/5)*5);B2.push();sv();if(typeof xRender==='function')xRender();if(VIEW==='tab')pgRender()},true);
try{if(window.__S)window.__S.B3=B3}catch(e){}
}
