// ===================== Notifications you choose: grouped, quiet when you want, never the same thing twice =====================
// Everything is worked out on the phone from your own numbers. With phone notifications on, the reminders that have a
// date (a bill due tomorrow, a heads-up about a tight week) are handed to your Sprout server, which sends them once.
const NT={};
{
const r2=x=>Math.round((+x||0)*100)/100,DY=MS;
NT.G=[
 ['heads','Heads up','When money could get tight',[['tight','A payment is coming up and checking is low','“You have a $400 payment coming up Friday and $420 in checking. Be careful.”'],['neg','Checking could go below zero','Before your next payday'],['daily','Your daily number is running low',''],['late','A paycheck is late','When it usually lands and hasn’t yet']],true],
 ['bills','Bills and pay-later','',[['due','Due tomorrow','Bills, card minimums and pay-later payments'],['paid','Paid','When a bill or plan payment goes through']],true],
 ['cards','Cards and credit','',[['util','High card usage before a statement',''],['cdue','Card payment coming up',''],['score','Credit score changed','From the credit reports you add']],true],
 ['spend','Spending','',[['dup','Possible double charge',''],['hike','Subscription price went up',''],['newsub','New subscription',''],['big','Bigger than usual purchase',''],['bud','Budget at 80% or over',''],['fee','Fees','']],true],
 ['wins','Wins','',[['payday','Payday','When your paycheck lands'],['goal','Goal reached',''],['streak','Streak milestones','']],true],
 ['tips','Tips','Off unless you turn them on',[['sg','Smart budget suggestions','Only when a pattern is strong'],['week','Weekly summary','Sunday mornings']],false]];
NT.g=()=>{const g=LG.st();g.nt=g.nt||{};const n=g.nt;n.grp=n.grp||{};n.k=n.k||{};n.sent=n.sent||{};n.rem=n.rem||[];if(n.max==null)n.max=3;if(!n.quiet)n.quiet={on:true,from:21,to:8};return n};
NT.grpOn=gk=>{const n=NT.g(),G=NT.G.find(x=>x[0]===gk);return n.grp[gk]!=null?!!n.grp[gk]:!!(G&&G[4])};
NT.on=(gk,k)=>{if(!NT.grpOn(gk))return false;const v=NT.g().k[gk+'.'+k];return v!=null?!!v:true};
// the old per-alert switches keep working
NT.legacy=()=>{try{const x=X().notif||{};return x}catch(e){return {}}};

// ---------- what's worth telling you right now ----------
NT.MUST=['Bill','Affirm','One-time','Debt min','Klarna','Cash App'];
NT.now=()=>{const out=[];if(LG.demo()||!state.setup||!rows||!rows.items)return out;const T=realDay(),cash=(()=>{try{return estCash()}catch(e){return +state.cash||0}})(),cush=+state.cushion||0,leg=NT.legacy();
  const up=t=>(rows.items||[]).filter(x=>x.t>=T&&x.t<=t&&x.a>0.004&&NT.MUST.indexOf(x.g)>=0).sort((a,b)=>a.t-b.t);
  const wd=t=>{const d=(t-T)/DY;return d<1?'today':d<2?'tomorrow':new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'long'})};
  // a payment is coming and checking is close to it
  if(NT.on('heads','tight')){const L=up(T+5*DY),tot=r2(L.reduce((a,x)=>a+x.a,0));if(L.length&&cash-tot<Math.max(cush,tot*0.15)){const last=L[L.length-1];
    out.push({id:'nt-tight-'+fd(T)+'-'+Math.round(tot),grp:'heads',k:'tight',t:L.length===1?'You have a '+money0(L[0].a)+' payment coming up '+wd(L[0].t)+' and '+money0(cash)+' in checking':'You have '+money0(tot)+' in payments coming up by '+wd(last.t)+' and '+money0(cash)+' in checking',s:(cash<tot?'That’s '+money0(tot-cash)+' short. ':'')+'Be careful with spending until '+(L.length===1?esc(shortName(L[0].name))+' goes through':'they go through')+'.',go:['calendar'],prio:1})}}
  if(NT.on('heads','neg')&&leg.low!==false){try{const D=(DAILY||[]).filter(d=>d.t>=T&&d.t<=T+14*DY),lo=D.reduce((a,d)=>!a||d.v<a.v?d:a,null);if(lo&&lo.v<0)out.push({id:'nt-neg-'+fd(lo.t),grp:'heads',k:'neg',t:'Checking could go below zero on '+sdate(lo.t),s:'About '+money0(lo.v)+' if things go as planned. Your money calendar shows what’s due before then.',go:['calendar'],prio:1})}catch(e){}}
  if(NT.on('heads','late')){try{const l=RC.late();if(l)out.push({id:'nt-late-'+fd(l.t),grp:'heads',k:'late',t:'Your paycheck usually lands by '+sdate(l.t)+' and hasn’t yet',s:'Sprout is still counting on about '+money0(l.amt)+'. If it’s delayed, your daily number will catch up once it lands.',go:['ypay'],prio:2})}catch(e){}}
  if(NT.on('heads','daily')){try{const sp=(state.spend||[]).map(s=>Object.assign({t:pd(s.d)},s)),A=availAt(realToday(),sp),per=(A.perTotal||0);if(per>5&&A.leftTotal>0&&A.leftTotal<per*0.2&&new Date().getHours()>=12)out.push({id:'nt-daily-'+fd(T),grp:'heads',k:'daily',t:'You have '+money(A.leftTotal)+' left to spend today',s:'Tomorrow you’ll have about '+money0(per)+' again.',go:['safe'],prio:3})}catch(e){}}
  // due tomorrow
  if(NT.on('bills','due')&&leg.bills!==false){const L=(rows.items||[]).filter(x=>x.t===T+DY&&x.a>0.004&&NT.MUST.indexOf(x.g)>=0);if(L.length)out.push({id:'nt-due-'+fd(T+DY),grp:'bills',k:'due',t:L.length===1?'Tomorrow: '+shortName(L[0].name)+' '+money(L[0].a):L.length+' payments due tomorrow, '+money(L.reduce((a,x)=>a+x.a,0)),s:L.length>1?L.slice(0,4).map(x=>shortName(x.name)+' '+money(x.a)).join(', ')+'.':'Sprout already set the money aside.',go:['calendar'],prio:2})}
  if(NT.on('bills','paid')){const L=(state.spend||[]).filter(s=>s.payKey&&s.at&&Date.now()-s.at<36*3600e3).slice(-3);L.forEach(s=>out.push({id:'nt-paid-'+s.payKey,grp:'bills',k:'paid',t:'Paid: '+shortName(String(s.payKey).split('|')[1]||s.note)+' '+money(+s.amt),s:'It’s off your list for this month.',go:['calendar'],prio:5}))}
  // cards
  try{const L=state.link&&state.link.liab||{};LG.cards().forEach(a=>{const li=L[a.id]||{},lim=+a.limit,bal=Math.max(0,+a.cur||0),u=lim>0?bal/lim:0;if(!li.due)return;const due=pd(li.due),dd=(due-T)/DY;
    if(NT.on('cards','util')&&u>=0.3&&dd>=20&&dd<=28)out.push({id:'nt-util-'+a.id+'-'+li.due,grp:'cards',k:'util',t:LG.label(a)+' is at '+Math.round(u*100)+'% of its limit',s:'Its statement likely closes in the next few days. The balance on a statement is usually what gets reported to credit bureaus.',go:['accounts'],prio:3});
    if(NT.on('cards','cdue')&&dd>=0&&dd<=3)out.push({id:'nt-cdue-'+a.id+'-'+li.due,grp:'cards',k:'cdue',t:LG.label(a)+' payment due '+wd(due),s:(+li.min>0?'Minimum '+money(+li.min):'')+(+li.stmt>0?(+li.min>0?', statement balance ':'Statement balance ')+money(+li.stmt):'')+'.',go:['yourplan'],prio:2})})}catch(e){}
  // spending
  let I=[];try{I=BR.insights()}catch(e){}
  I.forEach(i=>{const m={dup:'dup',odd:'big',fee:'fee',new:'newsub',pace:'bud'}[i.k];if(!m||!NT.on('spend',m))return;if(m==='dup'&&leg.dupe===false)return;out.push({id:i.id,grp:'spend',k:m,t:i.t,s:i.s,go:i.go||[],prio:m==='dup'?2:4})});
  if(NT.on('spend','hike')&&leg.hike!==false){try{subsList().filter(s=>s.hike&&s.st==='active'&&T-s.last<20*DY).forEach(s=>out.push({id:'nt-hike-'+s.id+'-'+fd(s.last),grp:'spend',k:'hike',t:s.name+' went up '+money(s.hike),s:'It’s now '+money(s.price)+(s.cad&&s.cad!=='monthly'?' '+s.cad:' a month')+'.',go:['subs'],prio:3}))}catch(e){}}
  if(NT.on('spend','bud')&&leg.bud!==false){try{const ms=monthSpend();BCATS.forEach(c=>{const l=budLim(c),v=ms[c[0]]||0;if(!(l>0)||v<l*0.8)return;const over=v>l;out.push({id:'nt-bud-'+c[0]+'-'+fd(T).slice(0,7)+(over?'-o':'-8'),grp:'spend',k:'bud',t:over?c[1]+' is over budget':c[1]+' is at '+Math.round(v/l*100)+'%',s:money0(v)+' of '+money0(l)+' this month.',go:['budcat',c[0]],prio:4})})}catch(e){}}
  // wins
  if(NT.on('wins','payday')){try{const a=RC.auto();if(a.pay){const r=RC.rows().filter(r=>r.a>0&&RC.key(r)===a.pay.key&&T-r.t<=DY).pop();if(r)out.push({id:'nt-payday-'+r.d,grp:'wins',k:'payday',t:'Payday: '+money(r.a)+' landed',s:'Your daily number has been updated.',go:['safe'],prio:4})}}catch(e){}}
  if(NT.on('wins','goal')){try{const v=SV();(state.goals||[]).forEach(g=>{if(+g.amt>0&&(+v.al[g.name]||0)>=+g.amt)out.push({id:'nt-goal-'+g.name,grp:'wins',k:'goal',t:'You reached '+g.name,s:money0(+g.amt)+' saved.',go:['vault'],prio:4})})}catch(e){}}
  if(NT.on('wins','streak')&&leg.streak!==false){try{const s=SK();if([7,14,30,60,100,365].indexOf(+s.run)>=0&&s.last===fd(T))out.push({id:'nt-streak-'+s.run,grp:'wins',k:'streak',t:s.run+'-day streak',s:'You’ve stayed on plan '+s.run+' days in a row.',go:[],prio:5})}catch(e){}}
  if(NT.on('tips','sg')){try{const s=SG.next();if(s)out.push({id:'nt-sg-'+s.id,grp:'tips',k:'sg',t:'Budget suggestion',s:s.short,go:['spins'],prio:6})}catch(e){}}
  return out.sort((a,b)=>a.prio-b.prio)};
