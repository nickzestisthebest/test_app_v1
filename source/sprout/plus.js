// ---------- Sprout Plus: offered where it pays for itself ----------
// Shown at moments of intent (when someone asks Sprout to cancel or lower a bill), with their own numbers,
// a no-risk trial with a reminder, and an honest price. No fake urgency, no hidden cancel.
const PLUSP={mo:6.99,yr:49.99};
let plusIs=()=>{const x=X();return !!(x.plus&&x.plus.on)};
let PLUSPEND=null;
function plusValue(){let unused=0,nego=0,nu=0,nn=0;
  try{const L=subsList().filter(s=>s.st==='active'&&s.flag==='unused');nu=L.length;unused=L.reduce((a,s)=>a+s.amt,0)*12}catch(e){}
  try{const N=negoList().filter(n=>!n.done&&+n.pot>0);nn=N.length;nego=N.reduce((a,n)=>a+(+n.pot||0),0)*12}catch(e){}
  return {unused:Math.round(unused),nego:Math.round(nego),nu,nn,total:Math.round(unused+nego)}}
const plusEnds=()=>{const x=X(),s=(x.plus&&x.plus.start)||Date.now();return new Date(s+7*864e5).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})};
function plusCtx(arg){const a=String(arg||'');const [k,id]=a.split(':');
  if(k==='cancel'){const s=(subsList().find(z=>z.id===id)||{});return {h:'Let Sprout cancel '+(s.name||'it')+' for you',d:'That’s '+money(s.amt||0)+' a month you’d stop paying once '+(s.name||'the provider')+' confirms. Plus sends the cancellation for you.'}}
  if(k==='nego'){const n=(negoList().find(z=>z.id===id)||{});return {h:'Let Sprout lower your '+String(n.name||'bill').toLowerCase()+' bill',d:'Estimated savings: about '+money(n.pot||0)+' a month. Your provider decides, so results vary and aren’t guaranteed.'}}
  if(k==='house')return {h:'Plan money together',d:'Share one plan with your partner, split bills and see each other’s progress. Included with Plus.'};
  const v=plusValue();
  if(v.total>=PLUSP.yr)return {h:'Sprout found up to '+money0(v.total)+' a year in possible savings',d:'An estimate based on the bills and subscriptions in your plan. What you actually save depends on your providers and choices.'};
  return {h:'Get more out of every paycheck',d:'Sprout does the annoying money chores for you, and rewards you for staying on plan.'}}
PAGES.plus=arg=>{const x=X(),on=plusIs(),yr=(x.plus&&x.plus.bill)!=='mo',v=plusValue(),C=plusCtx(arg),ck='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  if(on)return '<div class="plhero on"><span class="plbadge">Sprout Plus</span><b>You’re on Plus</b><span>Free trial until <b>'+plusEnds()+'</b>. We’ll remind you 2 days before it ends.</span></div>'+
    (v.total?'<div class="xcard plval"><h3>Still waiting for you</h3>'+(v.nu?'<div class="plrow"><span>'+v.nu+' subscription'+(v.nu>1?'s':'')+' you don’t use</span><b>'+money0(v.unused)+'/yr</b></div>':'')+(v.nn?'<div class="plrow"><span>'+v.nn+' bill'+(v.nn>1?'s':'')+' Sprout can lower</span><b>'+money0(v.nego)+'/yr</b></div>':'')+'<div class="plbtns"><button class="sbtn" data-x="open" data-v="subs">Cancel subscriptions</button><button class="sbtn alt" data-x="open" data-v="nego">Lower my bills</button></div></div>':'')+
    '<button class="btn alt" data-x="pstop">Cancel free trial</button><p class="plfine">Cancel anytime. You keep Plus until the trial ends.</p>'+demoNote('Demo mode. No payment is taken and nothing is billed.');
  const feats=[['Cancel for me','We send the cancellation for subscriptions you pick. No calls, no chats.'],['Lower my bills','We ask your providers for a better rate on phone, internet and insurance.'],['Ask Sprout and unlimited scans','Ask anything about your money, any time, and scan every receipt. Free includes 10 scans a month.'],['Every account in one place','Link all your banks, cards and loans. Free includes 2.'],['Money Pulse','Five scores for cash flow, debt, spending, saving and net worth, and what moves each one.'],['Credit score','Watch it every week and see what moves it.'],['Plan with a partner','One shared plan, split bills, both see progress.'],['Streak rewards','Earn Plus credit at green-day milestones. Terms apply.']];
  return '<div class="plhero"><span class="plbadge">Sprout Plus</span><b>'+esc(C.h)+'</b><span>'+esc(C.d)+'</span></div>'+
   (v.total?'<div class="xcard plval"><h3>Possible savings in your plan</h3>'+(v.nu?'<div class="plrow"><span>'+v.nu+' subscription'+(v.nu>1?'s':'')+' you don’t use</span><b>'+money0(v.unused)+'/yr</b></div>':'')+(v.nn?'<div class="plrow"><span>'+v.nn+' bill'+(v.nn>1?'s':'')+' Sprout can lower</span><b>'+money0(v.nego)+'/yr</b></div>':'')+'<div class="plrow"><span>Streak rewards (Plus credit)</span><b>up to '+money0(PLUSP.yr)+'</b></div><div class="plrow tot"><span>Plus costs</span><b>'+money(PLUSP.yr)+'/yr</b></div><p class="pldisc">Estimates, not guarantees. Actual savings vary. <button type="button" class="lnk" data-x="legaldoc" data-v="est">How we estimate</button></p></div>':'')+
   '<ul class="plfeat">'+feats.map(f=>'<li><i>'+ck+'</i><span><b>'+f[0]+'</b>'+f[1]+'</span></li>').join('')+'</ul>'+
   '<div class="pltl" aria-label="How the free trial works"><div><i></i><b>Today</b><span>Everything unlocked. No charge.</span></div><div><i></i><b>Day 5</b><span>We remind you the trial is ending.</span></div><div><i></i><b>Day 7</b><span>Plus starts. Cancel anytime before.</span></div></div>'+
   '<div class="plplans" role="radiogroup" aria-label="Choose a plan"><button type="button" role="radio" aria-checked="'+yr+'" data-x="pbill" data-v="yr" class="'+(yr?'on':'')+'"><em>Best value</em><b>Yearly</b><span><s>'+money(PLUSP.mo*12)+'</s> '+money(PLUSP.yr)+'/yr</span><small>Just '+money(PLUSP.yr/12)+' a month · Save 40%</small></button><button type="button" role="radio" aria-checked="'+(!yr)+'" data-x="pbill" data-v="mo" class="'+(yr?'':'on')+'"><b>Monthly</b><span>'+money(PLUSP.mo)+'/mo</span><small>Cancel anytime</small></button></div>'+
   '<button class="btn plcta" data-x="pstart">Start my free week</button><p class="plsure">No charge today. We’ll remind you before the trial ends.</p>'+
   '<p class="plfine">After the 7-day free trial, Sprout Plus renews automatically at '+(yr?money(PLUSP.yr)+' a year':money(PLUSP.mo)+' a month')+' until you cancel. Cancel at least 24 hours before the trial ends to avoid a charge. Manage or cancel anytime in your App Store account settings.</p>'+
   '<p class="plfine">Savings shown are estimates based on your plan, not promises. Providers decide on cancellations and rates. Plus does not guarantee any savings.</p><div class="pllinks"><button class="lnk" data-x="prestore">Restore purchases</button><button class="lnk" data-x="legaldoc" data-v="tos">Terms</button><button class="lnk" data-x="legaldoc" data-v="privacy">Privacy</button></div>'+demoNote('Demo mode. No payment is taken and nothing is billed.')};
