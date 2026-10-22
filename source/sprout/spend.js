// ===================== Spending: insights, categories and every transaction in one place =====================
// Insights used to hide behind a small chart icon. Now they open first in Spending, next to By category and All transactions,
// with a card on Finances and one line on Home that lead there.
const SP={};
{
const r2=x=>Math.round((+x||0)*100)/100,DY=MS;
const mkOf=t=>fd(t).slice(0,7);
// what counts as spending, by month and by budget, the same way the budgets count it
SP.rows=()=>(state.spend||[]).filter(s=>s&&isDate(s.d)&&B2.counts(s)).map(s=>({s,t:pd(s.d),m:s.d.slice(0,7),amt:(LG.isRefund(s)?-1:1)*(+s.amt||0),cat:B2.catOf(s),note:String(s.note||'')}));
SP.months=n=>{const T=realDay(),d=new Date(T),out=[];for(let k=n-1;k>=0;k--){const t=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-k,1);out.push(mkOf(t))}return out};
SP.byMonth=()=>{const o={};SP.rows().forEach(r=>{o[r.m]=(o[r.m]||0)+r.amt});return o};
SP.monthLabel=m=>new Date(pd(m+'-01')).toLocaleDateString('en-US',{timeZone:'UTC',month:'short'});
SP.place=m=>{let n='';try{n=LG.whoName(m)}catch(e){}n=String(n||tidy(m)||'Other').replace(/\b(\w+)( \1\b)+/gi,'$1').trim();return n||'Other'};
SP.dd=t=>String(t||'').replace(/\b([A-Za-z][\w']*(?: [A-Za-z][\w']*){0,2})(?: \1\b)+/g,'$1');
SP.top=()=>{let I=[];try{I=BR.insights().map(i=>Object.assign({},i,{t:SP.dd(i.t),s:SP.dd(i.s)}))}catch(e){}const pr={dup:0,low:1,pay:2,odd:3,fee:4,pace:5,new:6};return I.sort((a,b)=>(pr[a.k]==null?9:pr[a.k])-(pr[b.k]==null?9:pr[b.k]))};
SP.html=()=>{B2.sync();const T=realDay(),mk=mkOf(T),dom=new Date(T).getUTCDate(),R=SP.rows(),cur=R.filter(r=>r.m===mk),tot=r2(cur.reduce((a,r)=>a+r.amt,0)),lim=BCATS.reduce((a,c)=>a+budLim(c),0);
  const lm=mkOf(Date.UTC(new Date(T).getUTCFullYear(),new Date(T).getUTCMonth()-1,1)),prev=r2(R.filter(r=>r.m===lm&&new Date(r.t).getUTCDate()<=dom).reduce((a,r)=>a+r.amt,0));
  if(!R.length)return '<div class="txempty"><b>Nothing to look at yet</b><p>Connect your bank, import a statement or log what you spend, and Sprout shows where your money goes.</p></div>';
  let h='<div class="spsum"><span class="k">'+SP.monthLabel(mk)+' so far</span><b>'+money0(tot)+'</b><small>'+(lim>0?Math.round(tot/lim*100)+'% of your '+money0(lim)+' budget · ':'')+(prev>0?(tot>prev?money0(tot-prev)+' more':money0(prev-tot)+' less')+' than this time last month':'Every purchase, from your bank, cards and what you log')+'</small>'+
    (lim>0?'<div class="xbar'+(tot>lim?' over':tot>lim*0.85?' near':'')+'"><i style="width:'+Math.min(100,Math.round(tot/lim*100))+'%"></i></div>':'')+'</div>';
  // one smart budget suggestion at most
  try{if(typeof SG!=='undefined')h+=SG.card()}catch(e){}
  // heads-up: real things in your own transactions
  const I=SP.top().slice(0,4);if(I.length)h+='<div class="xsec">Worth a look</div><div class="spins">'+I.map(i=>'<div class="spi spi-'+esc(i.k||'x')+'"><b>'+esc(i.t)+'</b><span>'+esc(i.s)+'</span>'+(i.go&&i.go[0]?'<button type="button" class="lnk" data-x="open" data-v="'+esc(i.go[0])+'">Open</button>':'')+'</div>').join('')+'</div>';
  // six months, with the average
  const M=SP.months(6),bm=SP.byMonth(),vals=M.map(m=>Math.max(0,bm[m]||0)),mx=Math.max(1,...vals),full=vals.slice(0,-1).filter(v=>v>0),avg=full.length?full.reduce((a,b)=>a+b,0)/full.length:0;
  h+='<div class="xsec">Month by month</div><div class="xcard spm"><div class="spbars">'+M.map((m,i)=>'<div class="spb'+(i===M.length-1?' now':'')+'"><span class="spv">'+money0(vals[i])+'</span><i style="height:'+Math.max(2,Math.round(vals[i]/mx*100))+'%"></i><span class="spl">'+SP.monthLabel(m)+'</span></div>').join('')+
    '</div>'+(avg>0?'<small class="xhint">Your average is '+money0(avg)+' a month. '+SP.monthLabel(M[M.length-1])+' is still going.</small>':'')+'</div>';
  // biggest categories: the full list lives in By category
  const bc={};cur.forEach(r=>{bc[r.cat]=(bc[r.cat]||0)+r.amt});const top=Object.entries(bc).filter(e=>e[1]>0.004).sort((a,b)=>b[1]-a[1]).slice(0,3);
  if(top.length)h+='<div class="xsec">Where it’s going</div><div class="xcard">'+top.map(e=>{const c=BCATS.find(z=>z[0]===e[0])||[e[0],'Other'],l=budLim(c);return '<div class="sptc">'+catIcon('b:'+e[0],'sm')+'<div><b>'+esc(c[1])+'</b><small>'+(l>0?money0(e[1])+' of '+money0(l):money0(e[1]))+'</small></div><span>'+Math.round(e[1]/Math.max(1,tot)*100)+'%</span></div>'}).join('')+'<button type="button" class="lnk" data-txview="cat">See every category</button></div>';
  // the places you spend most
  const pl={};cur.filter(r=>r.amt>0).forEach(r=>{const k=SP.place(r.note);pl[k]=(pl[k]||{v:0,n:0});pl[k].v+=r.amt;pl[k].n++});const tp=Object.entries(pl).sort((a,b)=>b[1].v-a[1].v).slice(0,5);
  if(tp.length)h+='<div class="xsec">Top places this month</div><div class="xcard">'+tp.map(e=>'<div class="ixr"><span>'+esc(e[0])+'</span><small>'+e[1].n+'×</small><b>'+money0(e[1].v)+'</b></div>').join('')+'</div>';
  // what repeats
  let subs=[];try{subs=subsList().filter(x=>x.st==='active')}catch(e){}const smo=subs.reduce((a,x)=>a+x.amt,0),plo=PL.owed(),bl=(state.bills||[]).reduce((a,b)=>a+(b.type==='monthly'?+b.amt:+b.amt*30.44/Math.max(1,+b.every||30)),0);
  h+='<div class="xsec">What repeats</div><div class="xgrid">'+
    '<button class="xtile" data-x="open" data-v="subs"><span class="ico">'+ic('repeat')+'</span><b>Subscriptions</b><small>'+(subs.length?subs.length+' · '+money0(smo)+'/mo':'None found yet')+'</small></button>'+
    '<button class="xtile" data-x="open" data-v="yourplan"><span class="ico">'+ic('doc')+'</span><b>Bills</b><small>'+((state.bills||[]).length?money0(bl)+'/mo':'Add your bills')+'</small></button>'+
    '<button class="xtile" data-x="open" data-v="paylater"><span class="ico">'+ic('cal')+'</span><b>Pay later</b><small>'+(plo>0?money0(plo)+' left':'No open plans')+'</small></button>'+
    '<button class="xtile" data-x="open" data-v="calendar"><span class="ico">'+ic('cal')+'</span><b>Money calendar</b><small>Every date ahead</small></button></div>';
  return h};
