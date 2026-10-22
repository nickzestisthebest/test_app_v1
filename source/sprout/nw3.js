// ===================== Net worth 3: every account in one place, and a history that adds up =====================
// Net worth = cash + savings + investments and other assets − every debt (MX.debts).
// Past months are rebuilt from your transactions the same way for every kind of account,
// so a month never jumps just because Sprout learned about a debt.
const NW3={};
{
const r2=MX.r2;
NW3.other=()=>LG.accts().filter(a=>LG.type(a)==='other'&&+a.cur>0);
// own: checking, savings, investments and any other account with money in it (a crypto or HSA account, say)
LG.nw=()=>{const sav=LG.of('savings'),inv=LG.of('invest').concat(NW3.other());const C=lgR(estCash()),S=sav.length?lgR(sav.reduce((s,a)=>s+LG.bal(a),0)):lgR(Math.max(0,+state.saved||0)),I=lgR(inv.reduce((s,a)=>s+(+a.cur||0),0)),L=lgR(MX.owe()),A=lgR(C+S+I);
  return{C,S,I,A,L,N:lgR(A-L),own:lgR(Math.max(0,C)+Math.max(0,S)+Math.max(0,I))}};
netWorth=function(){return LG.nw()};
// loan payments seen in your transactions, so a loan's past balance is today's balance plus what you've paid since
NW3.loanPays=a=>{const L=LG.of('loan'),words=(String(a.inst||'')+' '+String(a.name||'')).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3&&!/^(loan|auto|bank|account|financial|services)$/.test(w));
  return (HIST||[]).filter(h=>!h.p&&h.x==='loan'&&+h.a<0&&(L.length===1||words.some(w=>String(h.m||'').toLowerCase().indexOf(w)>=0))).map(h=>({t:pd(h.d),a:-h.a}))};
LG.series=()=>{const n=LG.nw(),now=realDay(),d0=new Date(now),out=[],months=[];for(let i=24;i>=0;i--)months.push(new Date(Date.UTC(d0.getUTCFullYear(),d0.getUTCMonth()-i,1)));
  const live=LG.live(),A=LG.accts(),by={};(HIST||[]).forEach(h=>{if(h.p)return;(by[h.ac]=by[h.ac]||[]).push(h)});
  // history starts with the earliest transaction Sprout has for checking or a card
  let from=now;if(live)A.forEach(a=>{const t=LG.type(a);if(t!=='cash'&&t!=='card'&&t!=='savings')return;const H=by[LG.label(a)];if(H&&H.length)from=Math.min(from,H.reduce((m,h)=>Math.min(m,pd(h.d)),Infinity))});
  if(!live){const g=LG.st(),nws=g.nws||{};months.forEach((d,i)=>{const mk=fd(d).slice(0,7),last=i===months.length-1;if(last){out.push(Object.assign(LG.mo(d),{cash:n.C,sav:lgR(n.S+n.I),debt:n.L}));return}const s=nws[mk];if(s)out.push(Object.assign(LG.mo(d),{cash:s.c,sav:s.s,debt:s.d}))});out.forEach(o=>{o.a=lgR(o.cash+o.sav);o.v=lgR(o.a-o.debt)});return out}
  const typed=(state.debts||[]).filter(d=>!d.acct&&+d.bal>0),PLs=(()=>{try{return PL.plans()}catch(e){return []}})();
  months.forEach((d,i)=>{const last=i===months.length-1,me=Math.min(now,Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0));
    if(last){out.push(Object.assign(LG.mo(d),{cash:n.C,sav:lgR(n.S+n.I),debt:n.L,est:0}));return}
    if(me<from)return;let cash=LG.of('cash').length?0:n.C,sav=LG.of('savings').length?0:n.S,inv=0,debt=0,est=0;
    A.forEach(a=>{const t=LG.type(a),after=(by[LG.label(a)]||[]).reduce((s,h)=>pd(h.d)>me?s+(+h.a||0):s,0),cur=+a.cur||0;
      if(t==='cash')cash+=cur-after;else if(t==='savings')sav+=cur-after;else if(t==='invest'||(t==='other'&&cur>0)){inv+=cur;est=1}
      else if(t==='card')debt+=Math.max(0,cur+after);
      else if(t==='loan'){const paid=NW3.loanPays(a).filter(p=>p.t>me).reduce((s,p)=>s+p.a,0);debt+=Math.max(0,cur+paid);if(!paid)est=1}});
    // typed-in debts: today's balance (Sprout has no history for them)
    typed.forEach(dd=>{debt+=+dd.bal;est=1});
    // pay-later: from the first payment on, what was still due after that month
    PLs.forEach(p=>{const it=p.items||[];if(!it.length)return;const start=it[0].t-14*MS;if(me<start)return;debt+=it.filter(x=>x.t>me).reduce((s,x)=>s+x.amt,0)});
    out.push(Object.assign(LG.mo(d),{cash:lgR(cash),sav:lgR(sav+inv),debt:lgR(debt),est}))});
  out.forEach(o=>{o.a=lgR(o.cash+o.sav);o.v=lgR(o.a-o.debt)});return out};
