// ===================== Net worth 4: Own − Owe, a chart you can read, and a road ahead with a range =====================
// Own and Owe are lists that add up to the cent. Past months come from your transactions; the months ahead come from
// the same plan as everything else, with a band for lighter and heavier spending months. Tap any point for the breakdown.
const NW4={};
{
const r2=MX.r2;
NW4.st={back:'1y',ahead:'1y',sel:null};
NW4.BACK=[['6m','6 months'],['1y','1 year'],['2y','2 years'],['all','All']];NW4.AHEAD=[['off','Off'],['6m','6 months'],['1y','1 year'],['2y','2 years']];
NW4.mos={'6m':6,'1y':12,'2y':24,'all':240,'off':0};
NW4.ICO={cash:'bank',savings:'piggy',invest:'chart',credit:'card',over:'bank',card:'card',loan:'key',paylater:'pl',borrow:'bolt',other:'chart'};
// month-by-month past, from the same series every screen uses, with Own and Owe for each month
NW4.past=n=>{let S=[];try{S=LG.series()}catch(e){}const T=realToday(),out=S.slice(-(n+1)).map((s,i,arr)=>{const last=i===arr.length-1,t=last?T:Date.UTC(s.d.getUTCFullYear(),s.d.getUTCMonth()+1,0);return{t,v:s.v,own:r2(s.a),owe:r2(s.debt),est:!!s.est,lab:last?'Today':s.m+' '+s.y}});
  if(out.length){const nw=LG.nw();out[out.length-1]=Object.assign(out[out.length-1],{v:nw.N,own:nw.A,owe:nw.L,est:false})}return out};
NW4.ahead=n=>n?P4.ahead(rows,n).map(o=>Object.assign(o,{lab:F3.mon(o.t)})):[];
NW4.milestones=A=>{const out=[],L=MX.debts().filter(d=>d.src!=='plan'),seen={};let zero=false;A.forEach((o,i)=>{const prev=i?A[i-1]:null;
  L.forEach(d=>{if(seen[d.key])return;const left=F3.left(d,o.r);if(left<=0.5){seen[d.key]=1;out.push({t:o.t,v:o.v,text:LG.short(d.name)+' paid off'})}});
  if(!zero&&o.v>=0&&(prev?prev.v<0:LG.nw().N<0)){zero=true;out.push({t:o.t,v:o.v,text:'Above $0'})}
  if(o.debts<=0.5&&!(prev&&prev.debts<=0.5)&&L.length)out.push({t:o.t,v:o.v,text:'Debt-free'})});return out};
NW4.changeLines=(o,prev)=>{const L=[];if(!o)return L;if(o.inc!=null){L.push(['Money in','+'+money(o.inc)]);L.push(['Must-pays','−'+money(o.must)]);L.push(['Budgets','−'+money(o.bud)]);if(o.goals>0.004)L.push(['Set aside for goals','−'+money(o.goals)]);L.push(['Extra to debt','−'+money(o.extra)]);if(o.intr>0.004)L.push(['Interest added','+'+money(o.intr)+' owed'])}
  else if(prev){L.push(['Own','change '+(o.own-prev.own>=0?'+':'−')+money(Math.abs(o.own-prev.own))]);L.push(['Owe','change '+(o.owe-prev.owe>=0?'+':'−')+money(Math.abs(o.owe-prev.owe))])}return L};
NW4.pointHTML=(p,prev)=>{const ahead=p.inc!=null;return '<div class="nw4pt"><div class="nw4ph"><b>'+esc(p.lab||sdate(p.t))+'</b><span>'+(ahead?'if your plan goes as set':(p.est?'estimate':'from your transactions'))+'</span></div>'+
  '<div class="nw4trio"><div><small>Own</small><b>'+money0(p.own)+'</b></div><div><small>Owe</small><b>'+money0(p.owe)+'</b></div><div><small>Net worth</small><b class="'+(p.v<0?'neg':'')+'">'+money0(p.v)+'</b></div></div>'+
  (NW4.changeLines(p,prev).length?'<div class="nw4ch">'+NW4.changeLines(p,prev).map(l=>'<span>'+l[0]+'<b>'+l[1]+'</b></span>').join('')+'</div>':'')+'</div>'};
TITLES.networth='Net worth';TITLES.nwhow='How net worth is figured';TITLES.acctside='Own or owe?';
PAGES.networth=()=>{const n=LG.nw(),S=P4.sides(),T=realToday(),nb=NW4.mos[NW4.st.back]||12,na=NW4.mos[NW4.st.ahead]||0;
  const past=NW4.past(nb),ahead=NW4.ahead(na),first=past[0],chg=first?r2(n.N-first.v):0,all=past.concat(ahead.map(o=>({t:o.t,v:o.v,own:o.own,owe:o.owe,lab:o.lab,inc:o.inc,must:o.must,bud:o.bud,goals:o.goals,extra:o.extra,intr:o.intr,debts:o.debts})));
  const band=na?P4.band():null,bandS=band?{lo:[{t:T,v:n.N}].concat(band.lo.slice(0,na).map(o=>({t:o.t,v:o.v}))),hi:[{t:T,v:n.N}].concat(band.hi.slice(0,na).map(o=>({t:o.t,v:o.v})))}:null;
  const pastPts=past.map(p=>({t:p.t,v:p.v,lab:p.lab})),aheadPts=ahead.length?[{t:T,v:n.N,lab:'Today'}].concat(ahead.map(o=>({t:o.t,v:o.v,lab:o.lab}))):[];
  const flags=ahead.length?NW4.milestones(ahead).slice(0,4):[],last=all[all.length-1];
  const vals=[];if(first&&first.t<T)vals.push({t:first.t,v:first.v});vals.push({t:T,v:n.N,text:money0(n.N)});if(last&&last.t>T)vals.push({t:last.t,v:last.v});
  let h='<div class="f3hero nw'+(n.N<0?' neg':'')+'"><span class="k">Net worth</span><b>'+money0(n.N)+'</b><span class="d '+(chg>=0?'up':'dn')+'">'+(first&&first.t<T?(chg>=0?'▲ ':'▼ ')+money0(Math.abs(chg))+' since '+esc(first.lab.replace('Today','')):'Own minus owe, as of today')+'</span>'+
    '<div class="f3chips"><span>Own <b>'+money0(n.A)+'</b></span><span>Owe <b>'+money0(n.L)+'</b></span></div><button type="button" class="lnk how4" data-x="open" data-v="nwhow">How this is figured ›</button></div>';
  h+='<div class="xcard f3chart"><div class="f3ch"><h3>Over time</h3><span class="xhint">'+(all.length>1?C4.spanText(all[0].t,all[all.length-1].t):'')+'</span></div>'+C4.ranges('nw4',NW4.BACK,NW4.AHEAD,NW4.st)+
    '<div class="c4hdr"><span>What happened</span>'+(na?'<span class="ahead">If your plan goes as set <i class="est">Estimate</i></span>':'')+'</div>'+
    C4.time({h:200,zero:true,today:T,series:[{pts:pastPts,color:n.N<0&&chg<0?'var(--mxc-bad)':'var(--mxc-good)',area:true},aheadPts.length>1?{pts:aheadPts,color:'var(--mxc-good)',dash:true}:null],band:bandS,flags,vals,fmt:money0,
      tip:p=>{const i=all.findIndex(x=>x.t===p.t);const q=all[i]||p;return '<b>'+money0(q.v)+'</b><span>'+esc(q.lab||sdate(q.t))+(q.inc!=null?' · ahead':'')+'</span>'},onscrub:p=>{NW4.st.sel=p.t;const el=document.getElementById('nw4pt');if(el){const i=all.findIndex(x=>x.t===p.t);el.innerHTML=NW4.pointHTML(all[i]||p,all[i-1])}}})+
    '<div id="nw4pt">'+NW4.pointHTML(all.find(x=>x.t===T)||{t:T,v:n.N,own:n.A,owe:n.L,lab:'Today'},past[past.length-2])+'</div>'+
    '<p class="xhint c4key"><i class="solid"></i> Past, from your transactions'+(na?' <i class="dash"></i> Ahead, if your plan goes as set'+(bandS?' <i class="band"></i> If spending runs like your lighter or heavier months':''):'')+'</p>'+
    (ahead.length?'<p class="xhint">Ahead assumes about <b>'+money0(ahead[1]?ahead[1].inc:ahead[0].inc)+'</b> in and <b>'+money0(ahead[1]?ahead[1].out:ahead[0].out)+'</b> out a month'+(band?', or '+money0(band.loMo)+' to '+money0(band.hiMo)+' out in lighter and heavier months':'')+'. Savings and investments are held flat. <button type="button" class="lnk" data-x="open" data-v="nwhow">Details</button></p>':'')+
    (past.length<2?'<p class="xhint">History starts now. Sprout records your net worth each month from here, and fills in past months once your bank shares older transactions.</p>':'')+(past.some(p=>p.est)?'<p class="xhint">Months marked estimate use today’s value for investments or typed-in debts, because Sprout doesn’t have their history.</p>':'')+'</div>';
  // what moved it
  if(first&&first.t<T){const dOwn=r2(n.A-first.own),dOwe=r2(n.L-first.owe);h+='<div class="xcard"><h3>What moved it since '+esc(first.lab.split(' ')[0])+'</h3><div class="nw4mv"><span>Own<b class="'+(dOwn>=0?'up':'dn')+'">'+(dOwn>=0?'+':'−')+money0(Math.abs(dOwn))+'</b></span><span>Owe<b class="'+(dOwe<=0?'up':'dn')+'">'+(dOwe>=0?'+':'−')+money0(Math.abs(dOwe))+'</b></span><span>Net worth<b class="'+(chg>=0?'up':'dn')+'">'+(chg>=0?'+':'−')+money0(Math.abs(chg))+'</b></span></div></div>'}
  h+=NW4.sidesHTML(S);
  return h+'<p class="xhint">From your bank: today’s balances'+(LG.live()&&state.link.at?', synced '+LG.ago(state.link.at):'')+'. Past months are worked out from your transactions. Estimates only. Your statements are the final word.</p>'};
// ---------- Own and Owe lists, each adding up to the cent ----------
NW4.row=x=>{const d=x.d,go=d?(d.src==='plan'?'data-x="open" data-v="paylater"':'data-x="open" data-v="debt1" data-w="'+esc(d.key)+'"'):(x.a?'data-x="open" data-v="acctside" data-w="'+esc(x.a.id)+'"':''),sub=d?[(d.kind==='paylater'||d.kind==='borrow')?(d.prov||'Pay later')+(d.left?' · '+d.left+' payment'+(d.left===1?'':'s')+' left':''):(d.src==='bank'?'From your bank':'Typed in'),d.aprKnown&&d.apr?d.apr+'% APR'+(d.aprEst?' (estimated)':''):(d.src!=='plan'&&!d.aprKnown?'Rate needed':'')].filter(Boolean).join(' · '):(x.a?[x.a.inst,F2.subName(x.a)].filter(Boolean).join(' · '):'From your plan');
  return '<'+(go?'button type="button" '+go:'div')+' class="nwr"><span class="nwi">'+catIcon(NW4.ICO[x.k]||'chart','sm')+'</span><span class="nwt"><b>'+esc(x.name)+'</b><small>'+esc(sub)+'</small></span><span class="nwa'+(d||x.k==='over'||x.k==='other'?' owe':'')+'">'+money(x.v)+'</span>'+(go?'<span class="chev">›</span></button>':'</div>')};
NW4.sidesHTML=S=>{const zero=L=>L.filter(x=>Math.abs(x.v)<0.005),live=L=>L.filter(x=>Math.abs(x.v)>=0.005);const z=zero(S.own).concat(zero(S.owe)),ask=P4.unknownAccts();
  let h='<div class="xcard nwg own"><div class="nwgh"><b>Own</b><span>'+money(S.ownTot)+'</span></div>'+live(S.own).sort((a,b)=>b.v-a.v).map(NW4.row).join('')+'</div>';
  h+='<div class="xcard nwg owe"><div class="nwgh"><b>Owe</b><span class="owe">−'+money(S.oweTot)+'</span></div>'+(live(S.owe).length?live(S.owe).sort((a,b)=>b.v-a.v).map(NW4.row).join(''):'<p class="xhint" style="margin:6px 0 0">Nothing owed. Nice.</p>')+'</div>';
  if(ask.length)h+='<div class="xcard nwask"><b>'+ask.length+' account'+(ask.length>1?'s':'')+' to sort</b><small class="xhint">Sprout can’t tell if '+(ask.length>1?'these are':'this is')+' something you own or owe.</small>'+ask.map(a=>'<button type="button" class="sbtn alt" data-x="open" data-v="acctside" data-w="'+esc(a.id)+'">'+esc(NW3.cleanName(a))+' ›</button>').join('')+'</div>';
  if(z.length||S.hid.length)h+='<details class="nwzero"><summary>Paid off or $0'+(S.hid.length?', and hidden':'')+' ('+(z.length+S.hid.length)+')</summary>'+z.map(x=>NW4.row(Object.assign({},x,{name:x.name+' · Paid off'}))).join('')+S.hid.map(x=>'<button type="button" class="nwr" data-x="open" data-v="acctside" data-w="'+esc(x.a.id)+'"><span class="nwi">'+catIcon('bank','sm')+'</span><span class="nwt"><b>'+esc(x.name)+'</b><small>Hidden from net worth</small></span><span class="chev">›</span></button>').join('')+'</details>';
  return h};
// ---------- one account: own, owe or hide, remembered ----------
PAGES.acctside=id=>{const a=LG.accts().find(x=>x.id===id);if(!a)return '<p class="xhint">That account is gone.</p>';const cur=P4.sideOf(a),o=P4.acctOv(a);
  const opt=(k,l,d)=>'<label class="srow lgtog"><span class="slab">'+l+'<small>'+d+'</small></span><input type="radio" name="side4" data-side4="'+k+'" data-id="'+esc(id)+'"'+((o||cur)===k?' checked':'')+'></label>';
  return '<div class="nwsub"><span class="nwi">'+catIcon(NW4.ICO[LG.type(a)==='cash'?'cash':LG.type(a)]||'chart','sm')+'</span><div><b>'+esc(NW3.cleanName(a))+(a.mask?' ••'+esc(a.mask):'')+'</b><small>'+esc([a.inst,F2.subName(a)].filter(Boolean).join(' · '))+' · '+money(LG.bal(a))+'</small></div></div>'+
    '<div class="xcard">'+opt('own','Something I own','Counts toward Own (checking, savings, investments)')+opt('owe','Something I owe','Counts toward Owe (a card, a loan, a balance due)')+opt('hide','Leave it out','Not counted in net worth at all')+'</div>'+
    '<p class="xhint">Sprout sorted it as '+(cur==='ask'?'unknown':cur==='own'?'something you own':cur==='owe'?'something you owe':'hidden')+' from your bank’s account type. Your choice is remembered.</p>'};
document.addEventListener('change',e=>{const r=e.target.closest&&e.target.closest('[data-side4]');if(!r)return;const g=P4.g();g.acct[r.dataset.id]=r.dataset.side4;plan();queueSave();xRender()});
// ---------- how it is figured ----------
PAGES.nwhow=()=>'<div class="how4"><h3>Net worth = Own − Owe</h3><p><b>Own</b> is checking (the bank’s available balance), savings (available), and investments and other accounts at their current value.</p><p><b>Owe</b> is every card and loan (from your bank or typed in), pay-later installments not yet paid, and Cash App Borrow.</p><p>A card with a credit balance counts as Own. An overdrawn checking account counts as Owe. Pay-later plans count only the payments still due.</p>'+
  '<h3>Past months</h3><p>Each month-end balance is worked back from today’s balance using your transactions. Investments and typed-in debts use today’s value for past months, marked as estimates.</p>'+
  '<h3>The road ahead</h3><p>Each month: paychecks on their dates, must-pays on their due dates, your budgets (or your recent average spending when it runs higher), goals set aside, minimums plus extra to debt in your chosen order, and interest at balance × APR × days ÷ 365. Debts drop off as they are paid. Savings and investments are held flat: no market growth is assumed.</p><p>The shaded band shows where you’d land if spending looked like your lighter or heavier months (the lower and upper quarter of your last months).</p>'+
  '<p class="xhint">Estimates from your bank data and the plan you set. Not financial, tax, investment or legal advice. Bank data can be delayed. Forecasts aren’t guarantees. <button type="button" class="lnk" data-x="open" data-v="numbers">About Sprout’s numbers</button></p></div>';
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-f3=nw4b],[data-f3=nw4a]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.dataset.f3==='nw4b')NW4.st.back=b.dataset.v;else NW4.st.ahead=b.dataset.v;xRender()},true);
LG.ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'};
try{if(window.__S)window.__S.NW4=NW4}catch(e){}
}
