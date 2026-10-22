// ---------- focus view: tap a dashboard card, see just that, in depth ----------
const fsp=()=>(state.spend||[]).map(s=>Object.assign({t:pd(s.d)},s));
const fstat=(v,l,cls)=>'<div><b class="'+(cls||'')+'">'+v+'</b><span>'+l+'</span></div>';
const FOCUS={
 '#t-hero':{t:'Safe to spend today',show:['#t-alert','#t-hero','#m-health'],ins(){const A=availAt(realToday(),fsp()),rest=A.info.Everyday.rest+A.info.Personal.rest;
   return{stats:[fstat(money(Math.max(0,A.info.Everyday.left)),'Basics left today'),fstat(money(Math.max(0,A.info.Personal.left)),'Fun left today'),fstat(money(A.usedToday),'Spent today')],
   txt:'You have '+money(Math.max(0,rest))+' left for basics and fun over the next '+A.daysLeft+' day'+(A.daysLeft===1?'':'s')+'. Each morning Sprout splits what is left evenly, so spending less today raises tomorrow’s number.'}}},
 '#guide':{t:'Today’s plan',show:['#guide','#m-gap']},
 '.port':{t:'Checking',show:['.port','#m-ahead'],ins(){const {np,low}=lowBeforePay(),cash=+state.cash||0;
   return{stats:[fstat(money(cash),'Last checked'),fstat(low?money(low.v):'—','Lowest before payday',low&&low.v<0?'neg':''),fstat(np?sdate(np.d0):'—','Next payday')],
   txt:low?(low.v<0?'At this pace checking dips below zero on '+sdate(low.t)+'. The chart shows exactly when, and “Check a future date” lets you test a purchase first.':'Your lowest point before payday is '+money(low.v)+' on '+sdate(low.t)+'. Drag through the chart to see any day.'):'Drag through the chart to see your balance on any day.'}}},
 '#m-spend':{t:'This paycheck',show:['#m-spend','#m-per'],ins(){const A=availAt(realToday(),fsp()),i=A.info,sE=A.allow.Everyday-i.Everyday.rest,sP=A.allow.Personal-i.Personal.rest,pE=A.allow.Everyday>0?sE/A.allow.Everyday:0,pP=A.allow.Personal>0?sP/A.allow.Personal:0;
   return{stats:[fstat(money0(sE)+' / '+money0(A.allow.Everyday),'Basics spent',pE>1?'neg':''),fstat(money0(sP)+' / '+money0(A.allow.Personal),'Fun spent',pP>1?'neg':''),fstat(A.daysLeft+' days','Until payday')],
   txt:(pE>1||pP>1?'You are over on '+(pE>1&&pP>1?'basics and fun':pE>1?'basics':'fun')+' this paycheck. Sprout has already lowered your daily number to make up for it.':'You have used '+Math.round(Math.max(pE,pP)*100)+'% of your '+(pE>=pP?'basics':'fun')+' money with '+A.daysLeft+' days to go.')}}},
 '#upc-mini':{t:'Coming up',show:['#m-due'],ins(){const T=realDay(),it=rows.items.filter(x=>x.t>=T&&x.t<T+7*MS&&x.a>0.004),wait=x=>x.g==='Klarna'||x.g==='Cash App'||x.g==='Skip min',must=it.filter(x=>!wait(x)),big=it.slice().sort((a,b)=>b.a-a.a)[0];
   return{stats:[fstat(money0(it.reduce((a,x)=>a+x.a,0)),'Next 7 days'),fstat(money0(must.reduce((a,x)=>a+x.a,0)),'Must pay'),fstat(String(it.length),'Payments')],
   txt:big?'The biggest one is '+shortName(big.name).replace(/ \(every \d+ days\)/,'')+' ('+money(big.a)+') on '+sdate(big.t)+'. Tap the check next to any payment once it is paid.':'Nothing due in the next week.'}}},
 '#m-per':{t:'Next payday',show:['#m-per'],ins(){const {np}=lowBeforePay(),T=realDay(),before=np?rows.items.filter(x=>x.t>=T&&x.t<np.d0&&x.a>0.004).reduce((a,x)=>a+x.a,0):0;
   return{stats:[fstat(np?sdate(np.d0):'Not set','Next payday'),fstat(np?Math.max(0,Math.round((np.d0-T)/MS))+' days':'—','From today'),fstat(money0(before),'Due before then')],
   txt:'Each row below is one paycheck: what comes in, what goes to bills and debt, and what is left for you.'}}},
 '#debt-rows':{t:'Debt',show:['#debt-rows','#m-debt'],ins(){const cur=state.debts.reduce((a,d)=>a+ +d.bal,0),start=Math.max(+state.startDebt||0,cur),paid=start-cur,top=state.debts.filter(d=>+d.bal>0).slice().sort((a,b)=>b.apr-a.apr)[0];
   return{stats:[fstat(money0(cur),'Still owed'),fstat(money0(paid),'Paid off'),fstat(start>0?Math.round(paid/start*100)+'%':'—','Of the way there')],
   txt:top?top.name+' has the highest rate at '+top.apr+'%, so every extra dollar there saves the most interest. The timeline below shows when each debt disappears.':'No debt left. Nice work.'}}}
};
function clearFocus(){document.querySelectorAll('.focus-on,.focus-host').forEach(e=>e.classList.remove('focus-on','focus-host'));document.body.classList.remove('view-focus')}
let FKEY=null;
function fxRefresh(){if(VIEW!=='focus'||!FKEY)return;const F=FOCUS[FKEY],fx=document.getElementById('fx');if(F&&F.custom&&fx){try{fx.innerHTML=F.custom()}catch(e){}}}
function openFocus(sel){let F=FOCUS[sel];FKEY=sel;const el0=sel&&document.querySelector(sel);
  if(!F&&el0&&/^#m-/.test(sel)){const sm=el0.querySelector('summary .mt b, summary b');F={t:sm?sm.textContent:'Details',show:[sel]}}
  if(!F){setView('detail',sel);return}
  if(typeof closeMenu==='function')closeMenu();if(typeof txOpen!=='undefined'&&txOpen)closeTx();
  clearFocus();VIEW='focus';document.body.classList.remove('view-ov','view-detail','view-tab');document.body.classList.add('view-focus');
  F.show.forEach(q=>{const el=document.querySelector(q);if(!el)return;let top=el;const mods=el.closest('.mods');
    if(mods){top=el.closest('details.mod')||el;mods.classList.add('focus-host')}else{while(top.parentElement&&!top.parentElement.classList.contains('wrap'))top=top.parentElement}
    top.classList.add('focus-on');if(top.tagName==='DETAILS')top.open=true;if(el.tagName==='DETAILS')el.open=true});
  let ins=null;try{ins=F.ins?F.ins():null}catch(e){ins=null}
  const fx=document.getElementById('fx');if(fx){let h='';try{h=F.custom?F.custom():''}catch(e){h=''}fx.innerHTML=h}
  const fb=document.getElementById('fbar');if(fb)fb.innerHTML='<button class="fback" data-home aria-label="Back to home">‹</button><h1>'+esc(F.t)+'</h1>'+(F.act||'')+(ins?'<div class="fins"><div class="fstats">'+ins.stats.join('')+'</div>'+(ins.txt?'<p>'+esc(ins.txt)+'</p>':'')+'</div>':'');
  if(typeof tbSync==='function')tbSync();window.scrollTo(0,0)}
