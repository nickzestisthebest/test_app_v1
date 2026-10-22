// ----- profiles, profile pictures, direct messages (demo) -----
const AVCOL=['#2fae5a','#1f7a42','#5fbf86','#7aa93a','#3f9f8f','#5b7fb8','#9b6fb0','#d07a5a'];
const MEMBERS={
 'maya.pays':{bio:'Cleared my first card in 7 months. Now going after the car loan.',since:'Mar 2025',streak:88,stage:3,pct:64,groups:['g1','g4']},
 'dee.dollars':{bio:'Bill negotiator. If it renews, I call them first.',since:'Jan 2025',streak:52,stage:3,pct:71,groups:['g4','g5']},
 'jon.grows':{bio:'Snowball first, avalanche after. One small win at a time.',since:'May 2025',streak:21,stage:2,pct:38,groups:['g1']},
 'priya.saves':{bio:'Building a one-paycheck buffer before anything else.',since:'Jul 2025',streak:30,stage:1,pct:22,groups:['g2','g3']},
 'sam.steady':{bio:'Cooking at home and liking it more than I thought.',since:'Feb 2025',streak:41,stage:2,pct:47,groups:['g2']},
 'lena.l':{bio:'Student loans and a lot of questions. Here to learn.',since:'Aug 2025',streak:12,stage:1,pct:15,groups:['g3']},
 'omar.budgets':{bio:'Two kids, one budget, zero late fees this year.',since:'Apr 2025',streak:33,stage:2,pct:40,groups:['g6']},
 'kai.saves':{bio:'Side hustle money goes straight to debt.',since:'Jun 2025',streak:19,stage:2,pct:29,groups:['g5']},
 'rosa.r':{bio:'Nurse, night shifts, and a no-spend weekday rule.',since:'Sep 2025',streak:9,stage:1,pct:11,groups:['g4']}};
const DMREPLY={'maya.pays':['Love that. What is your next target?','Check-ins every morning were the thing that worked for me.','You got this. Message me when you hit your next milestone!'],
 'dee.dollars':['Call the retention line, not regular support. Ask what offers they have for staying.','Be friendly and quiet. Let them make the first offer.','Phone and insurance are usually the easiest wins.'],
 'jon.grows':['Same here, the middle stretch is the hardest.','I keep a sticky note with my debt-free date on the fridge.','Nice! Keep me posted.']};
const DMGEN=['Thanks for the message! Rooting for you.','That is a great plan. Small steps add up.','Same boat. Let us keep each other on track this week.'];
let DMTY=null,DMNEW=false;
const isMe=n=>n==='You'||(!!state.name&&n===state.name);
function myAvt(cls){const p=P();if(p.avimg)return '<span class="avt avimg'+(cls?' '+cls:'')+'"><img src="'+p.avimg+'" alt=""></span>';return '<span class="avt'+(cls?' '+cls:'')+'" style="background:'+(p.avc!=null?AVCOL[p.avc]:avc(state.name||'You'))+'">'+ini(state.name||'You')+'</span>'}
const _avt0=avt;avt=n=>isMe(n)?myAvt():_avt0(n);
const mlk=(n,inner)=>isMe(n)?'<span class="mlk" data-x="open" data-v="profile" role="button" tabindex="0">'+inner+'</span>':'<span class="mlk" data-x="mem" data-v="'+esc(n)+'" role="button" tabindex="0">'+inner+'</span>';
function DM(){const x=X();x.dm=x.dm||{};x.dmr=x.dmr||{};if(!x.dmseed){x.dmseed=1;const now=Date.now();x.dm['maya.pays']=x.dm['maya.pays']||[{f:'them',t:'Hi! I saw you joined the community. Want to be accountability buddies this month?',at:now-3*3600e3}];}return x}
function dmUnread(){const x=DM();return Object.keys(x.dm).filter(n=>{const L=x.dm[n],l=L[L.length-1];return l&&l.f==='them'&&l.at>(x.dmr[n]||0)}).length}
const ago=at=>{const m=Math.max(0,Math.round((Date.now()-at)/60000));return m<1?'now':m<60?m+'m':m<1440?Math.round(m/60)+'h':Math.round(m/1440)+'d'};
PAGES.member=n=>{const M=MEMBERS[n]||{bio:'Growing one green day at a time.',since:'2025',streak:7,stage:1,pct:10,groups:[]},s=X().soc,posts=SEED.filter(p=>p.who===n),ans=QSEED.reduce((a,q)=>a+q.ans.filter(z=>z[0]===n).length,0),muted=!!s.mute[n];
  setTimeout(()=>{const t=document.getElementById('x-t');if(t)t.textContent=n},0);
  return '<div class="mphead">'+_avt0(n).replace('class="avt"','class="avt big"')+'<b>'+esc(n)+'</b><p>'+esc(M.bio)+'</p><small>Member since '+M.since+'</small></div>'+
   '<div class="mpstats"><div><b>'+M.streak+'</b><span>Day streak</span></div><div><b>'+GROW[Math.min(4,M.stage)][0]+'</b><span>Plant stage</span></div><div><b>'+M.pct+'%</b><span>Debt paid off</span></div></div>'+
   '<div class="mpact"><button class="btn" data-x="dm" data-v="'+esc(n)+'">'+ic('chat')+'Message</button><button class="btn alt" data-x="mmute" data-v="'+esc(n)+'">'+(muted?'Unhide posts':'Hide posts')+'</button></div>'+
   (M.groups.length?'<div class="xcard"><h3>Groups</h3>'+M.groups.map(id=>{const g=GSEED.find(z=>z.id===id);return g?'<div class="xrow" data-x="open" data-v="group" data-w="'+g.id+'" role="button" tabindex="0">'+_avt0(g.name)+'<div class="xt"><b>'+g.name+'</b><small>'+g.desc+'</small></div></div>':''}).join('')+'</div>':'')+
   '<div class="xcard"><h3>Posts</h3>'+(posts.length?posts.map(p=>'<div class="mppost"><small>'+esc(p.tag)+' · '+p.t+' ago · '+((p.lk||0)+(s.like[p.id]?1:0))+' cheers</small><p>'+esc(p.txt)+'</p></div>').join(''):'<small class="xhint">No posts yet.</small>')+(ans?'<small class="xhint">'+ans+' answer'+(ans>1?'s':'')+' in Q&amp;A</small>':'')+'</div>'+
   demoNote('Example member for the demo. Only streaks, stages and percentages are shown on profiles, never dollar amounts.')};
