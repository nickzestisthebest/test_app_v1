// ===================== Recurring money: subscriptions, bills, paychecks and pay-later, found in your own history =====================
// Charges are grouped by who they're from, split by price, and kept only when they repeat on a schedule.
// Every finding carries how sure Sprout is and the charges behind it, so the app can show why it thinks so.
const RC={v:1};
{
const DY=MS,r2=x=>Math.round((+x||0)*100)/100;
const mid=a=>{if(!a.length)return 0;const s=a.slice().sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2};
const ym=t=>fd(t).slice(0,7);
// more services Sprout knows by name
[['fit','','Fitness',/onelife|ymca|orangetheory|life ?time (fitness|athletic)|24 hour fitness|gold'?s gym|blink fitness|eos fitness|crossfit|\bf45\b|solidcore|pure barre|club pilates|\bfitness\b|peloton/i],
 ['appleone','Apple One','Bundle',/apple one/i],['applemusic','Apple Music','Music',/apple music/i],['appletv','Apple TV+','Streaming',/apple ?tv/i],
 ['espn','ESPN+','Streaming',/espn/i],['sling','Sling TV','Streaming',/\bsling\b/i],['fubo','Fubo','Streaming',/fubo/i],['ytv','YouTube TV','Streaming',/youtube ?tv/i],
 ['crunchyroll','Crunchyroll','Streaming',/crunchyroll/i],['starz','Starz','Streaming',/starz/i],['amcplus','AMC+','Streaming',/amc ?\+|amcplus/i],['philo','Philo','Streaming',/\bphilo\b/i],
 ['pandora','Pandora','Music',/pandora/i],['tidal','Tidal','Music',/\btidal\b/i],['claude','Claude','Software',/anthropic|claude\.ai/i],['canva','Canva','Software',/canva/i],['notion','Notion','Software',/notion\.so|notion labs/i],['grammarly','Grammarly','Software',/grammarly/i],
 ['linkedin','LinkedIn Premium','Software',/linkedin/i],['nintendo','Nintendo Switch Online','Gaming',/nintendo/i],['eaplay','EA Play','Gaming',/ea play/i],
 ['strava','Strava','Fitness',/strava/i],['noom','Noom','Health',/\bnoom\b/i],['ww','WW','Health',/weight ?watchers|\bww international/i],
 ['tinder','Tinder','Dating',/tinder/i],['bumble','Bumble','Dating',/bumble/i],['hinge','Hinge','Dating',/\bhinge\b/i],
 ['wsj','Wall Street Journal','News',/\bwsj\b|wall street journal|dow jones/i],['wapo','Washington Post','News',/washington post|\bwapo\b/i],['substack','Substack','News',/substack/i],
 ['masterclass','MasterClass','Education',/masterclass/i],['skillshare','Skillshare','Education',/skillshare/i],['coursera','Coursera','Education',/coursera/i],['babbel','Babbel','Education',/babbel/i],
 ['walmartplus','Walmart+','Shopping',/walmart ?\+|walmart plus/i],['instacart','Instacart+','Delivery',/instacart ?\+|instacart plus|instacart express/i],
 ['costco','Costco membership','Shopping',/costco.*member|member.*costco/i],['aaa','AAA','Auto',/\baaa (member|club|ins)/i],['simplisafe','SimpliSafe','Home',/simplisafe/i]
].forEach(k=>{if(!SUBK.some(z=>z[0]===k[0]))SUBK.push(k)});
// services that are only ever a subscription, so one recent charge is enough to list them
const ONCE=new Set(['netflix','spotify','hulu','disney','max','peacock','paramount','icloud','googleone','dropbox','prime','audible','chatgpt','claude','sirius','dashpass','uberone','appleone','applemusic','appletv','espn','sling','fubo','ytv','crunchyroll','starz','amcplus','philo','pandora','tidal','nyt','wsj','wapo','youtube','kindle','calm','headspace']);
RC.BILL=[['phone','Phone',/t-?mobile|verizon|at&t|\bat ?& ?t\b|\batt\b|sprint|mint mobile|cricket wireless|metro ?(pcs|by)|visible\b|google fi\b|boost mobile|us cellular|straight talk|tracfone|xfinity mobile|spectrum mobile/i],
 ['internet','Internet and TV',/xfinity|comcast|spectrum|charter comm|cox comm|optimum|frontier comm|centurylink|lumen|google fiber|directv|dish network|starlink|earthlink|windstream/i],
 ['power','Utilities',/georgia power|duke energy|dominion energy|florida power|\bfpl\b|con ?ed\b|pg&e|edison|xcel energy|entergy|ameren|consumers energy|national grid|eversource|pseg|georgia natural gas|gas south|atlanta gas|piedmont natural|nicor|columbia gas|spire energy|\bwater\b|sewer|electric|\bpower\b|utilit|waste management|republic services|sanitation|\bemc\b/i],
 ['insurance','Insurance',/geico|progressive|state farm|allstate|usaa|liberty mutual|nationwide|farmers ins|travelers ins|lemonade|root ins|esurance|metlife|aflac|assurant|insurance|\bins prem/i],
 ['housing','Rent or mortgage',/\brent\b|apartment|\bapts?\b|property (management|mgmt)|prop mgmt|leasing|landlord|mortgage|rocket mortgage|mr\.? ?cooper|loancare|pennymac|freedom mortgage|\bhoa\b|homeowners assoc|\bbilt\b|yardi|rentcafe|appfolio|entrata/i],
 ['loan','Loan payment',/auto loan|capital one auto|ally (auto|financial|bank)|toyota (financial|motor)|honda financial|nissan (motor|infiniti)|ford credit|gm financial|santander consumer|carmax auto|westlake|credit acceptance|exeter fin|navient|nelnet|mohela|great lakes|aidvantage|edfinancial|sallie mae|\bsofi\b|upstart|lendingclub|best egg|prosper fund|\bavant\b|oportun|student loan|loan (pmt|payment|pymt)/i],
 ['childcare','Childcare and school',/daycare|child ?care|preschool|tuition|kindercare|bright horizons|primrose|goddard school/i]];
RC.BNPL=/klarna|affirm|afterpay|after ?pay\b|zip ?pay|\bzip\.co|quadpay|sezzle|paypal pay ?in ?4|\bpay ?in ?4\b|apple pay later|\buplift\b|katapult|perpay|splitit/i;
RC.prov=m=>{const s=String(m||'').toLowerCase();return /klarna/.test(s)?'Klarna':/affirm/.test(s)?'Affirm':/after ?pay/.test(s)?'Afterpay':/zip ?pay|zip\.co|quadpay/.test(s)?'Zip':/sezzle/.test(s)?'Sezzle':/paypal|pay ?in ?4/.test(s)?'PayPal Pay in 4':/apple pay later/.test(s)?'Apple Pay Later':/uplift/.test(s)?'Uplift':/katapult/.test(s)?'Katapult':/perpay/.test(s)?'Perpay':/splitit/.test(s)?'Splitit':''};
RC.PAYROLL=/payroll|direct ?dep|dir ?dep|dirdep|\bsalary\b|\bwages?\b|paychex|\badp\b|gusto|workday|rippling|intuit (payroll|qb)|trinet|justworks|paycom|paylocity|ceridian|dayforce|\bukg\b|insperity|fed sal|\bnet ?pay\b|\bpayrl\b/i;
RC.NOTPAY=/zelle|venmo|cash ?app|paypal|apple cash|transfer|\bxfer\b|deposit from|from (savings|checking|share)|refund|reversal|\breturn|interest|dividend|cash ?back|cashback|\batm\b|kalshi|polymarket|robinhood|coinbase|kraken|webull|fidelity|vanguard|schwab|reimburs|rebate|adjustment|tax ref|irs treas|mobile deposit|remote deposit|check deposit/i;
RC.NOTSUB=/grocer|market|kroger|publix|aldi|walmart|wal-mart|target|costco|shell|chevron|exxon|\bbp\b|\bgas\b|fuel|coffee|starbucks|dunkin|chipotle|mcdonald|chick-?fil|restaurant|cafe|pizza|burger|taco|uber\s*eats|doordash(?!.*pass)|lyft|uber(?!\s*one)|transfer|zelle|venmo|cash ?app|paypal|apple cash|\batm\b|withdraw|deposit|kalshi|polymarket|robinhood|coinbase|kraken|interest charge|\bfee\b|smoke|vape|liquor|bar\b/i;

// every money movement Sprout knows about, oldest first: bank and card history, plus what was logged by hand
RC.rows=()=>{const out=[];
  (HIST||[]).forEach(h=>{if(!h||h.c==='Skip'||h.xm||h.p)return;const x=h.x||'';if(/^(cp|cpin|own|wallet|invest|save|borrow)$/.test(x))return;const a=+h.a;if(!a||!isDate(h.d))return;
    out.push({t:pd(h.d),d:h.d,a,m:String(h.m||''),c:h.c,x,pf:h.f||'',k:h.k,ac:h.ac||''})});
  (state.spend||[]).forEach(s=>{if(!s||s.tid||s.linked||s.cat==='Skip'||!isDate(s.d)||!(+s.amt>0))return;const inc=s.cat==='Income';out.push({t:pd(s.d),d:s.d,a:inc?+s.amt:-(+s.amt),m:String(s.note||''),c:s.cat,x:s.xf||'',pf:s.pfd||'',man:1})});
  try{if(subDemoOn()){const has=new Set();out.forEach(r=>{const k=SUBK.find(z=>z[3].test(r.m));if(k)has.add(k[0])});subDemoRows().forEach(r=>{const k=SUBK.find(z=>z[3].test(r.m));if(k&&!has.has(k[0]))out.push({t:pd(r.d),d:r.d,a:-r.a,m:r.m,c:'Personal',x:'',pf:''})})}}catch(e){}
  return out.sort((a,b)=>a.t-b.t)};
RC.key=r=>{const m=String(r.m||'');const k=SUBK.find(z=>z[3].test(m));if(k&&k[0]!=='gym'&&k[0]!=='fit')return 's:'+k[0];if(RC.BNPL.test(m))return 'p:'+RC.prov(m).toLowerCase();const n=subNorm(m);return n?'m:'+n.toLowerCase():''};
RC.NAMES=[[/t-?mobile/i,'T-Mobile'],[/verizon/i,'Verizon'],[/at&t|\batt\b/i,'AT&T'],[/xfinity|comcast/i,'Xfinity'],[/spectrum/i,'Spectrum'],[/georgia power/i,'Georgia Power'],[/geico/i,'GEICO'],[/progressive/i,'Progressive'],[/state farm/i,'State Farm'],[/allstate/i,'Allstate'],[/usaa/i,'USAA'],[/capital one auto/i,'Capital One Auto'],[/navient/i,'Navient'],[/nelnet/i,'Nelnet'],[/mohela/i,'MOHELA'],[/sallie mae/i,'Sallie Mae'],[/duke energy/i,'Duke Energy'],[/georgia natural gas/i,'Georgia Natural Gas'],[/gas south/i,'Gas South'],[/mint mobile/i,'Mint Mobile'],[/cricket/i,'Cricket Wireless'],[/google fi\b/i,'Google Fi'],[/visible\b/i,'Visible'],[/\bsofi\b/i,'SoFi'],[/lemonade/i,'Lemonade'],[/liberty mutual/i,'Liberty Mutual'],[/aidvantage/i,'Aidvantage'],[/rocket mortgage/i,'Rocket Mortgage'],[/mr\.? ?cooper/i,'Mr. Cooper'],[/klarna/i,'Klarna'],[/affirm/i,'Affirm'],[/after ?pay/i,'Afterpay']];
RC.nice=m=>{const k=RC.NAMES.find(x=>x[0].test(m||''));if(k)return k[1];const s=subTitle(subNorm(m));return s.replace(/\bLlc\b|\bInc\b/g,'').trim()||'Payment'};
const CADS=[['weekly',7,52],['every 2 weeks',14,26],['twice a month',15.22,24],['monthly',30.44,12],['every 3 months',91.3,4],['every 6 months',182.6,2],['yearly',365.25,1]];
RC.CADS=CADS;
// "Apple Card" and "Apple Cash" are a card and a wallet, not subscriptions
try{const sx=/netflix|spotify|hulu|apple\.com|apple music|apple tv|apple one|icloud|adobe|audible|amazon prime|prime video|\bgym\b|fitzone|youtube premium|disney|\bmax\b|peacock|paramount|chatgpt|openai|anthropic/i;const c=B2.BC0.find(z=>z[0]==='subs');if(c)c[3]=sx;const t=TCATS.find(z=>z[0]==='subs');if(t)t[4]=/netflix|spotify|hulu|apple\.com|apple music|apple tv|icloud|adobe|audible|amazon prime|prime video|\bgym\b|youtube premium|disney|\bmax\b|peacock|paramount/;B2.sync()}catch(e){}
const span=ts=>{const a=new Date(ts[0]),b=new Date(ts[ts.length-1]);return (b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth()+1};
// how often something repeats: by the spacing, or (for monthly) one charge in each month even when the posting day wanders
RC.cadence=ts=>{if(ts.length<2)return null;const iv=[];for(let i=1;i<ts.length;i++)iv.push((ts[i]-ts[i-1])/DY);const m=mid(iv),fit=(lo,hi)=>iv.filter(v=>v>=lo&&v<=hi).length/iv.length;
  if(m>=5.5&&m<=8.5&&fit(5,9)>=0.75)return{c:CADS[0],q:fit(6,8)};
  if(m>=12&&m<=16&&fit(10,18)>=0.7)return{c:CADS[1],q:fit(13,15)};
  const uq=new Set(ts.map(ym)).size,one=uq===ts.length,cov=uq/span(ts);
  if((m>=24&&m<=37&&fit(22,40)>=0.66)||(one&&ts.length>=3&&cov>=0.75&&m>=20&&m<=46))return{c:CADS[3],q:Math.max(fit(26,35),one?cov:0)};
  if(m>=80&&m<=100&&fit(75,105)>=0.66)return{c:CADS[4],q:fit(84,98)};
  if(m>=170&&m<=195)return{c:CADS[5],q:0.7};
  if(m>=340&&m<=390)return{c:CADS[6],q:0.8};
  return null};
// the next date, keeping the usual day of the month for monthly things
RC.nextOf=(ts,cad,T)=>{const last=ts[ts.length-1];
  if(cad[1]>25&&cad[1]<40){const day=Math.round(mid(ts.slice(-3).map(t=>new Date(t).getUTCDate()))),d=new Date(last);let y=d.getUTCFullYear(),mo=d.getUTCMonth()+1;
    for(let k=0;k<36;k++){const t=Date.UTC(y,mo,Math.min(day,eom(y,mo+1)));if(t>T&&t-last>15*DY)return{t,day};mo++}return{t:last+30*DY,day}}
  let t=last;const P=Math.round(cad[1]);let k=0;while(t<=T&&k++<400)t+=P*DY;return{t,day:new Date(t).getUTCDate()}};
const dedupe=L=>{const c=[];L.forEach(r=>{const p=c[c.length-1];if(p&&r.t-p.t<=3*DY&&Math.abs(Math.abs(r.a)-Math.abs(p.a))<0.01)return;c.push(r)});return c};
const clusters=(L,tol)=>{const s=L.slice().sort((a,b)=>Math.abs(a.a)-Math.abs(b.a)),out=[];s.forEach(r=>{const v=Math.abs(r.a),c=out[out.length-1];if(c&&v<=c.lo*(1+tol)+0.5)c.L.push(r);else out.push({lo:v,L:[r]})});return out.map(c=>c.L.sort((a,b)=>a.t-b.t))};
const BRAND=/^(capital|one|chase|citi|citibank|wells|fargo|bank|america|discover|amex|american|express|synchrony|barclays|navy|federal|credit|union|card|visa|mastercard|the|and|bill|bills|payment|pmt|pymt|autopay|auto pay|online|llc|inc|com|monthly|account|ach|debit|web|pay|plan|purchase)$/;
const W=n=>String(n||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>=3&&!BRAND.test(w));
RC.sim=(a,b)=>{const A=W(a),B=new Set(W(b));return A.some(w=>B.has(w))};

let CACHE=null;
RC.all=()=>{const T=realDay(),key=(HIST?HIST.length:0)+'|'+(state.spend||[]).length+'|'+T+'|'+(subDemoOn()?1:0);if(CACHE&&CACHE.k===key)return CACHE.v;
  const rows=RC.rows(),G={},out=[];
  rows.forEach(r=>{if(r.a>=0||RX_FEE.test(r.m)||/^BANK_FEES/.test(r.pf))return;const k=RC.key(r);if(!k)return;(G[k]=G[k]||{k,L:[]}).L.push(r)});
  Object.values(G).forEach(g=>{const m0=g.L[g.L.length-1].m,known=SUBK.find(z=>z[3].test(m0)),bill=RC.BILL.find(b=>b[2].test(m0));
    const pf=g.L.map(r=>r.pf).filter(Boolean).pop()||'',billish=!!bill||/^(RENT_AND_UTILITIES|LOAN_PAYMENTS|GENERAL_SERVICES_INSURANCE)/.test(pf)||g.L.some(r=>r.x==='loan');
    const billCat=g.L.filter(r=>r.c==='Bill').length>=g.L.length/2;
    if(RC.BNPL.test(m0)){clusters(g.L,0.02).forEach(L=>{const c=dedupe(L);if(c.length<2)return;const last=c[c.length-1];if(T-last.t>50*DY)return;const ts=c.map(r=>r.t),cad=RC.cadence(ts);
        out.push({id:'p-'+g.k.slice(2)+'-'+Math.round(Math.abs(last.a)*100),key:g.k,kind:'plan',prov:RC.prov(m0),name:RC.prov(m0),price:r2(Math.abs(last.a)),typ:r2(Math.abs(last.a)),cad:cad?cad.c[0]:'',per:cad?cad.c[1]:0,n:c.length,last:last.t,next:cad?RC.nextOf(ts,cad.c,T).t:0,conf:cad?0.7:0.5,rows:c.map(r=>r.k).filter(Boolean)})});return}
    const groups=billish||(known&&known[0]!=='gym'&&known[0]!=='fit')?[g.L]:clusters(g.L,0.06);
    groups.forEach(L=>{const c=dedupe(L),n=c.length;if(!n)return;const ts=c.map(r=>r.t),am=c.map(r=>Math.abs(r.a)),last=c[n-1];
      const kind=billish||(billCat&&!known)?'bill':'sub',cad=n>=2?RC.cadence(ts):null,md=mid(am.slice(-3)),stable=am.filter(a=>Math.abs(a-md)<=Math.max(0.5,md*0.03)).length/n;
      let conf=0;
      if(kind==='sub'){
        if(known&&known[0]!=='gym'&&known[0]!=='fit'){if(cad&&stable>=0.6)conf=0.92;else if(n===1&&ONCE.has(known[0])&&T-last.t<=40*DY&&md<=120)conf=0.6;else if(n>=2&&ONCE.has(known[0])&&T-last.t<=40*DY&&stable>=0.6)conf=0.7}
        else if(known){if(cad&&n>=2&&stable>=0.8&&((cad.c[1]>=25&&cad.c[1]<=40)||cad.c[1]>=340))conf=0.85}
        else if(!RC.NOTSUB.test(m0)&&md<=250){if(cad&&n>=3&&stable>=0.9&&cad.c[1]>=25)conf=0.75;else if(cad&&n===2&&stable===1&&cad.c[1]>=25&&cad.c[1]<=40&&md<=100)conf=0.55}
      }else{
        if(cad&&cad.c[1]>=25&&n>=2&&(bill||n>=3))conf=bill?0.85:(stable>=0.8?0.75:0.6);
        else if(cad&&cad.c[1]>=6&&n>=4&&stable>=0.8)conf=0.65;
        else if(bill&&n>=2&&new Set(ts.map(ym)).size===n)conf=0.6;
      }
      if(!conf)return;const per=cad?cad.c:CADS[3];
      if(T-last.t>per[1]*1.6*DY+5*DY)return;
      const nx=RC.nextOf(ts,per,T),prev=n>=2?am[n-2]:am[0],hike=kind==='sub'&&n>=3&&am[n-1]-prev>=0.5&&am.slice(0,-1).every(a=>Math.abs(a-prev)<=Math.max(0.5,prev*0.03))?r2(am[n-1]-prev):0;
      const id=known&&known[0]!=='gym'&&known[0]!=='fit'?known[0]+(groups.length>1?'-'+Math.round(md):''):'m-'+subNorm(last.m).toLowerCase().replace(/[^a-z0-9]+/g,'-')+(groups.length>1?'-'+Math.round(md):'');
      const name=known&&known[1]?known[1]:RC.nice(last.m);
      out.push({id,key:g.k,kind,name,raw:last.m,cat:known?known[2]:bill?bill[1]:'Other',billType:bill?bill[0]:(g.L.some(r=>r.x==='loan')?'loan':''),price:r2(am[n-1]),typ:r2(md),cad:per[0],per:per[1],amt:r2((hike?am[n-1]:md)*per[2]/12),n,last:last.t,next:nx.t,day:nx.day,hike,vary:md>0&&(Math.max(...am)-Math.min(...am))/md>0.1,conf,known:!!known,rows:c.map(r=>r.k).filter(Boolean),first:ts[0]})})});
  // one-off charges from a service people subscribe to: keep only the likeliest one
  const seen={};out.filter(s=>s.kind==='sub'&&s.n===1).sort((a,b)=>(/sub|plus|pro\b|premium|member/i.test(b.raw)?1:0)-(/sub|plus|pro\b|premium|member/i.test(a.raw)?1:0)||b.price-a.price).forEach(s=>{const k=s.id.replace(/-\d+$/,'');if(seen[k])s.drop=1;seen[k]=1});
  for(let i=out.length-1;i>=0;i--)if(out[i].drop||(out[i].n===1&&out.some(o=>o!==out[i]&&o.kind==='sub'&&o.n>1&&o.id.replace(/-\d+$/,'')===out[i].id.replace(/-\d+$/,''))))out.splice(i,1);
  out.sort((a,b)=>b.amt-a.amt);CACHE={k:key,v:out};return out};
RC.reset=()=>{CACHE=null;PCACHE=null};

// ---------- paychecks ----------
let PCACHE=null;
RC.pays=()=>{const T=realDay(),key=(HIST?HIST.length:0)+'|'+(state.spend||[]).length+'|'+T;if(PCACHE&&PCACHE.k===key)return PCACHE.v;
  const G={};RC.rows().forEach(r=>{if(r.a<100||r.t>T)return;const m=r.m,pay=RC.PAYROLL.test(m)||/^INCOME_WAGES/.test(r.pf);if(/refund|tax ref|reversal/i.test(m))return;if(!pay&&RC.NOTPAY.test(m))return;
    if(!pay&&typeof LG!=='undefined'&&LG.ownName&&LG.ownName(m))return;if(r.c&&r.c!=='Income'&&!pay)return;const k=RC.key(r);if(!k)return;(G[k]=G[k]||{k,L:[],pay:false}).L.push(r);if(pay)G[k].pay=true});
  const out=[];
  Object.values(G).forEach(g=>{const c=[];g.L.forEach(r=>{const p=c[c.length-1];if(p&&r.t-p.t<=2*DY){if(r.a>p.a)c[c.length-1]=r;return}c.push(r)});const n=c.length;if(n<(g.pay?2:3))return;
    const ts=c.map(r=>r.t),am=c.map(r=>r.a),iv=[];for(let i=1;i<n;i++)iv.push((ts[i]-ts[i-1])/DY);const m=mid(iv),fit=(lo,hi)=>iv.filter(v=>v>=lo&&v<=hi).length/iv.length;
    const recent=c.slice(-6),doms=recent.map(r=>new Date(r.t).getUTCDate());let freq=null,q=0,days=null;
    // twice a month lands on two fixed days; every two weeks drifts through the month
    if(m>=12&&m<=18&&n>=4){const s=doms.slice().sort((a,b)=>a-b),lo=s.filter(d=>d<=16),hi=s.filter(d=>d>16),d1=lo.length?mid(lo):0,d2=hi.length?mid(hi):0;
      const near=(d,x)=>Math.abs(d-x)<=3||(x>=28&&d>=27);if(lo.length&&hi.length&&doms.every(d=>near(d,d1)||near(d,d2))&&Math.max(...lo)-Math.min(...lo)<=4&&Math.max(...hi)-Math.min(...hi)<=4){freq='semimonthly';q=fit(12,19);days=[Math.round(d1),d2>=28?31:Math.round(d2)]}}
    if(!freq&&m>=5.5&&m<=8.5&&fit(5,9)>=0.8){freq='weekly';q=fit(6,8)}
    if(!freq&&m>=12&&m<=16&&fit(10,18)>=0.75){freq='biweekly';q=fit(13,15)}
    if(!freq&&m>=26&&m<=35&&fit(24,38)>=0.75){freq='monthly';q=fit(27,34)}
    if(!freq)return;
    const last=c[n-1];if(T-last.t>({weekly:7,biweekly:14,semimonthly:16,monthly:31})[freq]*2.2*DY)return;
    const typ=r2(mid(am.slice(-3))),spread=(Math.max(...am.slice(-6))-Math.min(...am.slice(-6)))/Math.max(1,typ);
    let conf=(g.pay?0.5:0.25)+(n>=4?0.25:0.1)+(q>=0.85?0.2:0.1)-(spread>0.35?0.15:0);conf=Math.min(0.98,conf);
    let next;
    if(freq==='weekly'||freq==='biweekly'){const P=freq==='weekly'?7:14,wd=[0,0,0,0,0,0,0];recent.forEach(r=>wd[new Date(r.t).getUTCDay()]++);const mode=wd.indexOf(Math.max(...wd));
      const anc=recent.slice().reverse().find(r=>new Date(r.t).getUTCDay()===mode)||last;next=anc.t;let k=0;while(next<=T&&k++<200)next+=P*DY}
    else if(freq==='semimonthly'){const d=new Date(T);let y=d.getUTCFullYear(),mo=d.getUTCMonth();next=0;for(let k=0;k<3&&!next;k++){for(const dd of days){const t=Date.UTC(y,mo,Math.min(dd,eom(y,mo+1)));if(t>T){next=t;break}}mo++}}
    else{const day=Math.round(mid(doms)),d=new Date(T);let y=d.getUTCFullYear(),mo=d.getUTCMonth();next=Date.UTC(y,mo,Math.min(day,eom(y,mo+1)));if(next<=T){mo++;next=Date.UTC(y,mo,Math.min(day,eom(y,mo+1)))}}
    const pe={weekly:52,biweekly:26,semimonthly:24,monthly:12}[freq];
    out.push({key:g.k,name:RC.nice(last.m),amt:typ,freq,days,next,n,last:last.t,lastAmt:r2(last.a),conf,vary:spread>0.1,payroll:g.pay,mo:r2(typ*pe/12)})});
  out.sort((a,b)=>b.mo-a.mo);PCACHE={k:key,v:out};return out};
RC.pay=()=>RC.pays().find(p=>p.conf>=0.7)||null;
RC.FREQ={weekly:'every week',biweekly:'every other week',semimonthly:'twice a month',monthly:'every month'};
RC.wday=t=>new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'long'});
RC.payWords=p=>money0(p.amt)+' '+(p.freq==='biweekly'||p.freq==='weekly'?RC.FREQ[p.freq]+' on '+RC.wday(p.next)+'s':RC.FREQ[p.freq]);

// ---------- subscriptions come from here now ----------
detectSubs=function(){try{return RC.all().filter(s=>s.kind==='sub'&&s.conf>=0.55).map(s=>({id:s.id,name:s.name,cat:s.cat,price:s.price,cad:s.cad,amt:s.amt,n:s.n,next:s.next,hike:s.hike,known:s.known,maybe:s.conf<0.7,once:s.n===1,raw:s.raw,last:s.last}))}catch(e){return []}};

// ---------- what's already in the plan ----------
RC.inPlan=s=>(state.bills||[]).some(b=>b.src===s.id||RC.sim(b.name,s.name)||RC.sim(b.name,s.raw)||(b.type==='monthly'&&Math.abs(+b.amt-s.typ)<=Math.max(2,s.typ*0.05)&&Math.abs((+b.day||0)-s.day)<=4))||
  (state.debts||[]).some(d=>RC.sim(d.name,s.name)||RC.sim(d.name,s.raw)||((s.billType==='loan'||s.billType==='housing')&&!d.card&&+d.min>0&&Math.abs(+d.min-s.typ)<=Math.max(5,s.typ*0.15)))||
  (state.sched||[]).some(x=>RC.sim(x.name,s.name));
RC.dis=()=>{const g=LG.st();g.rcx=g.rcx||{};return g.rcx};
RC.newBills=()=>{if(LG.demo())return [];const d=RC.dis();return RC.all().filter(s=>s.kind==='bill'&&s.conf>=0.6&&!d[s.id]&&!RC.inPlan(s))};
RC.billOf=s=>s.per>25&&s.per<40?{name:s.name,amt:r2(s.typ),type:'monthly',day:s.day,src:s.id,auto:1}:{name:s.name,amt:r2(s.typ),type:'every',every:Math.round(s.per),first:fd(s.next),src:s.id,auto:1};
RC.addBills=ids=>{const L=RC.newBills().filter(s=>ids.indexOf(s.id)>=0),added=L.map(RC.billOf);if(!added.length)return 0;state.bills=(state.bills||[]).concat(added);RC.reset();try{editors()}catch(e){}plan();queueSave();
  toastAct('Added '+added.length+' bill'+(added.length>1?'s':'')+' to your plan','Undo',()=>{state.bills=state.bills.filter(b=>added.indexOf(b)<0);try{editors()}catch(e){}plan();queueSave();if(typeof xRender==='function')xRender()});return added.length};

// ---------- your paycheck, found from your deposits ----------
RC.auto=()=>{const g=LG.st();g.auto=g.auto||{};return g.auto};
RC.paySuggest=()=>{if(LG.demo()||!state.setup||+state.pay>0)return null;const p=RC.pay();if(!p)return null;const a=RC.auto();if(a.payNo&&a.payNo===p.key)return null;return p};
RC.usePay=p=>{const before={pay:state.pay,payFreq:state.payFreq,firstPay:state.firstPay,payDays:state.payDays};state.pay=p.amt;state.payFreq=p.freq;state.firstPay=fd(p.next);if(p.days)state.payDays=p.days.slice();
  const a=RC.auto();a.pay={key:p.key,set:p.amt,freq:p.freq,at:Date.now(),name:p.name};
  // a paycheck that already landed this pay period is already in checking, so it isn't counted again
  try{const T=realDay();RC.rows().filter(r=>r.a>0&&RC.key(r)===p.key&&T-r.t<=6*DY).forEach(r=>{payDates(state,r.t-20*DY).filter(t=>Math.abs(t-r.t)<=4*DY).forEach(t=>{state.gotPay=Object.assign({},state.gotPay||{},{[fd(t)]:true})})})}catch(e){}
  plan();queueSave();toastAct('Paycheck added: '+money0(p.amt)+' '+RC.FREQ[p.freq],'Undo',()=>{Object.assign(state,before);delete a.pay;plan();queueSave();if(typeof xRender==='function')xRender()})};
// after each sync: keep an auto-found paycheck current, and notice one that came early
RC.watch=()=>{try{RC.reset();if(LG.demo()||!state.setup)return;const a=RC.auto(),p=RC.pays().find(x=>a.pay&&x.key===a.pay.key);if(!a.pay||!p)return;
    const manual=Math.abs((+state.pay||0)-(+a.pay.set||0))>0.5||state.payFreq!==a.pay.freq;if(manual){a.pay.manual=1;return}
    if(Math.abs(p.amt-state.pay)/Math.max(1,state.pay)>0.02){state.pay=p.amt;a.pay.set=p.amt}
    if(p.freq===state.payFreq&&(p.freq==='weekly'||p.freq==='biweekly')){const nx=payDates(state,realDay())[0];if(nx&&Math.abs(nx-p.next)>=DY&&Math.abs(nx-p.next)<=4*DY)state.firstPay=fd(p.next)}
    const T=realDay();RC.rows().filter(r=>r.a>0&&RC.key(r)===p.key&&T-r.t<=6*DY).forEach(r=>{payDates(state,r.t-20*DY).filter(t=>t>=r.t&&t-r.t<=4*DY).forEach(t=>{if(!(state.gotPay||{})[fd(t)])state.gotPay=Object.assign({},state.gotPay||{},{[fd(t)]:true})})})}catch(e){}};
{const _af=LG.after;LG.after=function(){const r=_af.apply(this,arguments);RC.watch();return r}}
// a paycheck that should have landed by now
RC.late=()=>{if(LG.demo()||!(+state.pay>0)||!LG.live())return null;const a=RC.auto();if(!a.pay)return null;const T=realDay(),ds=payDates(state,T-6*DY).filter(t=>t<T&&T-t>=DY&&T-t<=5*DY);if(!ds.length)return null;const t=ds[ds.length-1];
  if((state.gotPay||{})[fd(t)])return null;const got=RC.rows().some(r=>r.a>0&&RC.key(r)===a.pay.key&&Math.abs(r.t-t)<=4*DY);return got?null:{t,amt:+state.pay}};

try{if(window.__S)window.__S.RC=RC}catch(e){}
}
