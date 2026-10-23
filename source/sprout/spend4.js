// ===================== Spending 4: Net = in − out, filters without a Basics chip, and insights you can slice by month =====================
const SP4={st:{mk:null,view:'tot',range:6,cat:''}};
{
const r2=MX.r2;
// ---------- the three cards use the same list, so Net is always in minus out ----------
LG.sumHTML=L=>{const F=LG.flows(L),sg=v=>(v<0?'−':'+')+money(Math.abs(v));let mv={net:0,out:0,inn:0,who:[]};try{const r=txRange();mv=LG.moved(r[0],r[1])}catch(e){}
  const net=lgR(F.inc-Math.max(0,F.out)),notes=[];
  if(Math.abs(mv.net)>0.004)notes.push(mv.net>0?money(mv.net)+' went to accounts Sprout can’t see'+(mv.who.length?' ('+esc(mv.who.join(', '))+')':'')+'. Link those accounts to follow it.':money(-mv.net)+' came in from accounts Sprout can’t see. It isn’t counted in Money in until you link those accounts.');
  if(F.ref>0.004)notes.push('Refunds of '+money(F.ref)+' lower Money out.');
  if(F.cp>0.004)notes.push('Money out includes '+money(F.cp)+' paid to a card Sprout can’t see. Link that card to see what you bought with it.');
  notes.push('Moving money between your own accounts, including to yourself by Zelle, isn’t counted'+(F.xfer>0.004?' ('+money(F.xfer)+' here)':'')+'.');
  notes.push('Net is Money in minus Money out for the same days and filters.');
  return '<div><span>Money in</span><b class="pos">+'+money(F.inc)+'</b></div><div><span>Money out</span><b>−'+money(Math.max(0,F.out))+'</b></div><div><span>Net</span><b class="'+(net<0?'neg':'pos')+'">'+sg(net)+'</b></div>'+
    '<details class="sp3det"><summary>What’s counted and what isn’t</summary><ul>'+notes.map(n=>'<li>'+n+'</li>').join('')+'</ul></details>'};
// ---------- filters: Everything, Money out, Money in (the category filter covers the rest) ----------
SP3.TYPES=[['all','Everything'],['out','Money out'],['in','Money in']];
if(TXF.type==='Everyday'||TXF.type==='Personal'||TXF.type==='Bill')TXF.type='all';
// ---------- insights by month ----------
SP4.mks=n=>SP.months(n);
SP4.byCat=mk=>{const o={};SP.rows().filter(r=>r.m===mk).forEach(r=>{o[r.cat]=(o[r.cat]||0)+r.amt});return o};
SP4.inOut=mk=>{let inn=0,out=0;(state.spend||[]).forEach(s=>{if(!s||!isDate(s.d)||String(s.d).slice(0,7)!==mk||s.cat==='Skip'||LG.isXfer(s))return;const a=+s.amt||0;if(s.cat==='Income'&&!LG.isRefund(s))inn+=a;else if(LG.isRefund(s))out-=a;else out+=a});return{inn:r2(inn),out:r2(Math.max(0,out))}};
SP4.tx=mk=>SP.rows().filter(r=>r.m===mk);
SP4.name=c=>((BCATS.find(z=>z[0]===c)||[c,'Other'])[1]);
SP4.CATC=['#6fa98a','#8fb7a5','#c9b88a','#d9a48c','#b9a7cc','#a9b8b0','#7fc4a9','#e0c7a0','#98b9d6','#d6b9b2'];
SP4.html=()=>{B2.sync();const T=realDay(),mk0=fd(T).slice(0,7),st=SP4.st;if(!st.mk)st.mk=mk0;const mk=st.mk,cur=mk===mk0,R=SP.rows(),rows=SP4.tx(mk),tot=r2(rows.reduce((a,r)=>a+r.amt,0)),lim=P4.budTotal(),dom=new Date(T).getUTCDate();
  if(!R.length)return '<div class="txempty"><b>Nothing to look at yet</b><p>Connect your bank, import a statement or log what you spend, and Sprout shows where your money goes.</p></div>';
  const M=SP4.mks(st.range===0?Math.min(36,C4.monthsBetween(P4.firstTx(),T)+1):st.range).filter(m=>pd(m+'-01')>=P4.firstTx()-31*MS||m===mk0),bm=SP.byMonth(),pm=M[M.indexOf(mk)-1]||SP4.mks(2)[0],prevTot=r2((bm[pm]||0)),prevSame=r2(R.filter(r=>r.m===pm&&new Date(r.t).getUTCDate()<=dom).reduce((a,r)=>a+r.amt,0));
  const full=M.filter(m=>m!==mk0).map(m=>bm[m]||0).filter(v=>v>0),avg=full.length?r2(full.reduce((a,b)=>a+b,0)/full.length):0;
  const label=new Date(pd(mk+'-01')).toLocaleDateString('en-US',{timeZone:'UTC',month:'long',year:'numeric'});
  let h='<div class="spsum sp4sum"><span class="k">'+(cur?SP.monthLabel(mk)+' so far':label)+'</span><b>'+money0(tot)+'</b><small>'+(lim>0?Math.round(tot/Math.max(1,lim)*100)+'% of your '+money0(lim)+' budget · ':'')+(cur?(prevSame>0?(tot>prevSame?money0(tot-prevSame)+' more':money0(prevSame-tot)+' less')+' than this time last month':'first month with data'):(prevTot>0?(tot>prevTot?money0(tot-prevTot)+' more':money0(prevTot-tot)+' less')+' than '+SP.monthLabel(pm):''))+(avg>0&&!cur?' · '+(tot>avg?money0(tot-avg)+' above':money0(avg-tot)+' below')+' your average':'')+'</small>'+
    (lim>0?'<div class="xbar'+(tot>lim?' over':tot>lim*0.85?' near':'')+'"><i style="width:'+Math.min(100,Math.round(tot/Math.max(1,lim)*100))+'%"></i></div>':'')+(cur?'':'<button type="button" class="lnk" data-sp4mk="'+mk0+'">Back to this month</button>')+'</div>';
  try{if(cur&&typeof SG!=='undefined')h+=SG.card()}catch(e){}
  if(cur){const I=SP.top().slice(0,4);if(I.length)h+='<div class="xsec">Worth a look</div><div class="spins">'+I.map(i=>'<div class="spi spi-'+esc(i.k||'x')+'"><b>'+esc(i.t)+'</b><span>'+esc(i.s)+'</span>'+(i.go&&i.go[0]?'<button type="button" class="lnk" data-x="open" data-v="'+esc(i.go[0])+'">Open</button>':'')+'</div>').join('')+'</div>'}
  // the chart: tap a month to slice the page
  const cats=M.map(m=>({k:m,lab:SP.monthLabel(m)+(new Date(pd(m+'-01')).getUTCMonth()===0?' '+C4.yr2(pd(m+'-01')):'')}));let stack=[],ref=0,refLab='';
  if(st.view==='tot'){stack=[{name:'Spending',color:'#6fa98a',vals:M.map(m=>Math.max(0,bm[m]||0))}];ref=avg;refLab='average'}
  else if(st.view==='cat'){const byM=M.map(SP4.byCat),ids=BCATS.map(c=>c[0]).filter(id=>byM.some(o=>(o[id]||0)>0));if(st.cat&&ids.indexOf(st.cat)>=0)stack=[{name:SP4.name(st.cat),color:'#6fa98a',vals:byM.map(o=>Math.max(0,o[st.cat]||0))}];else stack=ids.map((id,i)=>({name:SP4.name(id),color:SP4.CATC[i%SP4.CATC.length],vals:byM.map(o=>Math.max(0,o[id]||0))}))}
  else if(st.view==='io'){const IO=M.map(SP4.inOut);stack=[{name:'Money in',color:'#5fbf8a',vals:IO.map(x=>x.inn)},{name:'Money out',color:'#e0a08a',vals:IO.map(x=>x.out)}]}
  else{stack=[{name:'Spent',color:'#6fa98a',vals:M.map(m=>Math.max(0,bm[m]||0))}];ref=lim;refLab='budget'}
  const views=[['tot','Total'],['cat','By category'],['io','In vs out'],['bud','Budget vs actual']];
  h+='<div class="xsec">Month by month</div><div class="xcard spm sp4m"><div class="sp4ctl">'+F3.seg('sp4view',views,st.view)+F3.seg('sp4rg',[['6','6 mo'],['12','12 mo'],['0','All']],String(st.range))+'</div>'+
    (st.view==='cat'?'<div class="sp4cats"><button type="button" class="chip4'+(!st.cat?' on':'')+'" data-sp4cat="">All</button>'+BCATS.filter(c=>M.some(m=>(SP4.byCat(m)[c[0]]||0)>0)).map(c=>'<button type="button" class="chip4'+(st.cat===c[0]?' on':'')+'" data-sp4cat="'+esc(c[0])+'">'+esc(c[1])+'</button>').join('')+'</div>':'')+
    (st.view==='io'?SP4.pairBars(cats,stack,mk):C4.bars({cats,stack,sel:mk,h:210,ref,refLab,onsel:'sp4',fmt:C4.kfmt,legend:stack.length>1&&stack.length<=8}))+
    '<small class="xhint">Tap a month to see its breakdown below. '+(avg>0?'Your average is '+money0(avg)+' a month.':'')+(cur?' '+SP.monthLabel(mk0)+' is still going.':'')+'</small></div>';
  // what changed vs the month before and vs average
  const bc=SP4.byCat(mk),pbc=SP4.byCat(pm),movers=BCATS.map(c=>({id:c[0],name:c[1],v:r2(bc[c[0]]||0),p:r2(pbc[c[0]]||0)})).map(x=>Object.assign(x,{d:r2(x.v-x.p)})).filter(x=>Math.abs(x.d)>=10).sort((a,b)=>Math.abs(b.d)-Math.abs(a.d)).slice(0,4);
  if(prevTot>0&&movers.length)h+='<div class="xsec">What changed from '+SP.monthLabel(pm)+'</div><div class="xcard">'+movers.map(x=>'<div class="ixr"><span>'+esc(x.name)+'</span><small>'+money0(x.p)+' → '+money0(x.v)+'</small><b class="'+(x.d>0?'neg':'pos')+'">'+(x.d>0?'+':'−')+money0(Math.abs(x.d))+'</b></div>').join('')+'</div>';
  // where it's going, with the budget for that month
  const top=Object.entries(bc).filter(e=>e[1]>0.004).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(top.length)h+='<div class="xsec">Where it went'+(cur?'':' in '+SP.monthLabel(mk))+'</div><div class="xcard">'+top.map(e=>{const c=BCATS.find(z=>z[0]===e[0])||[e[0],'Other'],l=budLim(c);return '<button type="button" class="sptc" data-b2cat="'+esc(e[0])+'">'+catIcon('b:'+e[0],'sm')+'<div><b>'+esc(c[1])+'</b><small>'+(l>0?money0(e[1])+' of '+money0(l)+' budget':money0(e[1]))+'</small>'+(l>0?B3.bar(e[1]/l):'')+'</div><span>'+Math.round(e[1]/Math.max(1,tot)*100)+'%</span></button>'}).join('')+'<button type="button" class="lnk" data-txview="cat">See every category</button></div>';
  // one-offs and new places: what made the month what it was
  const big=rows.filter(r=>r.amt>0).sort((a,b)=>b.amt-a.amt).slice(0,3),seenBefore=new Set(R.filter(r=>r.m<mk).map(r=>SP.place(r.note))),newP={};rows.filter(r=>r.amt>0&&!seenBefore.has(SP.place(r.note))).forEach(r=>{const k=SP.place(r.note);newP[k]=(newP[k]||0)+r.amt});const np=Object.entries(newP).sort((a,b)=>b[1]-a[1]).slice(0,3);
  if(big.length)h+='<div class="xsec">Biggest purchases'+(cur?'':' in '+SP.monthLabel(mk))+'</div><div class="xcard">'+big.map(r=>'<div class="ixr"><span>'+esc(SP.place(r.note))+'</span><small>'+sdate(r.t)+' · '+esc(SP4.name(r.cat))+'</small><b>'+money0(r.amt)+'</b></div>').join('')+(np.length?'<small class="xhint">New this month: '+np.map(e=>esc(e[0])+' '+money0(e[1])).join(', ')+'.</small>':'')+'</div>';
  const pl={};rows.filter(r=>r.amt>0).forEach(r=>{const k=SP.place(r.note);pl[k]=(pl[k]||{v:0,n:0});pl[k].v+=r.amt;pl[k].n++});const tp=Object.entries(pl).sort((a,b)=>b[1].v-a[1].v).slice(0,5);
  if(tp.length)h+='<div class="xsec">Top places'+(cur?' this month':' in '+SP.monthLabel(mk))+'</div><div class="xcard">'+tp.map(e=>'<div class="ixr"><span>'+esc(e[0])+'</span><small>'+e[1].n+'×</small><b>'+money0(e[1].v)+'</b></div>').join('')+'</div>';
  let subs=[];try{subs=subsList().filter(x=>x.st==='active')}catch(e){}const smo=subs.reduce((a,x)=>a+x.amt,0),plo=PL.owed(),bl=(state.bills||[]).reduce((a,b)=>a+(b.type==='monthly'?+b.amt:+b.amt*30.44/Math.max(1,+b.every||30)),0);
  h+='<div class="xsec">What repeats</div><div class="xgrid">'+
    '<button class="xtile" data-x="open" data-v="subs"><span class="ico">'+ic('repeat')+'</span><b>Subscriptions</b><small>'+(subs.length?subs.length+' · '+money0(smo)+'/mo':'None found yet')+'</small></button>'+
    '<button class="xtile" data-x="open" data-v="calendar"><span class="ico">'+ic('cal')+'</span><b>Bills and payments</b><small>'+((state.bills||[]).length?money0(bl)+'/mo in bills':'On the money calendar')+'</small></button>'+
    '<button class="xtile" data-x="open" data-v="paylater"><span class="ico">'+ic('cal')+'</span><b>Pay later</b><small>'+(plo>0?money0(plo)+' left':'No open plans')+'</small></button>'+
    '<button class="xtile" data-x="open" data-v="budgets"><span class="ico">'+ic('doc')+'</span><b>Budgets</b><small>'+money0(lim)+' a month</small></button></div>';
  return h};
// in vs out: two bars per month, side by side
SP4.pairBars=(cats,stack,sel)=>{const n=cats.length,W=360,H=210,pl=40,pr=8,pt=22,pb=24,cw=(W-pl-pr)/n,bw=Math.max(4,cw*.34),hi0=Math.max(1,...stack[0].vals,...stack[1].vals),hi=hi0*1.12,Y=v=>pt+(1-v/hi)*(H-pt-pb),y0=H-pb;
  let s='<svg viewBox="0 0 '+W+' '+H+'" class="c4svg" aria-hidden="true">';C4.ticks(0,hi0).forEach(v=>{if(v<=0)return;const y=Y(v).toFixed(1);s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'" class="c4g"/><text x="'+(pl-6)+'" y="'+y+'" class="c4yl" text-anchor="end" dominant-baseline="middle">'+C4.kfmt(v)+'</text>'});s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y0+'" y2="'+y0+'" class="c4g z"/>';
  cats.forEach((c,i)=>{const x=pl+i*cw+cw/2,on=c.k===sel;s+='<g class="c4bar'+(on?' sel':'')+'" data-c4k="'+esc(c.k)+'">';[0,1].forEach(j=>{const v=stack[j].vals[i],y=Y(v);s+='<rect x="'+(x-bw-1+(j?bw+2:0)).toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1.5,y0-y).toFixed(1)+'" rx="3" fill="'+stack[j].color+'" class="c4rect"/>'});
    s+='<text x="'+x.toFixed(1)+'" y="'+(H-7)+'" class="c4xl'+(on?' sel':'')+'" text-anchor="middle">'+esc(c.lab)+'</text><rect x="'+(x-cw/2).toFixed(1)+'" y="'+pt+'" width="'+cw.toFixed(1)+'" height="'+(H-pt)+'" fill="transparent"/></g>'});
  s+='</svg>';const i=cats.findIndex(c=>c.k===sel);return '<div class="c4 c4b" data-c4b="io" data-c4sel="sp4">'+s+'<div class="c4leg"><span><i style="background:'+stack[0].color+'"></i>Money in'+(i>=0?' '+money0(stack[0].vals[i]):'')+'</span><span><i style="background:'+stack[1].color+'"></i>Money out'+(i>=0?' '+money0(stack[1].vals[i]):'')+'</span>'+(i>=0?'<span>Net '+(stack[0].vals[i]-stack[1].vals[i]>=0?'+':'−')+money0(Math.abs(stack[0].vals[i]-stack[1].vals[i]))+'</span>':'')+'</div></div>'};