// the bell: these join what's already there, without repeating anything
{const _al=alerts;alerts=function(){let A=_al.apply(this,arguments);try{const x=X(),have=new Set(A.map(a=>a.id)),L=NT.now().filter(a=>!have.has(a.id)&&!x.dis[a.id]);
    // insights already in the list follow your notification choices
    const off=new Set(NT.now.allOff?[]:[]);A=A.filter(a=>{const m=/^brdup/.test(a.id)?['spend','dup']:/^brbig/.test(a.id)?['spend','big']:/^brfee/.test(a.id)?['spend','fee']:/^brnew/.test(a.id)?['spend','newsub']:/^brpace/.test(a.id)?['spend','bud']:/^brlow/.test(a.id)?['heads','neg']:null;return !m||NT.on(m[0],m[1])});
    return L.filter(a=>a.prio<=2).concat(A,L.filter(a=>a.prio>2)).slice(0,30).map(a=>typeof SP!=='undefined'&&SP.dd?Object.assign({},a,{t:SP.dd(a.t),s:SP.dd(a.s)}):a)}catch(e){return A}}}
// "Open" from the bell for the new kinds
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=alertgo]');if(!b)return;const v=b.dataset.v;if(v==='spins'||v==='calendar'||v==='accounts'||v==='ypay'||v==='yourplan'||v==='safe'){e.stopImmediatePropagation();e.preventDefault();closeSheets();setTimeout(()=>{if(v==='spins')SP.open('ins');else{if(v==='calendar')CALS=null;xOpen(v)}},closeSheetsDelay()+40)}},true);

