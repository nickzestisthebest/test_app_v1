// ---------- v2: leagues + Plus milestone credit (demo) ----------
const CASH={7:1,14:2,30:5,60:8,100:12,180:20,365:30};
const TIERS=['Seed','Sprout','Sapling','Oak','Redwood'];
const LGN=['maya.pays','dee.dollars','jon.grows','priya.saves','sam.steady','lena.l','omar.budgets','kai.saves','rosa.r'];
const hsh=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
function RW(){const x=X();x.rw=x.rw||{bal:0,log:[]};return x.rw}
const plusOn=()=>{const x=X();return !!(x.plus&&x.plus.on)};
function league(){const s=SK(),wk=weekKey();s.lg=s.lg||{tier:0,wk,rank:5};
  if(s.lg.wk!==wk){const r=s.lg.rank,old=s.lg.tier;if(r<=3)s.lg.tier=Math.min(TIERS.length-1,old+1);else if(r>=9)s.lg.tier=Math.max(0,old-1);s.lg.wk=wk;queueSave();
    if(s.lg.tier!==old)setTimeout(()=>toast(s.lg.tier>old?'Promoted to the '+TIERS[s.lg.tier]+' League!':'Moved to the '+TIERS[s.lg.tier]+' League. Climb back this week.'),1200)}
  const W=weekDays(),el=W.length,me=W.filter(k=>dayStatus(k)==='g').length;
  const L=LGN.map(n=>{const h=hsh(n+wk+s.lg.tier);return{n,g:Math.min(el,Math.max(0,el-(h%3)-(h%5===0?1:0)-(h%11===0?2:0))),st:12+h%90}});
  if(!(P().lbhide))L.push({n:'You',g:me,st:streakNow(),me:1});
  L.sort((a,b)=>b.g-a.g||b.st-a.st);const rank=L.findIndex(z=>z.me)+1;if(rank)s.lg.rank=rank;
  const end=pd(wk)+7*MS,left=Math.round((end-realDay())/MS);return{L,rank,tier:s.lg.tier,left,me}}
function leagueHTML(){const g=league(),hide=!!P().lbhide;
  return '<div class="xhero"><span class="k">This week</span><b>'+TIERS[g.tier]+' League</b><span class="d">'+(hide?'You are hidden from leaderboards.':'You are #'+g.rank+' with '+g.me+' green day'+(g.me===1?'':'s')+'. ')+'Ends in '+g.left+' day'+(g.left===1?'':'s')+'.</span></div>'+
  '<div class="xcard"><small class="xhint">Top 3 move up a league. Bottom 2 move down. Ranked by green days this week, then streak. Only days are shown, never dollar amounts.</small>'+
  g.L.map((z,i)=>'<div class="xrow lgrow'+(z.me?' me':'')+(i<3?' up':i>=g.L.length-2?' down':'')+'"><b class="lgn">'+(i+1)+'</b>'+avt(z.me?(state.name||'You'):z.n)+'<div class="xt"><b>'+(z.me?(state.name?esc(state.name)+' (you)':'You'):esc(z.n))+'</b><small>'+z.st+' day streak</small></div><div class="xr">'+z.g+'<small>green days</small></div></div>').join('')+'</div>'+
  '<div class="xcard"><h3>Friends</h3><small class="xhint">Invite friends to a private league and keep each other on budget.</small><button class="sbtn" data-x="lginvite">Invite a friend</button></div>'+
  '<label class="xtog"><span>Show me on leaderboards<small>Turn off to stay private</small></span><input type="checkbox" class="sw" data-x="lbtog"'+(hide?'':' checked')+'></label>'}
STK_EXT={
 onMilestone(m){const c=CASH[m];if(!c)return '';if(plusOn()){const r=RW();r.bal+=c;r.log.unshift({m,c,at:fd(realDay())});sv();return '<div class="stkcel-cash">Sprout Plus reward: <b>'+money0(c)+' credit</b> added to your rewards (demo).</div>'}
   return '<div class="stkcel-cash">With Sprout Plus, this milestone earns <b>'+money0(c)+'</b> back. <button class="lnk" style="color:#fff;text-decoration:underline" data-x="open" data-v="plus">See Plus</button></div>'},
 sheet(n){const g=league(),r=RW(),on=plusOn(),tot=Object.values(CASH).reduce((a,b)=>a+b,0);
   return '<button class="sk-card lgcard" data-x="lgopen"><h4>Leaderboard</h4><div style="display:flex;align-items:center;gap:10px"><b style="font-family:var(--f-big);font-size:26px">'+(P().lbhide?'—':'#'+g.rank)+'</b><span style="flex:1;text-align:left">'+TIERS[g.tier]+' League · '+g.me+' green day'+(g.me===1?'':'s')+' this week</span><span class="schev">›</span></div></button>'+
   '<div class="sk-card"><h4>Plus rewards'+(on?' · '+money0(r.bal)+' earned':'')+'</h4><p class="note" style="margin:0 0 8px">Keep your streak and earn Plus credit at each milestone, up to the full price of Plus.'+(on?'':' Available with Sprout Plus.')+'</p><div class="rwt">'+Object.keys(CASH).map(m=>'<div class="'+(n>=+m?'got':'')+'"><b>'+money0(CASH[m])+'</b><span>'+m+' days</span></div>').join('')+'</div>'+
   (on?(r.bal>0?'<button class="btn alt" data-x="rwredeem">Use '+money0(r.bal)+' on my next Plus bill</button>':''):'<button class="btn" data-x="open" data-v="plus">Try Plus free</button>')+'<p class="note" style="margin:6px 0 0">Demo. Credit can’t be more than what you’ve paid for Plus.</p></div>'}};

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x]');if(!b||b.type==='checkbox')return;const a=b.dataset.x;
  if(a==='lgopen'){closeSheets();SEG='leagues';setTimeout(()=>setTab('community'),280)}
  else if(a==='lginvite')toast('Invite link copied (demo)');
  else if(a==='rwredeem'){const r=RW();toast(money0(r.bal)+' will come off your next Plus bill (demo)');r.log.unshift({m:'redeem',c:-r.bal,at:fd(realDay())});r.bal=0;sv();streakSheet()}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.x==='lbtog'){P().lbhide=!t.checked;savePrefs();pgRender()}});
