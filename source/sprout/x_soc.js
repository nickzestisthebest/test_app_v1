// ----- community (demo: example members, posts stay on this device) -----
const SEED=[
 {id:'s1',who:'maya.pays',t:'2h',type:'progress',tag:'Wins',txt:'Paid off my first credit card today. I started at $4,200 in March and checked in almost every day.',card:{pct:100,stage:3,streak:88},lk:142,cm:[['dee.dollars','Huge. The last payment is the best feeling.'],['jon.grows','What did you do with the freed up minimum?'],['maya.pays','Rolled it straight into the next card.']]},
 {id:'s2',who:'dee.dollars',t:'5h',type:'tip',tag:'Tips',txt:'Called my internet company and calmly said I was thinking of switching. They dropped me from $75 to $55 a month. It took six minutes.',lk:96,cm:[['priya.saves','Trying this tonight.'],['sam.steady','Works for phone plans too.']]},
 {id:'s3',who:'jon.grows',t:'9h',type:'progress',tag:'Debt',txt:'38% of the way through my debt. The tree finally looks like a tree.',card:{pct:38,stage:2,streak:21},lk:58,cm:[['maya.pays','Keep going, the middle is the hardest part.']]},
 {id:'s4',who:'lena.l',t:'1d',type:'question',tag:'Debt',txt:'My student loan has no minimum. Do you pay it every month, or hold the cash as a buffer? I pay about $150 and keep one paycheck saved.',lk:41,cm:[['dee.dollars','High interest first, then loans. Buffer always comes before extra payments.'],['priya.saves','I do $100 and it feels balanced.']]},
 {id:'s5',who:'sam.steady',t:'1d',type:'win',tag:'Wins',txt:'Four weeks in a row with no dining out. Saved $212 and it did not feel like a sacrifice.',lk:77,cm:[['lena.l','Teach me your ways.']]},
 {id:'s6',who:'priya.saves',t:'2d',type:'win',tag:'Wins',txt:'Hit a 30 day check-in streak. Small habit, big difference.',card:{pct:22,stage:1,streak:30},lk:64,cm:[]}];
const QSEED=[
 {id:'q1',who:'lena.l',t:'1d',tag:'Debt',q:'Avalanche or snowball when one card is 29% and the other is a small balance?',v:34,ans:[['maya.pays','Avalanche saves the most money. Snowball can keep you motivated. Pick whichever you will actually stick with.',22,1],['jon.grows','I did snowball for the first win, then switched.',9,0]]},
 {id:'q2',who:'priya.saves',t:'2d',tag:'Budgeting',q:'How much should I keep in checking before I send extra to debt?',v:28,ans:[['dee.dollars','One paycheck is a good floor. Less than that and a surprise bill puts you back on the card.',18,1]]},
 {id:'q3',who:'sam.steady',t:'3d',tag:'Credit',q:'Will paying down a card really move my score, or is that a myth?',v:19,ans:[['maya.pays','Usage matters a lot. Getting under 30% of the limit helped me most.',12,1]]},
 {id:'q4',who:'jon.grows',t:'4d',tag:'Saving',q:'Best way to save for a car repair fund while paying off debt?',v:15,ans:[]}];
const GSEED=[
 {id:'g1',name:'Debt-Free December',desc:'Aiming to clear a balance before year end.',mem:2412,ch:'Pay one extra payment every week'},
 {id:'g2',name:'No-Spend Challenge',desc:'14 days of no dining out, together.',mem:1180,ch:'14 days, no dining out',days:14},
 {id:'g3',name:'Student Loan Squad',desc:'Tips, forgiveness news and payoff stories.',mem:3071},
 {id:'g4',name:'Paycheck to Paycheck',desc:'Making it work, one pay period at a time.',mem:1865},
 {id:'g5',name:'Side Hustle Money',desc:'Where to put extra income.',mem:934},
 {id:'g6',name:'Couples and Money',desc:'Talking about money kindly.',mem:1402}];
