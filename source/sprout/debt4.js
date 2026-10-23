// ===================== Debts 4: strategies that change the plan, a list you can drag, and a detail sheet =====================
// The summary chips filter the chart. Highest rate, Smallest balance, My order (drag) and Split evenly re-run the plan
// right away, and the strip above the list compares them on the same money. Tap a debt for its own sheet.
const D4={};
{
const r2=MX.r2;
D4.st={groups:[],view:'bal',open:{}};
D4.KN={card:'Cards',loan:'Loans',paylater:'Pay later',borrow:'Cash advance',person:'People',other:'Other'};
D4.groupOf=d=>d.kind==='student'||d.kind==='auto'?'loan':d.kind;
D4.GC={card:'#c98f7f',loan:'#b8a296',paylater:'#d6b98a',borrow:'#d9a48c',person:'#b9a7cc',other:'#aab1ab'};
D4.sel=()=>D4.st.groups.length?D4.st.groups:null;
D4.inSel=d=>{const s=D4.sel();return !s||s.indexOf(D4.groupOf(d))>=0};
const ordn=n=>n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th');
// ---------- the chart: total owed over time for the selection, stacked by group (or by debt inside one group) ----------
D4.series=(L,R)=>{const T=realToday(),one=D4.sel()&&D4.sel().length===1,parts=one?L.map(d=>({k:d.key,name:d.name,color:null,get:r=>F3.left(d,r),now:d.bal})):Object.keys(D4.KN).map(g=>({k:g,name:D4.KN[g],color:D4.GC[g],get:r=>L.filter(d=>D4.groupOf(d)===g).reduce((a,d)=>a+F3.left(d,r),0),now:L.filter(d=>D4.groupOf(d)===g).reduce((a,d)=>a+d.bal,0)})).filter(p=>p.now>0.5);
  const pal=['#c98f7f','#d6b98a','#b8a296','#d9a48c','#b9a7cc','#aab1ab','#e0c7a0','#c7a3b0'];parts.forEach((p,i)=>{if(!p.color)p.color=pal[i%pal.length]});
  // monthly points: the balance at the end of each month on the plan
  const byM={};R.forEach(r=>{const mk=fd(r.d1-MS).slice(0,7);byM[mk]=r});const months=Object.keys(byM).sort().slice(0,36);
  const cats=[{k:'now',lab:'Now',t:T}].concat(months.map(mk=>({k:mk,lab:C4.mon(pd(mk+'-01'))+(new Date(pd(mk+'-01')).getUTCMonth()===0?' '+C4.yr2(pd(mk+'-01')):''),t:byM[mk].d1-MS})));
  const stack=parts.map(p=>({name:p.name,color:p.color,vals:cats.map(c=>c.k==='now'?r2(p.now):r2(p.get(byM[c.k])))}));
  let cut=cats.length;for(let i=1;i<cats.length;i++){if(stack.every(s=>s.vals[i]<=0.5)){cut=i+1;break}}
  return{cats:cats.slice(0,cut),stack:stack.map(s=>Object.assign({},s,{vals:s.vals.slice(0,cut)})),parts}};
D4.interestSeries=(L,R)=>{const byM={};R.slice(0,36).forEach(r=>{const mk=fd(r.d1-MS).slice(0,7);const o=byM[mk]=byM[mk]||{v:0};L.forEach(d=>{if(d.src==='plan'||!(d.raw in (r.intr||{})))return;o.v+=r.intr[d.raw]})});
  const ks=Object.keys(byM).sort().slice(0,24).filter(k=>byM[k].v>0.004);return{cats:ks.map(mk=>({k:mk,lab:C4.mon(pd(mk+'-01'))})),stack:[{name:'Interest',color:'#d9a48c',vals:ks.map(k=>r2(byM[k].v))}]}};
// ---------- the strategy comparison, on the same money ----------
D4.compareHTML=(pref,L)=>{const C=MX.compare(),noRate=MX.noRate(),K=Object.keys(MX.ORD);
  const best={intr:Math.min(...K.map(k=>C[k]&&C[k].intr!=null?C[k].intr:Infinity)),first:Math.min(...K.map(k=>C[k]&&C[k].first?C[k].first.t:Infinity))};
  return '<div class="d4cmp" role="list">'+K.map(k=>{const c=C[k]||{},on=pref.order===k;return '<button type="button" role="listitem" class="d4cmpi'+(on?' on':'')+'" data-f3="order" data-v="'+k+'" aria-pressed="'+on+'"><b>'+esc(MX.ORD[k])+'</b><span>Debt-free <em>'+(c.free?F3.mon(c.free):'beyond 3 yrs')+'</em></span><span>Interest <em>'+money0(c.intr||0)+(c.intr!=null&&c.intr===best.intr&&K.some(j=>C[j]&&C[j].intr>best.intr+0.5)?' · least':'')+'</em></span><span>First cleared <em>'+(c.first?esc(LG.short(c.first.name))+' · '+F3.mon(c.first.t)+(c.first.t===best.first&&K.some(j=>C[j]&&C[j].first&&C[j].first.t>best.first)?' · soonest':''):'–')+'</em></span></button>'}).join('')+'</div>'+
    (noRate.length?'<p class="xhint d4nr">Interest totals leave out '+noRate.length+' debt'+(noRate.length>1?'s':'')+' with no rate ('+esc(noRate.map(d=>d.name).join(', '))+'). Under Highest rate first they go last until a rate is added.</p>':'')};
// ---------- the page ----------
TITLES.debts='Debts';TITLES.debt1='Debt';
PAGES.debts=()=>{const {L,R}=F3.debtRows(),tot=MX.owe(),pref=MX.pref(),T=realToday(),fr=F3.free();
  if(!L.length)return '<div class="f3hero debt"><span class="k">You owe</span><b>$0</b><span class="d">No debts. Add a card or loan if you have one.</span></div><button type="button" class="btn alt" data-x="open" data-v="ydebt" data-w="new">+ Add a debt</button>';
  const G=MX.byKind(),sel=D4.sel(),LS=L.filter(D4.inSel),selTot=r2(LS.reduce((a,d)=>a+d.bal,0));
  let h='<div class="f3hero debt"><span class="k">You owe</span><b>'+money0(tot)+'</b><span class="d">'+(fr&&!fr.none?'Debt-free around '+F3.mon(fr.t)+' on this plan':'Not paid off within 3 years at this pace')+'</span>'+
    '<div class="f3chips chips4"><button type="button" class="chip4'+(!sel?' on':'')+'" data-d4g="all">All</button>'+Object.values(G).sort((a,b)=>b.v-a.v).map(g=>'<button type="button" class="chip4'+(!sel||sel.indexOf(g.k)>=0?' on':'')+'" data-d4g="'+g.k+'" aria-pressed="'+(!!sel&&sel.indexOf(g.k)>=0)+'">'+D4.KN[g.k]+' <b>'+money0(g.v)+'</b></button>').join('')+'</div>'+
    '<button type="button" class="lnk how4" data-x="open" data-v="debthow">How this is figured ›</button></div>';
  // chart
  const po=LS.length?(()=>{for(const r of R){if(LS.every(d=>F3.left(d,r)<=0.5))return r.d1}return null})():null;
  const S=D4.st.view==='int'?D4.interestSeries(LS,R):D4.series(LS,R);
  h+='<div class="xcard f3chart"><div class="f3ch"><h3>'+(sel?esc(sel.map(k=>D4.KN[k]).join(' + '))+' · '+money0(selTot):'All debts')+'</h3>'+F3.seg('d4view',[['bal','Balance'],['int','Interest']],D4.st.view)+'</div>'+
    (D4.st.view==='int'?'<p class="xhint" style="margin:0 0 6px">Interest added each month on the plan, for the debts with a rate.</p>':'<p class="xhint" style="margin:0 0 6px">'+(po?'Paid off around <b>'+F3.mon(po)+'</b> on this plan.':'Not paid off within 3 years at this pace.')+' Each bar is the balance at the end of that month.</p>')+
    C4.bars({cats:S.cats,stack:S.stack,h:200,fmt:C4.kfmt,legend:S.stack.length>1&&S.stack.length<=6})+'</div>';
  // where extra money goes
  const exMo=MX.extraMo(),g4=P4.g();
  h+='<div class="xcard"><h3>Where extra money goes</h3><label class="srow lgtog"><span class="slab">Send what’s left to debt<small>After must-pays, budgets and goals. Off keeps it in checking.</small></span><input type="checkbox" class="sw" data-f3="extra" data-v="1"'+(pref.extra!==false?' checked':'')+'></label>';
  if(pref.extra!==false){h+='<p class="d4ex">About <b>'+money0(exMo)+'</b> a month goes to extra right now'+(g4.cap>0?' (capped at '+money0(g4.cap)+')':'')+'. <button type="button" class="lnk" data-x="open" data-v="debthow">How it’s figured</button></p>'+
    '<div class="d4cap"><label><span>Send at most</span><span class="d4capin">$<input type="number" inputmode="decimal" min="0" step="10" data-d4cap value="'+(g4.cap>0?g4.cap:'')+'" placeholder="no cap"></span><span>a month extra</span></label></div>'+
    D4.compareHTML(pref,L)}
  h+='</div>';
  // the list, in the order of the chosen strategy
  const ord=MX.order(E),idx={};ord.forEach((d,i)=>idx[d.name]=i);const cards=L.filter(d=>d.src!=='plan'),plans=L.filter(d=>d.src==='plan');
  cards.sort((a,b)=>{const ia=idx[a.raw],ib=idx[b.raw];return (ia==null?999:ia)-(ib==null?999:ib)||b.bal-a.bal});
  const mine=pref.order==='mine'&&pref.extra!==false,tgt=ord[0]&&ord[0].name;
  h+='<div class="f3ch"><h3>'+(pref.extra!==false?'In this order':'Your cards and loans')+'</h3>'+(mine?'<span class="xhint">Press and hold a card to drag</span>':'')+'</div><div class="d4list'+(mine?' drag':'')+'" id="d4list">'+cards.map((d,i)=>D4.card(d,i,idx[d.raw],d.raw===tgt&&pref.extra!==false,mine,pref)).join('')+'</div>';
  if(plans.length)h+='<div class="f3ch"><h3>On their own schedule</h3><span class="xhint">Paid as scheduled</span></div><div class="d4list">'+plans.map(d=>D4.card(d,null,null,false,false,pref)).join('')+'</div>';
  h+='<button type="button" class="btn alt" data-x="open" data-v="ydebt" data-w="new">+ Add a debt</button>';
  const mi=F3.interest();
  return h+(mi>0.5?'<p class="xhint">All together, about '+money0(mi)+' a month goes to interest at today’s balances'+(MX.noRate().length?', leaving out debts with no rate':'')+'.</p>':'')+'<p class="xhint">Estimates from your plan. Your lenders’ statements are the final word.</p>'};
D4.card=(d,i,oi,isTgt,drag,pref)=>{const po=F3.payoff(d),sub=[d.src==='plan'?((d.prov||'Pay later')+(d.left?' · '+d.left+' payment'+(d.left===1?'':'s')+' left':'')):MX.KIND[d.kind],d.src!=='plan'?(d.aprKnown?(d.apr?d.apr+'% APR'+(d.aprEst?' est.':''):'No interest'):''):'',d.min>0?'min '+money0(d.min)+(d.day?' on the '+ordn(d.day):''):''].filter(Boolean).join(' · ');
  const num=oi!=null&&pref.extra!==false?'<button type="button" class="d4num" data-d4move="'+esc(d.raw)+'" aria-label="Position '+(oi+1)+', tap to move">'+(oi+1)+'</button>':'';
  return '<div class="d4c'+(isTgt?' tgt':'')+'" data-d4key="'+esc(d.key)+'" data-d4raw="'+esc(d.raw)+'">'+num+'<button type="button" class="d4b" data-x="open" data-v="debt1" data-w="'+esc(d.key)+'"><span class="f3k k-'+d.kind+'">'+catIcon(d.kind==='card'?'card':d.kind==='paylater'?'pl':d.kind==='borrow'?'bolt':d.kind==='person'?'heart':d.kind==='auto'?'car':d.kind==='student'?'cap':'key','sm')+'</span><span class="f3t"><b>'+esc(d.name)+(isTgt?' <em class="f3first">Extra goes here now</em>':'')+'</b><small>'+sub+'</small><small class="d4po">'+(po?'Paid off '+F3.mon(po):'Beyond 3 years at this pace')+'</small></span><span class="f3a">'+money0(d.bal)+'</span><span class="chev">›</span></button>'+
    (d.src!=='plan'&&!d.aprKnown?'<button type="button" class="d4rate" data-x="open" data-v="ydebt" data-w="'+(state.debts||[]).indexOf(d.debt)+'">Rate needed · Add rate ›</button>':'')+(drag?'<span class="d4grip" aria-hidden="true"><i></i><i></i><i></i></span>':'')+'</div>'};
// chips: tap focuses, more taps add, All resets (Undo for 4 seconds)
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-d4g]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const g=b.dataset.d4g,prev=D4.st.groups.slice();
  if(g==='all'){if(prev.length){D4.st.groups=[];D4.undo('Showing every debt',()=>{D4.st.groups=prev;xRender()})}}
  else if(!D4.st.groups.length)D4.st.groups=[g];else{const i=D4.st.groups.indexOf(g);if(i<0)D4.st.groups.push(g);else D4.st.groups.splice(i,1)}
  xRender()},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-f3=d4view]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();D4.st.view=b.dataset.v;xRender()},true);