// ---------- reminders you asked for ----------
NT.addRem=r=>{const n=NT.g();n.rem.push(Object.assign({at:Date.now()},r));queueSave();NT.queue()};

// ---------- phone notifications (needs your Sprout server and the app on your Home Screen) ----------
NT.dev=()=>{try{let d=localStorage.getItem('sprout-dev');if(!d){d=Math.random().toString(36).slice(2,12);localStorage.setItem('sprout-dev',d)}return d}catch(e){return 'x0000000'}};
NT.can=()=>LIVE.on&&'serviceWorker' in navigator&&'PushManager' in window&&typeof Notification!=='undefined';
NT.installed=()=>{try{return window.navigator.standalone===true||matchMedia('(display-mode: standalone)').matches}catch(e){return false}};
NT.ios=()=>/iphone|ipad|ipod/i.test(navigator.userAgent||'');
NT.b64=s=>{const p='='.repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...b].map(c=>c.charCodeAt(0)))};
NT.subscribe=async()=>{if(!NT.can())return{ok:false,why:'unsupported'};if(NT.ios()&&!NT.installed())return{ok:false,why:'install'};if(!liveOK())return{ok:false,why:'code'};
  const perm=await Notification.requestPermission();if(perm!=='granted')return{ok:false,why:'denied'};
  const k=await liveFetch('/api/push',{op:'key'});if(!k.ok||!k.key)return{ok:false,why:'server'};
  const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:NT.b64(k.key)});
  const j=await liveFetch('/api/push',{op:'sub',dev:NT.dev(),sub:sub.toJSON()});if(!j.ok)return{ok:false,why:'server'};NT.g().push=1;queueSave();NT.queue(true);return{ok:true}};
