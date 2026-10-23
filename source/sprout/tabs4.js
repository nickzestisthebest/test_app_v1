// ===================== Tabs 4: "Today" is what's happening now, "Money" is the whole picture, Settings is setup =====================
// Today: Safe to spend, what's due soon, this month's budgets, today's plan, the top insight, your streak.
// Money: net worth, cash flow ahead, debts, savings and goals, Money Pulse, spending history, the calendar, subscriptions, credit.
// Settings: your plan setup, accounts, Sprout Plus, partner sharing, notifications, privacy, About Sprout's numbers, help.
const TB4={};
{
LG.dedup=s=>String(s||'').replace(/^([^·(]+?)\s*·\s*\1\b\s*/,'$1 ').replace(/^Pay later\s*·\s*/,'').replace(/\s+/g,' ').trim();
const r2=MX.r2,ordn=n=>n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th');
TB4.label=()=>{try{const set=(sel,txt,d)=>{const b=document.querySelector(sel);if(!b)return;const tn=[...b.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(tn)tn.textContent=txt;else b.appendChild(document.createTextNode(txt));const svg=b.querySelector('svg path');if(svg&&d)svg.setAttribute('d',d)};
  set('.tb[data-tab=home],.tb[data-home]','Today','M4 10.5 12 4l8 6.5V20H4zM9.5 20v-5h5v5');set('.tb[data-tab=money]','Money','M4 7h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 7l12-3v3M16 13.5h1.5')}catch(e){}};
TB4.label();setTimeout(TB4.label,800);
// ---------- Today: due soon, compact ----------
TB4.due=()=>{const T=realToday(),L=(rows&&rows.items||[]).filter(x=>x.t>=T&&x.t<T+7*MS&&x.a>0.004&&!(state.paid||{})[payKey(x)]).sort((a,b)=>a.t-b.t),tot=r2(L.reduce((a,x)=>a+x.a,0));
  if(!state.setup)return '';const nx=(rows&&rows.items||[]).filter(x=>x.t>=T+7*MS&&x.a>0.004).sort((a,b)=>a.t-b.t)[0];
  return '<button type="button" class="ovcard wide t4due" data-x="open" data-v="calendar"><div class="och"><span>Due in the next 7 days</span><em>›</em></div>'+(L.length?'<b class="mid">'+money(tot)+'</b><div class="t4dl">'+L.slice(0,4).map(x=>'<span><i>'+(x.t===T?'Today':new Date(x.t).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short'}))+'</i><em>'+esc(LG.dedup(LG.short(shortName(x.name))))+'</em><b>'+money(x.a)+'</b></span>').join('')+(L.length>4?'<small>and '+(L.length-4)+' more</small>':'')+'</div>':'<small>Nothing due this week.'+(nx?' Next up: '+esc(LG.short(shortName(nx.name)))+', '+money(nx.a)+' on '+sdate(nx.t)+'.':'')+'</small>')+'</button>'};
TB4.goals=()=>{try{const G=P4.goals().filter(g=>!g.done&&!g.paused);if(!G.length)return '';const g=G[0],s=P4.goalSaved(g),t=+g.target||1;return '<button type="button" class="ovcard wide t4goal" data-x="open" data-v="goal1" data-w="'+esc(g.id)+'"><div class="och"><span>Goal · '+esc(g.name)+'</span><em>›</em></div><div class="t4gr">'+B3.bar(Math.min(1,s/t),'ok')+'<small>'+money0(s)+' of '+money0(t)+(G.length>1?' · '+(G.length-1)+' more goal'+(G.length>2?'s':''):'')+'</small></div></button>'}catch(e){return ''}};
{const _ov=overview;overview=function(){const r=_ov.apply(this,arguments);try{const o=document.getElementById('ov');if(!o)return r;
    // the whole-picture cards move to Money
    o.querySelectorAll('.pulse,.ovcard.pulsec,.plcard,.ovcard[data-v=pulse]').forEach(el=>el.remove());[...o.children].forEach(el=>{const t=(el.querySelector('.och span')||{}).textContent||'';if(/^Money pulse$/i.test(t.trim())||el.classList.contains('plcard')||/Sprout Plus/.test((el.querySelector('.pltag,.plh')||{}).textContent||''))el.remove()});
    const hero=o.querySelector('.h4hero');if(hero&&!o.querySelector('.t4due'))hero.insertAdjacentHTML('afterend',TB4.due());
    const mc=o.querySelector('.safem');if(mc&&!o.querySelector('.t4goal'))mc.insertAdjacentHTML('afterend',TB4.goals());
    TB4.label()}catch(e){try{console.warn('tabs4',e)}catch(_){}}return r}}
// ---------- Money: the whole picture ----------
F3.tools=()=>{let T={n:0,mo:0};try{T=subTotals()}catch(e){}let pulse='';try{pulse=PULSE.card()}catch(e){}let cr='';try{const c=(X().credit||{});cr=c.score?String(c.score):''}catch(e){}
  return pulse+'<div class="f3grid t4grid">'+F3.card('t4sub','data-x="open" data-v="subs"','<div class="f3nwt"><span class="k">Subscriptions</span><span class="chev">›</span></div><b class="f3mid">'+(T.n?money0(T.mo)+'<small>/mo</small>':'None')+'</b><small>'+(T.n?T.n+' active':'Find what renews')+'</small>')+
    F3.card('t4cr','data-x="open" data-v="credit"','<div class="f3nwt"><span class="k">Credit</span><span class="chev">›</span></div><b class="f3mid">'+(cr||'Check')+'</b><small>'+(cr?'Your latest score':'Your score and what moves it')+'</small>')+'</div>'+
    '<div class="t4links"><button type="button" class="lnk" data-x="nav" data-v="tx">All transactions ›</button><button type="button" class="lnk" data-x="open" data-v="networth">Every account ›</button><button type="button" class="lnk" data-x="open" data-v="nego">Help lowering a bill ›</button></div>'};
{const _mh=F3.moneyHTML;F3.moneyHTML=function(){let h=_mh.apply(this,arguments);try{h=h.replace(/<h1>Finances<\/h1><small>Your whole picture<\/small>/,'<h1>Money</h1><small>The whole picture</small>');
    // alerts and setup nudges live on Today
    h=h.replace(/<div class="f3need">[\s\S]*?<\/div>(?=<div class="f3grid t4grid">|<div class="xcard pulse|$)/,'')}catch(e){}return h}};
// ---------- Settings: setup in one place ----------
{const _st=PAGES.settings;PAGES.settings=function(){let h=_st.apply(this,arguments);try{const plus=plusIs(),x=X();
    const add=sgroup('Plans and sharing',[srow('star','Sprout Plus',plus?'On':'','data-x="open" data-v="plus"'),srow('users','Partner',x.house&&x.house.st==='on'?'On':'','data-x="open" data-v="house"'),srow('info','About Sprout’s numbers','','data-x="open" data-v="numbers"')]);
    h=h.replace(sgroup('Help',[srow('info','How Sprout works','','data-x="nav" data-v="how"'),srow('mail','Contact support','','data-x="open" data-v="support"')]),add+sgroup('Help',[srow('info','How Sprout works','','data-x="nav" data-v="how"'),srow('mail','Contact support','','data-x="open" data-v="support"')]));
    h=h.replace("srow('doc','Paycheck, bills and balances'","srow('doc','Your plan: paycheck, bills and balances'")}catch(e){}return h}}
// ---------- About Sprout's numbers (one calm page) and the one-time acknowledgement ----------
TITLES.numbers='About Sprout’s numbers';
PAGES.numbers=()=>'<div class="how4"><p>Sprout turns your bank data and the plan you set into estimates: what’s safe to spend, when bills are due, when debts could be paid off, and where your net worth is headed.</p>'+
  '<h3>What these numbers are</h3><p>Estimates, worked out on your phone from your accounts, transactions and settings. Bank data can be delayed or wrong. Forecasts assume your plan goes as set, and real life rarely does. Past results don’t promise future ones.</p>'+
  '<h3>What they aren’t</h3><p>Not financial, tax, investment, credit or legal advice, and not an offer of credit. Sprout doesn’t recommend products or tell you what to do. For decisions like borrowing or investing, a licensed professional can help.</p>'+
  '<h3>How each one is figured</h3><p><button type="button" class="lnk" data-x="open" data-v="debthow">Checking, debts and the payoff plan ›</button></p><p><button type="button" class="lnk" data-x="open" data-v="nwhow">Net worth, past and ahead ›</button></p><p><button type="button" class="lnk" data-x="open" data-v="safe">Safe to spend ›</button></p>'+
  '<p class="xhint">Your statements are the final word. Questions: <button type="button" class="lnk" data-x="open" data-v="support">contact support</button>.</p></div>';
TB4.ackNeeded=()=>{try{return state.setup&&!P4.g().ack}catch(e){return false}};
{const _ov=overview;overview=function(){const r=_ov.apply(this,arguments);try{const o=document.getElementById('ov');if(o&&TB4.ackNeeded()&&!o.querySelector('.t4ack')){const hero=o.querySelector('.h4hero');const html='<div class="ovcard wide t4ack"><b>One thing before you start</b><small>Sprout’s numbers are estimates from your data, not financial advice.</small><label class="t4ackl"><input type="checkbox" data-t4ack> I understand</label><button type="button" class="lnk" data-x="open" data-v="numbers">Learn more</button></div>';if(hero)hero.insertAdjacentHTML('beforebegin',html);else o.insertAdjacentHTML('afterbegin',html)}}catch(e){}return r}}
document.addEventListener('change',e=>{const c=e.target.closest&&e.target.closest('[data-t4ack]');if(!c||!c.checked)return;P4.g().ack=Date.now();queueSave();const card=c.closest('.t4ack');if(card){card.classList.add('t4bye');setTimeout(()=>card.remove(),300)}});
// small "Estimate" and "How this is figured" links on calculated cards
{const _mh=F3.moneyHTML;F3.moneyHTML=function(){let h=_mh.apply(this,arguments);try{h+='<p class="xhint t4est">Estimates from your bank data and plan. <button type="button" class="lnk" data-x="open" data-v="numbers">About Sprout’s numbers</button></p>'}catch(e){}return h}}
try{if(window.__S)window.__S.TB4=TB4}catch(e){}
}
