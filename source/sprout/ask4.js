// ===================== Ask 4: remembers the conversation, answers in one shape, and the chat shows what you sent =====================
// Plan numbers everywhere (the same income and left-over the plan uses), a price kept apart from a down payment, the
// disclaimer once per chat, older answers folded, a sticky input with examples that rotate, and buttons that do something.
const ASK4={ctx:{},st:{}};
{
const r2=MX.r2,lower=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim(),Bm=n=>'**'+money0(n)+'**';
ASK4.NOTE='Math from your data, not financial advice.';
// ---------- the plan's numbers, not a bank-history average ----------
FZ.mo=()=>{const T=realToday(),R=(rows||[]).filter(r=>r.d1>T&&r.lab!=='Today').slice(0,3);if(!R.length){const inc=MX.incMo();return{inc,out:inc,left:0,n:0,src:'plan'}}
  const days=R.reduce((a,r)=>a+r.days,0),k=365/12/Math.max(1,days),inc=r2(R.reduce((a,r)=>a+r.inc,0)*k),must=r2(R.reduce((a,r)=>a+(r.must||0),0)*k),bud=r2(R.reduce((a,r)=>a+r.every,0)*k),goals=r2(R.reduce((a,r)=>a+(r.goals||0),0)*k),extra=r2(R.reduce((a,r)=>a+Object.values(r.ex||{}).reduce((x,y)=>x+y,0),0)*k);
  return{inc,out:r2(must+bud),left:r2(Math.max(0,inc-must-bud)),must,bud,goals,extra,n:R.length,src:'plan'}};
// ---------- what the message is about: price, down payment, rate, length, item ----------
ASK4.money=t=>{const m=String(t||'').match(/\$?\s?(\d[\d,]*(?:\.\d+)?)\s*(k\b)?/i);if(!m)return 0;return r2(parseFloat(m[1].replace(/,/g,''))*(m[2]?1000:1))};
ASK4.parse=raw=>{const s=lower(raw),o={};
  const dn=s.match(/\b(?:put|with|pay|paying|have)\s+\$?\s?(\d[\d,]*(?:\.\d+)?)\s*(k\b)?\s*(?:dollars?\s*)?(?:down|as a down payment|for (?:a|the) down payment)\b/)||s.match(/\b(?:down payment|down)\s+(?:of\s+)?\$?\s?(\d[\d,]*(?:\.\d+)?)\s*(k\b)?/);if(dn)o.down=r2(parseFloat(dn[1].replace(/,/g,''))*(dn[2]?1000:1));
  const pr=s.match(/\b(?:costs?|price[sd]?|for|around|about|is|a|an)\s+\$?\s?(\d[\d,]*(?:\.\d+)?)\s*(k\b)?\s*(?:dollars?\b)?(?!\s*(?:down|a month|\/mo|per month|%|percent|months?|years?))/);
  const anyNum=s.match(/\$?\s?(\d[\d,]*(?:\.\d+)?)\s*(k\b)?/);
  if(!o.down&&anyNum&&!/\b(a month|\/mo|per month|months?|years?|%|percent)\b/.test(s.slice(anyNum.index,anyNum.index+anyNum[0].length+12))){const v=r2(parseFloat(anyNum[1].replace(/,/g,''))*(anyNum[2]?1000:1));if(v>=50)o.price=v}
  else if(pr&&!o.down){const v=r2(parseFloat(pr[1].replace(/,/g,''))*(pr[2]?1000:1));if(v>=50)o.price=v}
  const rt=s.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)/);if(rt)o.rate=+rt[1];
  const yr=s.match(/(\d+)\s*(?:years?|yr)\b/),mo=s.match(/(\d+)\s*months?\b/);if(mo)o.months=+mo[1];else if(yr)o.months=+yr[1]*12;
  const it=s.match(/\b(car|truck|suv|tesla|bmw|audi|mercedes|lexus|honda|toyota|motorcycle|house|home|condo|apartment|wedding|ring|trip|vacation|flight|laptop|phone|couch|sofa|tv|bike|boat|camera|computer|tires|furniture)\b/);if(it)o.item=it[1];
  o.finance=/\b(finance|financing|loan|lease|monthly payment|payments?)\b/.test(s);o.downQ=/\bdown\b/.test(s)&&!/\bdown from\b/.test(s);
  return o};
