// ---------- Sprout brain: insights and answers worked out on the phone ----------
// Everything here runs on the device with the person's own numbers, so it costs nothing and works offline.
// Ask Sprout tries these answers first; only questions it can't answer go to the AI (Plus).
const BR={};
{
const DAY=MS,T0=()=>realDay();
const r2=n=>Math.round(n*100)/100;
const B=n=>'**'+money(n)+'**',B0=n=>'**'+money0(n)+'**';
const pct=n=>Math.round(n*100)+'%';
const MON=['january','february','march','april','may','june','july','august','september','october','november','december'];
const MONS=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const WD=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const mName=m=>MON[m][0].toUpperCase()+MON[m].slice(1);
const dLong=t=>new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric'});
const ymd=t=>fd(t);
const som=t=>{const d=new Date(t);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1)};
const eomT=t=>{const d=new Date(t);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)};
const addM=(t,n)=>{const d=new Date(t);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+n,1)};

// ---- categories: the app's own rules first, then the bank's category when it has one ----
const PFD=f=>{f=String(f||'');if(!f)return null;
  if(/^FOOD_AND_DRINK_GROCERIES/.test(f))return BCATS[0];
  if(/^FOOD_AND_DRINK/.test(f))return BCATS[1];
  if(/^TRANSPORTATION/.test(f))return BCATS[2];
  if(/^GENERAL_MERCHANDISE/.test(f))return BCATS[3];
  if(/ENTERTAINMENT_TV_AND_MOVIES|ENTERTAINMENT_MUSIC|GYMS_AND_FITNESS|SUBSCRIPTION/.test(f))return BCATS[4];
  return null};
BR.pfdCat=PFD;
BR.pfdBill=f=>/^(RENT_AND_UTILITIES|LOAN_PAYMENTS|BANK_FEES|GOVERNMENT|GENERAL_SERVICES_INSURANCE|TRANSFER)/.test(String(f||''));
const bcat=s=>(s.bk&&BCATS.find(c=>c[0]===s.bk))||BCATS.find(c=>c[3]&&c[3].test(s.m))||PFD(s.pfd)||BCATS[5];

// every counted money movement, newest last
// payments to a linked card aren't spending (the purchases are), and refunds come off spending instead of counting as income
BR.tx=()=>{const LGo=typeof LG!=='undefined'?LG:null;return (state.spend||[]).filter(s=>s&&s.cat!=='Skip'&&+s.amt>0&&!(LGo&&LGo.isXfer(s))).map(s=>{const rf=!!(LGo&&LGo.isRefund(s));return{t:pd(s.d),d:s.d,amt:rf?-(+s.amt):+s.amt,cat:rf?LGo.refCat(s):s.cat,m:String(s.note||''),pfd:s.pfd||'',pending:!!s.pending,kind:s.kind||'',refund:rf}}).sort((a,b)=>a.t-b.t)};
const spendOnly=L=>L.filter(s=>s.cat==='Everyday'||s.cat==='Personal');
const sum=L=>r2(L.reduce((a,s)=>a+s.amt,0));
const inR=(L,a,b)=>L.filter(s=>s.t>=a&&s.t<=b);
const mk=s=>mkey(s.m)||String(s.m).toLowerCase().slice(0,14);
const median=a=>{if(!a.length)return 0;const s=a.slice().sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};

// ---- reading dates and amounts from plain English ----
const lower=s=>String(s||'').toLowerCase().replace(/[’‘]/g,"'");
BR.amount=q=>{const s=lower(q).replace(/(\d)\s*k\b/g,(m,d)=>d+'000');
  let m=s.match(/\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?/);if(m)return +(m[1].replace(/,/g,'')+(m[2]?'.'+m[2]:''));
  m=s.match(/\b(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?\s*(?:dollars|bucks|usd)\b/);if(m)return +(m[1].replace(/,/g,'')+(m[2]?'.'+m[2]:''));
  // a bare number that isn't a date, time or ordinal
  m=s.replace(/\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b/g,' ').replace(/\b\d+(st|nd|rd|th)\b/g,' ').replace(/\b\d{1,2}(:\d{2})?\s*(am|pm)\b/g,' ').replace(/\b(19|20)\d{2}\b/g,' ').replace(/\b\d+\s*(days?|weeks?|months?|years?|times?|%|percent)\b/g,' ').match(/\b(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?\b/);
  return m?+(m[1].replace(/,/g,'')+(m[2]?'.'+m[2]:'')):null};
BR.amounts=q=>{const out=[];lower(q).replace(/\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?|\b(\d+)(?:\.(\d{1,2}))?\s*(?:dollars|bucks)\b/g,(m,a,b,c,d)=>{out.push(+((a||c).replace(/,/g,'')+((b||d)?'.'+(b||d):'')))});return out};
// a future (or today) day mentioned in the text, or null
BR.when=q=>{const s=lower(q),T=T0();
  if(/\btoday|tonight|right now|this (?:morning|afternoon|evening)\b/.test(s))return T;
  if(/\btomorrow\b/.test(s))return T+DAY;
  if(/\bnext week\b/.test(s))return T+7*DAY;
  if(/\b(?:this )?weekend\b/.test(s)){const w=new Date(T).getUTCDay();return T+((6-w+7)%7)*DAY}
  if(/\b(?:on |by |before )?pay ?day\b/.test(s)){const np=(rows||[]).find(r=>r.inc&&r.d0>T);if(np)return np.d0}
  let m=s.match(/\b(next )?(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)(?:day|nesday|sday|urday|rsday)?\b/);
  if(m){const w=['sun','mon','tue','wed','thu','fri','sat'].indexOf(m[2].slice(0,3)),c=new Date(T).getUTCDay();let d=(w-c+7)%7;if(m[1]&&d<7)d+=d===0?7:0;if(m[1]&&d<=0)d+=7;return T+d*DAY}
  m=s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  if(m){const mo=MONS.indexOf(m[1].slice(0,3)),y=new Date(T).getUTCFullYear();let t=Date.UTC(y,mo,+m[2]);if(t<T-DAY)t=Date.UTC(y+1,mo,+m[2]);return t}
  m=s.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if(m){const y=new Date(T).getUTCFullYear();let t=Date.UTC(y,+m[1]-1,+m[2]);if(t<T-DAY)t=Date.UTC(y+1,+m[1]-1,+m[2]);return t}
  m=s.match(/\b(?:on )?the (\d{1,2})(?:st|nd|rd|th)\b/);
  if(m){const d=new Date(T);let t=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),+m[1]);if(t<T)t=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,+m[1]);return t}
  m=s.match(/\bin (\d+) (day|week|month)s?\b/);if(m)return m[2]==='day'?T+m[1]*DAY:m[2]==='week'?T+m[1]*7*DAY:Date.UTC(new Date(T).getUTCFullYear(),new Date(T).getUTCMonth()+ +m[1],new Date(T).getUTCDate());
  return null};
