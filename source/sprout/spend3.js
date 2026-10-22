// ===================== Spending 3: a steady summary, and filters people actually use =====================
// The summary is three numbers that never change size; the fine print folds into "What's counted and what isn't".
// Filters are one row: When, Filter (type, category, account, amount) and Sort. Search stays on the list.
const SP3={open:false};
{
const r2=MX.r2;
// ---------- the summary ----------
LG.sumHTML=L=>{const F=LG.flows(L),sg=v=>(v<0?'−':'+')+money(Math.abs(v));let mv={net:0,out:0,inn:0,who:[]};try{const r=txRange();mv=LG.moved(r[0],r[1])}catch(e){}
  const net=lgR(F.net-mv.net),notes=[];
  if(Math.abs(mv.net)>0.004)notes.push(mv.net>0?money(mv.net)+' went to accounts Sprout can’t see'+(mv.who.length?' ('+esc(mv.who.join(', '))+')':'')+'. It’s taken out of Net. Link those accounts to follow it.':'Net includes '+money(-mv.net)+' that came back from accounts Sprout can’t see.');
  if(F.ref>0.004)notes.push('Refunds of '+money(F.ref)+' lower Money out.');
  if(F.cp>0.004)notes.push('Money out includes '+money(F.cp)+' paid to a card Sprout can’t see. Link that card to see what you bought with it.');
  notes.push('Moving money between your own accounts, including to yourself by Zelle, isn’t counted'+(F.xfer>0.004?' ('+money(F.xfer)+' here)':'')+'.');
  return '<div><span>Money in</span><b class="pos">+'+money(F.inc)+'</b></div><div><span>Money out</span><b>−'+money(Math.max(0,F.out))+'</b></div><div><span>Net</span><b class="'+(net<0?'neg':'pos')+'">'+sg(net)+'</b></div>'+
    '<details class="sp3det"><summary>What’s counted and what isn’t</summary><ul>'+notes.map(n=>'<li>'+n+'</li>').join('')+'</ul></details>'};
// ---------- filters ----------
TXF.acct=TXF.acct||'';TXF.bc=TXF.bc||'';
SP3.WHEN=[['week','Last 7 days'],['month','Last 30 days'],['thism','This month'],['lastm','Last month'],['3m','Last 3 months'],['all','All time'],['custom','Pick dates']];
SP3.SORT=[['new','Newest first'],['old','Oldest first'],['big','Largest first'],['small','Smallest first']];
SP3.TYPES=[['all','Everything'],['out','Money out'],['in','Money in'],['Everyday','Basics'],['Personal','Fun'],['Bill','Bills and payments']];
{const _r=txRange;txRange=function(){const t=realDay(),d=new Date(t);if(TXF.when==='lastm')return[Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-1,1),Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),0)];if(TXF.when==='3m')return[t-90*MS,t];return _r.apply(this,arguments)}}
{const _l=txList;txList=function(){let L=_l.apply(this,arguments);try{if(TXF.acct)L=L.filter(s=>String(s.acct||(s.card?'Card':'Logged by you'))===TXF.acct);if(TXF.bc)L=L.filter(s=>B2.counts(s)&&B2.catOf(s)===TXF.bc)}catch(e){}return L}}
SP3.accts=()=>{const set=new Set();(state.spend||[]).forEach(s=>set.add(String(s.acct||(s.card?'Card':'Logged by you'))));return [...set].sort()};
SP3.nf=()=>(TXF.type!=='all'?1:0)+(TXF.acct?1:0)+(TXF.bc?1:0)+((+parseAmt(TXF.min)>0||+parseAmt(TXF.max)>0)?1:0);
SP3.bar=()=>{const ch=(list,key)=>list.map(o=>'<button type="button" class="wchip'+(TXF[key]===o[0]?' on':'')+'" data-txf="'+key+'" data-v="'+o[0]+'">'+o[1]+'</button>').join(''),n=SP3.nf();
  return '<div class="sp3bar"><label class="sp3sel"><span class="sr">When</span><select id="sp3-when">'+SP3.WHEN.map(o=>'<option value="'+o[0]+'"'+(TXF.when===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></label>'+
    '<button type="button" class="sp3fb'+(n?' on':'')+'" data-sp3f aria-expanded="'+SP3.open+'">Filter'+(n?' · '+n:'')+'</button>'+
    (TXV==='list'?'<label class="sp3sel"><span class="sr">Sort</span><select id="sp3-sort">'+SP3.SORT.map(o=>'<option value="'+o[0]+'"'+(TXF.sort===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></label>':'')+'</div>'+
   (TXF.when==='custom'?'<div class="row sp3cus"><label class="f">From<input type="date" id="tx-from" value="'+esc(TXF.from)+'"></label><label class="f">To<input type="date" id="tx-to" value="'+esc(TXF.to)+'"></label></div>':'')+
   (SP3.open?'<div class="sp3fp"><div class="txf"><span>Show</span><div class="wchips">'+ch(SP3.TYPES,'type')+'</div></div>'+
     '<div class="row"><label class="f">Category<select id="sp3-bc"><option value="">Any</option>'+BCATS.map(c=>'<option value="'+esc(c[0])+'"'+(TXF.bc===c[0]?' selected':'')+'>'+esc(c[1])+'</option>').join('')+'</select></label>'+
     '<label class="f">Account<select id="sp3-acct"><option value="">Any</option>'+SP3.accts().map(a=>'<option value="'+esc(a)+'"'+(TXF.acct===a?' selected':'')+'>'+esc(LG.short(a))+'</option>').join('')+'</select></label></div>'+
     '<div class="row"><label class="f">Min amount<input id="tx-min" type="text" inputmode="decimal" placeholder="$0" value="'+esc(TXF.min)+'"></label><label class="f">Max amount<input id="tx-max" type="text" inputmode="decimal" placeholder="Any" value="'+esc(TXF.max)+'"></label></div>'+
     (n?'<button type="button" class="lnk" data-sp3clear>Clear filters</button>':'')+'</div>':'')};
{const _rt=renderTx;renderTx=function(){const r=_rt.apply(this,arguments);try{const v=document.getElementById('txv');if(!v)return r;
    // the old chip rows step aside for the one-line bar
    v.querySelectorAll('.txbody>.txf,.txbody>.txmore').forEach(el=>{el.hidden=true});
    let bar=document.getElementById('sp3');if(!bar){bar=document.createElement('div');bar.id='sp3'}
    const seg=document.getElementById('tx-seg'),list=document.getElementById('tx-list'),q=v.querySelector('.txsearch');
    if(TXV==='ins'){bar.hidden=true;if(q)q.hidden=true}else{bar.hidden=false;bar.innerHTML=SP3.bar();if(q){q.hidden=TXV!=='list';list.parentElement.insertBefore(q,list)}list.parentElement.insertBefore(bar,q&&!q.hidden?q:list)}
    // the By category headline names a real category, not "everything else"
    if(TXV==='cat'){const p=list.querySelector('.catsum p');if(p){const rows=[...list.querySelectorAll('.catr')].map(c=>({n:(c.querySelector('.catt b')||{}).textContent||'',v:(c.querySelector('.cata')||{}).textContent||''})).filter(x=>!/everything else|payments to cards|card payments|loan payments|bill/i.test(x.n));
        const tot=num((list.querySelector('.catsum b')||{}).textContent||'0');if(rows[0]&&tot>0)p.innerHTML='Biggest category: <b>'+esc(rows[0].n)+'</b>, '+Math.round(num(rows[0].v)/tot*100)+'% of the total.'}}}catch(e){try{console.warn('spend3',e)}catch(_){}}return r}}
const num=s=>parseFloat(String(s).replace(/[^0-9.]/g,''))||0;
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.id)return;if(t.id==='sp3-when'){TXF.when=t.value;renderTx()}else if(t.id==='sp3-sort'){TXF.sort=t.value;renderTx()}else if(t.id==='sp3-bc'){TXF.bc=t.value;renderTx()}else if(t.id==='sp3-acct'){TXF.acct=t.value;renderTx()}});
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;if(t.closest('[data-sp3f]')){SP3.open=!SP3.open;renderTx();return}
  if(t.closest('[data-sp3clear]')){Object.assign(TXF,{type:'all',acct:'',bc:'',min:'',max:''});renderTx()}});
try{if(window.__S)window.__S.SP3=SP3}catch(e){}
}