// ---------- the purchase plan: price, down payment, financed amount, and what the plan says ----------
ASK4.purchase=(c)=>{const price=c.price,down=c.down>0?Math.min(c.down,price):0,fin=r2(price-down),h=FZ.have(),mo=FZ.mo(),item=c.item||'it',name=/^(a|an|the|my)\b/.test(item)?item:'the '+item;
  const save=down>0?down:price,need=Math.max(0,r2(save-h.tot)),per=mo.left,n=per>0?need/per:null,when=n!=null?FZ.when(n):null;
  const isCar=/car|truck|suv|tesla|bmw|audi|mercedes|lexus|honda|toyota|motorcycle/.test(item),isHome=/house|home|condo|apartment/.test(item),rate=c.rate||(isCar?7:isHome?6.5:10),months=c.months||(isCar?60:isHome?360:36),pm=FZ.pmt(fin,rate,months),inc=mo.inc;
  const fitsAfter=down>0&&when?(()=>{const left=mo.left-pm;return left})():null;
  let reply=down>0?(need<=0?'You already have '+Bm(h.tot)+' across checking and savings, which covers the '+money0(down)+' down payment.':n!=null?'At your current pace you’d have the '+money0(down)+' down payment around **'+FZ.mlabel(when)+'** ('+FZ.dur(n)+').':'Right now nothing is left over on your plan each month, so the down payment doesn’t build up yet.'):
    (need<=0?'You already have '+Bm(h.tot)+' across checking and savings, which covers '+money0(price)+'.':n!=null?'At your current pace you’d have '+money0(price)+' for '+name+' around **'+FZ.mlabel(when)+'** ('+FZ.dur(n)+').':'Right now nothing is left over on your plan each month, so money for '+name+' doesn’t build up yet.');
  if(down>0)reply+='\n\nPrice '+money0(price)+' · down payment '+money0(down)+' · financed '+money0(fin)+'. At '+rate+'% for '+(months>=120?months/12+' years':months+' months')+', the example payment is '+Bm(pm)+' a month, about '+Math.round(pm/Math.max(1,inc)*100)+'% of what comes in ('+money0(inc)+' a month).'+(fitsAfter!=null?' After the down payment is set, your plan has '+money0(mo.left)+' a month left over, so the payment would leave about '+money0(fitsAfter)+'.':'');
  reply+='\n\nThat’s based on about '+money0(mo.left)+' a month left over on your plan after must-pays and budgets, plus the '+money0(h.tot)+' you have now.';
  const sc=[];if(n!=null){sc.push({t:'At your current pace',n,per});const flex=(()=>{try{const R=P4.recent();return Object.entries(R.cat).filter(e=>B2.kindOf(e[0])==='fun'&&e[1]>=25).sort((a,b)=>b[1]-a[1]).slice(0,2)}catch(e){return []}})(),ft=flex.reduce((a,e)=>a+e[1],0);
    if(ft>0)sc.push({t:'If '+flex.map(e=>(BCATS.find(x=>x[0]===e[0])||[0,'Other'])[1]).join(' and ')+' were 20% lower',n:need/(per+ft*0.2),per:r2(per+ft*0.2)});
    let plEnd=null,plMo=0;try{const P=PL.plans().filter(p=>p.left>0);if(P.length){plEnd=Math.max(...P.map(p=>p.items[p.items.length-1].t));plMo=r2(P.reduce((a,p)=>a+p.owed,0)/Math.max(1,(plEnd-realToday())/(30.44*MS)))}}catch(e){}
    if(plMo>=20&&plEnd)sc.push({t:'Once your pay-later plans finish ('+FZ.mlabel(plEnd)+')',n:need/(per+plMo),per:r2(per+plMo)})}
  const html='<div class="fzp"><div class="fzrow3"><div><span>Coming in</span><b>'+money0(mo.inc)+'</b><small>a month, on your plan</small></div><div><span>Must-pays and budgets</span><b>'+money0(mo.out)+'</b><small>a month</small></div><div><span>Left over</span><b>'+money0(mo.left)+'</b><small>a month</small></div></div>'+
    (down>0?'<div class="ask4kv"><span>Price<b>'+money0(price)+'</b></span><span>Down payment<b>'+money0(down)+'</b></span><span>Financed<b>'+money0(fin)+'</b></span></div>':'')+
    (sc.length?'<div class="fzh">When you could have the '+money0(save)+(down>0?' down payment':'')+'</div>'+sc.map((s,i)=>'<div class="fzsc'+(i===0?' base':'')+'"><div class="fzsct"><span>'+esc(s.t)+'</span><b>'+FZ.mlabel(FZ.when(s.n))+'</b></div><small>'+money0(s.per)+' a month · '+FZ.dur(s.n)+'</small></div>').join(''):'')+
    (fin>=1000?'<details class="askdet"><summary>Try a loan example on the '+money0(fin)+' financed</summary>'+FZ.calcHTML(fin,rate,months,inc,isHome).replace('<div class="fzh">If you paid part now</div>','').replace(/<div class="fzdp">[\s\S]*?<\/div>/,'')+'</details>':'')+'</div>';
  const btns=[{label:'Make this a goal',x:'ask4goal',v:(down>0?(c.item?c.item+' down payment':'Down payment'):(c.item||'Big purchase')).slice(0,40),w:String(Math.round(save))},{label:'Where my money goes',x:'fzspend',alt:true},{label:'Remind me monthly',x:'ask4rem',v:(c.item||'this').slice(0,40),alt:true}];
  return{reply,actions:[],local:true,buttons:btns,html,intent:'plan'}};
