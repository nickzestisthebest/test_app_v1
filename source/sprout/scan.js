// ===== screenshot logging + "same money, two names" matching =====
const WALLETS=[['cashapp',/cash ?app|sq \*?cash|square cash/i,'Cash App'],['venmo',/venmo/i,'Venmo'],['paypal',/paypal/i,'PayPal'],['zelle',/zelle/i,'Zelle'],['applecash',/apple cash/i,'Apple Cash']];
const WNAME=Object.fromEntries(WALLETS.map(w=>[w[0],w[2]]));
const walletOf=s=>{for(const w of WALLETS)if(w[1].test(s||''))return w[0];return null};
// moving your own money into a wallet is not spending: the spend is the payment you make from it
const RX_WFUND=/add(ed)? cash|cash ?app.{0,12}(load|add|deposit|top ?up)|venmo.{0,12}(top ?up|add|load)|paypal.{0,12}(add funds|transfer from)|instant transfer to|transfer to (cash ?app|venmo|paypal)|apple cash (add|load)/i;
const STOPW=/^(cash|app|venmo|paypal|zelle|apple|the|and|inc|llc|co|store|payment|pay|to|from|sent|for|purchase|debit|card|pos|www|com|atl|usa)$/;
const nameToks=s=>normM(s).split(' ').filter(t=>t.length>2&&!STOPW.test(t));
// how sure are we that a and b are the same money? a,b = {amt,d,name,via,who,kind}
function sameScore(a,b){const x=+a.amt,y=+b.amt;if(!(x>0&&y>0))return 0;let sc=0;const lo=Math.min(x,y),hi=Math.max(x,y),diff=hi-lo;
  if(diff<=0.01)sc+=3;else{const fee=(a.via||b.via)&&diff<=Math.max(0.25,lo*0.0175)+0.01,tip=(a.kind==='receipt'||b.kind==='receipt')&&diff/lo<=0.35;if(fee)sc+=2.2;else if(tip)sc+=1.6;else return 0}
  const dd=Math.abs(pd(a.d)-pd(b.d))/MS;if(dd>4)return 0;sc+=dd===0?1:dd===1?.8:dd===2?.6:dd===3?.2:-1.5;
  const ta=nameToks((a.name||'')+' '+(a.who||'')),tb=nameToks((b.name||'')+' '+(b.who||''));
  const ov=ta.filter(t=>tb.some(u=>u===t||(t.length>3&&u.length>3&&(u.startsWith(t)||t.startsWith(u))))).length;if(ov)sc+=Math.min(2.5,1.5+ov*.5);
  const wa=a.via||walletOf(a.name),wb=b.via||walletOf(b.name);if(wa&&wb){if(wa===wb)sc+=2;else return 0}
  // both sides carry a real name (merchant or person) and they clearly disagree: different purchases that cost the same
  if(a.named&&b.named&&!ov&&!(wa&&wb)&&ta.length&&tb.length)sc-=2.5;
  return sc}
// pick the one confident match, or nothing. Never asks the person.
function bestSame(item,pool){let best=null,bs=0,near=0;pool.forEach(p=>{const sc=sameScore(item,p.o);if(sc>=3.6)near++;if(sc>bs){bs=sc;best=p}});
  return best&&(bs>=4.5||(bs>=3.6&&near===1))?{p:best,score:bs}:null}
