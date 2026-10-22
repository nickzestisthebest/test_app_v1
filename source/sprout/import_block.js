// ---------- import & history: shared transaction format ----------
// Every imported row becomes a normal spend entry {d,amt,cat,note,at,tid,acct,pending,src,card?,payKey?}
// and a compact history row {k,d,a,m,ac,c,p} (a<0 = money out). A real bank feed can later plug into importCommit().
let HIST=[],histDirty=false;
const HKEY='sprout-hist-v1',HCAP=6000;
const histDoc=()=>'data/users/'+uid+'/history';
async function histLoad(){let h=null;
  if(mode==='cloud'&&db&&uid){try{const s=await db.doc(histDoc()).get();if(s.exists&&Array.isArray(s.data().rows))h=s.data().rows}catch(e){}}
  if(!h){try{h=JSON.parse(localStorage.getItem(HKEY)||'null')}catch(e){}}
  HIST=Array.isArray(h)?h:[]}
function histSave(){try{localStorage.setItem(HKEY,JSON.stringify(HIST.slice(-HCAP)))}catch(e){}
  if(mode==='cloud'&&db&&uid){db.doc(histDoc()).set({rows:HIST.slice(-HCAP)}).catch(()=>{})}}
function hxForget(tid){const r=HIST.find(x=>x.k===tid);if(r){r.c='Skip';histSave()}}
const normM=s=>String(s||'').toLowerCase().replace(/[0-9#*\/\\_.,:;-]+/g,' ').replace(/\b(purchase|debit|card|pos|pending|authorized|on|digital|recurring|web|online|ref|payment|mobile|transfer)\b/g,' ').replace(/\s+/g,' ').trim();
const mkey=s=>normM(s).split(' ').slice(0,3).join(' ');
const cents=a=>Math.round(Math.abs(a)*100);
const baseKey=(d,a,m,ac)=>d+'|'+cents(a)+'|'+normM(m).replace(/ /g,'').slice(0,14)+'|'+String(ac||'').toLowerCase().replace(/ /g,'').slice(0,10);

// ---------- parsing ----------
function parseDate(s,yr){s=String(s||'').trim();let m;const ok=(y,mo,d)=>{y=+y;mo=+mo;d=+d;if(y<100)y+=2000;if(mo<1||mo>12||d<1||d>31)return null;return y+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0')};
  if((m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)))return ok(m[1],m[2],m[3]);
  if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)))return ok(m[3],m[1],m[2]);
  if((m=s.match(/^(\d{1,2})\/(\d{1,2})$/)))return ok(yr,m[1],m[2]);
  if((m=s.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/))){const mi=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(m[1].slice(0,3).toLowerCase());if(mi>=0)return ok(m[3]||yr,mi+1,m[2])}
  return null}
const isNumStr=c=>/^[\s$(+-]*\d[\d,]*(\.\d+)?\)?-?\s*$/.test(String(c||''));
function parseAmt2(v){if(v==null)return NaN;let t=String(v).trim();if(!t)return NaN;let neg=/^\(.*\)$/.test(t)||/^-/.test(t)||/-$/.test(t)||/\bCR\b/i.test(t)&&false;t=t.replace(/[^0-9.,]/g,'');if(t.indexOf('.')<0&&/,\d{1,2}$/.test(t))t=t.replace(/,(\d{1,2})$/,'.$1');const x=parseFloat(t.replace(/,/g,''));return isNaN(x)?NaN:(neg?-x:x)}
function csvSplit(text){text=String(text||'').replace(/^﻿/,'');const first=text.split(/\r?\n/).find(l=>l.trim())||'';const cnt=c=>(first.match(new RegExp(c==='\t'?'\\t':'\\'+c,'g'))||[]).length;const dl=[',','\t',';'].sort((a,b)=>cnt(b)-cnt(a))[0];
  const rows=[];let r=[],f='',q=false;for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"')q=true;else if(c===dl){r.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;r.push(f);f='';if(r.some(x=>x.trim()))rows.push(r);r=[]}else f+=c}
  r.push(f);if(r.some(x=>x.trim()))rows.push(r);return rows}