// ---------- the router: context first ----------
{const _ba=BR.answer;BR.answer=function(raw){try{const q=String(raw||'').trim(),s=lower(q);if(q&&q.length<=400&&!(typeof FZ!=='undefined'&&FZ.force)){const p=ASK4.parse(q),c=ASK4.ctx,fresh=c.at&&Date.now()-c.at<20*60e3;
      const perMonthQ=/\bhow much (should|do|would|will) i (need to )?(save|put away|set aside)\b|\bby (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b|\bby (next|the end of)\b/.test(s);
      const wantsPlan=!perMonthQ&&(p.downQ||p.finance||/\b(afford|buy|purchase|save (up )?for|saving for|when (can|could) i|how long until)\b/.test(s));
      if(p.item||p.price>=1000||p.down){if(p.item)c.item=p.item;if(p.price>=1000&&!p.down)c.price=p.price;if(p.down)c.down=p.down;if(p.rate)c.rate=p.rate;if(p.months)c.months=p.months;c.at=Date.now()}
      // a down payment on something we already talked about, or a price with a down payment in the same breath
      if(wantsPlan&&(p.down||(p.downQ&&fresh&&c.down))&&(c.price||p.price)){if(p.price&&p.price>(p.down||0))c.price=p.price;if(!c.price){c.at=Date.now();return Object.assign({reply:'What’s the price of '+(c.item?'the '+c.item:'it')+'? Then I can work out the down payment and the rest.',actions:[],local:true,intent:'plan'})}
        const r=ASK4.purchase(Object.assign({},c,{down:p.down||c.down}));if(r.html)FZ.H[r.reply]=r.html;return r}
      // a big item with a price: keep it, answer with the same plan numbers
      if(wantsPlan&&p.price>=1000&&!p.down){const r=ASK4.purchase(Object.assign({},c,{price:p.price,down:0}));if(r.html)FZ.H[r.reply]=r.html;return r}
      // "put 10k down" with no item or price known yet
      if(p.down&&!c.price){c.at=Date.now();return{reply:'Got it, '+money0(p.down)+' down. What’s the price'+(c.item?' of the '+c.item:'')+'? Then I can work out when the down payment could be ready and what the rest would cost a month.',actions:[],local:true,intent:'plan'}}
    }}catch(e){if(window.__brainDebug)console.error(e)}
    const r=_ba.apply(this,arguments);try{if(r&&r.reply){r.reply=r.reply.replace(/Spend 20% less on ([^.\n]+)/g,'If $1 were 20% lower').replace(/Set aside (\$[\d,]+) from each paycheck/g,'With $1 from each paycheck');if(r.html)r.html=r.html.replace(/Spend 20% less on /g,'If 20% lower on ').replace(/Set aside (\$[\d,]+) from each paycheck/g,'With $1 from each paycheck').replace('<div class="fzh">If you paid part now</div>','<details class="askdet"><summary>Try a loan example</summary><div class="fzh">If you paid part now</div>').replace(/(<\/div><p class="fzfine">[^<]*<\/p><\/div>)<\/div>$/,'$1</details></div>');if(r.html)FZ.H[r.reply]=r.html}}catch(e){}return r}}
// the note once per chat, as a quiet line (not in every answer)
FZ.NOTE=ASK4.NOTE;
{const _dc=drawChat;drawChat=function(){const r=_dc.apply(this,arguments);try{const out=$('#cmd-out'),th=out&&out.querySelector('.thread');if(!th)return r;const ais=[...th.querySelectorAll('.bub.ai:not(.typing)')];
    ais.forEach((b,i)=>{b.querySelectorAll('p').forEach(p=>{if(p.textContent.trim()===ASK4.NOTE||p.textContent.indexOf('For decisions like this, consider talking')>=0)p.remove()});
      // one shape: the first line is the answer, in bold
      const p0=b.querySelector('p');if(p0&&!p0.querySelector('b')&&p0.textContent.length<140)p0.classList.add('askhead');
      // older answers fold to their headline
      if(i<ais.length-1&&!b.classList.contains('open')){b.classList.add('fold');if(!b.querySelector('.askmore'))b.insertAdjacentHTML('beforeend','<button type="button" class="askmore">Show details</button>')}});
    if(ais.length&&!th.querySelector('.asknote'))ais[0].insertAdjacentHTML('afterend','<p class="asknote">'+ASK4.NOTE+' <button type="button" class="lnk" data-x="open" data-v="numbers">How this is figured</button></p>');
    // the message you just sent scrolls to the top of the view
    const me=[...th.querySelectorAll('.bub.me')].pop();if(me&&ASK4.st.justSent){ASK4.st.justSent=false;setTimeout(()=>{try{me.scrollIntoView({block:'start',behavior:'smooth'})}catch(e){}},60)}}catch(e){}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.askmore');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const bub=b.closest('.bub');bub.classList.toggle('fold');bub.classList.toggle('open');b.textContent=bub.classList.contains('fold')?'Show details':'Show less'},true);
{const _rc=runCmd;runCmd=function(){ASK4.st.justSent=true;return _rc.apply(this,arguments)}}
// ---------- buttons that do something, with a visible result ----------
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#cmd-out [data-x=ask4goal],#cmd-out [data-x=ask4rem],#cmd-out [data-x=fzgoal],#cmd-out [data-x=fzrem]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const a=b.dataset.x,v=b.dataset.v||'',w=+b.dataset.w||0;
  if(a==='ask4goal'||a==='fzgoal'){const g4=P4.g(),name=(v||'Goal').replace(/\b\w/,c=>c.toUpperCase()),per=MX.PER[state.payFreq]||26,amt=r2(Math.max(0,FZ.mo().left)*12/per);const g={id:'g'+Date.now().toString(36),name,target:r2(w),mode:'paycheck',amt,icon:/car|truck/i.test(name)?'car':/house|home/i.test(name)?'home':/trip|flight|vacation/i.test(name)?'plane':'star',moved:0,aside:0,hist:[]};
    g4.goals.push(g);plan();queueSave();b.textContent='Goal added ✓';b.disabled=true;D4.undo('Goal added: '+name+', '+money0(w)+(amt>0?' · '+money0(amt)+' each paycheck':''),()=>{const i=g4.goals.indexOf(g);if(i>=0)g4.goals.splice(i,1);plan();queueSave();b.textContent='Make this a goal';b.disabled=false});return}
  if(a==='ask4rem'||a==='fzrem'){if(typeof NT==='undefined'){toast('Reminders aren’t available here');return}const r={id:'goal-'+Date.now().toString(36),t:'Check in on '+(v||'your goal'),every:'month'};NT.addRem(r);b.textContent='Reminder set ✓';b.disabled=true;
    const d=new Date();const nx=new Date(d.getFullYear(),d.getMonth()+1,Math.min(28,d.getDate()));D4.undo('Monthly reminder set for '+nx.toLocaleDateString('en-US',{month:'short',day:'numeric'}),()=>{const n=NT.g();const i=n.rem.findIndex(x=>x.id===r.id);if(i>=0)n.rem.splice(i,1);queueSave();b.textContent='Remind me monthly';b.disabled=false});return}},true);
// ---------- the input: sticky, with examples that rotate, and chips from the same pool ----------
ASK4.pool=()=>{const L=(window.ASK_EXAMPLES||[]).slice();try{const T=realDay();const pl={};SP.rows().filter(r=>r.amt>0&&r.t>=T-90*MS).forEach(r=>{const k=SP.place(r.note);pl[k]=(pl[k]||0)+r.amt});const top=Object.entries(pl).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]);top.forEach(m=>{if(m.length<=14){L.push(['How much at '+m+' this month?','spent']);L.push(['Why so much at '+m+'?','trend'])}});
    MX.debts().filter(d=>d.src!=='plan').slice(0,2).forEach(d=>{const n=LG.short(d.name).replace(/\s*••.*$/,'');if(n.length<=14){L.push(['When is '+n+' paid off?','debt']);L.push(['How much interest on '+n+'?','debt'])}})}catch(e){}return L};