const LB=[['maya.pays',14],['sam.steady',13],['dee.dollars',11],['jon.grows',9],['priya.saves',8]];
let SEG='feed',COMP={type:'progress',att:true,hide:true,txt:''},TAB='money',ASK={tag:'Debt'},QF='All';
const allPosts=()=>X().soc.posts.concat(SEED);
const stageNow=()=>{const sc=sproutScore();let st=0;GROW.forEach((g,i)=>{if(sc>=g[1])st=i});return st};
function myCard(hide){const b=Math.max(+state.startDebt||0,totalDebt()),paid=Math.max(0,b-totalDebt());return{pct:b>0?Math.min(100,Math.round(paid/b*100)):0,stage:stageNow(),streak:streakNow(),paid:hide?null:Math.round(paid)}}
function pcardHTML(c){const col=['#8a6b3a','#2fae5a','#27994f','#1f7a42','#1f7a42'][Math.min(4,c.stage)];
  return '<div class="pcard"><div class="rw">'+LEAF('tr',col).replace('width="26" height="26"','')+'<div style="flex:1"><div style="font-size:12px;font-weight:800;color:var(--muted);letter-spacing:.06em;text-transform:uppercase">'+(GROW[c.stage]||GROW[0])[0]+' stage</div><b>'+(c.paid!=null&&c.paid>0?money0(c.paid)+' paid off':c.pct+'% paid off')+'</b></div><div style="text-align:right"><div style="font-size:12px;font-weight:800;color:var(--muted)">STREAK</div><b>'+c.streak+'</b></div></div><div class="xbar"><i style="width:'+Math.max(3,c.pct)+'%"></i></div></div>'}
function postHTML(p){const s=X().soc,lk=!!s.like[p.id],sv_=!!s.save[p.id],n=(p.cm||[]).length+(s.cm[p.id]||[]).length;if(s.mute[p.who])return '';
  return '<article class="post"><div class="ph2">'+avt(p.who)+'<div class="xt"><b>'+esc(p.who)+'</b><small>'+p.t+' ago'+(p.mine?' · only visible to you (demo)':'')+'</small></div><span class="tagc">'+esc(p.tag)+'</span></div><p>'+esc(p.txt)+'</p>'+(p.card?pcardHTML(p.card):'')+
  '<div class="acts"><button data-x="like" data-v="'+p.id+'" class="'+(lk?'on':'')+'" aria-label="Cheer" aria-pressed="'+lk+'">'+ic('leaf')+((p.lk||0)+(lk?1:0))+'</button><button data-x="open" data-v="comments" data-w="'+p.id+'" aria-label="Comments">'+ic('chat')+n+'</button><span class="sp"></span><button data-x="save" data-v="'+p.id+'" class="'+(sv_?'on':'')+'" aria-label="Save" aria-pressed="'+sv_+'">'+ic('mark')+'</button><button data-x="report" data-v="'+p.id+'" aria-label="More">'+ic('more')+'</button></div></article>'}
function socHTML(){const s=X().soc;let body='';
  if(SEG==='feed')body=allPosts().map(postHTML).join('')||'<div class="xcard"><small class="xhint">Nothing here yet.</small></div>';
  else if(SEG==='qa'){const tags=['All','Debt','Budgeting','Credit','Saving'],qs=s.qs.concat(QSEED).filter(q=>QF==='All'||q.tag===QF);
    body='<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px">'+tags.map(t=>'<button class="sbtn '+(QF===t?'':'alt')+'" data-x="qf" data-v="'+t+'">'+t+'</button>').join('')+'</div><button class="xplus" data-x="open" data-v="ask" style="background:linear-gradient(120deg,#17863a,#2fae5a)"><span><b>Ask the community</b><small>Money questions, answered kindly</small></span></button>'+
    qs.map(q=>{const n=q.ans.length+(s.ans[q.id]||[]).length,vt=!!s.vote[q.id];return '<article class="post"><div style="display:flex;gap:12px"><div class="vote"><button data-x="vote" data-v="'+q.id+'" class="'+(vt?'on':'')+'" aria-label="Upvote">'+ic('up').replace('<svg','<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"')+'</button>'+(q.v+(vt?1:0))+'</div><div style="flex:1;cursor:pointer" data-x="open" data-v="q" data-w="'+q.id+'" role="button" tabindex="0"><b style="font-size:16px;line-height:1.35">'+esc(q.q)+'</b><div style="margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="tagc">'+esc(q.tag)+'</span><small class="xhint">'+n+' answer'+(n===1?'':'s')+' · '+esc(q.who)+' · '+q.t+'</small>'+(q.ans.some(a=>a[3])?'<span class="chip">Answered</span>':'')+'</div></div></div></article>'}).join('');
  }else if(SEG==='leagues'){body=leagueHTML()}else{body='<div class="xhint">Groups are example communities for the demo.</div>'+GSEED.map(g=>{const j=!!s.join[g.id];return '<div class="xrow" data-x="open" data-v="group" data-w="'+g.id+'" role="button" tabindex="0">'+avt(g.name)+'<div class="xt"><b>'+g.name+'</b><small>'+(g.mem+(j?1:0)).toLocaleString()+' members · '+g.desc+'</small></div><button class="sbtn '+(j?'alt':'')+'" data-x="join" data-v="'+g.id+'">'+(j?'Joined':'Join')+'</button></div>'}).join('')}
  return '<div class="pgh"><div><h1>Community</h1><small>Grow together</small></div><button class="sbtn" data-x="open" data-v="compose">+ Share</button></div><div class="xseg" role="tablist">'+[['feed','Feed'],['qa','Q&A'],['groups','Groups'],['leagues','Leagues']].map(t=>'<button data-x="seg" data-v="'+t[0]+'" class="'+(SEG===t[0]?'on':'')+'">'+t[1]+'</button>').join('')+'</div>'+body+
  '<p class="xhint" style="text-align:center">Example members and posts. What you write stays on this device in the demo. Be kind, never share account numbers, and remember this is not financial advice.</p>'}