// returns rows [{d,a,m,p}] with a<0 = money out, or [] if it does not look like a CSV of transactions
function parseCSV(text,yr){const R=csvSplit(text);if(R.length<2)return[];
  let hi=R.findIndex(r=>r.length>=2&&r.some(c=>/date/i.test(c))&&r.some(c=>/amount|debit|credit|desc|merchant|payee|memo|details|name/i.test(c)));
  let col={},body;
  if(hi>=0){const H=R[hi].map(c=>c.trim().toLowerCase());body=R.slice(hi+1);
    const find=(re,ex)=>H.findIndex((c,i)=>re.test(c)&&!(ex&&ex.test(c)));
    col.d=find(/post/)>=0&&/date/.test(H[find(/post/)])?find(/post/):find(/^(transaction )?date|date/);if(col.d<0)col.d=find(/date/);
    col.m=find(/^desc|description|merchant|payee|name|details/);if(col.m<0)col.m=find(/memo/);
    col.debit=find(/debit|withdraw|money out|paid out/);col.credit=find(/credit|deposit|money in|paid in/);col.amt=find(/^amount|amount/,/running|balance/);col.type=find(/^type|transaction type|dr\/cr/);col.st=find(/status|pending/)}
  else{body=R;const s=R[0];col.d=s.findIndex(c=>parseDate(c,yr));col.amt=s.findIndex((c,i)=>i!==col.d&&isNumStr(c));let best=-1,bl=0;s.forEach((c,i)=>{if(i!==col.d&&i!==col.amt&&c.trim().length>bl&&!isNumStr(c)){bl=c.trim().length;best=i}});col.m=best;col.debit=col.credit=col.type=col.st=-1}
  if(col.d<0||col.m<0&&col.amt<0)return[];
  const out=[];body.forEach(r=>{const d=parseDate(r[col.d],yr);if(!d)return;let a=NaN;
    if(col.debit>=0||col.credit>=0){const db_=col.debit>=0?Math.abs(parseAmt2(r[col.debit])||0):0,cr=col.credit>=0?Math.abs(parseAmt2(r[col.credit])||0):0;a=cr-db_}
    else{a=parseAmt2(r[col.amt]);if(!isNaN(a)&&col.type>=0){const t=String(r[col.type]||'');if(/debit|sale|purchase|withdraw|payment to|charge/i.test(t))a=-Math.abs(a);else if(/credit|deposit|return|refund|payment|received/i.test(t))a=Math.abs(a)}}
    if(isNaN(a)||a===0)return;
    out.push({d,a,m:String(col.m>=0?r[col.m]:'').replace(/\s+/g,' ').trim(),p:col.st>=0&&/pend/i.test(r[col.st]||'')})});
  return out}
// when a single amount column has no debit/credit info, decide whether purchases are shown as positive numbers
function guessFlip(rows,kind){if(!rows.length)return false;const neg=rows.filter(r=>r.a<0).length,pos=rows.length-neg;if(neg>=pos*.3)return false;return true}