document.addEventListener('change',e=>{const i=e.target.closest&&e.target.closest('[data-d4cap]');if(!i)return;const v=Math.max(0,+i.value||0);P4.g().cap=v;plan();queueSave();xRender()});
// a toast with Undo
D4.undo=(msg,fn)=>{const t=$('#toast');if(!t)return;t.classList.add('act');t.innerHTML=esc(msg)+' <button type="button" class="tundo">Undo</button>';t.classList.add('on');clearTimeout(window.toastT);window.toastT=setTimeout(()=>{t.classList.remove('on');t.classList.remove('act')},4000);D4.undoFn=fn};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.tundo');if(!b)return;e.preventDefault();const f=D4.undoFn;D4.undoFn=null;$('#toast').classList.remove('on');if(f)f()});
// ---------- My order: drag a card, or tap its number to pick a spot ----------
D4.setOrder=names=>{const p=MX.pref(),prev=p.mine.slice(),po=p.order;p.mine=names;p.order='mine';plan();queueSave();xRender();D4.undo('Order saved',()=>{const q=MX.pref();q.mine=prev;q.order=po;plan();queueSave();xRender()})};
D4.names=()=>Array.from(document.querySelectorAll('#d4list .d4c')).map(c=>c.dataset.d4raw);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-d4move]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const names=D4.names(),me=b.dataset.d4move,card=b.closest('.d4c');
  let m=card.querySelector('.d4menu');if(m){m.remove();return}m=document.createElement('div');m.className='d4menu';m.innerHTML=names.map((n,i)=>'<button type="button" data-d4to="'+i+'"'+(n===me?' disabled':'')+'>Move to '+ordn(i+1)+'</button>').join('');card.appendChild(m);
  m.addEventListener('click',ev=>{const t=ev.target.closest('[data-d4to]');if(!t)return;ev.stopPropagation();const to=+t.dataset.d4to,arr=names.filter(n=>n!==me);arr.splice(to,0,me);D4.setOrder(arr)})},true);
{let drag=null;const vib=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};
  document.addEventListener('pointerdown',e=>{const g=e.target.closest&&e.target.closest('.d4grip');const card=e.target.closest&&e.target.closest('#d4list.drag .d4c');if(!card)return;const list=card.parentNode;
    const start=()=>{if(drag)return;const cards=Array.from(list.children),rects=cards.map(c=>c.getBoundingClientRect());drag={card,list,cards,rects,y0:e.clientY,from:cards.indexOf(card),to:cards.indexOf(card),h:card.offsetHeight+8};card.classList.add('lift');list.classList.add('dragging');vib(10)};
    let timer=g?null:setTimeout(start,260);if(g){e.preventDefault();start()}
    const mv=ev=>{if(!drag){if(Math.abs(ev.clientY-e.clientY)>8&&timer){clearTimeout(timer);timer=null}return}ev.preventDefault();const dy=ev.clientY-drag.y0;drag.card.style.transform='translateY('+dy+'px)';
      const cy=drag.rects[drag.from].top+drag.rects[drag.from].height/2+dy;let to=drag.from;drag.rects.forEach((r,i)=>{if(i<drag.from&&cy<r.top+r.height/2)to=Math.min(to,i);if(i>drag.from&&cy>r.top+r.height/2)to=Math.max(to,i)});
      if(to!==drag.to){drag.to=to;vib(6)}drag.cards.forEach((c,i)=>{if(c===drag.card)return;let s=0;if(i>drag.from&&i<=drag.to)s=-drag.h;else if(i<drag.from&&i>=drag.to)s=drag.h;c.style.transform=s?'translateY('+s+'px)':''});
      const vh=window.innerHeight;if(ev.clientY<80)window.scrollBy(0,-8);else if(ev.clientY>vh-80)window.scrollBy(0,8)};
    const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);if(timer){clearTimeout(timer);timer=null}if(!drag)return;const d=drag;drag=null;
      d.cards.forEach(c=>{c.style.transform='';c.classList.remove('lift')});d.list.classList.remove('dragging');if(d.to!==d.from){const names=d.cards.map(c=>c.dataset.d4raw),me=names.splice(d.from,1)[0];names.splice(d.to,0,me);vib(12);D4.setOrder(names)}};
    addEventListener('pointermove',mv,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up)});}