const asObj=s=>({amt:+s.amt,d:s.d,name:s.note||'',via:s.via||walletOf(s.note)||walletOf(s.bank&&s.bank.m),who:s.who||'',kind:s.kind2||'',named:s.src==='shot'||!!s.tid});
const outDir=s=>s.cat!=='Income';
// pools
const bankPool=dirOut=>(state.spend||[]).map((s,i)=>({s,i,o:Object.assign(asObj(s),{name:(s.bank&&s.bank.m)||s.note||''})})).filter(p=>p.s.tid&&!p.s.linked&&!p.s.nolink&&outDir(p.s)===dirOut);
const loggedPool=dirOut=>(state.spend||[]).map((s,i)=>({s,i,o:asObj(s)})).filter(p=>!p.s.tid&&!p.s.nolink&&outDir(p.s)===dirOut);
// bank row arriving: does it match something logged by hand or from a screenshot?
function matchLogged(r){const out=r.a<0,o={amt:Math.abs(r.a),d:r.d,name:r.m,via:walletOf(r.m),kind:'bank',named:true};const m=bestSame(o,loggedPool(out));return m?m.p.s:null}
// a screenshot or hand-logged item arriving: link it to the bank copy, skip it if already logged, or add it
function logOrLink(e,info){info=info||{};const out=e.cat!=='Income',o={amt:+e.amt,d:e.d,name:e.note||'',via:info.via||walletOf(e.note),who:info.who||'',kind:info.kind||'',named:info.src==='shot'};
  const b=bestSame(o,bankPool(out));
  if(b){const s=b.p.s;s.bank=s.bank||{m:s.note,a:+s.amt};s.linked=1;if(info.src==='shot')s.shot=1;if(e.note&&(info.kind==='p2p'||info.kind==='receipt'))s.note=e.note.slice(0,60);if(info.who)s.who=info.who;if(info.via)s.via=info.via;if(info.kind)s.kind2=info.kind;if(info.cat&&info.cat!==s.cat)s.cat=info.cat;return{st:'link',s}}
  const d=bestSame(o,loggedPool(out));if(d&&info.src==='shot')return{st:'dupe',s:d.p.s};
  const n=Object.assign({},e,{src:info.src||e.src||'hand'});if(info.via)n.via=info.via;if(info.who)n.who=info.who;if(info.kind)n.kind2=info.kind;state.spend.push(n);return{st:'new',s:n}}
const bankLabel=s=>(s.bank&&s.bank.m?tidy(s.bank.m):'your bank')+(s.acct?' in '+s.acct:'');
// ---------- scan sheet ----------
let SC={step:'pick',imgs:[],items:[],note:'',busy:false};
const CAM='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
const scanAI=()=>!!(sampleFn&&imgOK);
function scanOpen(){SC={step:'pick',imgs:[],items:[],note:'',busy:false};closeSheets();setTimeout(()=>{scRender();openSheet('sh-scan')},closeSheetsDelay())}
const closeSheetsDelay=()=>document.querySelector('.sheet.on')?280:0;
function scCat(it){if(it.dir==='in')return 'Income';const r={d:it.d,a:-it.amt,m:it.name};let c='Personal';try{c=categorize(r,'checking',new Set()).cat}catch(e){}
  if(c==='Skip'||c==='Bill'&&it.kind==='p2p')c=RX_EVERY.test(it.name)?'Everyday':'Personal';return c}
function scClassify(){SC.items.forEach(it=>{if(it.skip)return;const e={d:it.d,amt:it.amt,cat:it.cat,note:it.name};const out=it.cat!=='Income',o={amt:it.amt,d:it.d,name:it.name,via:it.via,who:it.who,kind:it.kind,named:true};
  const b=bestSame(o,bankPool(out));if(b){it.st='link';it.with=b.p.s;return}
  const d=bestSame(o,loggedPool(out));if(d){it.st='dupe';it.with=d.p.s;return}
  const twin=SC.items.find(z=>z!==it&&z.st==='new'&&sameScore(o,{amt:z.amt,d:z.d,name:z.name,via:z.via,who:z.who,kind:z.kind,named:true})>=4.5);if(twin){it.st='twin';return}
  it.st='new'})}