// the tabs: Insights first
txSegSync=function(){let g=document.getElementById('tx-seg');if(!g){const sum=document.getElementById('tx-sum');if(!sum)return;g=document.createElement('div');g.id='tx-seg';g.className='xseg2';g.setAttribute('role','tablist');sum.insertAdjacentElement('afterend',g)}
  g.innerHTML=[['ins','Insights'],['cat','By category'],['list','All transactions']].map(v=>'<button type="button" role="tab" data-txview="'+v[0]+'" aria-selected="'+(TXV===v[0])+'" class="'+(TXV===v[0]?'on':'')+'">'+v[1]+'</button>').join('')};
{const _rt=renderTx;renderTx=function(){const r=_rt.apply(this,arguments);try{const v=document.getElementById('txv');if(v){v.classList.toggle('insmode',TXV==='ins');const g=document.getElementById('tx-seg');if(g&&g.parentElement!==v.querySelector('.txbody'))0}
    if(TXV==='ins'){const L=document.getElementById('tx-list');if(L)L.innerHTML=SP.html();const g=document.getElementById('tx-seg'),b=v&&v.querySelector('.txbody');if(g&&b&&b.firstElementChild!==g)b.insertBefore(g,b.firstElementChild)}
    else{const g=document.getElementById('tx-seg'),s=document.getElementById('tx-sum');if(g&&s&&s.nextElementSibling!==g)s.insertAdjacentElement('afterend',g)}}catch(e){}return r}}