// ---------- the accounts list ----------
NW3.st={by:'type',zero:false};
NW3.ICO={cash:'bank',savings:'piggy',invest:'chart',other:'chart',card:'card',loan:'key',student:'cap',auto:'car',paylater:'pl',borrow:'bolt',person:'heart'};
NW3.cleanName=a=>{let s=LG.nm(String(a.name||'Account').replace(new RegExp('\\s*[.•x*#]{2,}\\s*'+(a.mask||'@@')+'\\s*$'),''));
  if(s===s.toUpperCase()&&/[A-Z]{3}/.test(s))s=s.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());return s.replace(/\s*\.{2,}\s*\d*\s*$/,'').trim()};
NW3.items=()=>{const out=[];LG.accts().forEach(a=>{const t=LG.type(a);if(t==='other'&&!(+a.cur>0))return;const debt=t==='card'||t==='loan',v=debt?Math.max(0,+a.cur||0):(t==='invest'||t==='other'?+a.cur||0:LG.bal(a));
    out.push({id:a.id,g:t==='other'?'invest':t,ico:t==='loan'?(/student/i.test(a.sub||'')?NW3.ICO.student:/auto|car/i.test(a.sub||'')?NW3.ICO.auto:NW3.ICO.loan):NW3.ICO[t],name:NW3.cleanName(a),mask:a.mask||'',bank:a.inst||'Your bank',sub:[a.inst,F2.subName(a)].filter(Boolean).join(' · '),v:r2(v),debt,src:'bank'})});
  MX.debts().forEach(d=>{if(d.src==='bank')return;const g=d.kind==='paylater'||d.kind==='borrow'?'later':d.kind==='card'?'card':d.kind==='person'||d.kind==='other'?'owed':'loan';
    out.push({id:d.key,g,ico:NW3.ICO[d.kind]||'key',name:d.name,mask:'',bank:d.src==='plan'?(d.prov||'Pay later'):'Typed in',sub:d.src==='plan'?(d.prov||'Pay later')+(d.left?' · '+d.left+' payment'+(d.left===1?'':'s')+' left':''):'Typed in'+(d.aprSet&&d.apr?' · '+d.apr+'% APR':''),v:d.bal,debt:true,src:d.src,go:d.src==='plan'?'data-x="open" data-v="paylater"':'data-x="open" data-v="ydebt" data-w="'+(state.debts||[]).indexOf(d.debt)+'"'})});
  return out};
NW3.G=[['cash','Checking','Your daily number uses this'],['savings','Savings','Counts in net worth, not your daily number'],['invest','Investments and retirement','Counts in net worth, never in your daily number'],['card','Credit cards',''],['loan','Loans',''],['later','Pay later and cash advances',''],['owed','Owed to people and other','']];
NW3.row=x=>'<'+(x.go?'button type="button" '+x.go:'div')+' class="nwr"><span class="nwi">'+catIcon(x.ico,'sm')+'</span><span class="nwt"><b>'+esc(x.name)+(x.mask?' <em>••'+esc(x.mask)+'</em>':'')+'</b><small>'+esc(x.sub)+'</small></span><span class="nwa'+(x.debt?' owe':'')+'">'+(x.debt&&x.v>0?'−':'')+money(x.v)+'</span>'+(x.go?'<span class="chev">›</span></button>':'</div>');
NW3.list=()=>{const I=NW3.items();if(!I.length)return '<div class="xcard"><b>No accounts yet</b><small class="xhint">Connect your bank and every account shows up here, from checking to your 401(k).</small><div class="svbtns"><button class="sbtn" data-x="nav" data-v="accts">Connect accounts</button></div></div>';
  const zero=I.filter(x=>Math.abs(x.v)<0.005),live=I.filter(x=>Math.abs(x.v)>=0.005||NW3.st.zero);let groups;
  if(NW3.st.by==='bank'){const m={};live.forEach(x=>{(m[x.bank]=m[x.bank]||[]).push(x)});groups=Object.keys(m).sort((a,b)=>a==='Typed in'?1:b==='Typed in'?-1:a.localeCompare(b)).map(k=>[k,k,'',m[k]])}
  else groups=NW3.G.map(g=>[g[0],g[1],g[2],live.filter(x=>x.g===g[0])]).filter(g=>g[3].length);
  return '<div class="nwhd"><h3>Accounts</h3>'+F3.seg('nwby',[['type','By type'],['bank','By bank']],NW3.st.by)+'</div>'+groups.map(g=>{const own=g[3].filter(x=>!x.debt).reduce((s,x)=>s+x.v,0),owe=g[3].filter(x=>x.debt).reduce((s,x)=>s+x.v,0),tot=r2(own-owe);
    return '<div class="xcard nwg"><div class="nwgh"><b>'+esc(g[1])+'</b><span class="'+(tot<0?'owe':'')+'">'+(tot<0?'−':'')+money(Math.abs(tot))+'</span></div>'+(g[2]?'<small class="xhint">'+g[2]+'</small>':'')+g[3].sort((a,b)=>Math.abs(b.v)-Math.abs(a.v)).map(NW3.row).join('')+'</div>'}).join('')+
   (zero.length?'<button type="button" class="lnk nwz" data-f3="nwzero" data-v="1">'+(NW3.st.zero?'Hide accounts at $0':'Show '+zero.length+' account'+(zero.length===1?'':'s')+' at $0')+'</button>':'')};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-f3=nwby],[data-f3=nwzero]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.dataset.f3==='nwby')NW3.st.by=b.dataset.v;else NW3.st.zero=!NW3.st.zero;xRender()},true);
