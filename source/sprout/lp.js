// ---------- press and hold (long-press quick actions) ----------
const LPR=[];let LPT=null,LPS=null,LPSUP=false,LPOPEN=false;
function lpReg(sel,fn){LPR.push([sel,fn])}
function lpFind(t){if(!t||!t.closest||t.closest('input,textarea,select,[data-pay],.lpm'))return null;for(const r of LPR){const el=t.closest(r[0]);if(el)return [el,r[1]]}return null}
function lpCancel(){clearTimeout(LPT);LPT=null;if(LPS&&LPS.el)LPS.el.classList.remove('lp-press');LPS=null}
addEventListener('pointerdown',e=>{if(e.button>0||LPOPEN)return;const f=lpFind(e.target);if(!f)return;LPS={el:f[0],fn:f[1],x:e.clientX,y:e.clientY};
  const el=f[0];setTimeout(()=>{if(LPS&&LPS.el===el)el.classList.add('lp-press')},140);
  LPT=setTimeout(()=>{if(!LPS)return;const s=LPS;lpCancel();LPSUP=true;lpOpen(s.el,s.fn)},460)},{passive:true});
addEventListener('pointermove',e=>{if(LPS&&Math.hypot(e.clientX-LPS.x,e.clientY-LPS.y)>9)lpCancel()},{passive:true});
['pointerup','pointercancel','blur'].forEach(n=>addEventListener(n,()=>{lpCancel();if(LPSUP)setTimeout(()=>{LPSUP=false},350)},{passive:true}));
addEventListener('scroll',lpCancel,{passive:true,capture:true});
addEventListener('click',e=>{if(LPSUP){e.preventDefault();e.stopImmediatePropagation();LPSUP=false}},true);
addEventListener('contextmenu',e=>{const f=lpFind(e.target);if(!f)return;e.preventDefault();if(LPOPEN)return;lpCancel();LPSUP=e.button!==2;lpOpen(f[0],f[1])});
addEventListener('keydown',e=>{if(e.key==='Escape'&&LPOPEN){lpClose();return}if((e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10'))&&document.activeElement){const f=lpFind(document.activeElement);if(f){e.preventDefault();lpOpen(f[0],f[1])}}});
function lpOpen(el,fn){let m=null;try{m=fn(el)}catch(err){m=null}if(!m)return;try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}
  LPOPEN=true;let o=document.getElementById('lpm');if(!o){o=document.createElement('div');o.id='lpm';o.className='lpm';document.body.appendChild(o)}
  o.innerHTML='<div class="lpm-bg" data-lpclose></div><div class="lpm-card" role="menu" aria-label="'+esc(m.title||'Quick actions')+'">'+(m.title?'<div class="lpm-h"><b>'+esc(m.title)+'</b>'+(m.sub?'<small>'+esc(m.sub)+'</small>':'')+'</div>':'')+(m.peek||'')+
    (m.items||[]).map((it,i)=>'<button type="button" role="menuitem" class="lpm-i'+(it.danger?' bad':'')+'" data-lpi="'+i+'">'+(it.ic&&typeof ic==='function'&&IC&&IC[it.ic]?ic(it.ic):(it.sym?'<i>'+it.sym+'</i>':'<i></i>'))+'<span>'+esc(it.t)+(it.s?'<small>'+esc(it.s)+'</small>':'')+'</span></button>').join('')+'</div>';
  o.__items=m.items||[];el.classList.add('lp-lift');o.__el=el;
  const card=o.querySelector('.lpm-card'),r=el.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,w=Math.min(320,vw-32);card.style.width=w+'px';
  let left=Math.min(Math.max(16,r.left+r.width/2-w/2),vw-16-w);card.style.left=left+'px';o.classList.add('on');
  const h=card.offsetHeight;let top=r.bottom+10;if(top+h>vh-16)top=r.top-10-h;if(top<16)top=Math.max(16,(vh-h)/2);card.style.top=top+'px';
  card.style.transformOrigin=(r.left+r.width/2-left)+'px '+(top>r.top?'0':'100%');
  const f=card.querySelector('.lpm-i');if(f)f.focus({preventScroll:true})}
function lpClose(){const o=document.getElementById('lpm');if(!o)return;o.classList.remove('on');if(o.__el)o.__el.classList.remove('lp-lift');LPOPEN=false}
document.addEventListener('click',e=>{const o=document.getElementById('lpm');if(!o||!LPOPEN)return;if(e.target.closest('[data-lpclose]')){lpClose();return}const b=e.target.closest('[data-lpi]');if(!b)return;const it=o.__items[+b.dataset.lpi];lpClose();if(it&&it.fn)setTimeout(()=>it.fn(),60)});
// ----- helpers -----
function lpAdd(s){const e={d:fd(realDay()),amt:Math.round(+s.amt*100)/100,cat:s.cat,note:s.note||'',at:Date.now()};state.spend.push(e);plan();queueSave();if(txOpen)renderTx();
  toastAct('Logged '+money(e.amt)+(e.note?' · '+e.note:''),'Undo',()=>{state.spend=state.spend.filter(x=>x!==e);plan();queueSave();if(txOpen)renderTx();toast('Undone')})}
function lpUsual(){const since=realDay()-90*MS,g={};(state.spend||[]).forEach(s=>{if(s.cat!=='Everyday'&&s.cat!=='Personal')return;if(pd(s.d)<since||!(+s.amt>0))return;const nt=String(s.note||'').trim();if(!nt)return;const k=nt.toLowerCase()+'|'+s.cat;const z=g[k]=g[k]||{note:nt,cat:s.cat,n:0,last:0,amts:{}};z.n++;z.last=Math.max(z.last,pd(s.d));const a=(+s.amt).toFixed(2);z.amts[a]=(z.amts[a]||0)+1});
  return Object.values(g).map(z=>Object.assign(z,{amt:+Object.keys(z.amts).sort((a,b)=>z.amts[b]-z.amts[a])[0]})).sort((a,b)=>b.n-a.n||b.last-a.last).slice(0,4)}
// 1) + Log spend: quick add your usual purchases
lpReg('#open-spend',()=>{const U=lpUsual();return{title:'Log it fast',sub:U.length?'Your usual purchases. One tap logs it for today.':'Your usual purchases will show up here after you log a few.',
  items:U.map(u=>({sym:u.cat==='Personal'?'★':'●',t:u.note+' · '+money(u.amt),s:u.cat==='Personal'?'Fun':'Basics',fn:()=>lpAdd(u)})).concat([{sym:'+',t:'Something else',fn:()=>openSheet('sh-spend')}])}});
// 2) Transactions: quick edit
lpReg('#tx-list .txrow',el=>{const i=+el.dataset.txe,s=state.spend[i];if(!s)return null;const inc=s.cat==='Income';
  const mv=c=>()=>{s.cat=c;plan();queueSave();renderTx();toast('Moved to '+catName(c))};
  const items=[];if(!inc){if(s.cat!=='Everyday')items.push({sym:'●',t:'Move to Basics',fn:mv('Everyday')});if(s.cat!=='Personal')items.push({sym:'★',t:'Move to Fun',fn:mv('Personal')});if(s.cat!=='Bill')items.push({sym:'≡',t:'It was a bill or payment',fn:mv('Bill')})}
  items.push({sym:'↻',t:'Log it again today',fn:()=>lpAdd({amt:s.amt,cat:s.cat,note:s.note})});
  items.push({sym:'✎',t:'Edit details',fn:()=>{txEdit=i;renderTx()}});
  items.push({sym:'✕',t:'Delete',danger:true,fn:()=>{const rm=state.spend[i];if(!rm)return;const snap=JSON.parse(JSON.stringify(rm));if(rm.tid&&typeof hxForget==='function')hxForget(rm.tid);if(rm.payKey&&state.paid)delete state.paid[rm.payKey];state.spend.splice(i,1);txEdit=null;plan();queueSave();renderTx();toastAct('Deleted','Undo',()=>{state.spend.splice(i,0,snap);if(snap.payKey)state.paid=Object.assign({},state.paid||{},{[snap.payKey]:true});plan();queueSave();renderTx();toast('Restored')})}});
  return{title:(s.note||catName(s.cat,s.kind))+' · '+(inc?'+':'−')+money(+s.amt),sub:catName(s.cat,s.kind)+' · '+sdate(pd(s.d)),items}});
// 3) Upcoming bills: mark paid or ask
lpReg('#upc .li, #upc-mini .rw, .ovdue',el=>{const b=el.querySelector('[data-pay]');if(!b)return null;const nm=b.dataset.nm,amt=+b.dataset.amt,key=b.dataset.pay;
  const items=[{sym:'✓',t:'Mark paid',s:money(amt),fn:()=>markPaid(key,amt,nm)}];
  if(sampleFn)items.push({sym:'?',t:'Can this wait?',s:'Ask Sprout',fn:()=>{openSheet('sh-ask');setTimeout(()=>{const i=$('#cmd-in');if(i&&i.focus){i.value='Can I pay '+shortName(nm)+' ('+money(amt)+') later this time? What happens if I do?';i.focus();const g=$('#cmd-go');if(g)g.disabled=false}},250)}});
  return{title:shortName(nm).replace(/ \(every \d+ days\)/,''),sub:money(amt)+' due '+sdate(pd(key.split('|')[0])),items}});
// 4) Streak chip: quick check-in
lpReg('#hd-streak',()=>{const ck=(state.checkin||{}).last===fd(realDay()),d=typeof stkToday==='function'?stkToday():null;
  return{title:streakNow()+' day streak',sub:d?(d.s>d.a+0.5?'Over today':money(Math.max(0,d.a-d.s))+' left today'):'',items:[ck?{sym:'✓',t:'Checked in today',s:'Nice work',fn:()=>{}}:{sym:'✓',t:'Check in now',s:'Locks in today',fn:openCheckin},{sym:'★',t:'See streak and rewards',fn:()=>{streakSheet();openSheet('sh-streak')}}]}});
// 5) Safe-to-spend hero: peek
lpReg('.ovhero',()=>{const sp=(state.spend||[]).map(s=>Object.assign({t:pd(s.d)},s)),A=availAt(realToday(),sp),nx=rows.items.filter(x=>x.t>=realDay()&&x.a>0.004).sort((a,b)=>a.t-b.t)[0];
  return{title:'Today at a glance',peek:'<div class="lpm-peek"><div><b>'+money(Math.max(0,A.info.Everyday.left))+'</b><span>Basics left</span></div><div><b>'+money(Math.max(0,A.info.Personal.left))+'</b><span>Fun left</span></div><div><b>'+(nx?money(nx.a):'—')+'</b><span>'+(nx?'Next: '+esc(shortName(nx.name).replace(/ \(every \d+ days\)/,'').slice(0,14)):'No bills soon')+'</span></div></div>',
   items:[{sym:'+',t:'Log spend',fn:()=>openSheet('sh-spend')}].concat(sampleFn?[{sym:'?',t:'Can I afford something?',s:'Ask Sprout',fn:()=>{openSheet('sh-ask');setTimeout(()=>{const i=$('#cmd-in');if(i&&i.focus){i.value='Can I afford ';i.focus()}},250)}}]:[]).concat([{sym:'›',t:'See details',fn:()=>setView('detail','#t-hero')}])}});
// one-time tip
function lpHint(){if(!state.setup)return;let seen=null;try{seen=localStorage.getItem('sprout-lp-hint')}catch(_){}if(seen)return;try{localStorage.setItem('sprout-lp-hint','1')}catch(_){}setTimeout(()=>toast('Tip: press and hold the + button, bills and purchases for quick actions.'),6000)}