NT.unsubscribe=async()=>{try{const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();if(sub)await sub.unsubscribe()}catch(e){}try{await liveFetch('/api/push',{op:'unsub',dev:NT.dev()})}catch(e){}NT.g().push=0;queueSave()};
// what to send ahead of time: things with a date, at 9 in the morning, outside quiet hours, a few a day at most
NT.at=(dayT,h)=>{const d=new Date(dayT);return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),h||9,0,0).getTime()};
NT.plan=()=>{const out=[],T=realDay(),n=NT.g();if(LG.demo()||!state.setup||!rows||!rows.items)return out;
  for(let k=1;k<=7;k++){const day=T+k*DY,L=(rows.items||[]).filter(x=>x.t===day+DY&&x.a>0.004&&NT.MUST.indexOf(x.g)>=0);if(NT.on('bills','due')&&L.length)out.push({id:'p-due-'+fd(day+DY),at:NT.at(day,9),title:L.length===1?'Due tomorrow: '+shortName(L[0].name):L.length+' payments due tomorrow',body:L.length===1?money(L[0].a)+'. Sprout already set the money aside.':L.slice(0,4).map(x=>shortName(x.name)+' '+money(x.a)).join(', '),url:'/?go=calendar'})}
  NT.now().filter(a=>a.prio<=2&&a.grp==='heads').forEach(a=>out.push({id:'p-'+a.id,at:Date.now()+60e3,title:a.t,body:a.s,url:'/?go='+(a.go&&a.go[0]||'')}));
  if(NT.on('tips','week')){const d=new Date(T),dd=(7-d.getUTCDay())%7||7;out.push({id:'p-week-'+fd(T+dd*DY),at:NT.at(T+dd*DY,10),title:'Your week in Sprout',body:'See what you spent and what’s coming up.',url:'/?go=spins'})}
  n.rem.forEach(r=>{const last=r.at||Date.now(),d=new Date(last),nx=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,Math.min(28,d.getUTCDate()));if(nx-T<=8*DY)out.push({id:'p-rem-'+r.id+'-'+fd(nx),at:NT.at(nx,10),title:r.t,body:'Your monthly check-in from Sprout.',url:'/?go=spins'})});
  // quiet hours and a daily cap
  const q=n.quiet,qh=h=>q&&q.on&&(q.from>q.to?(h>=q.from||h<q.to):(h>=q.from&&h<q.to));
  out.forEach(x=>{const d=new Date(x.at);if(qh(d.getHours())){d.setHours(q.to,0,0,0);if(d.getTime()<x.at)d.setDate(d.getDate()+1);x.at=d.getTime()}});
  const by={};out.sort((a,b)=>a.at-b.at).forEach(x=>{const k=new Date(x.at).toDateString();(by[k]=by[k]||[]).push(x)});const keep=[];
  Object.values(by).forEach(L=>{if(L.length<=n.max)keep.push(...L);else{keep.push(...L.slice(0,n.max-1));const rest=L.slice(n.max-1);keep.push({id:'p-more-'+rest[0].id,at:rest[0].at,title:rest.length+' things in Sprout today',body:rest.map(x=>x.title).join(' · ').slice(0,180),url:'/'})}});
  return keep.filter(x=>!n.sent[x.id]).slice(0,40)};