// home: a value card once Sprout has found real savings, easy to snooze
function plusCard(){if(!state.setup||plusIs())return '';const x=X();if((x.plusSnooze||0)>Date.now())return '';const v=plusValue();if(v.total<60)return '';
  const bits=[];if(v.nu)bits.push(v.nu+' subscription'+(v.nu>1?'s':'')+' you don’t use');if(v.nn)bits.push(v.nn+' bill'+(v.nn>1?'s':'')+' it can lower');
  return '<div class="ovcard wide plcard"><div class="plch"><span class="plbadge">Sprout Plus</span><button class="plx" data-x="plsnooze" aria-label="Not now">Not now</button></div><b>Up to '+money0(v.total)+' a year in possible savings</b><p>Sprout found '+bits.join(' and ')+'. Plus can take care of them for you.</p><small class="pldisc">Estimate, not a guarantee. <button type="button" class="lnk" data-x="legaldoc" data-v="est">How we estimate</button></small><button class="sbtn" data-x="open" data-v="plus" data-w="home">Try Plus free for 7 days</button></div>'}
// settings: Plus at the top, not buried
let plusSetCard=function(){const on=plusIs(),v=plusValue();
  return on?'<button type="button" class="plset on" data-x="open" data-v="plus"><span class="plbadge">Plus</span><span class="plst"><b>Sprout Plus</b><small>Free trial until '+plusEnds()+'</small></span><span class="schev">›</span></button>'
   :'<button type="button" class="plset" data-x="open" data-v="plus"><span class="plbadge">Plus</span><span class="plst"><b>Try Sprout Plus free</b><small>'+(v.total>=60?'Up to '+money0(v.total)+' a year in possible savings':'Cancel for me, unlimited Ask Sprout and more')+'</small></span><span class="schev">›</span></button>'}
// moments of intent: asking Sprout to cancel, negotiate or share opens Plus first, then carries on
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=runcancel],[data-x=runnego],[data-x=hinvite]');if(!b||plusIs())return;
  e.stopImmediatePropagation();e.preventDefault();const a=b.dataset.x,v=b.dataset.v||'';
  if(a==='runcancel'){const id=v||((XP&&XP.arg)||'');PLUSPEND={x:a,v};xGo('plus','cancel:'+id)}
  else if(a==='runnego'){PLUSPEND={x:a,v};xGo('plus','nego:'+v)}
  else{PLUSPEND={x:a,v};xGo('plus','house')}},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x]');if(!b)return;const a=b.dataset.x,x=X();
  if(a==='pstart'){x.plus=Object.assign({},x.plus,{on:1,start:Date.now()});sv();setTimeout(()=>{try{plan()}catch(_){}},30);
    const p=PLUSPEND;PLUSPEND=null;if(p){setTimeout(()=>{xBack();setTimeout(()=>{const t=document.createElement('button');t.dataset.x=p.x;if(p.v)t.dataset.v=p.v;t.hidden=true;document.getElementById('x-body').appendChild(t);t.click();t.remove()},120)},500)}else setTimeout(()=>{try{xRender()}catch(_){}},60)}
  if(a==='pstop'){PLUSPEND=null;setTimeout(()=>{try{plan()}catch(_){}},30)}
  if(a==='prestore')toast('No purchases to restore on this account (demo)');
  if(a==='plsnooze'){x.plusSnooze=Date.now()+7*864e5;sv();try{plan()}catch(_){}toast('Okay. We’ll check back next week.')}});