// ---------- the Net worth screen ----------
NW3.rg='1y';
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-f3=nwrg]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();NW3.rg=b.dataset.v;xRender()},true);
PAGES.networth=()=>{const n=LG.nw(),S=LG.series(),k={'6m':7,'1y':13,'2y':25}[NW3.rg]||13,past=S.slice(-k),W=F3.nwPts(),first=past[0];
  const pts=past.map((s,i)=>({t:i===past.length-1?realToday():Date.UTC(s.d.getUTCFullYear(),s.d.getUTCMonth()+1,0),v:s.v,lab:i===past.length-1?'Today':s.m+' '+s.y})),ahead=W.fut.slice(0,NW3.rg==='6m'?6:12).map(p=>Object.assign({},p,{lab:sdate(p.t)}));
  const all=pts.concat(ahead),chg=first?r2(n.N-first.v):0;
  let h='<div class="f3hero nwh"><span class="k">Net worth</span><b class="'+(n.N<0?'neg':'')+'">'+money0(n.N)+'</b>'+(first&&past.length>1?'<span class="f3pill '+(chg>=0?'up':'dn')+'">'+(chg>=0?'▲ ':'▼ ')+money0(Math.abs(chg))+' since '+first.m+' '+first.y+'</span>':'<span class="d">History starts now. Sprout records your net worth each month from here.</span>')+
    '<div class="f3chips"><span>Own <b>'+money0(n.own)+'</b></span><span>Owe <b>'+money0(n.L)+'</b></span></div></div>';
  h+='<div class="xcard"><div class="f3ch"><h3>Over time</h3>'+F3.seg('nwrg',[['6m','6M'],['1y','1Y'],['2y','2Y']],NW3.rg)+'</div>'+
    (all.length>1?MX.chart(all,{h:170,split:pts.length-1,zero:true,color:chg<0?'var(--mxc-bad)':'var(--mxc-good)',labels:[[all[0].t,all[0].lab.split(' ')[0]],[realToday(),'Today'],[all[all.length-1].t,sdate(all[all.length-1].t)]],past:'',fut:'ahead, on this plan'}):'<p class="xhint">Not enough history yet.</p>')+
    '<div class="nwkey"><span><i class="solid"></i>Past, from your transactions</span><span><i class="dash"></i>Ahead, if your plan goes as set</span></div>'+
    (past.some(s=>s.est)?'<p class="xhint" style="margin:0">Investments and typed-in debts show today’s balance for past months, because Sprout doesn’t have their history.</p>':'')+'</div>';
  if(first&&past.length>1){const d=(a,b)=>r2(a-b),L=past[past.length-1],mv=[['Checking',d(L.cash,first.cash)],['Savings and investments',d(L.sav,first.sav)],['What you owe',d(first.debt,L.debt)]];
    h+='<div class="xcard"><h3>What moved it since '+first.m+'</h3>'+mv.map(m=>'<div class="nwmv"><span>'+m[0]+(m[0]==='What you owe'?'<small>'+(m[1]>=0?'Paid down':'Went up')+'</small>':'')+'</span><b class="'+(m[1]<0?'dn':'up')+'">'+(m[1]<0?'−':'+')+money0(Math.abs(m[1]))+'</b></div>').join('')+
      '<div class="nwmv tot"><span>Net worth</span><b class="'+(chg<0?'dn':'up')+'">'+(chg<0?'−':'+')+money0(Math.abs(chg))+'</b></div></div>'}
  return h+NW3.list()+'<p class="xhint">From your bank: today’s balances'+(state.link&&state.link.at?', last synced '+agoTxt(state.link.at):'')+'. Past months are worked out from your transactions. Estimates only. Your statements are the final word.</p>'};
TITLES.accounts='Accounts';
PAGES.accounts=()=>{const n=LG.nw();return '<div class="f3hero"><span class="k">Net worth</span><b class="'+(n.N<0?'neg':'')+'">'+money0(n.N)+'</b><div class="f3chips"><span>Own <b>'+money0(n.own)+'</b></span><span>Owe <b>'+money0(n.L)+'</b></span></div></div>'+NW3.list()};
try{if(window.__S)window.__S.NW3=NW3}catch(e){}
}
