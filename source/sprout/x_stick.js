// ---------- stick-to-it: green-day streak, savers, milestones, quests ----------
let STK_EXT=null;
const STK_BADGE={3:['First green','Three days on budget','flower'],7:['Green week','A full week under budget','butterfly'],14:['Two strong weeks','Fourteen green days','bird'],30:['Steady month','Thirty days on budget','fruit'],60:['Deep roots','Sixty green days','fireflies'],100:['Hundred club','One hundred days','gold'],180:['Half-year grove','Six months on budget','rainbow'],365:['Evergreen','A full year on budget','crown']};
function SK(){if(!state.stk||typeof state.stk!=='object')state.stk={};const s=state.stk;s.log=s.log||{};s.days=s.days||{};s.aw=s.aw||{};s.qw=s.qw||{};
  if(s.savers==null)s.savers=1;if(s.run==null)s.run=0;if(s.best==null)s.best=0;if(s.kept==null)s.kept=0;if(s.keptAll==null)s.keptAll=0;if(s.banked==null)s.banked=0;if(s.sid==null)s.sid=1;
  if(!s.last){const ck=state.checkin||{},tk=fd(realDay()),yk=fd(realDay()-MS),L=ck.last;let n=(L===tk||L===yk)?(+ck.streak||0):0;
    if(n>0){const last=pd(L);for(let i=0;i<n;i++)s.log[fd(last-i*MS)]='g';s.run=L===tk?n-1:n}s.best=Math.max(+ck.best||0,n);s.last=yk}
  return s}
const greenDay=d=>!!d&&!!d.ck&&d.s<=d.a+0.5;
function stkToday(){const s=SK(),tk=fd(realDay());return s.days[tk]||null}
function streakNow(){if(!state.setup)return 0;const s=SK();return s.run+(greenDay(stkToday())?1:0)}
function stkSettle(){const s=SK(),y=realDay()-MS;let t=pd(s.last)+MS,ev=[];
  while(t<=y){const k=fd(t),d=s.days[k];if(greenDay(d)){s.log[k]='g';s.run++;const kp=Math.max(0,d.a-d.s);s.kept+=kp;s.keptAll+=kp}
    else if(s.run>0&&s.savers>0){s.log[k]='s';s.savers--;ev.push(['saver',k])}
    else{if(s.run>0)ev.push(['broke',k,s.run]);s.log[k]='x';s.run=0;s.kept=0;s.sid++}
    s.best=Math.max(s.best,s.run);t+=MS}
  s.last=fd(y);const cut=fd(realDay()-70*MS);Object.keys(s.days).forEach(k=>{if(k<cut)delete s.days[k]});Object.keys(s.log).forEach(k=>{if(k<fd(realDay()-400*MS))delete s.log[k]});return ev}
let STK_SIG='',STK_BOOT=false;
function stkTick(){if(!state.setup||!rows||!rows.length)return;const s=SK(),tk=fd(realDay());let changed=false;
  if(s.last<fd(realDay()-MS)){const ev=stkSettle();changed=true;if(STK_BOOT)ev.forEach(stkEvent);else setTimeout(()=>ev.forEach(stkEvent),2600)}
  let A=null;try{const sp=(state.spend||[]).map(x=>Object.assign({t:pd(x.d)},x));A=availAt(realToday(),sp)}catch(e){}
  if(A){const ck=(state.checkin||{}).last===tk||!!(state.link&&state.link.on&&fd(Date.UTC(new Date(state.link.at).getFullYear(),new Date(state.link.at).getMonth(),new Date(state.link.at).getDate()))===tk);
    const prev=s.days[tk],d={a:Math.round(Math.max(0,A.perTotal)*100)/100,s:Math.round(Math.max(0,A.usedToday)*100)/100,ck};
    if(!prev||prev.a!==d.a||prev.s!==d.s||prev.ck!==d.ck){if(STK_BOOT&&prev)stkNudge(prev,d);s.days[tk]=d;changed=true}}
  const n=streakNow();if(n>s.best){s.best=n;changed=true}
  let newM=0;MILES.forEach(m=>{if(n>=m&&!s.aw[s.sid+':'+m]){s.aw[s.sid+':'+m]=1;if(m>=7)s.savers=Math.min(3,s.savers+1);newM=m;changed=true}});
  if(newM){const mm=newM;setTimeout(()=>stkMilestone(mm),STK_BOOT?400:3000)}
  const qk=weekKey();if(!s.qw[qk]&&quests().every(q=>q.done)){s.qw[qk]=1;s.savers=Math.min(3,s.savers+1);changed=true;if(STK_BOOT)setTimeout(()=>toast('Weekly quests done! +1 streak saver'),600)}
  if(changed){const sig=JSON.stringify([s.days[tk],s.run,s.savers,s.best]);if(sig!==STK_SIG){STK_SIG=sig;queueSave()}}
  STK_BOOT=true}
