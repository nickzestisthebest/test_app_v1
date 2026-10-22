// ---------- Subscriptions, found automatically from your transactions ----------
// Looks for charges from the same merchant that repeat on a steady schedule with a steady price,
// recognises common services by name, spots price increases and predicts the next charge.
const SUBK=[['netflix','Netflix','Streaming',/netflix/i],['spotify','Spotify','Music',/spotify/i],['hulu','Hulu','Streaming',/hulu/i],['disney','Disney+','Streaming',/disney\s*plus|disney\+|disneyplus/i],
 ['max','Max','Streaming',/hbo\s*max|\bmax\.com|^max\b/i],['youtube','YouTube Premium','Streaming',/youtube/i],['peacock','Peacock','Streaming',/peacock/i],['paramount','Paramount+','Streaming',/paramount/i],
 ['icloud','iCloud+','Storage',/apple\.com\/bill|icloud/i],['googleone','Google One','Storage',/google\s*\*?\s*(one|storage)/i],['dropbox','Dropbox','Storage',/dropbox/i],
 ['prime','Amazon Prime','Shopping',/amazon\s*prime|amzn\s*prime|prime\s*video|prime\*/i],['audible','Audible','Books',/audible/i],['kindle','Kindle Unlimited','Books',/kindle/i],
 ['adobe','Adobe Creative Cloud','Software',/adobe/i],['msft','Microsoft 365','Software',/microsoft|msft/i],['chatgpt','ChatGPT Plus','Software',/openai|chatgpt/i],
 ['gym','','Fitness',/fitzone|planet\s*fitness|la\s*fitness|equinox|\bgym\b|crunch\s*fit|anytime\s*fitness/i],['calm','Calm','Health',/\bcalm\b/i],['headspace','Headspace','Health',/headspace/i],
 ['nyt','New York Times','News',/nytimes|new\s*york\s*times/i],['duolingo','Duolingo','Education',/duolingo/i],['dashpass','DoorDash DashPass','Delivery',/dashpass/i],['uberone','Uber One','Delivery',/uber\s*one/i],
 ['xbox','Xbox Game Pass','Gaming',/xbox/i],['playstation','PlayStation Plus','Gaming',/playstation|sony\s*interactive/i],['sirius','SiriusXM','Music',/sirius/i],['patreon','Patreon','Creators',/patreon/i]];