function scRender(){const B=$('#sc-body');if(!B||B===DUMMY)return;let x='';
  const thumbs=SC.imgs.length?'<div class="scthumbs">'+SC.imgs.map(u=>'<img src="'+u.url+'" alt="Your screenshot">').join('')+'</div>':'';
  if(SC.step==='pick'){
    x='<label class="scdrop" for="sc-file">'+CAM+'<b>Choose screenshots</b><small>or paste one here. Up to 4 at a time.</small></label><input id="sc-file" type="file" accept="image/*" multiple class="hide">'+
      '<div class="scworks"><span>Receipts</span><span>Cash App</span><span>Venmo</span><span>Zelle</span><span>PayPal</span><span>Bank and card apps</span></div>'+
      '<p class="note" style="margin:0">Sprout reads the amount, the date and who you paid, sorts it for you, and makes sure nothing is counted twice when your bank catches up.</p>'+
      (scanAI()?'':'<div class="lkdemo"><b>Demo mode.</b> Reading real screenshots needs Sprout’s AI, which isn’t available in this view. Try an example to see how it works.</div>')+
      '<div class="scex"><small>Try an example</small><button type="button" class="wchip" data-scex="cash">Cash App payment</button><button type="button" class="wchip" data-scex="receipt">Restaurant receipt</button><button type="button" class="wchip" data-scex="card">Card app screenshot</button></div>'}
  else if(SC.step==='read'){x=thumbs+'<div class="scread"><b>Reading your screenshot…</b><small>Finding the amount, date and who you paid</small></div><div class="scsk"><i></i><i></i><i></i></div>'}
  else{const add=SC.items.filter(i=>i.st==='new'&&!i.off),seen=SC.items.filter(i=>i.st==='link'||i.st==='dupe'||i.st==='twin'),skipped=SC.items.filter(i=>i.skip);
    x=thumbs+(SC.items.length?'':'<div class="scread"><b>No transactions found</b><small>'+esc(SC.note||'Try a clearer screenshot of the payment or receipt.')+'</small></div>')+
    (SC.items.filter(i=>i.st==='new').length?'<h4 class="sch">New</h4>'+SC.items.map((it,k)=>it.st!=='new'?'':'<div class="scrow'+(it.off?' off':'')+'"><span class="scico">'+esc((WNAME[it.via]||it.name||'?').slice(0,1).toUpperCase())+'</span><div class="sct"><b>'+esc(it.name)+'</b><small>'+sdate(pd(it.d))+(it.via?' · '+WNAME[it.via]:it.kind==='receipt'?' · Receipt':'')+(it.memo?' · '+esc(it.memo):'')+'</small>'+
      (it.cat==='Income'?'<div class="sccats"><button class="wchip on" type="button">Money in</button></div>':'<div class="sccats">'+[['Everyday','Basics'],['Personal','Fun'],['Bill','Bill']].map(c=>'<button type="button" class="wchip'+(it.cat===c[0]?' on':'')+'" data-sccat="'+k+':'+c[0]+'">'+c[1]+'</button>').join('')+'</div>')+
      '</div><div class="sca">'+(it.cat==='Income'?'+':'−')+money(it.amt)+'<button type="button" class="scx" data-scoff="'+k+'" aria-label="'+(it.off?'Include':'Leave out')+' '+esc(it.name)+'">'+(it.off?'Undo':'×')+'</button></div></div>').join(''):'')+
    (seen.length?'<div class="scseen"><b>'+seen.length+' already counted</b><small>Sprout found '+(seen.length===1?'it':'them')+' in your transactions, so '+(seen.length===1?'it won’t':'they won’t')+' be counted twice.</small>'+seen.map(it=>'<div class="scs"><span>'+esc(it.name)+' · '+money(it.amt)+'</span><em>'+(it.st==='link'?'Same as '+esc(bankLabel(it.with))+'. Details added.':it.st==='twin'?'Same as another screenshot':'Already logged as '+esc(it.with.note||catName(it.with.cat)))+'</em></div>').join('')+'</div>':'')+
    (skipped.length?'<p class="note" style="margin:0">Skipped '+skipped.map(i=>esc(i.name)+' ('+i.skip+')').join(', ')+'.</p>':'')+
    '<div class="row"><button type="button" class="btn" data-scgo>'+(add.length?'Add '+add.length+' transaction'+(add.length>1?'s':''):seen.length?'Update details':'Done')+'</button><button type="button" class="btn alt" data-scagain>Scan another</button></div>'}
  B.innerHTML=x}