function stkEvent(e){if(e[0]==='saver')toast('A streak saver covered '+sdate(pd(e[1]))+'. Your streak lives on.');else if(e[0]==='broke')toast('Your '+e[2]+'-day streak ended on '+sdate(pd(e[1]))+'. Today is day one again. You’ve got this.')}
function stkNudge(p,d){if(!d.ck&&!p.ck&&d.s===p.s)return;const left=d.a-d.s,wasOk=p.s<=p.a+0.5,isOk=d.s<=d.a+0.5;
  if(wasOk&&!isOk)toast('That puts you '+money(d.s-d.a)+' over today. '+(SK().savers>0?'A streak saver will cover it if you need it.':'Spend nothing else today to limit the damage.'));
  else if(isOk&&d.s>p.s&&left<d.a*.25&&left>=0)toast('Still green: '+money(left)+' left today.');
  else if(isOk&&d.ck&&!p.ck)toast('Day locked in. Stay under '+money(Math.max(0,left))+' to keep it green.')}
const weekKey=()=>{const t=realDay(),mon=t-((new Date(t).getUTCDay()+6)%7)*MS;return fd(mon)};
function weekDays(){const mon=pd(weekKey()),out=[];for(let i=0;i<7;i++){const t=mon+i*MS;if(t>realDay())break;out.push(fd(t))}return out}
function dayStatus(k){const s=SK(),tk=fd(realDay());if(k===tk){const d=s.days[k];return greenDay(d)?'g':(d&&d.s>d.a+0.5?'o':'p')}return s.log[k]||(s.days[k]?(greenDay(s.days[k])?'g':'x'):'x')}
function quests(){const s=SK(),W=weekDays(),st=W.map(dayStatus),green=st.filter(x=>x==='g').length,ns=W.filter(k=>{const d=s.days[k];return d&&d.ck&&d.s===0}).length,ck=W.filter(k=>s.days[k]&&s.days[k].ck).length;
  return[{t:'Have 5 green days',n:green,of:5},{t:'Have a no-spend day',n:ns,of:1},{t:'Check in every day',n:ck,of:7}].map(q=>Object.assign(q,{done:q.n>=q.of}))}
function stkMilestone(m){const s=SK(),b=STK_BADGE[m];const ext=STK_EXT&&STK_EXT.onMilestone?STK_EXT.onMilestone(m):'';
  let d=document.getElementById('stk-cel');if(!d){d=document.createElement('div');d.id='stk-cel';d.className='stkcel';document.body.appendChild(d)}
  d.innerHTML='<div class="stkcel-in" role="dialog" aria-modal="true" aria-labelledby="stkcel-t"><div class="stkcel-num">'+m+'</div><h2 id="stkcel-t">'+m+' green days!</h2><p>'+(b?'<b>'+b[0]+'</b> unlocked. Your tree has something new.':'Another milestone on the board.')+(m>=7?' You also earned a <b>streak saver</b>.':'')+'</p>'+ext+
   (s.kept>=1?'<div class="stkcel-kept">You kept <b>'+money0(s.kept)+'</b> under budget this streak.</div><button class="btn" data-stk="bank">Bank it and grow my tree</button>':'')+'<button class="btn alt" data-stk="celok">Keep going</button></div>';
  d.classList.add('on');confetti()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-stk]');if(!b)return;const a=b.dataset.stk,s=SK();
  if(a==='celok'){const d=document.getElementById('stk-cel');if(d)d.classList.remove('on')}
  else if(a==='bank'){const amt=Math.round(s.kept);if(amt<1)return;state.saved=(+state.saved||0)+amt;s.banked+=amt;s.kept=0;queueSave();plan();const d=document.getElementById('stk-cel');if(d)d.classList.remove('on');toast('Banked '+money0(amt)+'. Move it to savings in your bank so it stays put.');if(!document.getElementById('sh-streak').hidden)streakSheet()}
  else if(a==='checkin'){closeSheets();setTimeout(openCheckin,280)}});