// ---------- one debt: the sheet ----------
D4.schedule=d=>{const {R}=F3.debtRows();const out=[];let prevBal=d.bal;
  if(d.src==='plan'){(d.plan.items||[]).filter(x=>!x.done&&x.t>=realToday()).forEach(x=>{prevBal=r2(prevBal-x.amt);out.push({t:x.t,pay:x.amt,intr:0,prin:x.amt,bal:Math.max(0,prevBal)})});return out}
  for(const r of R){if(!(d.raw in r.bal))break;const pay=r2((r.paid||{})[d.raw]||0),intr=r2((r.intr||{})[d.raw]||0),bal=r2(r.bal[d.raw]);if(pay<=0.004&&bal>=prevBal-0.004&&intr<=0.004&&out.length>60)break;out.push({t:r.d0,pay,intr,prin:r2(pay-intr),bal});prevBal=bal;if(bal<=0.5)break}return out};
// standalone amortization used only for the "more a month" slider: this debt alone, at its rate, with a monthly payment
D4.amort=(bal,apr,mo)=>{let b=bal,i=0,n=0;const r=(apr||0)/100/12;if(!(mo>0))return{n:null,intr:null};while(b>0.004&&n<600){const int=r2(b*r);i=r2(i+int);b=r2(b+int-mo);n++}return{n:b>0.004?null:n,intr:i}};
D4.slider={};
PAGES.debt1=key=>{const {L,R}=F3.debtRows(),d=L.find(x=>x.key===key);if(!d)return '<p class="xhint">That debt is paid off or gone.</p>';const i=L.indexOf(d),prev=L[i-1],next=L[i+1],po=F3.payoff(d),S=D4.schedule(d),intrLeft=r2(S.reduce((a,x)=>a+x.intr,0)),pref=MX.pref();
  const planMo=(()=>{const P=R.slice(0,6).filter(r=>d.raw in (r.paid||{}));if(!P.length)return d.min;const days=P.reduce((a,r)=>a+r.days,0),paid=P.reduce((a,r)=>a+(r.paid[d.raw]||0),0);return r2(paid/Math.max(1,days)*365/12)})();
  const more=+D4.slider[key]||0,am=d.src!=='plan'&&d.aprKnown?D4.amort(d.bal,d.apr,planMo+more):null;
  // bars per month of balance
  const cats=[{k:'now',lab:'Now'}],vals=[d.bal];S.forEach(x=>{const mk=fd(x.t).slice(0,7);if(cats.some(c=>c.k===mk))return;cats.push({k:mk,lab:C4.mon(x.t)+(new Date(x.t).getUTCMonth()===0?' '+C4.yr2(x.t):'')});vals.push(x.bal)});
  let h='<div class="d4nav"><button type="button" class="sbtn alt" data-x="open" data-v="debt1" data-w="'+(prev?esc(prev.key):'')+'"'+(prev?'':' disabled')+'>‹ '+(prev?esc(LG.short(prev.name)):'')+'</button><button type="button" class="sbtn alt" data-x="open" data-v="debt1" data-w="'+(next?esc(next.key):'')+'"'+(next?'':' disabled')+'>'+(next?esc(LG.short(next.name)):'')+' ›</button></div>';
  h+='<div class="f3hero debt one"><span class="k">'+esc(d.name)+'</span><b>'+money(d.bal)+'</b><span class="d">'+esc([MX.KIND[d.kind],d.prov||'',d.src==='bank'?'from your bank':d.src==='typed'?'typed in':''].filter(Boolean).join(' · '))+'</span>'+
    '<div class="f3chips"><span>Rate <b>'+(d.src==='plan'?'none':d.aprKnown?(d.apr?d.apr+'%'+(d.aprEst?' est.':''):'0%'):'needed')+'</b></span>'+(d.min>0?'<span>Minimum <b>'+money0(d.min)+(d.day?' on the '+ordn(d.day):'')+'</b></span>':'')+'<span>Paid off <b>'+(po?F3.mon(po):'beyond 3 yrs')+'</b></span>'+(d.aprKnown&&d.src!=='plan'?'<span>Interest left <b>'+money0(intrLeft)+'</b></span>':'')+'</div></div>';
  h+='<div class="xcard f3chart"><div class="f3ch"><h3>Balance on this plan</h3><span class="xhint">'+(po?'Paid off '+F3.mon(po):'')+'</span></div>'+C4.bars({cats:cats.slice(0,25),stack:[{name:'Balance',color:D4.GC[D4.groupOf(d)]||'#c98f7f',vals:vals.slice(0,25)}],h:190,fmt:C4.kfmt,legend:false})+
    '<p class="xhint" style="margin:0">Minimums on the due date, extra in your chosen order'+(d.aprKnown&&d.apr?', interest at '+d.apr+'% ÷ 365 a day':'')+'. Labels show the balance at the end of each month.</p></div>';
  if(am){h+='<div class="xcard d4what"><h3>What if more went to this debt</h3><p class="xhint" style="margin:0">Right now about <b>'+money0(planMo)+'</b> a month goes here on the plan (minimum plus extra).</p><label class="d4sl"><span>If <b>'+money0(more)+'</b> more a month went here</span><input type="range" min="0" max="500" step="10" value="'+more+'" data-d4sl="'+esc(key)+'"></label>'+
    '<div class="f3two"><div><small>Paid off in</small><b>'+(am.n!=null?am.n+' month'+(am.n===1?'':'s'):'not within 50 yrs')+'</b></div><div><small>Interest on this debt</small><b>'+(am.intr!=null?money0(am.intr):'–')+'</b></div></div><p class="xhint">This debt alone, at its rate, with that payment every month. The plan above is the one that moves money.</p></div>'}
  if(S.length){const open=!!D4.st.open[key];h+='<div class="xcard"><div class="f3ch"><h3>Payment schedule</h3><button type="button" class="lnk" data-d4sched="'+esc(key)+'">'+(open?'Show less':'Show all '+S.length)+'</button></div><div class="d4sch"><div class="d4sr hd"><span>Date</span><span>Payment</span><span>Interest</span><span>Principal</span><span>After</span></div>'+S.slice(0,open?S.length:6).map(x=>'<div class="d4sr"><span>'+sdate(x.t)+'</span><span>'+money0(x.pay)+'</span><span>'+(x.intr?money0(x.intr):'–')+'</span><span>'+money0(x.prin)+'</span><span>'+money0(x.bal)+'</span></div>').join('')+'</div></div>'}
  h+='<div class="svbtns">'+(d.src==='plan'?'<button type="button" class="btn alt" data-x="open" data-v="paylater">See the plan</button>':'<button type="button" class="btn alt" data-x="open" data-v="ydebt" data-w="'+(state.debts||[]).indexOf(d.debt)+'">'+(d.aprKnown?'Edit this debt':'Add the interest rate')+'</button>')+'</div>';
  return h+'<p class="xhint">Estimates from your plan. Your lender’s statement is the final word.</p>'};