const SUBCAD=[[7,'weekly',52],[14,'every 2 weeks',26],[30.4,'monthly',12],[91,'every 3 months',4],[365,'yearly',1]];
function subNorm(m){let s=String(m||'').toUpperCase().replace(/^(SQ \*|TST\* ?|SP \*|PAYPAL \*|PP\*|POS |DEBIT |ACH |RECURRING |CHECKCARD \d+ )/,'');
  s=s.replace(/[#*].*$/,'').replace(/\d{3,}.*$/,'').replace(/\.(COM|NET|IO)\b/g,' ').replace(/[^A-Z&+ ]/g,' ').replace(/\b(INC|LLC|CO|USA|US)\b/g,' ').replace(/\s+/g,' ').trim();return s.split(' ').slice(0,3).join(' ')}
const subTitle=s=>s.toLowerCase().replace(/\b[a-z]/g,c=>c.toUpperCase());
function subRows(){const out=[];(HIST||[]).forEach(h=>{if(+h.a<0)out.push({d:h.d,a:-h.a,m:h.m})});
  (state.spend||[]).forEach(s=>{if(s.tid||s.linked||s.cat==='Income'||s.kind2==='in')return;if(+s.amt>0)out.push({d:s.d,a:+s.amt,m:s.note||''})});
  if(subDemoOn()){const has=new Set();out.forEach(r=>{const k=SUBK.find(z=>z[3].test(r.m));if(k)has.add(k[0])});subDemoRows().forEach(r=>{const k=SUBK.find(z=>z[3].test(r.m));if(k&&!has.has(k[0]))out.push(r)})}return out}
// example data: the example plans, and demo bank connections (real bank sync comes later)
const subDemoOn=()=>!!(state.demo||(state.link&&state.link.on));
// example statement for the demo: six months of charges, with a Hulu price increase on the latest one
function subDemoRows(){const T=realDay(),R=[],S=[['NETFLIX.COM 866-579-7172',15.49,7],['Spotify USA',11.99,22],['HULU 877-8244858 CA',15.99,3,17.99],['APPLE.COM/BILL',2.99,18],['ADOBE *CREATIVE CLD',22.99,11],['FITZONE GYM #221',30,1],['Audible*2K4JD9',14.95,26],['Amazon Prime*1A2B3C',14.99,14]];
  const dt=new Date(T);S.forEach(s=>{for(let k=0;k<6;k++){const d=new Date(Date.UTC(dt.getUTCFullYear(),dt.getUTCMonth()-k,s[2]));if(d.getTime()>T)continue;R.push({d:fd(d.getTime()),a:(s[3]&&k===0)||(s[3]&&d.getTime()>T-26*MS)?s[3]:s[1],m:s[0]})}});return R}
let SUBCACHE=null;
function detectSubs(){const rows=subRows(),key=JSON.stringify([rows.length,rows.slice(-3),realDay()]);if(SUBCACHE&&SUBCACHE.k===key)return SUBCACHE.v;
  const G={};rows.forEach(r=>{const kn=SUBK.find(k=>k[3].test(r.m)),id=kn?kn[0]:'m-'+subNorm(r.m).toLowerCase().replace(/[^a-z0-9]+/g,'-');if(!id||id==='m-')return;(G[id]=G[id]||{id,kn,raw:r.m,c:[]}).c.push({t:pd(r.d),a:+r.a})});
  const billNames=(state.bills||[]).concat(state.debts||[]).map(b=>subNorm(b.name));const T=realDay(),res=[];
  Object.values(G).forEach(g=>{const c=g.c.sort((x,y)=>x.t-y.t).filter((x,i,arr)=>!i||x.t-arr[i-1].t>2*MS);if(c.length<2)return;
    const iv=c.slice(1).map((x,i)=>(x.t-c[i].t)/MS).sort((x,y)=>x-y),med=iv[Math.floor(iv.length/2)];
    const cad=SUBCAD.find(z=>Math.abs(med-z[0])/z[0]<=0.2);if(!cad)return;
    const am=c.map(x=>x.a).sort((x,y)=>x-y),mid=am[Math.floor(am.length/2)];
    const exact=c.every(x=>Math.abs(x.a-mid)<=Math.max(0.5,mid*0.03));
    // unknown merchants must look like a real subscription: same price every time, monthly or longer, not everyday shopping
    if(g.kn&&!c.slice(-3).every(x=>Math.abs(x.a-mid)/mid<=0.25))return;
    if(!(g.kn&&c.length>=2)&&!(c.length>=3&&exact&&cad[0]>=28&&!/grocer|market|kroger|publix|aldi|walmart|target|costco|shell|chevron|exxon|bp\b|gas|fuel|coffee|starbucks|dunkin|chipotle|mcdonald|restaurant|cafe|pizza|uber\s*eats|doordash(?!.*pass)|lyft|uber(?!\s*one)/i.test(g.raw)))return;
    if(!g.kn&&(mid>250||billNames.some(b=>b&&subNorm(g.raw).startsWith(b.split(' ')[0]))))return;
    const last=c[c.length-1],prev=c[c.length-2];if(T-last.t>cad[0]*1.6*MS)return;
    const next=last.t+Math.round(cad[0])*MS,hike=last.a-prev.a>=0.5?last.a-prev.a:0;
    res.push({id:g.id,name:g.kn&&g.kn[1]?g.kn[1]:subTitle(subNorm(g.raw)),cat:g.kn?g.kn[2]:'Other',price:last.a,cad:cad[1],amt:Math.round(last.a*cad[2]/12*100)/100,n:c.length,next,hike,known:!!g.kn})});
  res.sort((a,b)=>b.amt-a.amt);SUBCACHE={k:key,v:res};return res}
const SUBDEMOUNUSED=['adobe','gym','audible'];
function subsList(){const x=X();return detectSubs().map(s=>{const r=x.subs[s.id]||{},un=r.unused===true||(subDemoOn()&&r.unused!==false&&SUBDEMOUNUSED.includes(s.id));
  const when=new Date(s.next).toLocaleDateString(undefined,{month:'short',day:'numeric'}),price=s.cad==='monthly'?'':money(s.price)+' '+s.cad+' · ';
  const note=s.hike?'Went up '+money(s.hike)+' on the last charge':price+'Next charge around '+when;
  return Object.assign({},s,{note,flag:s.hike?'hike':un?'unused':'',unused:un,st:r.s||'active',redir:!!r.redir})})}
// pages: honest empty state, and a way to mark something you don't use
{const _subs=PAGES.subs;PAGES.subs=()=>{const L=subsList();if(!L.length)return '<div class="xhero"><span class="k">Subscriptions</span><b>None found yet</b><span class="d">Sprout finds subscriptions automatically by spotting charges that repeat on a schedule.</span></div><div class="xcard"><h3>Give Sprout something to look at</h3><p class="xhint" style="margin:0 0 10px">Connect your accounts or import a statement. A few months of history works best.</p><div class="svbtns"><button class="sbtn" data-x="nav" data-v="accts">Connect accounts</button><button class="sbtn alt" data-x="nav" data-v="import">Import a statement</button></div></div>';
  return _subs().replace(/<div class="lkdemo"><b>([^<]*)\/mo looks unused\.<\/b>/,'<div class="lkdemo"><b>You marked $1/mo as not used.</b>').replace('Looks unused','Not used')
   .replace(/Demo mode\. In the full release Sprout finds these from your connected accounts, and cancelling is done for you\./,subDemoOn()?'Found automatically in example transactions. With your own accounts, Sprout finds these from your real charges.':'Found automatically from your transactions. Something missing or wrong? Tell Sprout from the subscription.')}}
{const _can=PAGES.cancel;PAGES.cancel=id=>{const h=_can(id),s=subsList().find(z=>z.id===id);if(!s||s.st==='cancelled')return h;
  const info='<div class="xcard subinfo"><div class="plrow"><span>How often</span><b>'+subTitle(s.cad)+'</b></div><div class="plrow"><span>Last charge</span><b>'+money(s.price)+(s.hike?' (up '+money(s.hike)+')':'')+'</b></div><div class="plrow"><span>Next charge</span><b>Around '+new Date(s.next).toLocaleDateString(undefined,{month:'short',day:'numeric'})+'</b></div><div class="plrow tot"><span>Charges found</span><b>'+s.n+'</b></div></div>'+
    '<label class="xtog"><span>I don’t use this<small>Helps Sprout point out what you could cut</small></span><input type="checkbox" class="sw" data-x="subunused" data-v="'+id+'"'+(s.unused?' checked':'')+'></label>';
  return h.replace('<div class="lkdemo">Cancelling saves',info+'<div class="lkdemo">Cancelling saves')}}
document.addEventListener('change',e=>{const t=e.target;if(!t||t.dataset.x!=='subunused')return;const x=X(),id=t.dataset.v;x.subs[id]=Object.assign({},x.subs[id],{unused:t.checked});sv();SUBCACHE=null;try{pgRender()}catch(_){}toast(t.checked?'Marked as not used':'Marked as used')});