function scLoadItems(list,note){SC.items=list.filter(Boolean).map(i=>Object.assign({},i));SC.note=note||'';
  SC.items.forEach(it=>{if(it.status==='declined')it.skip='declined';else if(it.type==='transfer')it.skip='moving your own money';if(!it.skip)it.cat=it.cat||scCat(it)});
  scClassify();SC.step='review';scRender()}
async function scRead(files){if(!files.length)return;SC.imgs=files.slice(0,4).map(f=>({f,url:URL.createObjectURL(f)}));SC.step='read';scRender();
  if(!scanAI()){await new Promise(r=>setTimeout(r,900));scLoadItems([],'Reading real screenshots needs Sprout’s AI, which isn’t available in this view. Try one of the examples.');return}
  try{const blobs=await Promise.all(SC.imgs.map(a=>shrink(a.f)));
    const res=await sampleFn.json(SCAN_PROMPT+'\n\ntodayRealDate: '+fd(realDay()),{modelTier:'default',cache:false,images:blobs});
    const its=(Array.isArray(res&&res.items)?res.items:[]).filter(i=>i&&isNum(+i.amount)&&+i.amount>0).slice(0,40).map(i=>({d:isDate(i.date)?i.date:fd(realDay()),amt:Math.round(+i.amount*100)/100,dir:i.direction==='in'?'in':'out',name:String(i.name||'Purchase').slice(0,48),via:WNAME[i.app]?i.app:null,kind:i.app==='receipt'?'receipt':(WNAME[i.app]?'p2p':''),who:WNAME[i.app]?String(i.name||''):'',memo:String(i.memo||'').slice(0,40),status:i.status,type:i.type}));
    scLoadItems(its,res&&res.note)}catch(e){SC.step='review';SC.items=[];SC.note='That didn’t go through. Try again in a moment.';scRender()}}
const SCAN_PROMPT=`Read every money movement visible in these screenshots (receipts, Cash App, Venmo, Zelle, PayPal, Apple Cash, bank or card apps). Reply with ONLY JSON: {"items":[{"date":"YYYY-MM-DD","amount":N,"direction":"out"|"in","name":"merchant or person exactly as shown","app":"cashapp"|"venmo"|"paypal"|"zelle"|"applecash"|"bank"|"card"|"receipt"|"other","memo":"the note on a payment, if any","status":"completed"|"pending"|"declined","type":"purchase"|"p2p"|"transfer"|"refund"|"income"}],"note":"one short sentence only if something could not be read"}.
Rules: amount is a positive number. For a receipt use the final total paid; if a tip line is blank, use the total before tip. Use the year from todayRealDate when the screenshot omits it. type "transfer" means moving money between the person's own accounts (adding cash, cashing out, transfer to bank). Never invent a transaction you cannot see.`;
function scExample(k){const T=fd(realDay()),Y=fd(realDay()-MS);let its;
  if(k==='cash'){SC.imgs=[{url:EXIMG.cash}];its=[{d:T,amt:25,dir:'out',name:'Alex R.',via:'cashapp',kind:'p2p',who:'Alex R.',memo:'Concert tickets',type:'p2p'}]}
  else if(k==='receipt'){SC.imgs=[{url:EXIMG.receipt}];its=[{d:Y,amt:31.4,dir:'out',name:'Taco Mama',kind:'receipt',memo:'Before tip',type:'purchase'}]}
  else{SC.imgs=[{url:EXIMG.card}];const recent=(state.spend||[]).filter(s=>s.cat!=='Income'&&s.cat!=='Bill'&&!s.linked&&pd(s.d)>=realDay()-5*MS).slice(-2);
    its=recent.map(s=>({d:s.d,amt:+s.amt,dir:'out',name:bankish(s.note||catName(s.cat)),kind:'',type:'purchase'})).concat([{d:T,amt:38.2,dir:'out',name:'Shell Oil 5742',kind:'',type:'purchase'},{d:T,amt:100,dir:'out',name:'Cash App add cash',type:'transfer'}])}
  SC.step='read';scRender();setTimeout(()=>scLoadItems(its),RM?50:1100)}