PAGES.inbox=()=>{const x=DM(),names=Object.keys(x.dm).filter(n=>x.dm[n].length).sort((a,b)=>x.dm[b][x.dm[b].length-1].at-x.dm[a][x.dm[a].length-1].at);
  if(DMNEW)return '<small class="xhint">Choose someone to message</small>'+Object.keys(MEMBERS).filter(n=>!X().soc.mute[n]).map(n=>'<div class="xrow" data-x="dm" data-v="'+n+'" role="button" tabindex="0">'+_avt0(n)+'<div class="xt"><b>'+n+'</b><small>'+esc(MEMBERS[n].bio)+'</small></div></div>').join('')+'<button class="btn alt" data-x="dmnew" data-v="0">Cancel</button>';
  return '<button class="btn dmnewb" data-x="dmnew" data-v="1">'+ic('plus')+'New message</button>'+
   (names.length?'<div class="xcard" style="padding:6px 8px">'+names.map(n=>{const L=x.dm[n],l=L[L.length-1],un=l.f==='them'&&l.at>(x.dmr[n]||0);return '<div class="xrow dmrow'+(un?' un':'')+'" data-x="dm" data-v="'+esc(n)+'" role="button" tabindex="0">'+_avt0(n)+'<div class="xt"><b>'+esc(n)+'</b><small>'+(l.f==='me'?'You: ':'')+esc(l.t.slice(0,60))+(l.t.length>60?'…':'')+'</small></div><div class="xr"><small>'+ago(l.at)+'</small>'+(un?'<i class="dmdot"></i>':'')+'</div></div>'}).join('')+'</div>':'<div class="xcard"><small class="xhint">No messages yet. Say hi to someone from the community.</small></div>')+
   demoNote('Demo mode. Messages stay on this device and replies are examples. Never share account numbers or passwords.')};
PAGES.chat=n=>{const x=DM(),L=x.dm[n]||[];x.dmr[n]=Date.now();setTimeout(()=>{const t=document.getElementById('x-t');if(t)t.textContent=n;const b=document.getElementById('dm-list');if(b)b.scrollTop=b.scrollHeight;if(typeof tbSync==='function')tbSync()},0);
  return '<div class="dmhd" data-x="mem" data-v="'+esc(n)+'" role="button" tabindex="0">'+_avt0(n)+'<div class="xt"><b>'+esc(n)+'</b><small>View profile</small></div><span>›</span></div>'+
   '<div class="dmlist" id="dm-list">'+(L.length?'':'<small class="xhint" style="text-align:center">Say hi to '+esc(n)+'. Be kind and keep money details general.</small>')+L.map(m=>'<div class="dmb '+(m.f==='me'?'me':'them')+'"><span>'+esc(m.t)+'</span><small>'+ago(m.at)+'</small></div>').join('')+(DMTY===n?'<div class="dmb them typing"><span><i></i><i></i><i></i></span></div>':'')+'</div>'+
   '<div class="xin"><input id="dm-in" type="text" maxlength="500" placeholder="Message '+esc(n)+'" aria-label="Message" autocomplete="off"><button class="sbtn" data-x="dmsend" data-v="'+esc(n)+'">Send</button></div>'+
   demoNote('Demo mode. Messages stay on this device and replies are examples.')};