// ---------- PDF + AI extraction ----------
let pdfReady=null;
function loadPdfJs(){if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);if(pdfReady)return pdfReady;
  pdfReady=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=()=>{try{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';res(window.pdfjsLib)}catch(e){rej(e)}};s.onerror=()=>{pdfReady=null;rej(new Error('pdf'))};document.head.appendChild(s)});return pdfReady}
async function pdfText(file){const lib=await loadPdfJs(),buf=await file.arrayBuffer(),doc=await lib.getDocument({data:buf}).promise;let out='';
  for(let p=1;p<=doc.numPages;p++){const pg=await doc.getPage(p),tc=await pg.getTextContent(),lines={};
    tc.items.forEach(it=>{if(!it.str||!it.str.trim())return;const y=Math.round(it.transform[5]/3);(lines[y]=lines[y]||[]).push([it.transform[4],it.str])});
    Object.keys(lines).map(Number).sort((a,b)=>b-a).forEach(y=>{out+=lines[y].sort((a,b)=>a[0]-b[0]).map(x=>x[1]).join('  ')+'\n'});out+='\n'}
  return out}
const IM_PROMPT=`Extract every transaction from this bank or credit card statement text. Reply with ONLY JSON: {"rows":[{"date":"YYYY-MM-DD","desc":"merchant or description as printed","amount":N,"pending":false}]}.
Rules: amount is NEGATIVE when money leaves the account or a charge is made, and POSITIVE for deposits, refunds, credits and payments received. Use the statement's dates; if a date has no year use YEAR. Skip balances, totals, summaries, headers, footers, rate tables and marketing text. Include pending items with "pending":true. One row per transaction. Never invent or merge rows.`;
async function aiRows(text,yr,onProg){if(!sampleFn)throw new Error('noai');const lines=text.split(/\r?\n/).filter(l=>l.trim()),chunks=[];let cur='';lines.forEach(l=>{if((cur+l).length>9000){chunks.push(cur);cur=''}cur+=l+'\n'});if(cur)chunks.push(cur);
  const out=[];for(let i=0;i<chunks.length;i++){onProg&&onProg(i+1,chunks.length);const r=await sampleFn.json(IM_PROMPT.replace('YEAR',yr)+'\n\nSTATEMENT TEXT:\n'+chunks[i],{modelTier:'default',cache:false});
    (r&&Array.isArray(r.rows)?r.rows:[]).forEach(x=>{const d=parseDate(x.date,yr),a=+x.amount;if(d&&isFinite(a)&&a!==0)out.push({d,a,m:String(x.desc||'').replace(/\s+/g,' ').trim(),p:!!x.pending})})}
  return out}

// ---------- categorize + match ----------
const RX_EVERY=/kroger|publix|walmart|wal-mart|target|costco|sam'?s club|aldi|trader joe|whole foods|safeway|grocer|supermarket|\bmarket\b|\bgas\b|fuel|shell|chevron|exxon|\bbp\b|\bqt\b|quiktrip|racetrac|wawa|sheetz|murphy|speedway|cvs|walgreens|pharmacy|petco|petsmart|chewy|\bvet\b|veterinar|animal|dollar|7-eleven|circle k/i;
const RX_FUN=/restaurant|cafe|coffee|starbucks|dunkin|mcdonald|chick-?fil|taco|pizza|doordash|uber eats|grubhub|\bbar\b|\bpub\b|brew|netflix|spotify|hulu|disney|steam|playstation|xbox|amazon|apple\.com|app store|movie|amc|cinema|ticket|casino|gambl|draftkings|fanduel|nike|shein|zara|sephora|lounge|bet365/i;
const RX_XFER=/transfer|zelle|apple cash|venmo|cash ?app|paypal|xfer|qc clearing/i;
const RX_FEE=/overdraft|\bnsf\b|insufficient|\bfee\b|interest charge|late charge|service charge/i;
const GENERIC=/^(plan|weekly|pay|payment|the|and|monthly|every|days|purchase|one|time|other|expense|reserve)$/;
function toks(s){return normM(s).split(' ').filter(t=>t.length>=3&&!GENERIC.test(t))}
function matchPlan(r,used){if(r.a>=0)return null;const amt=-r.a,t=pd(r.d),xf=RX_XFER.test(r.m);let best=null,bs=0;
  (rows&&rows.items||[]).forEach(x=>{if(!(x.a>0.004)||used.has(payKey(x)))return;const dt=Math.abs(x.t-t)/MS;if(dt>5)return;
    const isDebt=x.g==='Debt min'||x.g==='Skip min',diff=Math.abs(x.a-amt);let sc=0;
    if(diff<=0.01)sc+=3;else if(diff/x.a<=0.03)sc+=2;else if(isDebt&&amt>=x.a*.9&&amt<=x.a*6)sc+=1.5;else return;
    const xt=toks(x.name),mt=normM(r.m);if(xt.some(k=>mt.indexOf(k)>=0))sc+=2;else if(xf&&diff<=0.01)sc+=2;
    sc+=dt===0?1:dt<=2?.5:0;if(sc>bs){bs=sc;best=x}});
  return bs>=4.5?best:null}
function categorize(r,acctKind,used){const m=r.m||'',rl=(state.rules||{})[mkey(m)];
  if(r.a>0){
    if(acctKind==='card')return{cat:/refund|return|credit|reversal/i.test(m)?'Income':'Skip',kindName:'Refund'};
    const pays=payDates(state,pd(r.d)-8*MS).concat(payDates(state,pd(r.d)-30*MS)),near=pays.filter(t=>Math.abs(t-pd(r.d))<=4*MS).length>0;
    if(+state.pay>0&&r.a>=+state.pay*.8&&r.a<=+state.pay*1.3&&(near||!RX_XFER.test(m)))return{cat:'Income',kindName:'Paycheck'};
    if(rl)return{cat:rl,kindName:'Other'};
    if(/refund|reversal|return/i.test(m))return{cat:'Income',kindName:'Refund'};
    if(/online transfer|transfer (to|from)|\bxfer\b|apple cash balance|qc clearing/i.test(m)||Object.keys(state.accts||{}).some(a=>toks(a).filter(k=>k.length>3).some(k=>normM(m).indexOf(k)>=0)))return{cat:'Skip'};if(RX_XFER.test(m))return{cat:'Income',kindName:'Other',guess:true};
    return{cat:'Income',kindName:'Other'}}
  const x=matchPlan(r,used);if(x){used.add(payKey(x));return{cat:'Bill',note:x.name,payKey:payKey(x),matched:true}}
  if(rl)return{cat:rl};
  if(RX_FEE.test(m))return{cat:'Bill'};
  if(/payment|pmt|autopay|thank you|loan/i.test(m)&&(state.debts||[]).some(d=>toks(d.name).some(k=>normM(m).indexOf(k)>=0)))return{cat:'Skip'};
  if(RX_XFER.test(m)){const own=/online transfer|transfer (to|from)|\bxfer\b|apple cash balance|qc clearing/i.test(m)||Object.keys(state.accts||{}).some(a=>toks(a).filter(k=>k.length>3).some(k=>normM(m).indexOf(k)>=0));return own?{cat:'Skip'}:{cat:'Bill',guess:true}}
  if(RX_EVERY.test(m))return{cat:'Everyday'};
  if(RX_FUN.test(m))return{cat:'Personal'};
  return{cat:'Personal',guess:true}}

// build review rows against existing history/spend (dedupe + pending replacement)
function buildReview(raw,acct,kind,flip){const have=new Set(HIST.map(h=>h.k)),seen={},used=new Set(),out=[];
  raw.slice().sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0).forEach(r0=>{const r={d:r0.d,a:flip?-r0.a:r0.a,m:r0.m,p:!!r0.p};
    const bk=baseKey(r.d,r.a,r.m,acct);seen[bk]=(seen[bk]||0)+1;const k=bk+'|'+seen[bk];
    const row={k,d:r.d,a:r.a,m:r.m,p:r.p,acct,kind,inc:true};
    if(have.has(k)){row.dup='Already imported';row.inc=false}
    else{
      const man=(state.spend||[]).find(s=>!s.tid&&Math.abs(+s.amt-Math.abs(r.a))<=0.01&&Math.abs(pd(s.d)-pd(r.d))<=2*MS&&((r.a<0&&s.cat!=='Income')||(r.a>0&&s.cat==='Income')));
      if(man){row.dup='Matches something you logged by hand';row.inc=false;row.attach=man}}
    if(!row.dup){const c=categorize(r,kind,used);Object.assign(row,c);row.cat0=row.cat;
      if(!r.p){const pend=(state.spend||[]).find(s=>s.pending&&s.tid&&(Math.abs(+s.amt-Math.abs(r.a))<=0.01||(Math.abs(+s.amt-Math.abs(r.a))/Math.abs(r.a)<=.25&&mkey(s.note)===mkey(r.m)&&mkey(r.m)))&&Math.abs(pd(s.d)-pd(r.d))<=7*MS&&(s.acct||'')===acct);
        if(pend){row.replaces=pend.tid}}}
    out.push(row)});return out}

// ---------- commit ----------
function importCommit(list){const added=[];let paid=0,repl=0,att=0;
  list.forEach(r=>{if(r.dup){if(r.attach&&!r.attach.tid){r.attach.tid=r.k;r.attach.acct=r.acct;att++;HIST.push({k:r.k,d:r.d,a:r.a,m:r.m,ac:r.acct,c:r.attach.cat==='Income'?'Income':r.attach.cat,p:0})}return}
    if(!r.inc&&r.cat!=='Skip'){HIST.push({k:r.k,d:r.d,a:r.a,m:r.m,ac:r.acct,c:'Skip',p:r.p?1:0});return}
    if(r.replaces){const i=state.spend.findIndex(s=>s.tid===r.replaces);if(i>=0){const o=state.spend[i];if(o.payKey&&!r.payKey&&state.paid)delete state.paid[o.payKey];state.spend.splice(i,1);const h=HIST.findIndex(x=>x.k===r.replaces);if(h>=0)HIST.splice(h,1);repl++}}
    HIST.push({k:r.k,d:r.d,a:r.a,m:r.m,ac:r.acct,c:r.cat,p:r.p?1:0});
    if(r.cat==='Skip')return;
    const e={d:r.d,amt:Math.round(Math.abs(r.a)*100)/100,cat:r.cat,note:(r.note||r.m||'').slice(0,60),at:pd(r.d),tid:r.k,acct:r.acct,src:'import'};
    if(r.p)e.pending=true;if(r.kind==='card')e.card=true;
    if(r.cat==='Income'){e.kind=r.kindName||'Other';if(r.kindName==='Paycheck'&&r.kind!=='card'){const pdts=payDates(state,pd(r.d)-20*MS),t0=pd(r.d),near=pdts.filter(t=>Math.abs(t-t0)<=4*MS).sort((a,b)=>Math.abs(a-t0)-Math.abs(b-t0))[0];if(near&&!(state.gotPay||{})[fd(near)]){state.gotPay=Object.assign({},state.gotPay||{},{[fd(near)]:true});e.payDay=fd(near)}}}
    if(r.payKey&&r.cat==='Bill'){e.payKey=r.payKey;state.paid=Object.assign({},state.paid||{},{[r.payKey]:true});paid++}
    state.spend.push(e);added.push(e);
    if(r.cat!==r.cat0&&r.cat0!==undefined&&!r.matched){state.rules=Object.assign({},state.rules||{},{[mkey(r.m)]:r.cat})}});
  if(HIST.length>HCAP)HIST=HIST.slice(-HCAP);
  // drop pending items that never posted
  const old=realDay()-12*MS;state.spend=state.spend.filter(s=>!(s.pending&&s.tid&&pd(s.d)<old));
  state.accts=Object.assign({},state.accts||{},{[list[0]?list[0].acct:'Account']:list[0]?list[0].kind:'checking'});
  plan();queueSave();histSave();return{added:added.length,paid,repl,att}}

// ---------- import UI ----------
let IM={step:'pick',acct:'',kind:'checking',raw:[],flip:false,rows:[],msg:'',busy:false,src:''};
const CATS=[['Everyday','Basics'],['Personal','Fun'],['Bill','Bill / payment'],['Income','Money in'],['Skip','Skip (not counted)']];
function imOpen(){IM=Object.assign(IM,{step:'pick',raw:[],rows:[],msg:'',busy:false});const a=Object.keys(state.accts||{});if(!IM.acct&&a.length){IM.acct=a[a.length-1];IM.kind=state.accts[IM.acct]}imRender();openSheet('sh-import')}
function imYear(){return +String(state.asOf||todayStr).slice(0,4)}
function imRender(){const B=$('#im-body');if(!B||B===DUMMY)return;let x='';
  if(IM.step==='pick'){
    const accts=Object.keys(state.accts||{});
    x='<p class="note" style="margin:0">Bring in a bank or card statement and Sprout will sort it, match it to your bills and keep a history it can learn from. Nothing is added until you review it.</p>'+
    '<label class="f">Which account is this?<input id="im-acct" list="im-acctl" type="text" placeholder="e.g. Capital One checking" value="'+esc(IM.acct)+'"><datalist id="im-acctl">'+accts.map(a=>'<option value="'+esc(a)+'">').join('')+'</datalist></label>'+
    '<div class="f"><span>What kind of account?</span><div class="wchips">'+[['checking','Checking or savings'],['card','Credit card']].map(o=>'<button type="button" class="wchip'+(IM.kind===o[0]?' on':'')+'" data-im="kind" data-v="'+o[0]+'">'+o[1]+'</button>').join('')+'</div></div>'+
    '<div class="row"><label class="btn" for="im-file" style="cursor:pointer;flex:1 1 auto;text-align:center">Choose a file (CSV or PDF)</label><input id="im-file" type="file" accept=".csv,.txt,.pdf,text/csv,application/pdf,text/plain" class="hide"></div>'+
    '<label class="f">Or paste your transactions<textarea id="im-paste" rows="5" placeholder="Paste rows from your bank website or a statement">'+'</textarea></label>'+
    '<div class="row"><button type="button" class="btn alt" data-im="paste">Read pasted text</button></div>'+
    '<p class="note" style="margin:0">CSV files are read on your device. PDFs and pasted text are sent to Claude to read the rows. Don’t include account numbers. Pending items are supported.</p>'+
    (IM.msg?'<p class="note" id="im-msg" style="margin:0;color:'+(IM.busy?'var(--muted)':'var(--bad)')+'">'+esc(IM.msg)+'</p>':'');
  }else if(IM.step==='review'){
    const R=IM.rows,n=R.filter(r=>r.inc&&!r.dup).length,dup=R.filter(r=>r.dup).length,mt=R.filter(r=>r.matched).length,pe=R.filter(r=>r.p).length,rp=R.filter(r=>r.replaces).length,gs=R.filter(r=>r.guess).length;
    const dts=R.map(r=>r.d).sort();
    x='<div class="three"><div><b>'+n+'</b><span>new to add</span></div><div><b>'+mt+'</b><span>matched to bills</span></div><div><b>'+dup+'</b><span>already have</span></div></div>'+
      '<p class="note" style="margin:0">'+esc(IM.acct||'Account')+' · '+(dts.length?sdate(pd(dts[0]))+' to '+sdate(pd(dts[dts.length-1])):'')+(pe?' · '+pe+' pending':'')+(rp?' · '+rp+' pending now posted':'')+(gs?' · '+gs+' to double-check':'')+'</p>'+
      '<div class="row" style="align-items:center"><button type="button" class="btn alt sm" data-im="flip">Swap money in / out</button><span class="note" style="margin:0">Use this if charges look like deposits.</span></div>'+
      '<div class="imlist">'+R.map((r,i)=>'<div class="imrow'+(r.dup?' dup':'')+'"><label class="imchk"><input type="checkbox" data-imi="'+i+'" data-imf="inc"'+(r.inc?' checked':'')+(r.dup&&!r.attach?' disabled':'')+' aria-label="Include"></label><div class="imm"><b>'+esc(r.m||'(no description)')+'</b><small>'+sdate(pd(r.d))+(r.p?' · Pending':'')+(r.matched?' · matches '+esc(r.note):'')+(r.replaces?' · replaces its pending copy':'')+(r.dup?' · '+r.dup:'')+(r.guess?' · not sure, check this':'')+'</small></div><div class="ima '+(r.a>0?'pos':'')+'">'+(r.a>0?'+':'−')+money(Math.abs(r.a))+'</div>'+
        (r.dup?'':'<select data-imi="'+i+'" data-imf="cat" aria-label="Category">'+CATS.map(c=>'<option value="'+c[0]+'"'+(r.cat===c[0]?' selected':'')+'>'+c[1]+'</option>').join('')+'</select>')+'</div>').join('')+'</div>'+
      '<div class="row"><button type="button" class="btn" data-im="apply">Add '+n+' transaction'+(n===1?'':'s')+'</button><button type="button" class="btn alt" data-im="back">Back</button></div>'+
      '<p class="note" style="margin:0">Changing a category teaches Sprout. Next time that merchant will land in the same place.</p>';
  }else{
    const s=IM.result||{};
    x='<div class="done-hero"><div class="big">'+s.added+'</div><span>transaction'+(s.added===1?'':'s')+' added</span></div><ul class="plain">'+(s.paid?'<li><b>'+s.paid+'</b> bill'+(s.paid===1?'':'s')+' marked paid in your plan.</li>':'')+(s.repl?'<li><b>'+s.repl+'</b> pending item'+(s.repl===1?'':'s')+' replaced by the final charge.</li>':'')+(s.att?'<li><b>'+s.att+'</b> of your hand-logged items matched and linked.</li>':'')+'<li>Your history now holds <b>'+HIST.length+'</b> transactions. See Spending insights in the menu.</li><li>Update your checking balance so Sprout starts from the bank’s number.</li></ul>'+
      '<div class="row"><button type="button" class="btn" data-im="checkin">Update checking</button><button type="button" class="btn alt" data-im="again">Import another</button></div>'}
  B.innerHTML=x}
async function imIngest(text,fileName,isPdf,file){const yr=imYear();IM.acct=($('#im-acct').value||IM.acct||'').trim()||IM.acct||'My account';IM.busy=true;IM.msg='Reading…';imRender();
  try{let raw=[],viaAI=false;
    if(isPdf){let t;try{t=await pdfText(file)}catch(e){throw new Error('I couldn’t open that PDF here. Try downloading a CSV from your bank, or copy the transactions and paste them below.')}text=t}
    if(!isPdf){raw=parseCSV(text,yr)}
    if(!raw.length){if(!sampleFn)throw new Error('I couldn’t read rows from that. Try a CSV from your bank, or turn on Claude in this view.');
      viaAI=true;raw=await aiRows(text,yr,(i,n)=>{IM.msg='Reading part '+i+' of '+n+'…';const m=document.getElementById('im-msg');if(m)m.textContent=IM.msg})}
    if(!raw.length)throw new Error('I didn’t find any transactions in that. Check the file or paste the transaction rows.');
    IM.raw=raw;IM.flip=viaAI?false:guessFlip(raw,IM.kind);
    IM.busy=false;IM.msg='';IM.rows=buildReview(IM.raw,IM.acct,IM.kind,IM.flip);IM.step='review';imRender()}
  catch(e){IM.busy=false;IM.msg=e.message==='noai'?'Claude isn’t available in this view.':(e&&e.code==='not_granted'?'I need your OK to use Claude to read this. Try again and allow it.':e.message||'That didn’t work.');imRender()}}
document.addEventListener('change',async e=>{const t=e.target;if(!t)return;
  if(t.id==='im-file'&&t.files&&t.files[0]){const f=t.files[0],pdf=/\.pdf$/i.test(f.name)||f.type==='application/pdf';t.value='';let txt='';if(!pdf)txt=await f.text();imIngest(txt,f.name,pdf,f)}
  if(t.dataset&&t.dataset.imi!==undefined){const r=IM.rows[+t.dataset.imi];if(!r)return;if(t.dataset.imf==='inc')r.inc=t.checked;else if(t.dataset.imf==='cat'){r.cat=t.value;if(t.value==='Income'&&!r.kindName)r.kindName='Other';r.matched=r.matched&&t.value==='Bill';if(!r.matched){delete r.payKey}imRender()}}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-im]');if(!b)return;const a=b.dataset.im;
  if(a==='kind'){IM.kind=b.dataset.v;const ac=$('#im-acct');if(ac&&ac.value)IM.acct=ac.value;imRender()}
  else if(a==='paste'){const v=$('#im-paste').value;if(!v.trim()){IM.msg='Paste some transactions first.';imRender();return}imIngest(v,'pasted',false)}
  else if(a==='flip'){IM.flip=!IM.flip;IM.rows=buildReview(IM.raw,IM.acct,IM.kind,IM.flip);imRender()}
  else if(a==='back'){IM.step='pick';imRender()}
  else if(a==='apply'){IM.rows.forEach(r=>{if(r.cat==='Income'&&!r.kindName)r.kindName='Other'});IM.result=importCommit(IM.rows);IM.step='done';imRender();toast('Imported '+IM.result.added+' transactions')}
  else if(a==='checkin'){closeSheets();setTimeout(openCheckin,300)}
  else if(a==='again'){IM.step='pick';IM.msg='';imRender()}});