function moneyHTML(){const n=netWorth(),T=subTotals(),ms=monthSpend(),tot=BCATS.reduce((a,c)=>a+ms[c[0]],0),lim=BCATS.reduce((a,c)=>a+budLim(c),0),cr=creditScore(),al=alerts().length,neg=negoList().filter(z=>!z.done).reduce((a,z)=>a+z.pot,0),v=X().vault,h=X().house;
  const tile=(pg,ico,t,s,em)=>'<button class="xtile" data-x="open" data-v="'+pg+'"><span class="ico">'+ic(ico)+'</span><b>'+t+'</b>'+(em?'<em>'+em+'</em>':'')+'<small>'+s+'</small></button>';
  return '<div class="pgh"><div><h1>Money</h1><small>Everything in one place</small></div><button class="sbtn alt" data-x="open" data-v="alerts" aria-label="Alerts">'+(al?al+' alert'+(al>1?'s':''):'No alerts')+'</button></div>'+
  '<button class="xhero" data-x="open" data-v="networth" style="border:0;text-align:left;font:inherit;color:inherit;cursor:pointer"><span class="k">Net worth</span><b class="'+(n.N<0?'dn':'')+'">'+money0(n.N)+'</b><span class="d">'+money0(totalDebt())+' still owed · tap for the trend</span></button>'+
  (al?'<button class="xalert" data-x="open" data-v="alerts">'+ic('bell')+'<span style="flex:1">'+alerts()[0].t+'</span>›</button>':'')+
  '<div class="xgrid">'+tile('subs','repeat','Subscriptions',T.n+' active · '+money0(T.mo*12)+'/yr',T.unused?money0(T.unused)+'/mo unused':'')+tile('nego','phone','Lower my bills','We negotiate for you','Save ~'+money0(neg)+'/mo')+tile('budgets','pie','Budgets',Math.round(tot/Math.max(1,lim)*100)+'% used this month')+tile('credit','gauge','Credit score','Example score',String(cr.s))+tile('vault','vault','Savings vault',money0(v.bal)+' saved (demo)')+tile('calendar','cal','Bill calendar','Never miss a due date')+tile('house','users','Partner',h&&h.st==='on'?'Sharing with Alex':'Share with someone')+tile('alerts','bell','Alerts',al?al+' to review':'All clear')+'</div>'+
  '<button class="xplus" data-x="open" data-v="plus"><span style="flex:1"><b>Sprout Plus</b><small>Preview paid plans. No charge in the demo.</small></span><span>›</span></button>'}
function pgRender(){const P=$('#pg');if(!P||P===DUMMY)return;P.innerHTML=TAB==='community'?socHTML():moneyHTML();tbSync()}
function setTab(t){TAB=t;VIEW='tab';document.body.classList.remove('view-ov','view-detail');document.body.classList.add('view-tab');pgRender();window.scrollTo(0,0)}
function tbSync(){const on=n=>VIEW==='tab'?TAB===n:n==='home';document.querySelectorAll('.tb[data-tab]').forEach(b=>{const v=on(b.dataset.tab);b.classList.toggle('on',v);b.setAttribute('aria-current',v?'page':'false')});const bd=document.getElementById('tb-bdg');if(bd){const n=alerts().length;bd.textContent=n;bd.hidden=!n}}
PAGES.comments=id=>{const p=allPosts().find(z=>z.id===id);if(!p)return '';const mine=X().soc.cm[id]||[];
  return '<div class="ph2">'+avt(p.who)+'<div class="xt"><b>'+esc(p.who)+'</b><small>'+p.t+' ago</small></div></div><p style="margin:0">'+esc(p.txt)+'</p>'+
  (p.cm||[]).map(c=>'<div class="cmt">'+avt(c[0])+'<div class="bub"><b>'+esc(c[0])+'</b><br>'+esc(c[1])+'</div></div>').join('')+mine.map(c=>'<div class="cmt">'+avt('You')+'<div class="bub"><b>You</b><br>'+esc(c)+'</div></div>').join('')+
  '<div class="xin"><input id="cm-in" type="text" maxlength="280" placeholder="Add a kind comment" aria-label="Comment"><button class="sbtn" data-x="cmsend" data-v="'+id+'">Send</button></div>'};