// ----- home card -----
function stickCard(){if(!state.setup)return '';const s=SK(),d=stkToday()||{a:0,s:0,ck:false},n=streakNow(),left=d.a-d.s,over=left<-0.5,pct=d.a>0?Math.min(100,d.s/d.a*100):(d.s>0?100:0),near=!over&&pct>=80;
  const st=over?'over':near?'near':'ok',lock=d.ck,nxt=MILES.find(m=>m>n&&!s.aw[s.sid+':'+m]);
  const msg=over?'Over by '+money(-left)+' today. '+(s.savers>0?'A streak saver will cover it ('+s.savers+' left).':'Your streak resets tomorrow.'):lock?'Locked in for today. Stay under '+money(Math.max(0,left))+' to keep it green.':'Check in tonight to lock in day '+(s.run+1)+'.';
  return '<section class="stick '+st+'" aria-label="Today’s budget streak"><button class="stick-top" data-stkopen><span class="stick-ic">'+LEAF('',over?'#d0604d':'#2fae5a')+'</span><span class="stick-t"><b>'+n+'</b> day green streak'+(nxt?'<small>'+(nxt-n)+' to your '+nxt+'-day reward</small>':'')+'</span><span class="stick-sv" aria-label="'+s.savers+' streak savers">'+'<i></i>'.repeat(s.savers)+'</span></button>'+
   '<div class="stick-mid"><span>Today</span><b>'+(over?'−'+money(-left):money(Math.max(0,left)))+'</b><small>'+(over?'over':'left')+' of '+money(d.a)+'</small></div><div class="stick-bar"><i style="width:'+Math.max(2,pct).toFixed(0)+'%"></i></div>'+
   '<div class="stick-msg">'+msg+(!lock?' <button class="lnk" data-stk="checkin">Check in</button>':'')+'</div></section>'}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-stkopen]')){streakSheet();openSheet('sh-streak')}});
// ----- tree decorations from best streak -----
const _treeSvg=treeSvg;
treeSvg=function(st){const s=SK(),b=s.best,svg=_treeSvg(st);let o='';
  if(b>=3)[[34,201],[58,205],[244,204],[268,200],[90,207]].forEach((p,i)=>{o+='<g class="dk-fl"><path d="M'+p[0]+' '+p[1]+'v-9" stroke="#3f9d5d" stroke-width="1.6"/><circle cx="'+p[0]+'" cy="'+(p[1]-11)+'" r="4" fill="'+['#ff9fb2','#ffd166','#c9a7ff','#ff9fb2','#ffffff'][i]+'"/><circle cx="'+p[0]+'" cy="'+(p[1]-11)+'" r="1.6" fill="#f2b84b"/></g>'});
  if(b>=7)o+='<g class="dk-bf"><path d="M212 118c-6-8-14-4-10 3s10 1 10-3zM212 118c6-8 14-4 10 3s-10 1-10-3z" fill="#c9a7ff"/><path d="M212 112v12" stroke="#5b4a8a" stroke-width="1.4"/></g>';
  if(b>=14)o+='<g class="dk-bird"><ellipse cx="96" cy="186" rx="8" ry="6" fill="#5b7fb8"/><circle cx="102" cy="181" r="4" fill="#5b7fb8"/><path d="M106 181l4 1-4 1z" fill="#f2b84b"/><circle cx="103" cy="180" r="1" fill="#fff"/></g>';
  if(b>=30&&st>=2)[[136,128],[166,122],[150,108]].forEach(p=>{o+='<circle cx="'+p[0]+'" cy="'+(p[1]+(st>=3?-40:0))+'" r="4.5" fill="#e5484d"/>'});
  if(b>=60)[[60,90],[110,60],[200,80],[250,120],[180,40]].forEach((p,i)=>{o+='<circle class="dk-ff" style="animation-delay:'+(i*.5)+'s" cx="'+p[0]+'" cy="'+p[1]+'" r="2.4" fill="#fff3a6"/>'});
  if(b>=100)o+='<path d="M150 '+(st>=3?40:150)+'l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#f2c94c" stroke="#c98a12" stroke-width="1"/>';
  return o?svg.replace(/<\/svg>$/,o+'</svg>'):svg};