NT.queue=(force)=>{if(!LIVE.on||!liveOK()||!NT.g().push)return;clearTimeout(NT.qt);NT.qt=setTimeout(async()=>{try{const items=NT.plan(),h=JSON.stringify(items.map(x=>[x.id,x.at]));if(!force&&h===NT.g().qh)return;
  const j=await liveFetch('/api/push',{op:'queue',dev:NT.dev(),items});if(j&&j.ok){NT.g().qh=h;queueSave()}}catch(e){}},force?50:4000)};
{const _pl=plan;plan=function(){const r=_pl.apply(this,arguments);try{NT.queue()}catch(e){}return r}}
// opening a notification brings you to the right place
try{const m=location.search.match(/[?&]go=([a-z]+)/);if(m){const go=m[1];let n=0;const tick=()=>{if(!document.body.classList.contains('ready')||document.getElementById('auth')){if(++n<60)setTimeout(tick,500);return}try{history.replaceState(null,'',location.pathname)}catch(e){}if(go==='spins')SP.open('ins');else if(go&&PAGES[go]){if(go==='calendar')CALS=null;xOpen(go)}};setTimeout(tick,900)}}catch(e){}

// ---------- the Notifications page ----------
PAGES.notifs=()=>{const n=NT.g(),live=LIVE.on,sup=NT.can(),push=!!n.push;let ph='';
  if(!live)ph='<p class="xhint" style="margin:0">In this preview, alerts show under the bell. On your phone, Sprout can also send them as notifications.</p>';
  else if(!sup)ph='<p class="xhint" style="margin:0">This browser can’t show notifications. Add Sprout to your Home Screen on iPhone (iOS 16.4 or later) to get them.</p>';
  else if(NT.ios()&&!NT.installed())ph='<p class="xhint" style="margin:0">To get notifications on iPhone, add Sprout to your Home Screen first: tap Share, then Add to Home Screen. Then turn this on from there.</p>';
  const hrs=[...Array(24).keys()],hl=h=>(h%12||12)+(h<12?' am':' pm');
  let h=sgroup('On your phone',[ '<label class="srow"><span class="sico">'+ic('bell')+'</span><span class="slab">Phone notifications<small>'+(push?'On for this phone':'Off')+'</small></span><input type="checkbox" class="sw" data-ntpush'+(push?' checked':'')+(live&&sup?'':' disabled')+'></label>',
    '<label class="srow"><span class="sico">'+ic('moon')+'</span><span class="slab">Quiet hours<small>Nothing between '+hl(n.quiet.from)+' and '+hl(n.quiet.to)+'</small></span><input type="checkbox" class="sw" data-ntq'+(n.quiet.on?' checked':'')+'></label>'+
    (n.quiet.on?'<div class="srow ntq"><select data-ntqf aria-label="Quiet from">'+hrs.map(x=>'<option value="'+x+'"'+(x===n.quiet.from?' selected':'')+'>'+hl(x)+'</option>').join('')+'</select><span>to</span><select data-ntqt aria-label="Quiet until">'+hrs.map(x=>'<option value="'+x+'"'+(x===n.quiet.to?' selected':'')+'>'+hl(x)+'</option>').join('')+'</select></div>':''),
    '<div class="srow"><span class="sico">'+ic('flag')+'</span><span class="slab">At most each day</span><div class="wchips ntmax">'+[1,3,5].map(v=>'<button type="button" class="wchip'+(n.max===v?' on':'')+'" data-ntmax="'+v+'">'+v+'</button>').join('')+'</div></div>'].concat(push?['<button type="button" class="srow" data-nttest><span class="sico">'+ic('send')+'</span><span class="slab">Send a test notification</span></button>']:[]))+ph;
  NT.G.forEach(G=>{const gon=NT.grpOn(G[0]);h+='<section class="sgrp ntg"><h3><span>'+G[1]+(G[2]?'<small>'+G[2]+'</small>':'')+'</span><input type="checkbox" class="sw" data-ntg="'+G[0]+'"'+(gon?' checked':'')+' aria-label="'+G[1]+'"></h3><div class="sbox'+(gon?'':' off')+'">'+
    G[3].map(it=>'<label class="srow"><span class="slab">'+it[1]+(it[2]?'<small>'+it[2]+'</small>':'')+'</span><input type="checkbox" class="sw" data-ntk="'+G[0]+'.'+it[0]+'"'+(NT.on(G[0],it[0])||(!gon&&n.k[G[0]+'.'+it[0]]!==false)?' checked':'')+(gon?'':' disabled')+'></label>').join('')+'</div></section>'});
  if(n.rem.length)h+=sgroup('Reminders',n.rem.map((r,i)=>'<div class="srow"><span class="slab">'+esc(r.t)+'<small>Once a month</small></span><button type="button" class="sbtn alt" data-ntrm="'+i+'">Remove</button></div>'));
  return h+'<p class="xhint">Everything also shows under the bell in Sprout. Each notification is sent once, and similar ones are bundled together.</p>'};