PAGES.compose=()=>{const types=[['progress','Progress'],['win','Win'],['tip','Tip'],['question','Question']],c=myCard(COMP.hide);
  return '<div class="xf"><div style="display:flex;gap:6px;flex-wrap:wrap">'+types.map(t=>'<button class="sbtn '+(COMP.type===t[0]?'':'alt')+'" data-x="ctype" data-v="'+t[0]+'">'+t[1]+'</button>').join('')+'</div><textarea id="cp-txt" maxlength="500" placeholder="'+({progress:'Tell people how it is going',win:'Share a win, big or small',tip:'Share something that worked',question:'What do you want to ask?'})[COMP.type]+'">'+esc(COMP.txt)+'</textarea></div>'+
  '<label class="xtog"><span>Attach my progress card<small>Your stage, streak and how much is paid off</small></span><input type="checkbox" class="sw" data-x="catt"'+(COMP.att?' checked':'')+'></label>'+
  (COMP.att?'<label class="xtog"><span>Hide dollar amounts<small>Show percent only. Recommended.</small></span><input type="checkbox" class="sw" data-x="chide"'+(COMP.hide?' checked':'')+'></label>'+pcardHTML(c):'')+
  '<button class="btn" data-x="cpost">Post</button>'+demoNote('Demo mode. Your post is shown only to you on this device.')};
PAGES.q=id=>{const q=X().soc.qs.concat(QSEED).find(z=>z.id===id);if(!q)return '';const mine=X().soc.ans[id]||[];
  return '<div><span class="tagc">'+esc(q.tag)+'</span><h3 style="font-family:var(--f-big);font-size:22px;font-weight:600;margin:8px 0 2px;text-transform:none;letter-spacing:0;color:var(--ink)">'+esc(q.q)+'</h3><small class="xhint">Asked by '+esc(q.who)+' · '+q.t+' ago</small></div>'+
  q.ans.map(a=>'<div class="xcard"><div style="display:flex;gap:8px;align-items:center">'+avt(a[0])+'<b style="flex:1">'+esc(a[0])+'</b>'+(a[3]?'<span class="chip">Best answer</span>':'')+'</div><p style="margin:0">'+esc(a[1])+'</p><small class="xhint">'+a[2]+' found this helpful</small></div>').join('')+
  mine.map(a=>'<div class="xcard"><div style="display:flex;gap:8px;align-items:center">'+avt('You')+'<b>You</b></div><p style="margin:0">'+esc(a)+'</p></div>').join('')+(q.ans.length+mine.length?'':'<div class="xcard"><small class="xhint">No answers yet. Be the first.</small></div>')+
  '<div class="xf"><textarea id="an-in" maxlength="500" placeholder="Share what worked for you"></textarea><button class="btn" data-x="answer" data-v="'+id+'">Post answer</button></div><button class="lnk" data-x="asksprout" style="align-self:center">Ask Sprout for a quick answer</button>'};
