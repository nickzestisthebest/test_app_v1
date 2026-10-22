// ===================== Ask, smarter on the phone: typos, slang, follow-ups, and real plans for big purchases =====================
// Everything here runs on the device with the person's own numbers. The AI is only for what this can't work out.
// Answers show math from their data, never advice about what to buy, borrow or invest in.
const FZ={H:{},ctx:null,force:false};
{
const r2=x=>Math.round((+x||0)*100)/100,DY=MS,T0=()=>realDay();
const lower=s=>String(s||'').toLowerCase().replace(/[’‘]/g,"'");
// ---------- 1. reading messy questions ----------
const BASE=('how much what whats when where which who why can could should would will did does do is are am have has had my me you your the to for on at in of and or but if than this that next last past week weekend month year today tonight tomorrow yesterday now right left spend spent spending afford buy bought purchase purchases pay paid payment payments paycheck payday salary income earn make made money cash balance checking savings saving save saved account accounts budget budgets category categories groceries grocery dining restaurant restaurants coffee food gas fuel transit shopping subscriptions subscription bills bill due upcoming owe owed debt debts loan loans card cards credit score report utilization interest rate minimum net worth invest investments investing retirement klarna affirm afterpay later plan plans goal goals calendar transactions transaction biggest largest most charges charge fees fee refund refunds cancel compare versus more less over under track doing many total safe daily number allowance free remaining rent mortgage phone insurance utilities electric water internet car house home vacation trip travel wedding laptop emergency broke enough cover help hello thanks january february march april june july august september october november december monday tuesday wednesday thursday friday saturday sunday dollars bucks thousand hundred much going cost costs costing expensive cheap pets medical doctor dentist gym fitness clothes shoes amazon target walmart kroger publix costco starbucks chipotle mcdonalds uber lyft doordash netflix spotify hulu apple google insurance tuition daycare kids gift gifts birthday christmas holiday concert tickets drinks bar bars hair nails beauty').split(' ');
const SLANG={wk:'week',wks:'weeks',mo:'month',mos:'months',mnth:'month',yr:'year',yrs:'years',tmrw:'tomorrow',tmr:'tomorrow',tmw:'tomorrow',tomoz:'tomorrow',tonite:'tonight','2day':'today','2nite':'tonight',rn:'right now',u:'you',ur:'your',r:'are',pls:'please',plz:'please',groc:'groceries',grocs:'groceries',subs:'subscriptions',acct:'account',accts:'accounts',bal:'balance',chk:'checking',chking:'checking',sav:'savings',pmt:'payment',pymt:'payment',pmts:'payments',bday:'birthday',xmas:'christmas',vacay:'vacation',resto:'restaurant',gonna:'going to',wanna:'want to',gotta:'have to',cant:"can't",wont:"won't",dont:"don't",didnt:"didn't",im:"i'm",ive:"i've",whats:"what's",hows:"how's",wheres:"where's",howmuch:'how much',doordash:'doordash',ubereats:'uber eats',nw:'net worth',cc:'credit card',bnpl:'pay later',k401:'401k'};
FZ.phr=s=>{s=String(s).replace(/[a-z0-9']+/g,w=>SLANG[w]||w);PHRASE.forEach(p=>{s=s.replace(p[0],p[1])});return s};
const PHRASE=[[/\bam i broke\b|\bhow broke am i\b|\bdo i have any money\b|\bdaily number\b|\bwhat can i spend( today| now| right now| tonight)?\b/,'how much can i spend today'],[/\bwhat'?s left( for today| today| to spend)?\b(?! in| on| for (a|an|the|my))/,'how much is left to spend'],
  [/\bhow much cash (do i have|have i got)\b/,'how much money do i have'],[/\bwhat'?s coming up\b|\bwhat'?s next\b/,'upcoming payments'],[/\bwhat do i owe\b(?! (this|next|before|by|on|to))/,'how much do i owe'],
  [/\bis \$?(\d[\d,.]*k?) (ok|okay|fine|alright|cool)\b/,'can i afford $$$1'],[/\bhow much (on|at)\b/,'how much did i spend $1'],[/\bwhich budgets? (am i|are) over\b|\bwhat budgets? (am i|are) over\b/,'am i over budget'],
  [/\bwhat did i spend (the )?most on\b|\bbiggest (spending )?categor(y|ies)\b|\bwhere am i spending (the )?most\b/,'where does my money go'],[/\bhow am i looking\b|\bhow'?m i doing\b/,'how am i doing'],
  [/\bhow much debt( do i have| i have| have i got| am i in)?\b/,'how much do i owe'],[/\bwhen do i get paid\b|\bnext check\b/,'when is my next payday'],[/\bwhere did (all )?my money go\b/,'where does my money go']];
// how different two words are, counting a swap of two letters as one change
FZ.dist=(a,b,max)=>{if(Math.abs(a.length-b.length)>max)return max+1;const n=a.length,m=b.length,d=[];for(let i=0;i<=n;i++){d[i]=[i];for(let j=1;j<=m;j++)d[i][j]=i?0:j}
  for(let i=1;i<=n;i++){let best=99;for(let j=1;j<=m;j++){const c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);if(d[i][j]<best)best=d[i][j]}if(best>max)return max+1}return d[n][m]};
FZ.vocab=()=>{const k=BCATS.length+'|'+(HIST?HIST.length:0);if(FZ._v&&FZ._v.k===k)return FZ._v.v;const V=new Set(BASE);
  BCATS.forEach(c=>String(c[1]).toLowerCase().split(/[^a-z0-9]+/).forEach(w=>{if(w.length>=3)V.add(w)}));
  try{const cnt={};(HIST||[]).slice(-1500).forEach(h=>{const w=(mkey(h.m)||'').split(' ')[0];if(w&&w.length>=4&&/^[a-z]+$/.test(w))cnt[w]=(cnt[w]||0)+1});Object.keys(cnt).filter(w=>cnt[w]>=2).forEach(w=>V.add(w))}catch(e){}
  const v=[...V];FZ._v={k,v};return v};
FZ.fix=q=>{let s=lower(q);const V=FZ.vocab(),VS=new Set(V);
  s=s.replace(/[a-z0-9']+/g,w=>{if(SLANG[w])return SLANG[w];if(VS.has(w)||w.length<3||/\d/.test(w)||/^(i|a|an|it|its|it's|im|i'm|so|be|by|up|we|no|ok)$/.test(w))return w;
    const max=w.length<=4?1:2;let best=null,bd=max+1;for(const c of V){if(Math.abs(c.length-w.length)>max)continue;const d=FZ.dist(w,c,max);if(d<bd||(d===bd&&best&&c[0]===w[0]&&best[0]!==w[0])){bd=d;best=c}}
    return best&&bd<=max&&(bd<2||best[0]===w[0])?best:w});
  PHRASE.forEach(p=>{s=s.replace(p[0],p[1])});return s};

// ---------- 2. your month, from your own history ----------
FZ.mo=()=>{const M=typeof SG!=='undefined'?SG.full(3):[];const rows=M.map(m=>LG.flows((state.spend||[]).filter(s=>s&&String(s.d).slice(0,7)===m))).filter(f=>f.inc>0||f.out>0);
  if(rows.length>=2){const inc=r2(rows.reduce((a,f)=>a+f.inc,0)/rows.length),out=r2(rows.reduce((a,f)=>a+f.out,0)/rows.length);return{inc,out,left:r2(inc-out),n:rows.length,src:'history'}}
  const per={weekly:52,biweekly:26,semimonthly:24,monthly:12}[state.payFreq]||26,inc=r2((+state.pay||0)*per/12),bills=(state.bills||[]).reduce((a,b)=>a+(b.type==='monthly'?+b.amt:+b.amt*30.44/Math.max(1,+b.every||30)),0),mins=(state.debts||[]).reduce((a,d)=>a+(+d.min||0),0),out=r2((+state.everyday||0)+(+state.discReduced||0)+bills+mins);
  return{inc,out,left:r2(inc-out),n:0,src:'plan'}};
FZ.have=()=>{let c=0;try{c=Math.max(0,estCash())}catch(e){c=Math.max(0,+state.cash||0)}let s=0;try{s=LG.of('savings').reduce((a,x)=>a+LG.bal(x),0)}catch(e){}try{const v=SV();s+=(+v.bal||0)-(+v.bank||0)}catch(e){}return{cash:r2(c),sav:r2(s),tot:r2(c+s)}};
FZ.when=n=>{const d=new Date(T0());return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+Math.ceil(n),1)};
FZ.mlabel=t=>new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',year:'numeric'});
FZ.dur=n=>{n=Math.ceil(n);if(n<=1)return 'about a month';if(n<24)return n+' months';const y=Math.floor(n/12),m=n%12;return y+' year'+(y>1?'s':'')+(m?' and '+m+' month'+(m>1?'s':''):'')};
FZ.pmt=(P,apr,n)=>{const i=apr/100/12;return i>0?P*i/(1-Math.pow(1+i,-n)):P/n};
FZ.NOTE='This is math from your data, not financial advice. For decisions like this, consider talking to a licensed professional.';
FZ.big=/\b(car|cars|truck|suv|tesla|bmw|audi|mercedes|lexus|porsche|honda|toyota|rs3|m3|house|home|condo|apartment|down payment|wedding|ring|engagement|boat|motorcycle|vacation|trip|europe|japan|cruise|laptop|macbook|computer|iphone|tv|couch|furniture|surgery|tuition|college)\b/;
FZ.item=q=>{const s=lower(q);let m=s.match(/\b(?:buy|get|afford|save (?:up )?for|saving (?:up )?for|pay for|purchase)\s+(?:a |an |the |my |some |new |a new |another )*([a-z0-9][a-z0-9' -]{1,32}?)(?=\s+(?:for|that|which|by|before|in|at|this|next|and|how|when|soon|eventually|one day|someday|cost|costs|is|are)\b|[?.!,]|$)/);
  let t=m?m[1].trim():'';t=t.replace(/^(one|it|that|this|them|stuff)$/,'').replace(/\s+(one|now|soon)$/,'');if(!t){const b=s.match(FZ.big);if(b)t=b[1]}
  t=t.replace(/^\$?[\d,.]+k?\s+/,'').replace(/\s+(of|for|at|around|about|costing)\s+\$?[\d,.]+k?.*$/,'').replace(/\s+\$?[\d,.]+k?$/,'').trim();
  return t?t.replace(/\b(rs3|m3|bmw|suv|tv)\b/g,x=>x.toUpperCase()).replace(/\b(audi|tesla|mercedes|lexus|porsche|honda|toyota|macbook|iphone|japan|europe)\b/g,x=>x[0].toUpperCase()+x.slice(1)):''};
// the big-purchase plan: where you are, when you could get there, and what would change it
FZ.plan=(price,label)=>{const mo=FZ.mo(),h=FZ.have(),need=Math.max(0,r2(price-h.tot)),L=label||'it',name=label?(/^(a|an|the|my|our|some)\b/i.test(label)?label:'the '+label):'this',isCar=/car|truck|suv|tesla|bmw|audi|mercedes|lexus|porsche|honda|toyota|rs3|m3|motorcycle/i.test(L),isHome=/house|home|condo|apartment/i.test(L);
  const sc=[];const add=(t,extra)=>{const per=mo.left+extra;if(per<=0)return;sc.push({t,per:r2(per),n:need/per})};
  add('At your current pace',0);
  // the most flexible spending, from your own budgets
  let flex=[];try{const R=SP.rows(),M=SG.full(3);const by={};R.filter(r=>M.indexOf(r.m)>=0&&B2.kindOf(r.cat)==='fun').forEach(r=>{by[r.cat]=(by[r.cat]||0)+r.amt/3});flex=Object.entries(by).filter(e=>e[1]>=25).sort((a,b)=>b[1]-a[1]).slice(0,2)}catch(e){}
  const flexTot=flex.reduce((a,e)=>a+e[1],0),flexNames=flex.map(e=>(BCATS.find(c=>c[0]===e[0])||[0,'Other'])[1]+' '+money0(e[1])+'/mo').join(' and ');
  if(flexTot>0)add('Spend 20% less on '+flex.map(e=>(BCATS.find(c=>c[0]===e[0])||[0,'Other'])[1]).join(' and '),flexTot*0.2);
  // pay-later plans that finish
  let plEnd=null,plMo=0;try{const P=PL.plans().filter(p=>p.left>0);if(P.length){plEnd=Math.max(...P.map(p=>p.items[p.items.length-1].t));plMo=r2(P.reduce((a,p)=>a+p.owed,0)/Math.max(1,(plEnd-T0())/(30.44*DY)))}}catch(e){}
  if(plMo>=20&&plEnd)add('Once your pay-later plans finish ('+FZ.mlabel(plEnd)+')',plMo);
  const pay=+state.pay||0;if(pay>0){const y=Math.max(25,Math.round(pay*0.1/25)*25),per={weekly:52,biweekly:26,semimonthly:24,monthly:12}[state.payFreq]||26;add('Set aside '+money0(y)+' from each paycheck',y*per/12-Math.max(0,mo.left)>0?y*per/12-Math.max(0,mo.left):0)}
  const uniq=[];sc.forEach(s=>{if(!uniq.some(u=>Math.abs(u.per-s.per)<1))uniq.push(s)});
  let reply='';
  if(need<=0)reply='You already have '+B(h.tot)+' across checking and savings, which covers '+money0(price)+'. Spending it would leave '+money0(h.tot-price)+', so check the plan below before you do.';
  else if(mo.left<=0)reply='Right now more goes out than comes in, about '+B(Math.abs(mo.left))+' a month on average, so money for '+name+' doesn’t build up on its own yet.\n\nHere’s what the numbers say would change that.';
  else{const s0=uniq[0];reply='At your current pace you’d have '+money0(price)+' for '+name+' around **'+FZ.mlabel(FZ.when(s0.n))+'** ('+FZ.dur(s0.n)+').\n\nThat’s based on about '+money0(mo.left)+' a month left over'+(mo.src==='history'?' in your last '+mo.n+' months':' in your plan')+', plus the '+money0(h.tot)+' you have now.'}
  reply+='\n\n'+FZ.NOTE;
  const html='<div class="fzp">'+
    '<div class="fzrow3"><div><span>Coming in</span><b>'+money0(mo.inc)+'</b><small>a month</small></div><div><span>Going out</span><b>'+money0(mo.out)+'</b><small>a month</small></div><div><span>Left over</span><b class="'+(mo.left<0?'neg':'')+'">'+money0(mo.left)+'</b><small>a month</small></div></div>'+
    (need>0&&uniq.length?'<div class="fzh">When you could have '+money0(price)+'</div>'+uniq.slice(0,4).map((s,i)=>{const w=Math.max(6,Math.min(100,Math.round((uniq[0].n/s.n)*100)));return '<div class="fzsc'+(i===0?' base':'')+'"><div class="fzsct"><span>'+esc(s.t)+'</span><b>'+FZ.mlabel(FZ.when(s.n))+'</b></div><div class="fzbar"><i style="width:'+(i===0?100:w)+'%"></i></div><small>'+money0(s.per)+' a month · '+FZ.dur(s.n)+'</small></div>'}).join(''):'')+
    (price>=3000?FZ.calcHTML(price,isCar?7:isHome?6.5:10,isCar?60:isHome?360:36,mo.inc,isHome):'')+'</div>';
  const btns=[{label:'Make this a goal',x:'fzgoal',v:(label||'Big purchase').slice(0,40),w:String(Math.round(price))},{label:'Where my money goes',x:'fzspend',alt:true},{label:'Remind me monthly',x:'fzrem',v:(label||'Big purchase').slice(0,40),alt:true}];
  return{reply,actions:[],local:true,buttons:btns,html,intent:'plan'}};
// an example payment, with sliders for the rate and how long
FZ.calcHTML=(price,apr,n,inc,home)=>{const id='fzc'+Math.random().toString(36).slice(2,7),dn=home?0.2:0.1;
  return '<div class="fzh">If you paid part now</div><div class="fzcalc" id="'+id+'" data-p="'+price+'" data-inc="'+inc+'">'+
    '<div class="fzdp">'+[0.1,0.2].map(f=>'<button type="button" class="wchip'+(f===dn?' on':'')+'" data-fzdn="'+f+'">'+Math.round(f*100)+'% down · '+money0(price*f)+'</button>').join('')+'</div>'+
    '<label class="fzsl"><span>Example rate <b data-fzv="r">'+apr+'%</b></span><input type="range" min="0" max="20" step="0.25" value="'+apr+'" data-fzk="r"></label>'+
    '<label class="fzsl"><span>Length <b data-fzv="n">'+(n>=120?n/12+' years':n+' months')+'</b></span><input type="range" min="'+(home?120:12)+'" max="'+(home?360:84)+'" step="'+(home?60:12)+'" value="'+n+'" data-fzk="n"></label>'+
    '<div class="fzout"><span>Monthly payment</span><b data-fzv="pmt"></b><small data-fzv="pct"></small></div><p class="fzfine">An illustration, not an offer. Real rates depend on your credit and the lender.</p></div>'};
FZ.calc=el=>{if(!el)return;const P=+el.dataset.p,inc=+el.dataset.inc,dn=+((el.querySelector('[data-fzdn].on')||{dataset:{fzdn:0.1}}).dataset.fzdn),r=+el.querySelector('[data-fzk=r]').value,n=+el.querySelector('[data-fzk=n]').value,pm=FZ.pmt(P*(1-dn),r,n);
  el.querySelector('[data-fzv=r]').textContent=r+'%';el.querySelector('[data-fzv=n]').textContent=n>=120?n/12+' years':n+' months';el.querySelector('[data-fzv=pmt]').textContent=money(pm);
  el.querySelector('[data-fzv=pct]').textContent=inc>0?'About '+Math.round(pm/inc*100)+'% of what comes in each month ('+money0(inc)+'). Total paid '+money0(pm*n+P*dn)+'.':'Total paid '+money0(pm*n+P*dn)+'.'};
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.fzk)FZ.calc(t.closest('.fzcalc'))});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-fzdn]');if(!t)return;t.parentElement.querySelectorAll('[data-fzdn]').forEach(x=>x.classList.toggle('on',x===t));FZ.calc(t.closest('.fzcalc'))});
const B=n=>'**'+money(n)+'**';
// the first day a purchase fits without your balance dipping under your cushion later
FZ.fits=a=>{const cush=+state.cushion||0,D=(DAILY||[]).filter(d=>d.t>=realToday());if(!D.length)return null;const suf=[];let m=Infinity;for(let i=D.length-1;i>=0;i--){m=Math.min(m,D[i].v);suf[i]=m}
  for(let i=0;i<D.length;i++)if(suf[i]-a>=cush)return D[i].t;return null};

// ---------- 3. answers Sprout gives on the phone ----------
const say=(reply,x)=>Object.assign({reply,actions:[],local:true},x||{});
const has=(s,re)=>re.test(s);
const RANGE=q=>BR.range(q,'none');
FZ.pre=(s,raw)=>{
  let amt=BR.amount(raw)||BR.amount(s);const T=T0();if(!amt&&/\b(afford|buy|purchase|save (up )?for|pay for)\b/.test(s)){const y=s.match(/\b((?:19|20)\d{2})\s+(?!(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\b)[a-z]/);if(y)amt=+y[1]}
  // a follow-up that answers "How much is it?"
  if(FZ.ctx&&Date.now()-FZ.ctx.at<15*60e3&&amt>0&&s.split(' ').length<=8&&!/\b(spend|spent|owe|bill|due|subscri|payday|budget|afford|buy|save|purchase|get|when|how)\b/.test(s)){const c=FZ.ctx;FZ.ctx=null;return c.kind==='big'||amt>=1000?FZ.plan(amt,c.label):FZ.small(amt,c.label,raw)}
  // a monthly cost
  const mon=s.match(/\$?\s?([\d,]+(?:\.\d+)?)\s*(?:k\b)?\s*(?:\/|a|per|each|every)\s*(?:mo|month)\b/);if(FZ.open(s)&&FZ.ai())return null;
  if(mon&&/\b(afford|add|sign up|take on|can i|could i|handle|swing)\b/.test(s)){const a=+mon[1].replace(/,/g,'')*(/\d\s*k\b/.test(mon[0])?1000:1),mo=FZ.mo(),after=r2(mo.left-a),lf=(s.match(/\bfor (?:a |an |the |my )?([a-z][a-z0-9' -]{1,30}?)\s*\??$/)||[])[1],it=FZ.item(raw),lab=lf||(/\d|\b(month|mo)\b/.test(it)?(s.match(/\b(gym|car|phone|insurance|rent|subscription|membership|loan|lease|plan)\b/)||[])[1]||'':it);
    return say('Adding '+B(a)+' a month'+(lab?' for '+lab:'')+' would leave about '+B(after)+' a month left over, down from '+money0(mo.left)+'.\n\n- That’s about '+money(a*12/365)+' a day less in your daily number\n- Over a year, '+money0(a*12)+'\n\n'+(after<0?'That’s more than you have left over each month right now, so something else would need to give. ':'')+FZ.NOTE)}
  // big purchases, or "when could I afford ..."
  const askWhen=/\b(when|how long|how soon|how many months|how)\b.*\b(afford|buy|purchase|have enough for|pay for|get (a|an|the|my|new|another))\b|\bsave (up )?for (a|an|the|my|new)\b|\bsaving (up )?for\b|\bwant to (buy|afford|get (a|an|the|new))\b|\bplanning (to|on) (buy|get)/.test(s)&&!/\bget paid\b/.test(s);
  const big=amt>=1500||(FZ.big.test(s)&&!(amt>0&&amt<1500));
  if((askWhen||(/\b(afford|buy)\b/.test(s)&&big))&&!/\bhow much (did|have) i\b/.test(s)&&!/\bhow much (should|do|would|will|must) i (need to )?save\b/.test(s)&&!/\b(save|saving)\b.*\bby (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|next|the end|end of)/.test(s)){const lab=FZ.item(raw);
    if(!(amt>0)){FZ.ctx={kind:big?'big':'small',label:lab,at:Date.now()};return say('How much is '+(lab?'the '+lab:'it')+'? A rough number is fine, like "about 35,000".',{intent:'plan'})}
    if(amt>=1000||big)return FZ.plan(amt,lab);return FZ.small(amt,lab,raw)}
  // pay-later
  if(/pay ?later|klarna|affirm|afterpay|after pay|sezzle|installment/.test(s)&&/\b(owe|left|how much|plans?|payments?|due|next|when|total|balance)\b/.test(s)){const P=PL.plans().filter(p=>p.left>0);
    if(!P.length)return say('You don’t have any pay-later plans in Sprout. Scan the upcoming payments screen in Klarna, Affirm or Afterpay and Sprout adds every payment.',{buttons:[{label:'Scan a screenshot',x:'fzscan'}]});
    const nx=P.filter(p=>p.next).sort((a,b)=>a.next.t-b.next.t)[0];return say('You owe '+B(PL.owed())+' across '+P.length+' pay-later plan'+(P.length>1?'s':'')+'.'+(nx?' Next up: '+money(nx.next.amt)+' to '+nx.prov+' on '+sdate(nx.next.t)+'.':''),{items:P.map(p=>({date:p.next?fd(p.next.t):'',name:p.prov+' · '+p.store+' ('+p.left+' left)',amount:p.owed})),buttons:[{label:'See all plans',x:'askgo',v:'paylater'}]})}
  // net worth
  if(/\bnet ?worth\b|how much am i worth|what am i worth/.test(s)){const n=LG.nw();return say('Your net worth is '+B(n.N)+'.\n\n- You own '+money0(n.own!=null?n.own:n.A)+(n.I>0?', including '+money0(n.I)+' in investments and retirement':'')+'\n- You owe '+money0(n.L)+(PL.owed()>0?', including '+money0(PL.owed())+' on pay-later plans':''),{buttons:[{label:'See the trend',x:'askgo',v:'networth'}]})}
  // savings, investments, retirement
  if(/\b(401 ?k|403 ?b|ira|roth|retirement|investments?|brokerage|savings? account|in (my )?savings)\b/.test(s)&&/\b(how much|what|balance|have|total|worth)\b/.test(s)){const S=LG.of('savings'),I=LG.of('invest');
    if(!S.length&&!I.length){const v=SV();return say(v.bal>0?'You’re tracking '+B(v.bal)+' in savings.':'Sprout doesn’t see a savings or investment account yet. Connect it, or add it in Savings and investments.',{buttons:[{label:'Savings and investments',x:'askgo',v:'vault'}]})}
    const it=S.concat(I).map(a=>({name:LG.label(a)+(F2.subName(a)?' · '+F2.subName(a):''),amount:r2(LG.type(a)==='invest'?+a.cur||0:LG.bal(a))}));const tot=it.reduce((a,x)=>a+x.amount,0);
    return say('You have '+B(tot)+' across '+it.length+' savings and investment account'+(it.length>1?'s':'')+'. Retirement and investments count in your net worth, never in your daily number.',{items:it})}
  // a budget by name: "how much did I spend on pets", "how am I doing on dining"
  const cat=FZ.catIn(s);
  if(cat&&/\b(spend|spent|spending|left|doing|budget|over|under|on track|much)\b/.test(s)&&!/\b(can|could|should|may) i spend\b/.test(s)&&!/^(i |just |i just )?(spent|paid|bought|grabbed|dropped)\b/.test(s)){const R=RANGE(raw)||{a:Date.UTC(new Date(T).getUTCFullYear(),new Date(T).getUTCMonth(),1),b:T,label:'this month'};const rows=SP.rows().filter(r=>r.cat===cat[0]&&r.t>=R.a&&r.t<=R.b),tot=r2(rows.reduce((a,r)=>a+r.amt,0)),lim=budLim(cat);
    const top={};rows.filter(r=>r.amt>0).forEach(r=>{const k=SP.place(r.note);top[k]=(top[k]||0)+r.amt});const tl=Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const mon=R.label==='this month';return say('You’ve spent '+B(tot)+' on '+cat[1]+' '+R.label+'.'+(mon&&lim>0?(tot>lim?' That’s '+money0(tot-lim)+' over your '+money0(lim)+' budget.':' That leaves '+money0(lim-tot)+' of your '+money0(lim)+' budget.'):'')+(tl.length>1?'\n\nMost of it went to:\n'+tl.map(e=>'- '+e[0]+': '+money0(e[1])).join('\n'):''),{buttons:[{label:'Open '+cat[1],x:'fzcat',v:cat[0]}],intent:/\b(doing|left|over|under|on track)\b/.test(s)&&!/\bspen[dt]\b/.test(s)?'track':'spent'})}
  // credit
  if(/\bcredit (score|report)\b|\butiliz|\bmy score\b|\bfico\b|\bvantage|\bhard inquir|\binquiries\b/.test(s)&&typeof CR!=='undefined')return CR.answer(s);
  return null};
FZ.catIn=s=>{let best=null;BCATS.forEach(c=>{const n=lower(c[1]);if(n.length<3)return;const words=n.split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!/^(and|the)$/.test(w));if(new RegExp('\\b'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b').test(s)||words.some(w=>new RegExp('\\b'+w+'\\b').test(s)))best=best||c});return best};
// a smaller amount: when it fits without dipping under the cushion
FZ.small=(a,label,raw)=>{const t=FZ.fits(a),T=realToday();if(t===null)return FZ.plan(a,label);
  if(t<=T)return say('You could cover '+B(a)+(label?' for '+label:'')+' today without your balance dipping under your '+money0(+state.cushion||0)+' cushion later on.\n\nIt would still come out of your daily spending money, so here’s how it lands:',{actions:[{type:'what_if',amount:a,date:fd(T),label:label?label[0].toUpperCase()+label.slice(1):'What if'}]});
  return say('The first day '+B(a)+(label?' for '+label:'')+' fits without your balance dipping under your cushion later is **'+sdate(t)+'**.\n\nThat’s after money comes in and the bills before it are covered.',{actions:[{type:'what_if',amount:a,date:fd(t),label:label?label[0].toUpperCase()+label.slice(1):'What if'}]})};
// when nothing matches: offer the closest questions instead of guessing
FZ.SUG=[['how much can i spend today',/spend|left|today|daily|money|broke/],['what bills are due before payday',/bills?|due|owe|payments?/],['how much did i spend this month',/spent|spend|spending|month/],['when is my next payday',/pay|paid|paycheck|payday/],
  ['what subscriptions am i paying for',/subscri|monthly|recurring/],['what is my net worth',/worth|own|assets?/],['am i on track with my budgets',/budget|track|doing/],['where does my money go',/where|money|go|categor/],['how much do i owe on pay later plans',/klarna|affirm|afterpay|later/]];
FZ.guess=(q,f)=>{const ai0=FZ.ai();if(ai0&&String(q).trim().split(/\s+/).length>6)return null;const s=f||lower(q),hits=FZ.SUG.map(x=>[x[0],(s.match(new RegExp(x[1].source,'g'))||[]).length]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,3);if(!hits.length)return null;
  FZ.last=q;const ai=ai0;return say('I want to get this right. Did you mean one of these?',{buttons:hits.map(h=>({label:h[0][0].toUpperCase()+h[0].slice(1)+'?',x:'askq',v:h[0]})).concat(ai?[{label:'Ask the AI instead',x:'askai',alt:true}]:[]),guess:true})};
{const _ba=BR.answer;BR.answer=function(raw){if(FZ.force){FZ.force=false;return null}const q=String(raw||'').trim();if(!q||q.length>400)return null;const s0=lower(q).replace(/\s+/g,' '),s=FZ.phr(s0),f=FZ.fix(q);
  let r=null;try{r=FZ.pre(s,q)||(f!==s?FZ.pre(f,q):null)}catch(e){if(window.__brainDebug)console.error(e)}if(r)return FZ.keep(r);
  r=_ba.call(this,s!==s0?s:q);if(r)return FZ.keep(r);
  if(f!==s){r=_ba.call(this,f);if(r)return FZ.keep(r)}
  try{return FZ.guess(q,f)}catch(e){return null}}}
FZ.keep=r=>{try{const po=PL.owed();if(r&&po>0.004&&/^You owe \*\*[^*]+\*\* across \d+ debts?\./.test(r.reply||'')&&!/pay-later/.test(r.reply))r.reply=r.reply.replace(/^(You owe \*\*[^*]+\*\* across \d+ debts?\.)/,'$1 Plus '+money(po)+' left on pay-later plans, so '+money(FZ.debts().reduce((a,d)=>a+d.bal,0)+po)+' in all.')}catch(e){}if(r&&r.html&&r.reply)FZ.H[r.reply]=r.html;if(r&&r.reply&&/^How much is (it|the .*)\? A rough number/.test(r.reply))0;return r};
// the old "How much is it?" also remembers what you asked about
{const _ba2=BR.answer;BR.answer=function(raw){const r=_ba2.apply(this,arguments);try{if(r&&r.intent==='afford'&&/^How much is it\?/.test(r.reply)){FZ.ctx={kind:FZ.big.test(lower(raw))?'big':'small',label:FZ.item(raw),at:Date.now()};r.reply='How much is '+(FZ.ctx.label?'the '+FZ.ctx.label:'it')+'? A rough number is fine.'}}catch(e){}return r}}
// rich parts of an answer (the plan, the sliders) are drawn under its text
{const _dc=drawChat;drawChat=function(){const r=_dc.apply(this,arguments);try{const th=document.querySelector('#cmd-out .thread');if(!th)return r;const cs=chat.slice(-8),kids=[...th.children];
    cs.forEach((c,i)=>{const el=kids[i];if(!el||c.ai==null||!FZ.H[c.ai]||el.querySelector('.fzp'))return;const btn=el.querySelector('.askbtns');const box=document.createElement('div');box.innerHTML=FZ.H[c.ai];if(btn)el.insertBefore(box.firstElementChild,btn);else el.appendChild(box.firstElementChild);el.classList.add('wide');el.querySelectorAll('.fzcalc').forEach(FZ.calc)})}catch(e){}return r}}
// buttons under answers
FZ.ask=t=>{const i=document.getElementById('cmd-in');if(!i)return;i.value=t;try{runCmd()}catch(e){}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#cmd-out [data-x]');if(!b)return;const a=b.dataset.x,v=b.dataset.v,w=b.dataset.w;
  if(a==='askq'){e.preventDefault();e.stopImmediatePropagation();FZ.ask(v);return}
  if(a==='askai'){e.preventDefault();e.stopImmediatePropagation();if(!FZ.last)return;FZ.force=true;FZ.ask(FZ.last);return}
  if(a==='fzgoal'){e.preventDefault();e.stopImmediatePropagation();state.goals=state.goals||[];let n=v||'Goal',k=2;while(state.goals.some(g=>g.name===n))n=(v||'Goal')+' '+(k++);state.goals.push({name:n,amt:+w||0});try{editors()}catch(_){}plan();queueSave();toastAct('Added '+n+' to your goals','Open',()=>{closeSheets();setTimeout(()=>xOpen('vault'),closeSheetsDelay()+30)});return}
  if(a==='fzspend'){e.preventDefault();e.stopImmediatePropagation();SP.open('ins');return}
  if(a==='fzcat'){e.preventDefault();e.stopImmediatePropagation();closeSheets();setTimeout(()=>xOpen('budcat',v),closeSheetsDelay()+30);return}
  if(a==='fzscan'){e.preventDefault();e.stopImmediatePropagation();closeSheets();setTimeout(()=>{const s=document.querySelector('[data-scan]');if(s)s.click()},closeSheetsDelay()+30);return}
  if(a==='fzrem'){e.preventDefault();e.stopImmediatePropagation();if(typeof NT!=='undefined'){NT.addRem({id:'goal-'+Date.now().toString(36),t:'Check in on '+(v||'your goal'),every:'month'});toast('Sprout will remind you once a month')}return}},true);

// ---------- 3b. more questions Sprout answers on the phone ----------
FZ.debts=()=>{let D=[];try{D=(E&&E.debts)||state.debts||[]}catch(e){D=state.debts||[]}return D.filter(d=>+d.bal>0.004).map(d=>({name:d.name,bal:+d.bal,apr:+d.apr||0,min:Math.max(+d.min||0,0)}))};
// months until every balance is paid, paying the minimums plus any extra toward the highest rate first
FZ.payoff=(extra)=>{const D=FZ.debts().map(d=>Object.assign({},d));if(!D.length)return 0;let m=0;
  while(D.some(d=>d.bal>0.01)&&m<600){m++;let x=extra||0;D.forEach(d=>{if(d.bal<=0.01)return;d.bal+=d.bal*d.apr/1200;const p=Math.min(d.bal,d.min);d.bal-=p});
    D.filter(d=>d.bal>0.01).sort((a,b)=>b.apr-a.apr).forEach(d=>{const p=Math.min(d.bal,x);d.bal-=p;x-=p});
    if(m===1&&D.every(d=>d.bal<=0.01))break;if(m>=600)return null}return m>=600?null:m};
FZ.ai=()=>{try{return !!sampleFn&&!FZ.stub&&(!LIVE.on||(liveOK()&&plusIs()))}catch(e){return false}};
FZ.open=s=>/^(should|would|is it|explain|why|what do you think|help me think|tell me about|which is better)\b/.test(s)||(/\b(or|versus|vs)\b/.test(s)&&/^(should|is|would|which)\b/.test(s));
FZ.more=(s,raw)=>{if(FZ.open(s)&&FZ.ai())return null;const T=T0();
  // when is a particular bill due
  const dm=s.match(/\bwhen(?:'s| is| are| do i pay)? (?:my |the |our )?([a-z][a-z0-9 &'.-]{1,30}?) (?:due|bill|payment|payments)\b/);
  if(dm&&!/\b(next )?(pay ?day|paycheck|check)\b/.test(dm[1])&&!/\b(afford|buy|save|purchase|saving)\b/.test(s)){const w=dm[1].trim(),L=(rows&&rows.items||[]).filter(x=>x.t>=T&&x.a>0.004&&(String(x.name).toLowerCase().indexOf(w)>=0||RC.sim(x.name,w))).sort((a,b)=>a.t-b.t);
    if(L.length){const x=L[0];return say(shortName(x.name)+' is due **'+sdate(x.t)+'**: '+B(x.a)+'.'+(L.length>1?' After that, '+sdate(L[1].t)+'.':''),{buttons:[{label:'Money calendar',x:'askgo',v:'calendar'}]})}
    return say('I don’t see '+w+' in your plan. Add it in Your plan and Sprout sets money aside before it’s due.',{buttons:[{label:'Your plan',x:'askgo',v:'yourplan'}]})}
  // card balances
  if(/\b(credit )?cards? balances?\b|\bhow much (do i owe|is) on my (credit )?cards?\b|\bwhat'?s on my cards?\b/.test(s)){let C=[];try{C=LG.cards().map(a=>({name:LG.label(a),amount:r2(Math.max(0,+a.cur||0)),lim:+a.limit||0}))}catch(e){}
    (state.debts||[]).filter(d=>LG.cardish(d)&&!C.some(c=>RC.sim(c.name,d.name))).forEach(d=>C.push({name:d.name,amount:r2(+d.bal||0),lim:+d.limit||0}));
    if(!C.length)return say('Sprout doesn’t see any credit cards yet. Link them, or add one in Your plan.',{buttons:[{label:'Your plan',x:'askgo',v:'yourplan'}]});
    const tot=C.reduce((a,c)=>a+c.amount,0),lim=C.reduce((a,c)=>a+c.lim,0);return say('Your cards add up to '+B(tot)+(lim>0?', '+Math.round(tot/lim*100)+'% of your '+money0(lim)+' in limits':'')+'.',{items:C.map(c=>({name:c.name+(c.lim>0?' · '+Math.round(c.amount/c.lim*100)+'%':''),amount:c.amount})),intent:'debt'})}
  // a subscription's price
  if(/\b(go|went|gone|going) up\b|\bprice\b|\bmore expensive\b|\braised?\b|\bincrease/.test(s)){let L=[];try{L=subsList()}catch(e){}const sub=L.find(x=>{const w=String(x.name).toLowerCase().split(/[^a-z0-9+]+/)[0];return w&&w.length>=3&&new RegExp('\\b'+w.replace(/[+]/g,'\\+')+'\\b').test(s)});
    if(sub)return say(sub.hike?sub.name+' went up '+B(sub.hike)+'. It’s now '+money(sub.price)+(sub.cad&&sub.cad!=='monthly'?' '+sub.cad:' a month')+'.':'No change: '+sub.name+' is still '+money(sub.price)+(sub.cad&&sub.cad!=='monthly'?' '+sub.cad:' a month')+'.',{buttons:[{label:'Subscriptions',x:'askgo',v:'subs'}]});
    if(/\bsubscri/.test(s)){const H=L.filter(x=>x.hike&&x.st==='active');return say(H.length?H.length+' subscription'+(H.length>1?'s':'')+' went up recently:':'None of your subscriptions went up recently.',{items:H.map(x=>({name:x.name+' (+'+money(x.hike)+')',amount:x.price})),buttons:[{label:'Subscriptions',x:'askgo',v:'subs'}]})}}
  // which debt first: both common ways, with your numbers, no recommendation
  if(/\b(which|what) (debt|card|loan)s?\b.*\b(first|pay off|payoff|focus)\b|\bpay ?off order\b|\bavalanche\b|\bsnowball\b/.test(s)){const D=FZ.debts();if(!D.length)return say('Sprout doesn’t see any debts. Nice. If that’s not right, add them in Your plan.');
    const byR=D.slice().sort((a,b)=>b.apr-a.apr),byB=D.slice().sort((a,b)=>a.bal-b.bal);
    return say('There are two common ways people order debts. Here’s what each looks like with yours:\n\n**Highest rate first** (usually the least interest overall):\n'+byR.map((d,i)=>(i+1)+'. '+d.name+(d.apr?' · '+d.apr+'%':' · rate not set')+' · '+money0(d.bal)).join('\n')+'\n\n**Smallest balance first** (clears whole accounts sooner):\n'+byB.map((d,i)=>(i+1)+'. '+d.name+' · '+money0(d.bal)).join('\n')+(D.some(d=>!d.apr)?'\n\nAdd the missing rates in Your plan to make the first list exact.':'')+'\n\n'+FZ.NOTE,{buttons:[{label:'Your plan',x:'askgo',v:'yourplan'}]})}
  // when debt free
  if(/\bdebt ?free\b|\bpay (off|down) (all )?(my )?(debts?|everything)\b.*\bwhen\b|\bwhen\b.*\b(pay off|paid off)\b/.test(s)){const D=FZ.debts();let plEnd=0;try{PL.plans().filter(p=>p.left>0).forEach(p=>{plEnd=Math.max(plEnd,p.items[p.items.length-1].t)})}catch(e){}
    if(!D.length&&!plEnd)return say('Sprout doesn’t see any debts to pay off.');const m0=FZ.payoff(0),mo=FZ.mo(),m1=mo.left>0?FZ.payoff(mo.left):null,lab=n=>FZ.mlabel(Math.max(FZ.when(n),plEnd||0));
    const stuck=D.filter(d=>d.min<=d.bal*d.apr/1200+0.01);
    return say((m0==null?'Paying only the minimums, some of your debt wouldn’t go down'+(stuck.length?' ('+stuck.map(d=>d.name).join(', ')+': the minimum barely covers the interest)':'')+'.':'Paying the minimums, you’d be debt free around **'+lab(m0)+'**'+(m0?' ('+FZ.dur(m0)+')':'')+'.')+
      (m1!=null&&(m0==null||m1<m0)?'\n\nIf your usual '+money0(mo.left)+' a month left over also went to debt, highest rate first: around **'+lab(m1)+'**.':'')+(plEnd?'\n\nYour pay-later plans finish by '+FZ.mlabel(plEnd)+'.':'')+(D.some(d=>!d.apr)?'\n\nSome rates aren’t set, so interest is left out for those.':'')+'\n\n'+FZ.NOTE,{buttons:[{label:'Your plan',x:'askgo',v:'yourplan'}],intent:'debt'})}
  // money in over a period
  if(/\b(get paid|got paid|earn|earned|make|made|income|bring in|brought in|came in|come in)\b/.test(s)&&!/\bnext\b|\bwhen\b/.test(s)){const R=RANGE(raw);if(R||/\b(a|per|each) month\b/.test(s)===false&&/\b(last|this) (month|week|year)\b/.test(s)){const RR=R||{a:Date.UTC(new Date(T).getUTCFullYear(),new Date(T).getUTCMonth(),1),b:T,label:'this month'};
    const L=(state.spend||[]).filter(x=>x&&isDate(x.d)&&pd(x.d)>=RR.a&&pd(x.d)<=RR.b),f=LG.flows(L);const pays=L.filter(x=>x.cat==='Income'&&(RC.PAYROLL.test(x.note||'')||x.kind==='Paycheck'));
    return say('You brought in '+B(f.inc)+' '+RR.label+'.'+(pays.length?' '+pays.length+' paycheck'+(pays.length>1?'s':'')+', '+money0(pays.reduce((a,x)=>a+ +x.amt,0))+'.':'')+(f.moved>0.004?'\n\nMoney moved between your own accounts isn’t counted.':''))}}
  // goals
  if(/\bgoals?\b/.test(s)){const G=state.goals||[];if(!G.length)return say('You don’t have any goals yet. Ask something like “When can I afford a $1,200 trip?” and tap Make this a goal.',{buttons:[{label:'Savings and goals',x:'askgo',v:'vault'}]});let v={al:{}};try{v=SV()}catch(e){}
    return say(G.length===1?'Here’s your goal:':'Here are your '+G.length+' goals:',{items:G.map(g=>{const al=+(v.al||{})[g.name]||0,t=+g.amt||0;return{name:g.name+' · '+(t>0?Math.min(100,Math.round(al/t*100))+'% of '+money0(t):money0(al)+' saved'),amount:al}}),buttons:[{label:'Savings and goals',x:'askgo',v:'vault'}]})}
  // the calendar
  if(/\bcalendar\b/.test(s)){const D=(DAILY||[]).filter(d=>d.t>=T&&d.t<=T+30*DY),lo=D.reduce((a,d)=>!a||d.v<a.v?d:a,null);try{CALS=null}catch(e){}
    return say(lo?'Over the next 30 days, checking is lowest around **'+sdate(lo.t)+'**, about '+B(lo.v)+'.':'Here’s everything with a date.',{buttons:[{label:'Open the money calendar',x:'askgo',v:'calendar'}]})}
  // fees
  if(/\bfees?\b|\boverdraft\b|\binterest charged?\b/.test(s)&&/\b(how much|spent|paid|pay|charged|any)\b/.test(s)){const R=RANGE(raw)||{a:T-90*DY,b:T,label:'in the last 3 months'};const L=(HIST||[]).filter(h=>h&&+h.a<0&&isDate(h.d)&&pd(h.d)>=R.a&&pd(h.d)<=R.b&&(RX_FEE.test(h.m||'')||/^BANK_FEES/.test(h.f||'')||/interest charge/i.test(h.m||'')));const tot=r2(L.reduce((a,h)=>a-h.a,0));
    return say(L.length?'You paid '+B(tot)+' in fees and interest '+R.label+'.':'No fees or interest '+R.label+'. Nice.',{items:L.slice(-8).reverse().map(h=>({date:h.d,name:h.m,amount:r2(-h.a)})),intent:'odd'})}
  return null};
{const _pre=FZ.pre;FZ.pre=(s,raw)=>FZ.more(s,raw)||_pre(s,raw)}

// ---------- 4. Ask works on the phone even when the AI isn't set up ----------
{const _ci=cmdInit;cmdInit=async function(){await _ci.apply(this,arguments);if(sampleFn)return;
  FZ.stub=true;sampleFn=BRwrap({limits:async()=>({images:false}),json:async()=>({reply:'I can’t answer that one on the phone yet. Try asking about your spending, bills, paycheck, budgets, debts or a purchase you’re planning, like “When can I afford a $1,200 trip?”',actions:[],buttons:[{label:'How much can I spend today?',x:'askq',v:'how much can i spend today'},{label:'What’s due before payday?',x:'askq',v:'what bills are due before payday'}]})});
  document.body.classList.remove('noai');$('#cmd-box').classList.remove('hide');$('#cmd-na').classList.add('hide')}}
// the example chips include the new kinds of questions
{const _ci2=cmdInit;cmdInit=async function(){await _ci2.apply(this,arguments);try{const ex=['How much can I spend today?','When can I afford a $1,200 trip?','What’s due before payday?','How much did I spend on dining this month?','What’s my net worth?','How much do I owe on pay later?'];$('#cmd-ex').innerHTML=ex.map(x=>'<button class="chip" data-ex="'+esc(x)+'">'+esc(x)+'</button>').join(' ')}catch(e){}}}

// ---------- 5. Log by typing or talking: "12 at Chipotle", "40 gas yesterday", "got paid 1600" ----------
const QL={};
QL.split=t=>{const parts=String(t||'').split(/\s*(?:,|;|\band\b|\bplus\b|\balso\b)\s*(?=[^,;]*\d)/i).filter(p=>BR.amount(p)>0);return parts.length?parts:[t]};
QL.one=p=>{const s=lower(p),a=BR.amount(p);if(!(a>0))return null;let d=BR.past(p);const ago=s.match(/\b(\d+) days? ago\b/);if(ago)d=T0()-(+ago[1])*DY;
  const inc=/\b(got paid|paycheck|pay ?day|salary|direct deposit|refund(ed)?|got back|money in|deposit(ed)?|income|sold|received|venmo(ed)? me|paid me|cashed)\b/.test(s),kind=/refund|got back/.test(s)?'Refund':/paid|paycheck|salary|pay ?day|direct deposit/.test(s)&&!/paid me|venmo/.test(s)?'Paycheck':'Other';
  const bill=!inc&&/\b(rent|bill|insurance|phone bill|electric|water bill|internet|car payment|loan payment|mortgage)\b/.test(s);
  let note=String(p).replace(/\$\s?[\d,]+(\.\d+)?|\b\d[\d,]*(\.\d+)?\s*(k\b|dollars|bucks)?/gi,' ').replace(/\b(i|just|spent|spend|paid|pay|bought|buy|got|grabbed|dropped|on|at|for|some|a|an|the|my|with|using|cash|card|credit|debit|yesterday|today|this morning|tonight|last night|last|ago|days?|(mon|tues|wednes|thurs|fri|satur|sun)day|got paid|money in|received|refund(ed)?)\b/gi,' ').replace(/[.!?]+/g,' ').replace(/\s+/g,' ').trim().slice(0,40);
  if(note)note=note.replace(/\b\w/g,c=>c.toUpperCase());if(!note)note=inc?(kind==='Paycheck'?'Paycheck':kind==='Refund'?'Refund':'Money in'):'Spending';
  const card=/\b(on|with|using) (my |the )?(\w+ )?(credit )?card\b|\bvisa\b|\bamex\b|\bmastercard\b/.test(s)&&!/\bdebit\b/.test(s);
  let bc=null,cat='Everyday';if(inc)cat='Income';else if(bill)cat='Bill';else{bc=B2.catOf({note});const kd=bc&&bc!=='oth'?B2.kindOf(bc):(RX_EVERY.test(note)?'basic':'fun');cat=kd==='basic'?'Everyday':'Personal';if(bc==='oth')bc=null}
  return{amt:r2(a),d:fd(Math.min(d,T0())),note,cat,kind:inc?kind:null,card,bc}};
QL.parse=t=>QL.split(t).map(QL.one).filter(Boolean).slice(0,6);
QL.render=()=>{const i=document.getElementById('ql-in'),o=document.getElementById('ql-out');if(!i||!o)return;const L=QL.parse(i.value);QL.items=L;
  if(!i.value.trim()){o.innerHTML='';return}if(!L.length){o.innerHTML='<p class="note" style="margin:6px 2px 0">Add an amount, like “12 at Chipotle”.</p>';return}
  o.innerHTML='<div class="qlcards">'+L.map((x,k)=>'<div class="qlc"><div class="qlct"><b>'+(x.cat==='Income'?'+':'')+money(x.amt)+'</b><span>'+esc(x.note)+'</span></div><div class="qlm"><span>'+(x.d===fd(T0())?'Today':sdate(pd(x.d)))+'</span>'+
    (x.cat==='Income'?'<span>Money in</span>':x.cat==='Bill'?'<span>Bill or payment</span>':'<select data-qlcat="'+k+'" aria-label="Budget">'+BCATS.map(c=>'<option value="'+esc(c[0])+'"'+(c[0]===(x.bc||'oth')?' selected':'')+'>'+esc(c[1])+'</option>').join('')+'</select>')+(x.card?'<span>Card</span>':'')+'</div></div>').join('')+'</div>'+
    '<button type="button" class="btn qlgo" data-qlgo>'+(L.length>1?'Log all '+L.length:'Log it')+'</button>'};
QL.save=()=>{const L=QL.items||[];if(!L.length)return;state.spend=state.spend||[];let lastPw=null;
  L.forEach(x=>{const e={d:x.d,amt:x.amt,cat:x.cat,note:x.note,at:Date.now()};if(x.kind)e.kind=x.kind;if(x.bc&&x.cat!=='Income'&&x.cat!=='Bill')e.bc=x.bc;
    if(x.cat==='Income'&&x.kind==='Paycheck'){try{const pdts=payDates(state,pd(state.asOf)-20*DY),t0=pd(e.d),near=pdts.filter(t=>Math.abs(t-t0)<=4*DY).sort((a,b)=>Math.abs(a-t0)-Math.abs(b-t0))[0];if(near&&!(state.gotPay||{})[fd(near)]){state.gotPay=Object.assign({},state.gotPay||{},{[fd(near)]:true});e.payDay=fd(near)}}catch(_){}}
    state.spend.push(e);if(x.card&&x.cat!=='Income'){const cs=(state.debts||[]).filter(d=>d.card||LG.cardish(d)),nm=cs.find(d=>new RegExp('\\b'+String(d.name).toLowerCase().split(/\s+/)[0]+'\\b').test(lower(document.getElementById('ql-in').value)));const pw=nm?'d:'+nm.name:cs.length===1?'d:'+cs[0].name:(LG.pw&&LG.pw!=='chk'?LG.pw:null);if(pw){LG.applyPaid(e,pw);lastPw=pw}else e.card=true}});
  const i=document.getElementById('ql-in');if(i)i.value='';QL.render();closeSheets();const tot=L.reduce((a,x)=>a+(x.cat==='Income'?0:x.amt),0);
  toast(L.length>1?'Logged '+L.length+' items':(L[0].cat==='Income'?'Added '+money(L[0].amt)+' money in':'Logged '+money(L[0].amt)+' · '+L[0].note));try{plan()}catch(_){}queueSave();if(txOpen)renderTx()};
let qlT=null;document.addEventListener('input',e=>{if(e.target&&e.target.id==='ql-in'){clearTimeout(qlT);qlT=setTimeout(QL.render,140)}});
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='ql-in'&&e.key==='Enter'){e.preventDefault();QL.render();if((QL.items||[]).length)QL.save()}});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.qlcat!=null){const x=(QL.items||[])[+t.dataset.qlcat];if(x){x.bc=t.value;x.cat=B2.kindOf(t.value)==='basic'?'Everyday':'Personal'}}});
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;if(t.closest('[data-qlgo]')){e.preventDefault();QL.save();return}
  if(t.closest('[data-qlmic]')){e.preventDefault();QL.listen();return}});
// talking: the phone's own speech recognition when it has it; the keyboard's dictation button works everywhere
QL.listen=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition,i=document.getElementById('ql-in'),b=document.querySelector('[data-qlmic]');if(!i)return;
  if(!SR){i.focus();toast('Tap the microphone on your keyboard to talk');return}
  try{const r=new SR();r.lang='en-US';r.interimResults=true;r.maxAlternatives=1;if(b)b.classList.add('on');r.onresult=ev=>{let t='';for(const x of ev.results)t+=x[0].transcript;i.value=t;QL.render()};r.onerror=()=>{if(b)b.classList.remove('on');i.focus()};r.onend=()=>{if(b)b.classList.remove('on')};r.start()}catch(err){i.focus()}};
{const _os=openSheet;openSheet=function(id){const r=_os.apply(this,arguments);if(id==='sh-spend')setTimeout(()=>{const i=document.getElementById('ql-in');if(i&&!document.getElementById('sp-amt').value)QL.render()},30);return r}}
try{if(window.__S){window.__S.FZ=FZ;window.__S.QL=QL}}catch(e){}
}