// a past day ("yesterday", "on monday") for logging
BR.past=q=>{const s=lower(q),T=T0();if(/\byesterday\b/.test(s))return T-DAY;
  const m=s.match(/\b(?:on |last )(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/);if(m){const w=['sun','mon','tue','wed','thu','fri','sat'].indexOf(m[1]),c=new Date(T).getUTCDay();let d=(c-w+7)%7;if(d===0)d=7;return T-d*DAY}
  return T};
// a time range for "how much did I spend ..." questions
BR.range=(q,def)=>{const s=lower(q),T=T0(),d=new Date(T),y=d.getUTCFullYear(),mo=d.getUTCMonth();
  if(/\btoday\b/.test(s))return{a:T,b:T,label:'today'};
  if(/\byesterday\b/.test(s))return{a:T-DAY,b:T-DAY,label:'yesterday'};
  if(/\blast week\b/.test(s)){const w=d.getUTCDay(),a=T-(w+7)*DAY;return{a,b:a+6*DAY,label:'last week'}}
  if(/\bthis week\b|\bso far this week\b/.test(s)){const w=d.getUTCDay();return{a:T-w*DAY,b:T,label:'this week'}}
  if(/\blast month\b/.test(s)){const a=addM(T,-1);return{a,b:eomT(a),label:'last month'}}
  if(/\bthis year\b|\bso far this year\b|\bytd\b/.test(s))return{a:Date.UTC(y,0,1),b:T,label:'this year'};
  if(/\blast year\b/.test(s))return{a:Date.UTC(y-1,0,1),b:Date.UTC(y-1,11,31),label:'last year'};
  let m=s.match(/\b(?:last|past|previous) (\d+) (day|week|month)s?\b/);
  if(m){const n=+m[1],a=m[2]==='day'?T-(n-1)*DAY:m[2]==='week'?T-(7*n-1)*DAY:addM(T,-n)+ (new Date(T).getUTCDate()-1)*DAY;return{a,b:T,label:'in the last '+n+' '+m[2]+(n>1?'s':'')}}
  if(/\b(?:this|my) pay (?:period|cycle)\b|\bsince (?:my last )?pay ?day\b/.test(s)){let r=rows[0];(rows||[]).forEach(x=>{if(x.d0<=T)r=x});return{a:r.d0,b:T,label:'since payday'}}
  m=s.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec)\b/);
  if(m&&!/\bmay i\b/.test(s)){const k=MONS.indexOf(m[1].slice(0,3));let yy=k>mo?y-1:y;const a=Date.UTC(yy,k,1);return{a,b:Math.min(eomT(a),T),label:'in '+mName(k)}}
  if(/\bthis month\b|\bso far\b/.test(s)||def!=='none')return{a:som(T),b:T,label:'this month'};
  return null};