PAGES.ask=()=>'<div class="xf"><div style="display:flex;gap:6px;flex-wrap:wrap">'+['Debt','Budgeting','Credit','Saving'].map(t=>'<button class="sbtn '+(ASK.tag===t?'':'alt')+'" data-x="atag" data-v="'+t+'">'+t+'</button>').join('')+'</div><textarea id="aq-in" maxlength="200" placeholder="Ask a money question"></textarea><button class="btn" data-x="aqpost">Post question</button></div>'+demoNote('Demo mode. Questions stay on this device. In the full release, other members answer.');
PAGES.group=id=>{const g=GSEED.find(z=>z.id===id);if(!g)return '';const s=X().soc,j=!!s.join[id],ch=s.chal[id]||[],tk=fd(realDay()),done=ch.includes(tk),posts=SEED.filter((p,i)=>i%GSEED.length===GSEED.indexOf(g)||i===0).slice(0,2);
  const rank=LB.concat([['You',ch.length]]).sort((a,b)=>b[1]-a[1]);
  return '<div class="ph2">'+avt(g.name)+'<div class="xt"><b style="font-size:18px">'+g.name+'</b><small>'+(g.mem+(j?1:0)).toLocaleString()+' members</small></div><button class="sbtn '+(j?'alt':'')+'" data-x="join" data-v="'+g.id+'">'+(j?'Joined':'Join')+'</button></div><p style="margin:0">'+g.desc+'</p>'+
  (g.ch?'<div class="xcard"><h3>Group challenge</h3><b>'+g.ch+'</b>'+(g.days?'<div class="xbar"><i style="width:'+Math.round(ch.length/g.days*100)+'%"></i></div><small class="xhint">'+ch.length+' of '+g.days+' days</small>':'')+(j?'<button class="btn'+(done?' alt':'')+'" data-x="tick" data-v="'+id+'">'+(done?'Done today ✓':'Check in for today')+'</button>':'<small class="xhint">Join the group to take part.</small>')+
  (g.days?'<h3>Leaderboard</h3>'+rank.map((r,i)=>'<div class="xrow">'+avt(r[0])+'<div class="xt"><b>'+(i+1)+'. '+esc(r[0])+'</b></div><div class="xr">'+r[1]+' days</div></div>').join(''):'')+'</div>':'')+
  '<h3 class="xh">Recent</h3>'+posts.map(postHTML).join('')};