document.addEventListener('input',e=>{if(e.target&&e.target.id==='im-acct')IM.acct=e.target.value});

// ---------- spending insights (from full history) ----------
function insightsHTML(){const H=HIST.filter(h=>h.c!=='Skip');if(!H.length)return '<div class="txempty"><b>No history yet</b><p>Import a statement and Sprout will show where your money goes, which charges repeat, and what fees you paid.</p><button type="button" class="btn" data-nav-import>Import a statement</button></div>';
  const out=H.filter(h=>h.a<0&&h.c!=='Income'),ds=H.map(h=>h.d).sort(),span=Math.max(1,Math.round((pd(ds[ds.length-1])-pd(ds[0]))/MS)+1);
  const mon={};H.forEach(h=>{const m=h.d.slice(0,7),o=mon[m]=mon[m]||{in:0,b:0,f:0,bl:0};if(h.a>0&&h.c==='Income')o.in+=h.a;else if(h.a<0){if(h.c==='Everyday')o.b-=h.a;else if(h.c==='Personal')o.f-=h.a;else if(h.c==='Bill')o.bl-=h.a}});
  const mk=Object.keys(mon).sort().slice(-8),mx=Math.max(1,...mk.map(k=>mon[k].b+mon[k].f+mon[k].bl));
  const mnth=mk.map(k=>{const o=mon[k],tot=o.b+o.f+o.bl,lab=new Date(pd(k+'-01')).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',year:'2-digit'});
    return '<div class="ixm"><span class="ixl">'+lab+'</span><div class="ixbar" title="Basics, Fun, Bills"><i style="width:'+(o.b/mx*100).toFixed(1)+'%;background:#2fae5a"></i><i style="width:'+(o.f/mx*100).toFixed(1)+'%;background:#f2b84b"></i><i style="width:'+(o.bl/mx*100).toFixed(1)+'%;background:#9bb8a6"></i></div><b>'+money0(tot)+'</b></div>'}).join('');
  const mer={};out.forEach(h=>{const k=mkey(h.m)||'other',o=mer[k]=mer[k]||{n:0,t:0,name:h.m};o.n++;o.t-=h.a});
  const top=Object.values(mer).sort((a,b)=>b.t-a.t).slice(0,8).map(o=>'<div class="ixr"><span>'+esc(o.name.slice(0,34))+'</span><small>'+o.n+'×</small><b>'+money0(o.t)+'</b></div>').join('');
  // recurring
  const grp={};out.forEach(h=>{const k=mkey(h.m);if(k)(grp[k]=grp[k]||[]).push(h)});const rec=[];
  Object.keys(grp).forEach(k=>{const L=grp[k].sort((a,b)=>a.d<b.d?-1:1);if(L.length<3)return;const gaps=[];for(let i=1;i<L.length;i++)gaps.push(Math.round((pd(L[i].d)-pd(L[i-1].d))/MS));gaps.sort((a,b)=>a-b);const g=gaps[Math.floor(gaps.length/2)];
    const am=L.map(x=>-x.a).sort((a,b)=>a-b),md=am[Math.floor(am.length/2)];if((am[am.length-1]-am[0])/md>.2)return;
    const cad=g>=6&&g<=8?['weekly',52/12]:g>=13&&g<=15?['every 2 weeks',26/12]:g>=27&&g<=33?['monthly',1]:g>=360&&g<=370?['yearly',1/12]:null;if(!cad)return;rec.push({name:L[L.length-1].m,amt:md,cad:cad[0],mo:md*cad[1],last:L[L.length-1].d})});
  rec.sort((a,b)=>b.mo-a.mo);const recTot=rec.reduce((a,r)=>a+r.mo,0);
  const recH=rec.length?rec.slice(0,8).map(r=>'<div class="ixr"><span>'+esc(r.name.slice(0,30))+'</span><small>'+money(r.amt)+' '+r.cad+'</small><b>'+money0(r.mo)+'/mo</b></div>').join('')+'<small class="note">About '+money0(recTot)+' a month goes to charges that repeat. Worth a look for ones you no longer use.</small>':'<p class="note" style="margin:0">Not enough repeating charges found yet. Import a few months for this to work.</p>';
  const fees=H.filter(h=>h.a<0&&RX_FEE.test(h.m)),od=H.filter(h=>/overdraft|\bnsf\b|insufficient/i.test(h.m)&&h.a<0);
  const feeT=fees.reduce((a,h)=>a-h.a,0);
  const feeH=fees.length?'<div class="ixr"><span>Fees and interest-like charges</span><small>'+fees.length+'×</small><b>'+money0(feeT)+'</b></div>'+fees.slice(-5).reverse().map(h=>'<div class="ixr sub"><span>'+esc(h.m.slice(0,34))+'</span><small>'+sdate(pd(h.d))+'</small><b>'+money(-h.a)+'</b></div>').join('')+(od.length?'<small class="note">'+od.length+' overdraft-type charge'+(od.length>1?'s':'')+' found.</small>':''):'<p class="note" style="margin:0">No fees spotted in what you have imported.</p>';
  const spendT=out.reduce((a,h)=>a-h.a,0);
  return '<div class="three"><div><b>'+H.length+'</b><span>transactions</span></div><div><b>'+span+'</b><span>days covered</span></div><div><b>'+money0(spendT/span)+'</b><span>spent per day</span></div></div>'+
   '<section class="ixc"><h4>Spending by month</h4>'+mnth+'<div class="legend2"><span><i style="background:#2fae5a"></i>Basics</span><span><i style="background:#f2b84b"></i>Fun</span><span><i style="background:#9bb8a6"></i>Bills</span></div></section>'+
   '<section class="ixc"><h4>Where it goes</h4>'+top+'</section>'+
   '<section class="ixc"><h4>Charges that repeat</h4>'+recH+'</section>'+
   '<section class="ixc"><h4>Fees</h4>'+feeH+'</section>'}
function insOpen(){$('#ins-body').innerHTML=insightsHTML();openSheet('sh-ins')}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-nav-import]')){closeSheets();setTimeout(imOpen,300)}});
