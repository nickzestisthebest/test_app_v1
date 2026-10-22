// ===================== Alerts 3: every Review button opens the right thing, and repeats are merged =====================
const AL3={};
{
const r2=MX.r2;
// what each alert opens: its own target when it has one, otherwise a page that shows what it's about
AL3.target=a=>{const go=a.go||[];if(go.length)return{p:go[0],w:go[1]};const id=String(a.id||''),k=a.k||'';
  if(/^nt-neg|^low|^brlow/.test(id)||k==='neg'||k==='low')return{p:'cashflow'};
  if(/^brpace/.test(id)||k==='pace'||k==='bud')return{p:'budgets'};
  if(/^brpay/.test(id)||k==='pay')return{p:'ypay'};
  if(/^brnew|^nt-newsub|^nt-hike/.test(id)||k==='new'||k==='newsub'||k==='hike')return{p:'subs'};
  if(/^brdup|^brbig|^brfee/.test(id)||k==='dup'||k==='odd'||k==='big'||k==='fee')return{p:'alview',w:id};
  if(/^streak/.test(id))return null;
  return null};
// "Possible double charge at Cash App" twice becomes one alert that says how many
AL3.merge=L=>{const out=[],seen={};L.forEach(a=>{const key=(a.k||String(a.id).replace(/[-\d].*$/,''))+'|'+String(a.t||'').toLowerCase();if(seen[key]){seen[key].n=(seen[key].n||1)+1;seen[key].ids.push(a.id);return}const c=Object.assign({},a,{ids:[a.id]});seen[key]=c;out.push(c)});return out};
// insights you dismissed or marked normal don't come back as alerts either
{const _al=alerts;alerts=function(){let A=_al.apply(this,arguments);try{A=A.filter(a=>{const bm=String(a.id||'').match(/^nt-bud-([^-]+)-/);if(bm){const c=BCATS.find(z=>z[0]===bm[1]);if(c&&budLim(c)<25)return false}if(!/^br/.test(String(a.id||'')))return true;const g=INS.g(),i={id:a.id,k:a.k,t:a.t};if(g.insfb[a.id])return false;if(g.inskey[INS.key(i)])return false;return true})}catch(e){}return A}}
// the transactions behind a spending alert
AL3.place=t=>{const m=String(t||'').match(/\b(?:at|from)\s+(.+?)\s*$/i);return m?m[1]:''};
AL3.txFor=a=>{const T=realDay(),mk=fd(T).slice(0,7),words=AL3.place(a.t).toLowerCase().split(/\s+/).filter(w=>w.length>2).slice(0,2),fee=/fee/i.test(a.t)||/^brfee/.test(a.id),rx=words.map(w=>new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i'));
  const am=(String(a.s||'').match(/\$([\d,]+\.\d{2})/)||[])[1],amt=am?parseFloat(am.replace(/,/g,'')):null,exact=amt&&/^brdup|^brbig/.test(String(a.id||''));
  return (state.spend||[]).map((s,i)=>Object.assign({i,t:pd(s.d)},s)).filter(s=>T-s.t<=35*MS&&s.cat!=='Income'&&(fee?(String(s.d).slice(0,7)===mk&&(RX_FEE.test(s.note||'')||/^BANK_FEES/.test(s.pfd||''))):rx.length&&rx.every(r=>r.test(String(s.note||''))))&&(!exact||Math.abs(+s.amt-amt)<0.011)).sort((a,b)=>b.t-a.t).slice(0,30)};
TITLES.alview='Alert';
PAGES.alview=id=>{const a=alerts().find(z=>z.id===id)||{id,t:'This alert',s:''},L=AL3.txFor(a),tot=r2(L.reduce((s,x)=>s+ +x.amt,0));
  return '<div class="xcard"><b style="font-size:17px">'+esc(a.t)+'</b><small class="xhint">'+esc(a.s||'')+'</small></div>'+
   '<div class="xcard b3txl"><h3>'+(L.length?'The charges ('+money(tot)+')':'No matching charges in the last month')+'</h3>'+L.map(s=>'<div class="b3tx"><div><b>'+esc(B3.nm(s.note))+'</b><small>'+sdate(s.t)+(s.card?' · Card':'')+(s.pending?' · Pending':'')+'</small></div><span class="b3ta">'+money(+s.amt)+'</span></div>').join('')+'</div>'+
   INS.menu({id:a.id,k:a.k,t:a.t,s:a.s})+'<p class="xhint">If a charge is wrong, your bank or the store can usually reverse it. Tap “This was normal” and Sprout won’t flag it again.</p>'};
PAGES.alerts=()=>{const L=AL3.merge(alerts()),x=X();
  const card=a=>{const tg=AL3.target(a);return '<div class="xcard al3"><b>'+esc(a.t)+(a.n>1?' <em class="al3n">'+a.n+' times</em>':'')+'</b><small class="xhint">'+esc(a.s||'')+'</small><div class="al3b">'+
    (tg?'<button class="sbtn" data-al3go="'+esc(tg.p)+'" data-al3w="'+esc(tg.w||'')+'">Review</button>':'<button class="sbtn" data-al3ok="'+esc(a.ids.join('|'))+'">Got it</button>')+'<button class="sbtn alt" data-al3dis="'+esc(a.ids.join('|'))+'">Dismiss</button></div></div>'};
  return (L.length?L.map(card).join(''):'<div class="xcard"><b>All clear</b><small class="xhint">Nothing needs your attention right now.</small></div>')+
   '<button type="button" class="btn alt" data-x="open" data-v="notifs">Choose what Sprout tells you about</button>'};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-al3go],[data-al3ok],[data-al3dis]');if(!t)return;e.preventDefault();e.stopImmediatePropagation();const x=X();
  if(t.dataset.al3go){const p=t.dataset.al3go,w=t.dataset.al3w||undefined;
    if(p==='spins'){closeSheets();setTimeout(()=>SP.open('ins'),closeSheetsDelay()+40);return}
    if(p==='lvbanks'){closeSheets();setTimeout(acctsOpen,closeSheetsDelay()+40);return}
    if(p==='cancel'){const id=w||Object.keys(x.subs||{}).find(k=>x.subs[k].req&&x.subs[k].req.status==='needs_you');xGo('cancel',id);return}
    if(PAGES[p]){if(p==='calendar')CALS=null;xGo(p,w);return}
    closeSheets();setTimeout(()=>{const m=document.querySelector('#menu [data-nav="'+p+'"]');if(m)m.click()},closeSheetsDelay()+40);return}
  const ids=(t.dataset.al3ok||t.dataset.al3dis).split('|');ids.forEach(id=>{x.dis[id]=1});queueSave();xRender();try{overview()}catch(_){}
  if(t.dataset.al3dis)toastAct('Dismissed','Undo',()=>{ids.forEach(id=>{delete x.dis[id]});queueSave();xRender();try{overview()}catch(_){}})},true);
// pay-later names like "(4 of 3)": the plan really has at least 4 payments
AL3.fixPlans=()=>{try{const S=state.sched||[],mx={};S.forEach(x=>{const p=PL.parse(x.name);if(!p.k)return;const id=p.prov+'|'+p.store;mx[id]=Math.max(mx[id]||0,p.k,p.of)});
    S.forEach(x=>{const m=String(x.name).match(/^(.*)\((\d+)\s*of\s*(\d+)\)\s*$/i);if(!m)return;const p=PL.parse(x.name),id=p.prov+'|'+p.store,n=mx[id];if(n&&+m[3]<n)x.name=m[1]+'('+m[2]+' of '+n+')'})}catch(e){}};
{const _af=LG.after;LG.after=function(){AL3.fixPlans();return _af.apply(this,arguments)}}
try{AL3.fixPlans()}catch(e){}
try{if(window.__S)window.__S.AL3=AL3}catch(e){}
}