// ---- what someone is asking about: a budget category, a type, or a store ----
const TOPICS=[
  [/\bfood\b/,'food (groceries and eating out)',s=>bcat(s)===BCATS[0]||bcat(s)===BCATS[1]],
  [/grocer|supermarket|food shopping/,'groceries',s=>bcat(s)===BCATS[0]],
  [/eat(?:ing)? out|dining|restaurant|take ?out|takeout|fast food|coffee|lunch|dinner|breakfast|delivery|door ?dash|uber eats/,'eating out and coffee',s=>bcat(s)===BCATS[1]],
  [/\bgas\b|fuel|transport|commut|uber|lyft|parking|tolls?\b/,'gas and getting around',s=>bcat(s)===BCATS[2]],
  [/shopping|amazon|clothes|clothing/,'shopping',s=>bcat(s)===BCATS[3]],
  [/subscriptions?|streaming/,'subscriptions',s=>bcat(s)===BCATS[4]],
  [/\bbills?\b/,'bills',s=>s.cat==='Bill'],
  [/basics|essentials|everyday|necessit/,'basics',s=>s.cat==='Everyday'],
  [/\bfun\b|entertainment|going out/,'fun',s=>s.cat==='Personal'],
];
const STOP=new Set('how much did i do have spend spent spending on at in for the a an my this last month week year so far total what was is it of to me money all and since today yesterday past days weeks months buy bought pay paid charges charge purchases purchase been with get got overall everything expenses altogether whole entire many lot'.split(' '));
function topic(q){const s=lower(q);for(const t of TOPICS)if(t[0].test(s))return{label:t[1],f:t[2]};
  // a store or merchant name they typed
  const words=s.replace(/[^a-z0-9&' ]/g,' ').split(/\s+/).filter(w=>w.length>=3&&!STOP.has(w)&&!MON.includes(w)&&!MONS.includes(w)&&!WD.includes(w)&&!/^\d/.test(w));
  if(!words.length)return null;const L=BR.tx();
  for(let n=Math.min(3,words.length);n>=1;n--)for(let i=0;i+n<=words.length;i++){const ph=words.slice(i,i+n).join(' ');const hit=L.filter(s=>lower(s.m).includes(ph));if(hit.length)return{label:ph.replace(/\b\w/g,c=>c.toUpperCase()),f:s=>lower(s.m).includes(ph),merchant:true}}
  return{label:words.join(' '),f:()=>false,merchant:true,none:true}}

// ---- insights: things worth a heads-up, found in their own transactions ----
BR.insights=()=>{const out=[],L=BR.tx(),T=T0(),x=X();
  if(!L.length)return out;
  const first=L[0].t,histDays=(T-first)/DAY;
  // charged twice: same place, same amount, within a day
  const recent=L.filter(s=>s.t>=T-21*DAY&&!s.pending&&(s.cat==='Everyday'||s.cat==='Personal')&&s.amt>=5);
  const seen={};recent.forEach(s=>{const k=mk(s)+'|'+s.amt.toFixed(2);(seen[k]=seen[k]||[]).push(s)});
  Object.values(seen).forEach(g=>{for(let i=1;i<g.length;i++)if(g[i].t-g[i-1].t<=DAY){out.push({id:'brdup-'+mk(g[i])+g[i].amt+g[i].d,t:'Possible double charge at '+tidy(g[i].m),s:money(g[i].amt)+' twice on '+sdate(g[i-1].t)+(g[i].t!==g[i-1].t?' and '+sdate(g[i].t):'')+'. If you only bought once, ask the store or your bank to reverse it.',go:[],k:'dup'});break}});
  // bigger than usual at a place they go often
  const byM={};L.filter(s=>s.t<T-14*DAY&&s.t>=T-120*DAY&&(s.cat==='Everyday'||s.cat==='Personal')).forEach(s=>{(byM[mk(s)]=byM[mk(s)]||[]).push(s.amt)});
  L.filter(s=>s.t>=T-10*DAY&&(s.cat==='Everyday'||s.cat==='Personal')&&!s.pending).forEach(s=>{const h=byM[mk(s)];if(h&&h.length>=3){const md=median(h);if(s.amt>=Math.max(40,md*2.5))out.push({id:'brbig-'+mk(s)+s.d+s.amt,t:'Bigger than usual at '+tidy(s.m),s:money(s.amt)+' on '+sdate(s.t)+'. You usually spend about '+money0(md)+' there.',go:[],k:'odd'})}});
  // fees
  const fees=L.filter(s=>s.t>=som(T)&&(RX_FEE.test(s.m)||/^BANK_FEES/.test(s.pfd)));
  if(fees.length){const f=sum(fees);out.push({id:'brfee-'+ymd(som(T))+'-'+fees.length,t:'You paid '+money(f)+' in fees this month',s:fees.slice(0,3).map(s=>tidy(s.m)+' '+money(s.amt)).join(', ')+'. Banks often waive a first fee if you ask.',go:[],k:'fee'})}
  // spending faster than usual, by budget
  if(histDays>=50){const dom=new Date(T).getUTCDate(),nowA=som(T);
    BCATS.slice(0,5).forEach(c=>{const cur=sum(inR(spendOnly(L),nowA,T).filter(s=>bcat(s)===c));if(cur<60)return;
      const past=[1,2,3].map(n=>{const a=addM(T,-n);if(a<first-5*DAY)return null;return sum(inR(spendOnly(L),a,a+(dom-1)*DAY).filter(s=>bcat(s)===c))}).filter(v=>v!==null);
      if(!past.length)return;const usual=past.reduce((a,b)=>a+b,0)/past.length;
      if(usual>20&&cur>=usual*1.3&&cur-usual>=40)out.push({id:'brpace-'+c[0]+ymd(nowA),t:c[1]+' is running ahead of usual',s:money0(cur)+' so far this month, about '+money0(cur-usual)+' more than by this time most months.',go:['budgets'],k:'pace'})})}
  // paycheck changed
  const pays=L.filter(s=>s.cat==='Income'&&s.kind==='Paycheck');
  if(pays.length>=3){const last=pays[pays.length-1],md=median(pays.slice(-6,-1).map(s=>s.amt));if(md>0&&Math.abs(last.amt-md)/md>0.05&&last.t>=T-16*DAY)out.push({id:'brpay-'+last.d,t:'Your last paycheck was '+(last.amt<md?'smaller':'bigger')+' than usual',s:money(last.amt)+' on '+sdate(last.t)+' versus about '+money0(md)+' normally.'+(last.amt<md?' Worth a look at your pay stub.':''),go:[],k:'pay'})}
  // a dip before payday
  try{const {np,low}=lowBeforePay(),cush=+state.cushion||100;if(state.setup&&low&&low.v<cush)out.push({id:'brlow-'+ymd(low.t),t:'Checking may dip to '+money0(low.v)+' on '+sdate(low.t),s:'That’s before '+(np?'payday on '+sdate(np.d0):'your next payday')+'. Spending a little less until then keeps you above your '+money0(cush)+' cushion.',go:[],k:'low'})}catch(e){}
  // new repeating charge
  try{detectSubs().filter(s=>s.n<=3&&!s.known&&s.next-T<40*DAY).slice(0,2).forEach(s=>out.push({id:'brnew-'+s.id,t:'New repeating charge: '+s.name,s:money(s.price)+' '+(s.cad||'monthly')+'. If you didn’t sign up for this, it may be a trial that turned paid.',go:['subs'],k:'new'}))}catch(e){}
  return out.filter(a=>!x.dis[a.id])};

// ---- a compact summary the AI gets instead of raw transactions (smaller = cheaper) ----
BR.summary=()=>{const L=BR.tx(),T=T0(),a=som(T),la=addM(T,-1);
  const byCat=(A,Bb)=>{const o={};BCATS.forEach(c=>o[c[1]]=0);spendOnly(inR(L,A,Bb)).forEach(s=>o[bcat(s)[1]]+=s.amt);Object.keys(o).forEach(k=>o[k]=r2(o[k]));return o};
  const top={};spendOnly(inR(L,a,T)).forEach(s=>{const k=tidy(s.m);top[k]=(top[k]||0)+s.amt});
  let subs=[];try{subs=subsList().filter(s=>s.st==='active').map(s=>s.name+' '+money(s.amt)+'/mo'+(s.hike?' (went up)':''))}catch(e){}
  return {thisMonthByBudget:byCat(a,T),lastMonthByBudget:byCat(la,eomT(la)),billsThisMonth:sum(inR(L,a,T).filter(s=>s.cat==='Bill')),incomeThisMonth:sum(inR(L,a,T).filter(s=>s.cat==='Income')),
    topPlacesThisMonth:Object.entries(top).sort((x,y)=>y[1]-x[1]).slice(0,8).map(e=>e[0]+' '+money0(e[1])),subscriptions:subs.slice(0,15),budgets:BCATS.slice(0,5).map(c=>c[1]+' limit '+money0(budLim(c))),
    headsUp:BR.insights().slice(0,5).map(i=>i.t)}};

// ---- answers ----
const say=(reply,extra)=>Object.assign({reply,actions:[],local:true},extra||{});
const isQ=s=>/\?\s*$/.test(s)||/^(how|what|when|where|which|who|why|can|could|should|do|does|did|is|am|are|will|would|any|show|list|tell|give)\b/.test(lower(s).trim());
const nextPay=()=>{const T=T0();return (rows||[]).find(r=>r.inc&&r.d0>T)};
const curPer=()=>{const T=T0();let r=rows[0];(rows||[]).forEach(x=>{if(x.d0<=T)r=x});return r};
const everydayWord=s=>RX_EVERY.test(s)||/grocer|\bgas\b|fuel|pharmac|medicine|prescription|\bpet\b|dog food|cat food|toiletr|diaper|household|cleaning/.test(lower(s));
const cleanNote=s=>String(s||'').replace(/\$\s?[\d,]+(\.\d+)?|\b\d+(\.\d+)?\s*(dollars|bucks)\b/gi,'').replace(/\b(i|just|spent|paid|bought|got|grabbed|on|at|for|some|a|an|the|yesterday|today|this morning|tonight|last night|on (mon|tues|wednes|thurs|fri|satur|sun)day)\b/gi,' ').replace(/\b\d+(\.\d+)?\b/g,' ').replace(/[.!]+$/,'').replace(/\s+/g,' ').trim().slice(0,40);

const INTENTS=[];
const on=(name,test,fn)=>INTENTS.push({name,test,fn});

on('help',s=>/^(hi|hey|hello|yo|help|what can (you|i) (do|ask)|what do you do)\b/.test(s)&&s.split(' ').length<=6,()=>say('Hi! Ask me anything about your money. A few things I can answer instantly:\n\n- How much can I spend today?\n- Can I afford $80 on Friday?\n- What bills are due before payday?\n- How much did I spend on groceries this month?\n- What subscriptions am I paying for?\n- Am I on track with my budgets?\n\nYou can also tell me things like "I spent $14 on lunch".'));

on('log',(s,raw)=>!isQ(raw)&&/^(?:i\s+)?(?:just\s+|also\s+)?(spent|paid|bought|got|grabbed|dropped)\b|^\$\s?\d/.test(s)&&BR.amount(raw)>0,(s,raw)=>{
  const parts=raw.split(/\s*(?:,|;|\band\b|\bplus\b)\s*(?=[^,;]*\$?\d)/i).filter(p=>BR.amount(p));const when=BR.past(raw),acts=[];
  (parts.length?parts:[raw]).slice(0,6).forEach(p=>{const a=BR.amount(p);if(!(a>0))return;const note=cleanNote(p)||'Spending';acts.push({type:'log_spend',amount:a,bucket:everydayWord(p)?'Everyday':'Personal',note:note[0].toUpperCase()+note.slice(1),date:ymd(when)})});
  if(!acts.length)return null;return say(acts.length>1?'Got it. Here’s what I’ll log:':'Got it. I’ll log '+money(acts[0].amount)+' to '+(acts[0].bucket==='Everyday'?'Basics':'Fun')+'.',{actions:acts})});

on('balance-set',(s,raw)=>!isQ(raw)&&/(?:checking|bank balance|balance)(?: account)?(?: is| has| at| shows| says|:|=)\s*\$?\s?[\d,]+|i have \$?[\d,.]+ in (?:my )?checking/.test(s),(s,raw)=>{const a=BR.amount(raw);if(a===null)return null;return say('Got it. I’ll set your checking balance to '+money(a)+'.',{actions:[{type:'set_cash',amount:a}]})});

on('afford',s=>!/how much (?:can|could|should|do) i/.test(s)&&/\b(can|could) i (afford|buy|get|spend|pay for|swing|do)\b|\bwhat if i (buy|spend|get|pay)\b|\bis it (?:ok|okay|alright|fine) (?:to|if i) (?:spend|buy|get)\b|\bshould i (?:buy|get|spend)\b|\bcan i still (?:afford|spend|buy)\b/.test(s),(s,raw)=>{
  const a=BR.amount(raw);if(!(a>0))return say('How much is it? Try something like "Can I afford $80 on Friday?" and I’ll show you exactly how it lands.');
  const t=BR.when(raw)||T0();let m=lower(raw).match(/\b(?:for|on)\s+(?:a |an |the |some )?([a-z][a-z' -]{1,30}?)(?=\s+(?:on|this|next|tomorrow|today|tonight|by|before|at|in)\b|[?.!,]|$)/);
  if(!m)m=lower(raw).match(/\$\s?[\d,.]+\s+([a-z][a-z' -]{1,24}?)(?=\s+(?:on|this|next|tomorrow|today|tonight|by|before|at|in)\b|[?.!,]|$)/);
  let label=m?m[1].trim():'';if(/^(friday|monday|tuesday|wednesday|thursday|saturday|sunday|today|tomorrow|payday|it|that|this)$/.test(label))label='';
  return say('Here’s how '+money(a)+(label?' for '+label:'')+' '+whenTxt(t)+' would land:',{actions:[{type:'what_if',amount:a,date:ymd(t),label:label?label[0].toUpperCase()+label.slice(1):'What if'}]})});

on('today',s=>/how much (?:can|could|should|do) i (?:have to )?spend|safe to spend|(?:available|left) to spend|spending money|what'?s my (?:daily|number|allowance)|how much (?:do i have|is) left|my daily (?:number|limit|allowance)/.test(s)&&!/\b(did|spent|last)\b/.test(s),(s)=>{
  const rt=realToday(),sp=(state.spend||[]).map(x=>Object.assign({t:pd(x.d)},x)),A=availAt(rt,sp);
  const e=A.info.Everyday,f=A.info.Personal,end=sdate(A.d1-DAY);
  const which=/grocer|basics|\bgas\b|essentials|everyday/.test(s)?'basics':/\bfun\b|eat(?:ing)? out|going out|dining|shopping|restaurants?/.test(s)?'fun':'all';
  const left=which==='basics'?Math.max(0,e.left):which==='fun'?Math.max(0,f.left):Math.max(0,A.leftTotal),per=which==='basics'?e.per:which==='fun'?f.per:e.per+f.per;
  const nm=which==='basics'?' on basics':which==='fun'?' on fun':'';
  if(/\bweek|weekend\b/.test(s)){const w=new Date(rt).getUTCDay(),dw=Math.max(1,Math.min(A.daysLeft,7-w));const wk=left+per*(dw-1);
    return say('You have about '+B0(wk)+' to spend'+nm+' for the rest of this week.\n\n- Today: '+money(left)+(dw>1?'\n- Then about '+money0(per)+' a day':'')+'\n\nThat keeps your bills covered through '+end+'.')}
  if(which!=='all')return say('You can spend '+B(left)+nm+' today'+(which==='basics'?' (groceries, gas, everyday needs)':'')+'.\n\nAfter today it’s about '+money0(per)+' a day through '+end+'.');
  if(A.leftTotal<=0)return say('You’ve used today’s spending money, so the safest move is to hold off until tomorrow.\n\nTomorrow you’ll have about '+B0(per)+' again, and your bills stay covered through '+end+'.');
  return say('You can spend '+B(A.leftTotal)+' today.\n\n- Basics: '+money(Math.max(0,e.left))+'\n- Fun: '+money(Math.max(0,f.left))+'\n\nThat keeps your bills covered through '+end+'. Money you don’t spend today gets spread over the rest of the pay period.')});

on('payday',s=>/\b(pay ?day|paycheck|pay check|get paid|next check|next pay)\b/.test(s)&&!/save|saving|bills?\b|due|\bowe\b|payments?\b/.test(s),(s)=>{
  const np=nextPay();if(!np)return say('I don’t have your paycheck set up yet. Add it in Edit numbers and I can tell you exactly when it lands and what you’ll have.');
  const per=curPer(),before=per&&isFinite(per.cash)?per.cash:null;
  if(/how much (?:will|do|would) i have|what will i have|left (?:on|by|at|before) pay ?day|have (?:on|by|at) pay ?day/.test(s)&&before!==null)
    return say('Right before payday on '+sdate(np.d0)+', checking should be about '+B0(before)+'.\n\nAfter your '+money0(np.inc)+' '+(np.lab==='Bonus'?'bonus':'paycheck')+' lands, that’s about '+money0(before+np.inc)+'. This is an estimate based on your plan and bills.');
  const d=Math.round((np.d0-T0())/DAY);return say('Your next '+(np.lab==='Bonus'?'bonus':'paycheck')+' is '+(d===1?'tomorrow':'on '+dLong(np.d0))+(d>1?' ('+d+' days)':'')+': about '+B0(np.inc)+'.')});

on('bills',s=>/\b(bills?|payments?|due|owe)\b/.test(s)&&/\b(what|which|when|any|list|show|upcoming|coming|due|next|before|this|left|have)\b/.test(s)&&!/how much (?:did|have) i (?:spend|spent|pay|paid)|debt[- ]free|pay off/.test(s),(s)=>{
  const T=T0(),np=nextPay();let a=T,b=T+13*DAY,label='in the next 2 weeks';
  if(/\btoday\b/.test(s)){b=T;label='today'}else if(/\btomorrow\b/.test(s)){a=b=T+DAY;label='tomorrow'}
  else if(/\bthis week\b/.test(s)){b=T+(6-new Date(T).getUTCDay())*DAY;label='this week'}
  else if(/\bnext week\b/.test(s)){const w=new Date(T).getUTCDay();a=T+(7-w)*DAY;b=a+6*DAY;label='next week'}
  else if(/\bthis month\b|\brest of (?:the )?month\b/.test(s)){b=eomT(T);label='the rest of this month'}
  else if(/\bnext month\b/.test(s)){a=addM(T,1);b=eomT(a);label='next month'}
  else if(/pay ?day|paycheck/.test(s)&&np){b=np.d0-DAY;label='before payday on '+sdate(np.d0)}
  const its=(rows&&rows.items||[]).filter(i=>i.t>=a&&i.t<=b&&i.a>0.004).sort((x,y)=>x.t-y.t);
  if(!its.length)return say('Nothing is due '+label+'.');
  const tot=its.reduce((x,i)=>x+i.a,0);
  return say(its.length+' payment'+(its.length>1?'s':'')+' due '+label+', '+money(tot)+' in all:',{items:its.slice(0,40).map(i=>({date:ymd(i.t),name:i.name,amount:r2(i.a)}))})});

on('spent',s=>/how much (?:did|have|do) i (?:spend|spent|pay|paid|put)|what did i spend|how much (?:went|money went|have i spent)|total (?:i )?(?:spent|spending)|what(?:'s| is| was) my (?:spending|total)|spent (?:on|at)\b|spending (?:on|at)\b/.test(s),(s,raw)=>{
  const R=BR.range(raw)||{a:som(T0()),b:T0(),label:'this month'},tp=topic(raw.replace(/\b(this|last|past|so far)\b.*$/i,'')+' ')||topic(raw);
  const L=BR.tx();const inr=inR(L,R.a,R.b);
  if(tp&&tp.none)return say('I don’t see any spending at '+tp.label+' '+R.label+'. If it was paid another way, you can log it by typing something like "I spent $20 at '+tp.label+'".');
  const pick=tp?inr.filter(tp.f).filter(s=>tp.label==='bills'?true:s.cat!=='Income'):spendOnly(inr);
  const tot=sum(pick),n=pick.length;
  let extra='';
  if(R.label==='this month'){const dom=new Date(T0()).getUTCDate(),la=addM(T0(),-1),prev=tp?inR(L,la,la+(dom-1)*DAY).filter(tp.f):spendOnly(inR(L,la,la+(dom-1)*DAY));const pv=sum(prev);
    if(pv>0&&Math.abs(tot-pv)>=10)extra='\n\nThat’s '+money0(Math.abs(tot-pv))+(tot>pv?' more':' less')+' than by this time last month.'}
  if(!tp){const bills=sum(inr.filter(x=>x.cat==='Bill'));extra=(bills>0?'\n\nPlus '+money0(bills)+' in bills and payments.':'')+extra}
  if(!n)return say('You haven’t spent anything'+(tp?' on '+tp.label:'')+' '+R.label+'.');
  const top={};pick.forEach(x=>{const k=tidy(x.m)||'Other';top[k]=(top[k]||0)+x.amt});const tl=Object.entries(top).sort((x,y)=>y[1]-x[1]);
  const list=!tp||!tp.merchant?(tl.length>1?'\n\nMost of it went to:\n'+tl.slice(0,3).map(e=>'- '+e[0]+': '+money0(e[1])).join('\n'):''):'';
  return say('You spent '+B(tot)+(tp?' on '+tp.label:' on day-to-day spending')+' '+R.label+' across '+n+' purchase'+(n>1?'s':'')+'.'+list+extra)});

on('biggest',s=>/(biggest|largest|most expensive|top|highest) (?:\w+ )?(purchases?|expenses?|charges?|transactions?|spends?|things? i bought)/.test(s),(s,raw)=>{
  const R=BR.range(raw)||{a:som(T0()),b:T0(),label:'this month'},L=spendOnly(inR(BR.tx(),R.a,R.b)).sort((a,b)=>b.amt-a.amt).slice(0,5);
  if(!L.length)return say('No purchases '+R.label+' yet.');
  return say('Your biggest purchases '+R.label+':',{items:L.map(x=>({date:x.d,name:tidy(x.m)||'Purchase',amount:x.amt}))})});

on('breakdown',s=>/where (?:does|did|is|do) (?:all )?my money (?:go|going)|what do i spend (?:the )?most on|spending (?:breakdown|by category)|break ?down my spending|top categories|biggest categor/.test(s),(s,raw)=>{
  const R=BR.range(raw)||{a:som(T0()),b:T0(),label:'this month'},L=spendOnly(inR(BR.tx(),R.a,R.b)),tot=sum(L);
  if(!tot)return say('No spending '+R.label+' yet.');
  const o={};L.forEach(x=>{const c=bcat(x)[1];o[c]=(o[c]||0)+x.amt});const E=Object.entries(o).sort((a,b)=>b[1]-a[1]);
  return say('You’ve spent '+B0(tot)+' '+R.label+'. '+E[0][0]+' is the biggest piece at '+pct(E[0][1]/tot)+'.\n\n'+E.map(e=>'- '+e[0]+': '+money0(e[1])+' ('+pct(e[1]/tot)+')').join('\n'))});

on('subs',s=>/subscriptions?|recurring (?:charges?|payments?)|what am i subscribed|monthly charges|streaming services|what (?:am i|do i) pay(?:ing)? (?:for )?(?:every|each) month/.test(s)&&!/how much (?:did|have) i spen/.test(s),()=>{
  let L=[];try{L=subsList().filter(x=>x.st==='active')}catch(e){}
  if(!L.length)return say('I haven’t spotted any subscriptions yet. They show up once a charge repeats on a schedule, usually after two months of history.');
  const mo=L.reduce((a,x)=>a+x.amt,0),hk=L.filter(x=>x.hike),un=L.filter(x=>x.unused);
  return say('You have '+L.length+' subscription'+(L.length>1?'s':'')+', about '+B(mo)+' a month ('+money0(mo*12)+' a year).'+(hk.length?' '+hk.map(x=>x.name).join(' and ')+(hk.length>1?' went':' went')+' up recently.':'')+(un.length?' You marked '+un.length+' as not used.':''),{items:L.map(x=>({name:x.name+(x.cad&&x.cad!=='monthly'?' ('+x.cad+')':''),amount:r2(x.amt)}))})});

on('save',s=>/how much (?:should|do|would|can) i (?:need to )?(?:save|put (?:away|aside)|set aside)|\bsave (?:up )?for\b|\bsaving (?:up )?for\b|\bput aside for\b|\bset aside for\b/.test(s)&&BR.amount(s)>0,(s,raw)=>{
  const a=BR.amount(raw),T=T0();let by=BR.when(raw);const mm=lower(raw).match(/\bin (\d+) months?\b/);if(mm)by=addM(T,+mm[1]);
  const mo=lower(raw).match(/\b(?:by|before|in|for) (january|february|march|april|may|june|july|august|september|october|november|december)\b/);if(mo&&!by){const k=MON.indexOf(mo[1]),y=new Date(T).getUTCFullYear();by=Date.UTC(k<=new Date(T).getUTCMonth()?y+1:y,k,1)}
  let pays=[];try{pays=payDates(state,T-DAY)}catch(e){}
  const per=t=>Math.max(1,pays.filter(p=>p>T&&p<=t).length);
  if(by&&by>T){const n=per(by);return say('To save '+money0(a)+' by '+sdate(by)+', put aside about '+B0(Math.ceil(a/n))+' from each of your next '+n+' paycheck'+(n>1?'s':'')+'.\n\nAdd it as a goal in Savings and Sprout will build it into your daily number.')}
  const o=[3,6,12].map(m=>[m,per(addM(T,m))]);
  return say('Here’s what '+money0(a)+' takes, depending on when you need it:\n\n'+o.map(x=>'- In '+x[0]+' months: about '+money0(Math.ceil(a/x[1]))+' per paycheck').join('\n')+'\n\nTell me a date (like "by June") and I’ll give you one number.')});

on('debt',s=>/debt[- ]free|pay (?:off|down) (?:my )?(?:debts?|cards?|loans?|credit)|which (?:debt|card|loan)|how much do i owe|total debt|my debts?\b|what do i owe/.test(s),()=>{
  const D=(state.debts||[]).filter(d=>+d.bal>0);if(!D.length)return say('You don’t have any debts set up. If you do owe on a card or loan, add it in Edit numbers and I’ll map out a payoff date.');
  const tot=D.reduce((a,d)=>a+ +d.bal,0),hi=D.slice().sort((a,b)=>(+b.apr||0)-(+a.apr||0))[0];let free='';try{free=(document.getElementById('v-debt')||{}).textContent||''}catch(e){}
  return say('You owe '+B0(tot)+' across '+D.length+' debt'+(D.length>1?'s':'')+'.'+(free?(free===new Date(T0()).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',year:'numeric'})?' At your current plan it’s paid off by the end of this month.':' At your current plan you’re debt-free around **'+free+'**.'):'')+(D.length>1&&+hi.apr>0?'\n\nPaying '+shortName(hi.name)+' first ('+hi.apr+'% rate) saves the most interest. Keep paying the minimums on the rest.':''),{items:D.map(d=>({name:shortName(d.name)+(+d.apr?' · '+d.apr+'%':''),amount:r2(+d.bal)}))})});

on('track',s=>/on track|over (?:my )?budget|under (?:my )?budget|how am i doing|how'?s my (?:budget|spending|month)|budgets? (?:status|look)|stay(?:ing)? (?:on|within) (?:my )?budget/.test(s),()=>{
  const ms=monthSpend(),T=T0(),dim=new Date(eomT(T)).getUTCDate(),dom=new Date(T).getUTCDate(),fr=dom/dim;
  const L=BCATS.slice(0,6).map(c=>({n:c[1],sp:ms[c[0]]||0,lim:budLim(c)})).filter(x=>x.lim>0);
  const over=L.filter(x=>x.sp>x.lim),hot=L.filter(x=>x.sp<=x.lim&&x.sp>x.lim*Math.min(1,fr+0.15)&&x.sp>20),ok=L.length-over.length-hot.length;
  let msg=over.length?'You’re over in '+over.length+' budget'+(over.length>1?'s':'')+' this month.':hot.length?'Mostly on track, with '+hot.length+' budget'+(hot.length>1?'s':'')+' running a bit fast.':'You’re on track in all '+L.length+' budgets this month. Nice.';
  const lines=over.map(x=>'- '+x.n+': '+money0(x.sp)+' of '+money0(x.lim)+' (over by '+money0(x.sp-x.lim)+')').concat(hot.map(x=>'- '+x.n+': '+money0(x.sp)+' of '+money0(x.lim)+', and the month is '+pct(fr)+' done'));
  return say(msg+(lines.length?'\n\n'+lines.join('\n'):'')+(ok&&lines.length?'\n\nThe other '+ok+' are on pace.':''))});

on('compare',s=>/compar(?:e|ed|ing) (?:this|my|to|with|it)?\s?(?:month|spending|last)|than (?:last|this time last) month|month over month|(?:vs\.?|versus) last month|more or less than last/.test(s),()=>{
  const L=BR.tx(),T=T0(),dom=new Date(T).getUTCDate(),a=som(T),la=addM(T,-1),lb=la+(dom-1)*DAY;
  const cur=spendOnly(inR(L,a,T)),prev=spendOnly(inR(L,la,lb));const c=sum(cur),p=sum(prev);
  if(!p)return say('I don’t have enough of last month yet to compare. So far this month you’ve spent '+B0(c)+'.');
  const o={},q={};cur.forEach(x=>{const k=bcat(x)[1];o[k]=(o[k]||0)+x.amt});prev.forEach(x=>{const k=bcat(x)[1];q[k]=(q[k]||0)+x.amt});
  const ch=BCATS.map(b=>[b[1],(o[b[1]]||0)-(q[b[1]]||0)]).filter(x=>Math.abs(x[1])>=15).sort((x,y)=>Math.abs(y[1])-Math.abs(x[1])).slice(0,4);
  return say('So far this month you’ve spent '+B0(c)+', '+(c>p?money0(c-p)+' more':money0(p-c)+' less')+' than by this point last month ('+money0(p)+').'+(ch.length?'\n\n'+ch.map(x=>'- '+x[0]+': '+(x[1]>0?'up ':'down ')+money0(Math.abs(x[1]))).join('\n'):''))});

on('income',s=>/how much do i (?:make|earn|bring in|get paid)|my (?:income|salary|take[- ]home|pay)\b(?! ?day)|monthly income/.test(s),()=>{
  const p=+state.pay||0,f=state.payFreq||'biweekly',n={weekly:52,biweekly:26,semimonthly:24,monthly:12}[f]||26;if(!p)return say('I don’t have your pay set up yet. Add it in Edit numbers and I can work out your monthly income.');
  const inc=sum(inR(BR.tx(),som(T0()),T0()).filter(s=>s.cat==='Income'));
  return say('You take home about '+B0(p)+' '+({weekly:'every week',biweekly:'every 2 weeks',semimonthly:'twice a month',monthly:'every month'}[f]||'')+', which is about '+B0(p*n/12)+' a month on average.'+(inc>0?'\n\nSo far this month, '+money0(inc)+' has come in.':''))});

on('odd',s=>/(unusual|weird|odd|suspicious|strange|unknown|unrecognized|fraud)\b.*(charges?|transactions?|purchases?|activity)|duplicate|double[- ]?charged|charged (?:me )?twice|any fees|bank fees|overdraft|paying fees/.test(s),(s)=>{
  const I=BR.insights().filter(i=>/fee/.test(s)?i.k==='fee':/duplicate|double|twice/.test(s)?i.k==='dup':i.k==='dup'||i.k==='odd'||i.k==='fee'||i.k==='new');
  if(!I.length)return say(/fee/.test(s)?'No fees this month. Nice.':'Nothing looks off in your recent transactions. I check for double charges, unusually big purchases, fees and new repeating charges.');
  return say('Here’s what stood out:\n\n'+I.slice(0,5).map(i=>'- **'+i.t+'**. '+i.s).join('\n'))});

on('balance',s=>/how much (?:money )?(?:do i have|is in|is there) (?:in )?(?:my )?(?:checking|bank|account)|(?:my|checking) balance\b|what'?s in my (?:checking|account|bank)|how much money do i have/.test(s),()=>{
  const at=state.cashAt||0,ago=at?Math.round((Date.now()-at)/60000):null,lk=state.link&&state.link.live;
  return say('Checking is at '+B(+state.cash||0)+(at?' ('+(lk?'synced':'updated')+' '+(ago<1?'just now':ago<60?ago+' min ago':ago<1440?Math.round(ago/60)+' h ago':Math.round(ago/1440)+' days ago')+')':'')+'.'+(lk?'':' If that’s out of date, tell me the new balance, like "checking is $640".'))});

// judgment calls ("should I do X or Y?") go to the AI; the phone only answers questions with a clear number
const ADVICE=/\b(should i|is it (?:smarter|better|wise|worth|a good idea)|would it be|what do you think|which is better|better to|recommend|advice|opinion|thoughts on|pros and cons)\b/;
BR.answer=(raw)=>{const q=String(raw||'').trim();if(!q||q.length>400)return null;const s=lower(q).replace(/\s+/g,' ');
  const adv=ADVICE.test(s)&&!/^how much\b/.test(s);
  for(const it of INTENTS){if(adv&&it.name!=='afford')continue;try{if(it.test(s,q)){const r=it.fn(s,q);if(r){r.intent=it.name;return r}}}catch(e){if(window.__brainDebug)console.error(it.name,e)}}
  return null};
BR.intents=()=>INTENTS.map(i=>i.name);
}