const bankish=n=>String(n).toUpperCase().replace(/[^A-Z0-9 ]/g,'').slice(0,14)+' #'+(1000+((n.length*577)%8999));
function scCommit(){let a=0,l=0;const before=clone(state);
  SC.items.forEach(it=>{if(it.skip||it.off)return;
    if(it.st==='new'){const r=logOrLink({d:it.d,amt:it.amt,cat:it.cat,note:it.name+(it.memo&&it.kind==='p2p'?' · '+it.memo:''),at:Date.now()},{src:'shot',via:it.via,who:it.who,kind:it.kind,cat:it.cat});if(r.st==='new')a++;else l++}
    else if(it.st==='link'){const s=it.with;s.linked=1;s.shot=1;s.bank=s.bank||{m:s.note,a:+s.amt};if(it.kind==='p2p'||it.kind==='receipt')s.note=(it.name+(it.memo&&it.kind==='p2p'?' · '+it.memo:'')).slice(0,60);if(it.via)s.via=it.via;if(it.who)s.who=it.who;if(it.kind)s.kind2=it.kind;l++}});
  plan();queueSave();closeSheets();if(typeof txOpen!=='undefined'&&txOpen&&typeof renderTx==='function')renderTx();
  toastAct((a?'Added '+a:'Nothing new to add')+(l?' · '+l+' matched to your bank':''),'Undo',()=>{state=before;plan();queueSave();if(txOpen)renderTx();toast('Undone')})}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-scan],[data-scex],[data-sccat],[data-scoff],[data-scgo],[data-scagain]');if(!t)return;
  if(t.hasAttribute('data-scan')){e.preventDefault();scanOpen()}
  else if(t.dataset.scex)scExample(t.dataset.scex);
  else if(t.dataset.sccat){const[k,c]=t.dataset.sccat.split(':');SC.items[+k].cat=c;scRender()}
  else if(t.dataset.scoff!==undefined){const it=SC.items[+t.dataset.scoff];it.off=!it.off;scRender()}
  else if(t.hasAttribute('data-scgo'))scCommit();
  else if(t.hasAttribute('data-scagain')){SC={step:'pick',imgs:[],items:[],note:''};scRender()}});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='sc-file'){scRead([...e.target.files].filter(f=>/^image\//.test(f.type)));e.target.value=''}});
document.addEventListener('paste',e=>{const s=document.getElementById('sh-scan');if(!s||s.hidden)return;const fs=[...(e.clipboardData&&e.clipboardData.files||[])].filter(f=>/^image\//.test(f.type));if(fs.length){e.preventDefault();scRead(fs)}});
// split a match that was wrong (one tap, from the transaction editor)
function txSplit(i){const s=state.spend[i];if(!s||!s.linked)return;const before=clone(state);
  const b={d:s.d,amt:s.bank&&s.bank.a||+s.amt,cat:s.cat,note:tidy(s.bank&&s.bank.m||'Bank transaction'),at:Date.now(),tid:s.tid,acct:s.acct,src:'import',nolink:1};
  delete s.tid;delete s.acct;delete s.linked;delete s.bank;s.nolink=1;state.spend.push(b);txEdit=null;plan();queueSave();renderTx();
  toastAct('Kept as two separate transactions','Undo',()=>{state=before;plan();queueSave();renderTx()})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-txsplit]');if(b){e.preventDefault();e.stopPropagation();txSplit(+b.dataset.txsplit)}},true);
// demo: when the example bank syncs, the bank's copy of a screenshot payment shows up under a different name
function demoBankCopies(D){const out=[];(state.spend||[]).forEach(s=>{if(s.src!=='shot'||s.tid||s.nolink||s.bankSeeded||pd(s.d)<D-4*MS)return;s.bankSeeded=1;
  const who=String(s.who||s.note||'').split(' · ')[0].toUpperCase().replace(/[^A-Z ]/g,'').trim();
  const m=s.via==='cashapp'?'CASH APP*'+who:s.via==='venmo'?'VENMO *'+who:s.via==='zelle'?'ZELLE TO '+who:s.via==='paypal'?'PAYPAL *'+who.replace(/ /g,''):String(s.note||'').split(' · ')[0].toUpperCase()+' ATL GA';
  out.push({d:s.d,a:-(s.kind2==='receipt'?Math.round(+s.amt*118)/100:+s.amt),m,p:false})});return out}
// example screenshot thumbnails (drawn, labelled as examples)
const svgU=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
const EXIMG={
 cash:svgU('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" rx="22" fill="#f5f7f6"/><text x="150" y="58" font-family="Arial" font-size="16" fill="#6b7b72" text-anchor="middle">Example payment screenshot</text><circle cx="150" cy="130" r="38" fill="#2fae5a"/><text x="150" y="142" font-family="Arial" font-size="32" font-weight="700" fill="#fff" text-anchor="middle">A</text><text x="150" y="205" font-family="Arial" font-size="20" fill="#1c2b23" text-anchor="middle">To Alex R.</text><text x="150" y="262" font-family="Arial" font-size="48" font-weight="700" fill="#1c2b23" text-anchor="middle">$25</text><text x="150" y="300" font-family="Arial" font-size="16" fill="#6b7b72" text-anchor="middle">Concert tickets</text><text x="150" y="350" font-family="Arial" font-size="15" fill="#6b7b72" text-anchor="middle">Completed · Today</text></svg>'),
 receipt:svgU('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" rx="10" fill="#fff"/><text x="150" y="50" font-family="Courier New" font-size="22" font-weight="700" fill="#222" text-anchor="middle">TACO MAMA</text><text x="150" y="74" font-family="Courier New" font-size="13" fill="#555" text-anchor="middle">Example receipt</text><g font-family="Courier New" font-size="15" fill="#222"><text x="30" y="125">2 Tacos</text><text x="270" y="125" text-anchor="end">12.50</text><text x="30" y="150">Burrito</text><text x="270" y="150" text-anchor="end">11.90</text><text x="30" y="175">Drinks</text><text x="270" y="175" text-anchor="end">4.50</text><text x="30" y="210">Tax</text><text x="270" y="210" text-anchor="end">2.50</text><text x="30" y="250" font-weight="700">TOTAL</text><text x="270" y="250" text-anchor="end" font-weight="700">31.40</text><text x="30" y="290">Tip</text><text x="270" y="290" text-anchor="end">______</text></g></svg>'),
 card:svgU('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" rx="22" fill="#fff"/><text x="24" y="50" font-family="Arial" font-size="20" font-weight="700" fill="#1c2b23">Recent activity</text><text x="24" y="72" font-family="Arial" font-size="13" fill="#6b7b72">Example card app screenshot</text><g font-family="Arial" font-size="15" fill="#1c2b23"><line x1="24" x2="276" y1="98" y2="98" stroke="#e5ebe7"/><text x="24" y="130">Purchase</text><text x="276" y="130" text-anchor="end">−$xx.xx</text><line x1="24" x2="276" y1="152" y2="152" stroke="#e5ebe7"/><text x="24" y="184">Purchase</text><text x="276" y="184" text-anchor="end">−$xx.xx</text><line x1="24" x2="276" y1="206" y2="206" stroke="#e5ebe7"/><text x="24" y="238">SHELL OIL 5742</text><text x="276" y="238" text-anchor="end">−$38.20</text><line x1="24" x2="276" y1="260" y2="260" stroke="#e5ebe7"/><text x="24" y="292">CASH APP ADD CASH</text><text x="276" y="292" text-anchor="end">−$100.00</text></g></svg>')};

if(location.protocol==='file:')window.__sp={sameScore,walletOf,RX_WFUND,categorize:(m,a)=>categorize({d:fd(realDay()),a,m},'checking',new Set())};