function dmSend(n){const i=document.getElementById('dm-in'),t=(i&&i.value||'').trim();if(!t)return;const x=DM();(x.dm[n]=x.dm[n]||[]).push({f:'me',t,at:Date.now()});x.dmr[n]=Date.now();DMTY=n;afterChange();
  const R=DMREPLY[n]||DMGEN,k=x.dm[n].filter(m=>m.f==='them').length;setTimeout(()=>{const y=DM();(y.dm[n]=y.dm[n]||[]).push({f:'them',t:R[k%R.length],at:Date.now()});DMTY=null;if(XP.page==='chat'&&XP.arg===n)y.dmr[n]=Date.now();afterChange()},RM?50:1600);
  setTimeout(()=>{const j=document.getElementById('dm-in');if(j)j.focus()},40)}
PAGES.profile=()=>{const p=P();
  return '<div class="pfav">'+myAvt('big')+'<div class="pfbtns"><label class="sbtn" for="pf-file" style="cursor:pointer">'+(p.avimg?'Change photo':'Add a photo')+'</label>'+(p.avimg?'<button class="sbtn alt" data-x="avdel">Remove</button>':'')+'<input id="pf-file" type="file" accept="image/*" hidden></div></div>'+
   (p.avimg?'':'<div class="pfcols" role="radiogroup" aria-label="Avatar color">'+AVCOL.map((c,i)=>'<button type="button" role="radio" aria-checked="'+(p.avc===i)+'" aria-label="Color '+(i+1)+'" data-x="avcol" data-v="'+i+'" class="'+(p.avc===i?'on':'')+'" style="background:'+c+'"></button>').join('')+'</div>')+
   '<div class="xf"><label class="f">Name<input id="pf-name" type="text" maxlength="40" value="'+esc(state.name||'')+'" placeholder="First name"></label><label class="f">About you<input id="pf-bio" type="text" maxlength="120" value="'+esc(p.bio||'')+'" placeholder="What are you working toward?"></label><label class="f">Email (demo)<input id="pf-mail" type="email" value="'+esc(p.email||'')+'" placeholder="you@example.com"></label><button class="btn" data-x="pfsave">Save</button></div>'+
   demoNote('Your photo, name and bio show on your posts, comments and leagues. Your photo is stored with your Sprout data.')};
function avFile(f){if(!f||!/^image\//.test(f.type)){toast('Choose an image file');return}const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const S=160,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),m=Math.min(im.width,im.height);g.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,S,S);
  let u='';try{u=c.toDataURL('image/jpeg',.82)}catch(e){}if(!u){toast('Couldn’t use that image');return}P().avimg=u;sv();afterChange();if(VIEW==='tab')pgRender();toast('Photo updated')};im.onerror=()=>toast('Couldn’t read that image');im.src=r.result};r.readAsDataURL(f)}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='pf-file'){avFile(e.target.files&&e.target.files[0]);e.target.value=''}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='dm-in'){e.preventDefault();const b=document.querySelector('#x-body [data-x=dmsend]');if(b)dmSend(b.dataset.v)}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x]');if(!b)return;const a=b.dataset.x,v=b.dataset.v,x=X();
  switch(a){
   case 'mem':xGo('member',v);break;
   case 'dm':DMNEW=false;xGo('chat',v);break;
   case 'inbox':DMNEW=false;xOpen('inbox');break;
   case 'dmnew':DMNEW=v==='1';xRender();break;
   case 'dmsend':dmSend(v);break;
   case 'mmute':x.soc.mute[v]=!x.soc.mute[v];afterChange();toast(x.soc.mute[v]?'Their posts are hidden':'Their posts are visible again');break;
   case 'avdel':delete P().avimg;sv();afterChange();if(VIEW==='tab')pgRender();toast('Photo removed');break;
   case 'avcol':P().avc=+v;sv();afterChange();break;
  }});
Object.assign(TITLES,{member:'Profile',inbox:'Messages',chat:'Message'});