document.addEventListener('change',async e=>{const t=e.target;if(!t||!t.dataset)return;const n=NT.g();
  if(t.dataset.ntg!=null){n.grp[t.dataset.ntg]=t.checked;queueSave();NT.queue(true);xRender();try{tbSync()}catch(_){}return}
  if(t.dataset.ntk!=null){n.k[t.dataset.ntk]=t.checked;queueSave();NT.queue(true);try{tbSync()}catch(_){}return}
  if(t.hasAttribute('data-ntq')){n.quiet.on=t.checked;queueSave();NT.queue(true);xRender();return}
  if(t.hasAttribute('data-ntqf')||t.hasAttribute('data-ntqt')){n.quiet[t.hasAttribute('data-ntqf')?'from':'to']=+t.value;queueSave();NT.queue(true);xRender();return}
  if(t.hasAttribute('data-ntpush')){if(t.checked){t.disabled=true;let r={ok:false,why:'x'};try{r=await NT.subscribe()}catch(err){r={ok:false,why:'x'}}t.disabled=false;
      if(!r.ok){t.checked=false;toast(r.why==='install'?'Add Sprout to your Home Screen first, then turn this on there':r.why==='denied'?'Notifications are blocked. Allow them for Sprout in your phone’s Settings.':r.why==='code'?'Add your access code first, in Bank sync, AI and backup':'Couldn’t turn on notifications. Try again in a moment.')}else toast('Notifications are on')}
    else{await NT.unsubscribe();toast('Notifications are off')}xRender()}});
document.addEventListener('click',async e=>{const t=e.target;if(!t.closest)return;const mx=t.closest('[data-ntmax]');if(mx){NT.g().max=+mx.dataset.ntmax;queueSave();NT.queue(true);xRender();return}
  const rm=t.closest('[data-ntrm]');if(rm){NT.g().rem.splice(+rm.dataset.ntrm,1);queueSave();NT.queue(true);xRender();return}
  if(t.closest('[data-nttest]')){const j=await liveFetch('/api/push',{op:'test',dev:NT.dev()});toast(j&&j.ok?'Sent. It should show up in a few seconds.':'That didn’t go through. Try turning notifications off and on again.')}});
TITLES.notifs='Notifications';
try{if(window.__S)window.__S.NT=NT}catch(e){}
}