Object.assign(TITLES,{comments:'Comments',compose:'Share with the community',q:'Question',ask:'Ask the community',group:'Group'});
// ----- handlers -----
function vlog(t,d,a){const v=X().vault;v.log.unshift({t,d:fdate(realDay()),a});v.log=v.log.slice(0,20)}
function afterChange(){sv();if(VIEW==='tab')pgRender();if(document.getElementById('sh-x')&&!document.getElementById('sh-x').hidden)xRender()}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-tab]');if(!t)return;const n=t.dataset.tab;if(n==='home')goHome();else{closeSheets();if(txOpen)closeTx();setTab(n)}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[role=button][data-x]')){e.preventDefault();e.target.click()}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x]');if(!b)return;if(b.type==='checkbox')return;const a=b.dataset.x,v=b.dataset.v,w=b.dataset.w,x=X();
  if(e.target.closest('button[data-x]')&&e.target.closest('button[data-x]')!==b){}
  switch(a){
   case 'open':{if(v==='group'||v==='q'||v==='comments'||v==='cancel'||v==='negogo')xGo(v,w);else if(v==='calendar'){CALS=null;xGo(v)}else xGo(v);break}
   case 'back':xBack();break;
   case 'crr':CRR=+v;xRender();break;
   case 'crev':crScrub(+v);break;
   case 'seg':SEG=v;pgRender();break;
   case 'runcancel':runSteps('cancel',v,3,()=>{x.subs[v]={s:'cancelled',at:Date.now()};sv();xRender();pgRender();toast('Cancelled (demo)');confetti()});break;
   case 'keep':xBack();toast('Kept. Sprout will remind you before it renews.');break;
   case 'remind':toast('Reminder set for 3 days before it renews (demo)');break;
   case 'redir':{const r=x.subs[v]||{};r.redir=true;x.subs[v]=r;afterChange();toast('That money now counts toward your debt (demo)');break}
   case 'runnego':{XP.page='negogo';XP.arg=v;XP.stack.push(['nego',null]);runSteps('nego',v,4,()=>{const n=negoList().find(z=>z.id===v);x.nego[v]={sv:Math.round(n.pot*.85*100)/100,at:Date.now()};sv();xRender();pgRender();toast('Saved '+money(x.nego[v].sv)+' a month (demo)');confetti()});break}
   case 'bud':{const c=BCATS.find(z=>z[0]===v);x.bud[v]=Math.max(25,budLim(c)+ +w);afterChange();break}
   case 'vadd':{const am=+v;if(am<0&&x.vault.bal<-am){toast('Not enough in the vault');break}x.vault.bal+=am;vlog(am>0?'Added to vault':'Taken out','Demo',am);afterChange();break}
   case 'vfund':{if(x.vault.bal<25){toast('Add to the vault first');break}x.vault.bal-=25;x.vault.al[v]=(x.vault.al[v]||0)+25;vlog('Moved to '+v,'Goal',-25);afterChange();break}
   case 'calsel':CALS.sel=v;xRender();break;
   case 'calnav':{let m=CALS.m+ +v,y=CALS.y;if(m<0){m=11;y--}if(m>11){m=0;y++}CALS={y,m,sel:y+'-'+String(m+1).padStart(2,'0')+'-01'};xRender();break}
   case 'alertgo':xGo(v);break;
   case 'alertdis':case 'alertok':x.dis[v]=1;afterChange();tbSync();break;
   case 'hinvite':x.house={st:'sent',code:Math.random().toString(36).slice(2,8)};afterChange();break;
   case 'haccept':x.house.st='on';afterChange();toast('Alex joined (demo)');break;
   case 'hleave':x.house=null;afterChange();break;
   case 'pbill':x.plus=Object.assign({},x.plus,{bill:v});afterChange();break;
   case 'pstart':x.plus=Object.assign({},x.plus,{on:1});afterChange();toast('Demo trial started. No payment taken.');confetti();break;
   case 'pstop':x.plus=Object.assign({},x.plus,{on:0});afterChange();break;
   case 'like':x.soc.like[v]=!x.soc.like[v];afterChange();break;
   case 'save':x.soc.save[v]=!x.soc.save[v];afterChange();toast(x.soc.save[v]?'Saved':'Removed from saved');break;
   case 'report':{const p=allPosts().find(z=>z.id===v);if(p&&!p.mine){x.soc.mute[p.who]=1;afterChange();toastAct('Reported and hidden (demo)','Undo',()=>{delete X().soc.mute[p.who];afterChange()})}else toast('This is your own post');break}
   case 'cmsend':{const i=$('#cm-in'),tx=(i.value||'').trim();if(!tx)break;(x.soc.cm[v]=x.soc.cm[v]||[]).push(tx);afterChange();break}
   case 'ctype':COMP.txt=($('#cp-txt').value||'');COMP.type=v;xRender();break;
   case 'cpost':{const tx=($('#cp-txt').value||'').trim();if(!tx){toast('Write something first');break}const card=COMP.att?myCard(COMP.hide):null;x.soc.posts.unshift({id:'u'+Date.now(),who:state.name||'You',t:'now',type:COMP.type,tag:({progress:'Debt',win:'Wins',tip:'Tips',question:'Debt'})[COMP.type],txt:tx,card,lk:0,cm:[],mine:true});x.soc.posts=x.soc.posts.slice(0,30);COMP.txt='';SEG='feed';closeSheets();afterChange();toast('Posted (demo). Only you can see it.');confetti();break}
   case 'catt':break;
   case 'qf':QF=v;pgRender();break;
   case 'vote':x.soc.vote[v]=!x.soc.vote[v];afterChange();break;
   case 'atag':ASK.tag=v;{const t=$('#aq-in').value;xRender();$('#aq-in').value=t}break;
   case 'aqpost':{const q=($('#aq-in').value||'').trim();if(!q){toast('Type your question first');break}x.soc.qs.unshift({id:'m'+Date.now(),who:state.name||'You',t:'now',tag:ASK.tag,q,v:0,ans:[]});SEG='qa';closeSheets();afterChange();toast('Question posted (demo)');break}
   case 'answer':{const tx=($('#an-in').value||'').trim();if(!tx)break;(x.soc.ans[v]=x.soc.ans[v]||[]).push(tx);afterChange();break}
   case 'asksprout':closeSheets();setTimeout(()=>openSheet('sh-ask'),300);break;
   case 'join':{e.stopPropagation();x.soc.join[v]=!x.soc.join[v];afterChange();toast(x.soc.join[v]?'Joined':'Left group');break}
   case 'tick':{const ch=x.soc.chal[v]=x.soc.chal[v]||[],k=fd(realDay()),i=ch.indexOf(k);if(i>=0)ch.splice(i,1);else{ch.push(k);toast('Checked in. Keep it going!')}afterChange();break}
  }});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.x||t.type!=='checkbox')return;const x=X(),a=t.dataset.x,v=t.dataset.v;
  if(a==='vtog'){x.vault[v]=t.checked;sv()}else if(a==='ntog'){x.notif[v]=t.checked;sv()}else if(a==='hcomb'){x.house.comb=t.checked;sv()}
  else if(a==='catt'){COMP.txt=$('#cp-txt').value||'';COMP.att=t.checked;xRender()}else if(a==='chide'){COMP.txt=$('#cp-txt').value||'';COMP.hide=t.checked;xRender()}});