document.addEventListener('input',e=>{const s=e.target.closest&&e.target.closest('[data-d4sl]');if(!s)return;D4.slider[s.dataset.d4sl]=+s.value;const card=s.closest('.d4what');if(!card)return;const d=MX.debts().find(x=>x.key===s.dataset.d4sl);if(!d)return;
  const {R}=F3.debtRows();const P=R.slice(0,6).filter(r=>d.raw in (r.paid||{})),days=P.reduce((a,r)=>a+r.days,0),paid=P.reduce((a,r)=>a+(r.paid[d.raw]||0),0),planMo=P.length?r2(paid/Math.max(1,days)*365/12):d.min,am=D4.amort(d.bal,d.apr,planMo+ +s.value);
  card.querySelector('.d4sl b').textContent=money0(+s.value);const B=card.querySelectorAll('.f3two b');B[0].textContent=am.n!=null?am.n+' month'+(am.n===1?'':'s'):'not within 50 yrs';B[1].textContent=am.intr!=null?money0(am.intr):'–'});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-d4sched]');if(!b)return;e.preventDefault();D4.st.open[b.dataset.d4sched]=!D4.st.open[b.dataset.d4sched];xRender()});
// swipe left or right in the sheet to move between debts
{let sx=null,sy=null;document.addEventListener('touchstart',e=>{if(XP.page!=='debt1')return;const t=e.touches[0];sx=t.clientX;sy=t.clientY},{passive:true});
  document.addEventListener('touchend',e=>{if(XP.page!=='debt1'||sx==null)return;const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;sx=null;if(Math.abs(dx)<70||Math.abs(dy)>50||e.target.closest('.c4,input'))return;const L=MX.debts(),i=L.findIndex(x=>x.key===XP.arg),j=dx<0?i+1:i-1;if(L[j])xGo('debt1',L[j].key,false)},{passive:true})}
TITLES.debthow='How the payoff plan is figured';
PAGES.debthow=()=>'<div class="how4"><h3>Left in checking</h3><p>start + paychecks and other income − must-pays − budgets − goals set aside − extra to debt</p><p><b>Must-pays</b>: bills, every card and loan minimum, pay-later installments, Cash App Borrow and one-time payments due in the period.</p><p><b>Budgets</b>: your category budgets per month × 12 ÷ 365 × days in the period (or your recent average spending, when it runs higher).</p><p><b>Extra to debt</b>: only money above your cushion after all of that, in the order you chose. Pay-later plans and Cash App Borrow keep their own schedules.</p><p><b>Interest</b>: balance × APR × days ÷ 365, added before the minimum. Debts with no rate are left out of interest totals and go last under Highest rate first.</p><h3>Strategies</h3><p>Highest rate first sends extra to the highest APR. Smallest balance first clears the smallest account first. My order follows the order you set. Split evenly divides extra across debts by their share of the balance.</p><p class="xhint">Estimates from your plan and your bank’s balances. Not financial advice. <button type="button" class="lnk" data-x="open" data-v="numbers">About Sprout’s numbers</button></p></div>';
try{if(window.__S)window.__S.D4=D4}catch(e){}
}