ASK4.next=()=>{const L=ASK4.pool();if(!L.length)return 'Can I afford this?';const st=ASK4.st;if(!st.order||st.order.length!==L.length||st.i>=st.order.length){st.order=L.map((_,i)=>i);for(let i=st.order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[st.order[i],st.order[j]]=[st.order[j],st.order[i]]}st.i=0}return L[st.order[st.i++]][0]};
ASK4.rm=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
ASK4.mount=()=>{const inp=document.getElementById('cmd-in');if(!inp||document.getElementById('askph'))return;const box=inp.parentElement;box.classList.add('askin');inp.placeholder='';const ph=document.createElement('button');ph.type='button';ph.id='askph';ph.className='askph';ph.innerHTML='Ask anything, like <em>“'+esc(ASK4.next())+'”</em>';box.insertBefore(ph,inp);
  const sync=()=>{ph.classList.toggle('hide',!!inp.value)};inp.addEventListener('input',sync);inp.addEventListener('focus',()=>ph.classList.add('focus'));inp.addEventListener('blur',()=>ph.classList.remove('focus'));
  ph.addEventListener('click',()=>{const q=ph.querySelector('em').textContent.replace(/^“|”$/g,'');inp.value=q;sync();inp.focus()});
  const tick=()=>{if(!document.getElementById('askph'))return;const vis=!inp.value&&document.activeElement!==inp&&!ASK4.rm()&&ph.offsetParent;if(vis){ph.classList.add('fade');setTimeout(()=>{ph.querySelector('em').textContent='“'+ASK4.next()+'”';ph.classList.remove('fade')},380)}setTimeout(tick,4500)};setTimeout(tick,4500);
  ASK4.chips()};