SP.open=view=>{TXV=view||'ins';TXCX=null;closeSheets();setTimeout(()=>{if(typeof openTx==='function')openTx();else renderTx()},closeSheetsDelay()+20)};
insOpen=function(){SP.open('ins')};
try{FOCUS['#txv'].t='Spending'}catch(e){}
// Transactions (menu, the Finances tile) opens the full list; the chart and insights open Insights
document.addEventListener('click',e=>{const m=e.target.closest&&e.target.closest('[data-nav=tx]');if(m)TXV='list'},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-spins]');if(b){e.preventDefault();SP.open('ins')}});
// Finances: a big Spending card right under net worth
SP.card=()=>{const T=realDay(),mk=mkOf(T),cur=SP.rows().filter(r=>r.m===mk),tot=r2(cur.reduce((a,r)=>a+r.amt,0)),lim=BCATS.reduce((a,c)=>a+budLim(c),0),bc={};cur.forEach(r=>{bc[r.cat]=(bc[r.cat]||0)+r.amt});
  const t=Object.entries(bc).filter(e=>e[0]!=='oth'&&e[1]>0.004).sort((a,b)=>b[1]-a[1])[0],tc=t&&BCATS.find(z=>z[0]===t[0]),I=SP.top()[0];let sg=null;try{sg=typeof SG!=='undefined'?SG.next():null}catch(e){}
  return '<button type="button" class="ovcard wide spcard" data-spins><div class="och"><span>Spending</span><em>›</em></div><b class="mid">'+money0(tot)+'<small> this month'+(lim>0?' of '+money0(lim):'')+'</small></b>'+(lim>0?'<div class="xbar'+(tot>lim?' over':tot>lim*0.85?' near':'')+'"><i style="width:'+Math.min(100,Math.round(tot/lim*100))+'%"></i></div>':'')+
    (tc&&t[1]>0?'<div class="sptop">'+catIcon('b:'+tc[0],'sm')+'<span>Most on <b>'+esc(tc[1])+'</b> · '+money0(t[1])+'</span></div>':'')+
    (sg?'<div class="spnote"><span class="spdot"></span>'+esc(sg.short)+'</div>':I?'<div class="spnote"><span class="spdot"></span>'+esc(I.t)+'</div>':'<small>Insights, categories and every transaction</small>')+'</button>'};
{const _mh=moneyHTML;moneyHTML=function(){const h=_mh.apply(this,arguments);try{const i=h.indexOf('<button class="nwcard"');if(i<0)return h;const j=h.indexOf('</button>',h.indexOf('class="nwgo"',i))+9;return h.slice(0,j)+SP.card()+h.slice(j)}catch(e){return h}}}
// Home: one line pointing to your top insight, never a second chart
{const _ic=insightCard;insightCard=function(){const h=_ic.apply(this,arguments);try{let sg=null;try{sg=typeof SG!=='undefined'?SG.next():null}catch(e){}const I=SP.top()[0],t=sg?sg.short:I?I.t:'';if(!t)return h;
    return h+'<button type="button" class="ovins" data-spins><span>Top insight</span><b>'+esc(t)+'</b><em>›</em></button>'}catch(e){return h}}}
try{if(window.__S)window.__S.SP=SP}catch(e){}
}