// ----- streak sheet -----
streakSheet=function(){const s=SK(),n=streakNow(),d=stkToday()||{a:0,s:0,ck:false},nxt=MILES.find(m=>m>n&&!s.aw[s.sid+':'+m])||null,prev=MILES.filter(m=>m<=n).pop()||0,pct=nxt?Math.max(3,(n-prev)/(nxt-prev)*100):100;
  const mon=pd(weekKey()),names=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],tk=fd(realDay());
  const ico={g:LEAF('','#2fae5a'),s:'<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="#5b7fb8"/></svg>',x:'<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="#e9b0a8"/><path d="M9 9l6 6M15 9l-6 6" stroke="#b5483c" stroke-width="2" stroke-linecap="round"/></svg>',o:'<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="#f6d5a0"/><path d="M12 7v6M12 16h.01" stroke="#9a5b00" stroke-width="2.2" stroke-linecap="round"/></svg>',p:'<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#2fae5a" stroke-width="2" stroke-dasharray="3 3"/></svg>',f:'<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#c9d6ce" stroke-width="1.6" stroke-dasharray="3 3"/></svg>'};
  const wk=names.map((nm,i)=>{const t=mon+i*MS,k=fd(t),stt=t>realDay()?'f':dayStatus(k);return '<div class="'+(stt==='g'?'on':'')+'">'+ico[stt]+nm+'</div>'}).join('');
  const Q=quests(),qdone=!!s.qw[weekKey()];
  const badges=MILES.filter(m=>STK_BADGE[m]).map(m=>{const b=STK_BADGE[m],got=s.best>=m;return '<div class="bdg2'+(got?' got':'')+'"><span>'+(got?LEAF('','#2fae5a'):'<b>'+m+'</b>')+'</span><b>'+b[0]+'</b><small>'+(got?b[1]:m+' days')+'</small></div>'}).join('');
  $('#stk-body').innerHTML='<div class="sk-hero">'+LEAF('bigleaf',n>0?'#2fae5a':'#b5c9bc')+'<div class="sk-num">'+n+'</div><div class="sk-lbl">Green day streak</div><div class="sk-sub">'+(n>0?'Days in a row you stayed within budget':'Stay within today’s budget and check in to start')+'</div></div>'+
   '<div class="three3"><div><b>'+(d.a>0||d.s>0?(d.s>d.a+0.5?'Over':money(Math.max(0,d.a-d.s))):'—')+'</b><span>'+(d.s>d.a+0.5?'Today':'Left today')+'</span></div><div><b>'+s.best+' day'+(s.best===1?'':'s')+'</b><span>Best streak</span></div><div><b>'+s.savers+' / 3</b><span>Streak savers</span></div></div>'+
   (!d.ck?'<button class="btn" data-stk="checkin">Check in to lock in today</button>':'')+
   '<div class="sk-card"><h4>This week</h4><div class="sk-wk">'+wk+'</div></div>'+
   '<div class="sk-card"><div class="sk-ms"><div class="sk-msb'+(prev?'':' off')+'">'+prev+'</div><div class="sk-mst"><div class="sk-tr"><i style="width:'+pct.toFixed(0)+'%"></i></div>'+(nxt?(nxt-n)+' more green day'+(nxt-n===1?'':'s')+' to unlock <b>'+(STK_BADGE[nxt]?STK_BADGE[nxt][0]:'your next milestone')+'</b>'+(nxt>=7?' and a streak saver':''):'You have reached every milestone')+'</div><div class="sk-msb off">'+(nxt||'★')+'</div></div></div>'+
   (STK_EXT&&STK_EXT.sheet?STK_EXT.sheet(n):'')+
   '<div class="sk-card"><h4>Weekly quests'+(qdone?' · done':'')+'</h4>'+Q.map(q=>'<div class="qrow'+(q.done?' done':'')+'"><span class="qck">'+(q.done?'✓':'')+'</span><span style="flex:1">'+q.t+'</span><b>'+Math.min(q.n,q.of)+'/'+q.of+'</b></div>').join('')+'<p class="note" style="margin:6px 0 0">Finish all three for a free streak saver.</p></div>'+
   '<div class="sk-card"><h4>Money you kept</h4><div class="kept"><div><b>'+money0(s.kept)+'</b><span>under budget this streak</span></div><div><b>'+money0(s.banked)+'</b><span>banked so far</span></div></div>'+(s.kept>=1?'<button class="btn alt" data-stk="bank">Bank '+money0(s.kept)+' and grow my tree</button>':'<p class="note" style="margin:0">Every green day, what you didn’t spend from your daily budget adds up here.</p>')+'</div>'+
   '<div class="sk-card"><h4>Rewards</h4><div class="bdgs">'+badges+'</div></div>'+
   '<details class="sk-card"><summary style="font-weight:800;cursor:pointer">How green days work</summary><p class="note" style="margin:8px 0 0">A green day means you checked in'+(typeof lkOpen==='function'?' (or your accounts synced)':'')+' and spent no more than that day’s safe-to-spend. Green days in a row make your streak. If you slip, a streak saver covers the day automatically. You earn savers at milestones from 7 days on and by finishing the weekly quests, and you can hold up to 3. Your best streak and badges are kept forever.</p></details>'};
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#stk-cel [data-x]')){const d=document.getElementById('stk-cel');if(d)d.classList.remove('on')}},true);