ASK4.chips=()=>{const ex=document.getElementById('cmd-ex');if(!ex)return;const L=ASK4.pool();const pick=[];const used=new Set();for(let k=0;k<40&&pick.length<6;k++){const q=L[Math.floor(Math.random()*L.length)];if(!q||used.has(q[1]))continue;used.add(q[1]);pick.push(q[0])}ex.innerHTML=pick.map(x=>'<button class="chip" data-ex="'+esc(x)+'">'+esc(x)+'</button>').join('');ex.classList.add('askrow')};
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#open-ask,[data-nav=ask],[data-x=open][data-v=ask]'))setTimeout(()=>{ASK4.mount();ASK4.chips()},120)});
setTimeout(ASK4.mount,1500);
ASK4.openWith=q=>{const o=document.getElementById('open-ask');if(o)o.click();setTimeout(()=>{const i=document.getElementById('cmd-in');if(i){i.value=q;i.dispatchEvent(new Event('input'));try{runCmd()}catch(e){}}},350)};
try{if(window.__S)window.__S.ASK4=ASK4}catch(e){}
}
// ===================== Ask 4, part 2: the AI gets Sprout's own facts, and its numbers are checked =====================
{
const r2=MX.r2;
// the facts Sprout already worked out (the AI is told to use only these)
ASK4.facts=()=>{const f={};try{const T=realToday(),mo=FZ.mo(),n=LG.nw(),fr=F3.free(),ml=MX.left(),np=(rows||[]).find(r=>r.inc>0&&r.d0>T),R=P4.rollTotal(realDay());
    Object.assign(f,{today:fd(T),incomePerMonthOnPlan:mo.inc,mustPaysPerMonth:mo.must,budgetsPerMonth:mo.bud,goalsPerMonth:mo.goals,extraToDebtPerMonth:mo.extra,leftOverPerMonthOnPlan:mo.left,
      safeToSpendToday:ml?ml.today:null,safeUntilPayday:ml?ml.left:null,nextPayday:np?fd(np.d0):null,nextPaycheck:np?r2(np.inc):null,budgetThisMonth:R.lim,spentThisMonthInBudgets:R.spent,leftThisMonthInBudgets:R.monthLeft,
      own:n.A,owe:n.L,netWorth:n.N,debtFreeMonth:fr&&!fr.none?fd(fr.t).slice(0,7):null,debts:MX.debts().slice(0,12).map(d=>({name:d.name,balance:d.bal,apr:d.aprKnown?d.apr:null,min:d.min})),
      categories:R.cats.map(c=>({name:c.name,budget:c.lim,spent:c.spent,left:c.monthLeft}))})}catch(e){}return f};
ASK4.nums=s=>(String(s).match(/\$\s?\d[\d,]*(?:\.\d+)?/g)||[]).map(x=>parseFloat(x.replace(/[$,\s]/g,''))).filter(v=>v>=1);
{const _ac=askContext;askContext=function(){let c=_ac.apply(this,arguments);try{c+='\n\nSprout’s worked-out facts (use these numbers; do not invent others; say "about" for anything you estimate):\n'+JSON.stringify(ASK4.facts())}catch(e){}return c}}
// answers are cached for a day per question and data version, so asking twice doesn't cost twice
ASK4.cacheKey=q=>{let v='';try{v=(state.spend||[]).length+'|'+Math.round(MX.owe())+'|'+Math.round(LG.nw().N)+'|'+fd(realDay())}catch(e){}return 'ask4c:'+String(q||'').toLowerCase().replace(/\s+/g,' ').trim()+'|'+v};
{const _rc=runCmd;runCmd=async function(){const i=$('#cmd-in'),q=i?String(i.value||'').trim():'';let hit=null;try{const raw=localStorage.getItem(ASK4.cacheKey(q));if(raw){const o=JSON.parse(raw);if(Date.now()-o.at<86400e3)hit=o.ai}}catch(e){}
  if(q&&hit&&!atts.length){chat.push({me:q});chat.push({ai:hit,cached:1});i.value='';ASK4.st.justSent=true;drawChat();return}
  const r=await _rc.apply(this,arguments);try{const last=chat[chat.length-1];if(q&&last&&last.ai&&!last.err&&!last.local)localStorage.setItem(ASK4.cacheKey(q),JSON.stringify({ai:last.ai,at:Date.now()}))}catch(e){}return r}}
// numbers in an AI reply are checked against Sprout's own: anything Sprout didn't calculate is flagged, advice wording is softened
{const _bw=BRwrap;BRwrap=function(fn){const w=_bw(fn);if(!w)return w;const _j=w.json;w.json=async function(prompt,opts){const res=await _j.apply(this,arguments);try{if(res&&res.reply&&!res.local){
      const known=new Set();const add=v=>{if(v==null||!isFinite(+v))return;known.add(Math.round(+v))};const F=ASK4.facts();JSON.stringify(F).replace(/-?\d+(?:\.\d+)?/g,m=>{add(Math.abs(parseFloat(m)));return m});
      String(prompt).replace(/\d[\d,]*(?:\.\d+)?/g,m=>{add(parseFloat(m.replace(/,/g,'')));return m});
      const odd=ASK4.nums(res.reply).filter(v=>{const k=Math.round(v);for(const x of known){if(Math.abs(x-k)<=Math.max(1,x*0.01))return false}return true});
      res.reply=res.reply.replace(/\byou should\b/gi,'you could').replace(/\bI recommend\b/gi,'One option is').replace(/\bI suggest\b/gi,'One option is');
      if(odd.length)res.reply+='\n\nCheck: '+odd.slice(0,3).map(v=>money0(v)).join(', ')+(odd.length>1?' aren’t numbers':' isn’t a number')+' Sprout calculated. Treat '+(odd.length>1?'them':'it')+' as rough.'}}catch(e){}return res};return w}}
}