C4.onsel.sp4=k=>{SP4.st.mk=k;renderTx()};
SP.html=SP4.html;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-f3=sp4view],[data-f3=sp4rg],[data-sp4cat],[data-sp4mk]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  if(b.dataset.f3==='sp4view')SP4.st.view=b.dataset.v;else if(b.dataset.f3==='sp4rg')SP4.st.range=+b.dataset.v;else if(b.dataset.sp4cat!=null)SP4.st.cat=b.dataset.sp4cat;else if(b.dataset.sp4mk)SP4.st.mk=b.dataset.sp4mk;renderTx()},true);
// the month goes back to the current one when Spending is opened again
{const _o=SP.open;SP.open=function(){SP4.st.mk=null;return _o.apply(this,arguments)}}
// ---------- budgets far below real spending get repaired once, with Undo ----------
{const _plan=plan;plan=function(){const r=_plan.apply(this,arguments);try{if(!SP4.fixed){SP4.fixed=1;const done=P4.fixBudgets();if(done.length)setTimeout(()=>D4.undo('Raised '+done.length+' budget'+(done.length>1?'s':'')+' that were far below what you spend',()=>{P4.undoFix();plan();queueSave()}),800)}}catch(e){}return r}}
try{if(window.__S)window.__S.SP4=SP4}catch(e){}
}
// the old chip row (hidden) still carried Basics, Fun and Bills: take those out of the page entirely
{const _rt=renderTx;renderTx=function(){const r=_rt.apply(this,arguments);try{document.querySelectorAll('[data-txf=type][data-v=Everyday],[data-txf=type][data-v=Personal],[data-txf=type][data-v=Bill]').forEach(b=>b.remove())}catch(e){}return r}}
