// ===================== Pay-later plans (Klarna, Affirm, Afterpay and others) are debt =====================
// What's still owed on each plan counts in what you owe and your net worth. Each payment is set aside before it's due,
// and counts toward the budget for what you bought, in the month you pay it. The purchase and its payments never both count.
const PL={};
{
const r2=x=>Math.round((+x||0)*100)/100,DY=MS;
PL.g=()=>{const g=LG.st();g.pl=g.pl||{};g.pl.cat=g.pl.cat||{};g.pl.m=g.pl.m||{};return g.pl};
PL.isPL=x=>!!x&&(x.group==='Affirm'||x.group==='Klarna'||x.group==='Cash App'||RC.BNPL.test(x.name||''));
// "Klarna · Audi South Atlanta (2 of 6)" -> provider, store, installment
PL.parse=name=>{let s=String(name||'').trim(),k=0,of=0;const m=s.match(/\s*\((\d+)\s*of\s*(\d+)\)\s*$/i);if(m){k=+m[1];of=+m[2];s=s.slice(0,m.index).trim()}
  let prov='',store=s;const i=s.indexOf(' · ');if(i>0){prov=RC.prov(s.slice(0,i))||s.slice(0,i).trim();store=s.slice(i+3).trim()}else{prov=RC.prov(s);if(prov)store=s.replace(new RegExp(prov.split(' ')[0],'i'),'').replace(/^[\s·:*-]+/,'').trim()}
  return{prov:prov||'Pay later',store:store||prov||'Purchase',k,of}};
PL.idOf=(prov,store)=>'pl-'+(prov+'-'+store).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48);
// each plan from your scanned or typed-in payment schedule
let PC=null,BC=null;const pkey=()=>realDay()+'|'+JSON.stringify(state.sched||[]).length+'|'+Object.keys(state.paid||{}).length+'|'+JSON.stringify(PL.g().cat)+'|'+BCATS.length;
let PIN=false;PL.plans=fresh=>{if(!fresh&&PC&&PC.k===pkey())return PC.v;if(PIN)return [];PIN=true;let v=[];try{v=PL.plans0()}finally{PIN=false}if(!fresh)PC={k:pkey(),v};return v};
PL.plans0=()=>{const T=realDay(),G={},paid=state.paid||{};
  (state.sched||[]).forEach((x,i)=>{if(!PL.isPL(x)||!isDate(x.d))return;const p=PL.parse(x.name),id=PL.idOf(p.prov,p.store),t=pd(x.d);
    const g=G[id]=G[id]||{id,prov:p.prov,store:p.store,items:[],of:0,src:'plan'};g.items.push({i,t,d:x.d,amt:r2(x.amt),name:x.name,k:p.k,of:p.of,done:!!paid[payKey({t,name:x.name})]||t<T});if(p.of)g.of=Math.max(g.of,p.of)});
  return Object.values(G).map(g=>{g.items.sort((a,b)=>a.t-b.t);const fut=g.items.filter(x=>!x.done);g.left=fut.length;g.owed=r2(fut.reduce((a,x)=>a+x.amt,0));g.next=fut[0]||null;
    g.amt=g.next?g.next.amt:((g.items[g.items.length-1]||{}).amt||0);g.total=Math.max(g.of||0,g.items.length);g.paidN=g.total-g.left;g.cat=PL.catOf(g);g.auto=!PL.g().cat[g.id];return g}).sort((a,b)=>(a.next?a.next.t:9e15)-(b.next?b.next.t:9e15))};
// payments seen at the bank that don't match a scanned plan: grouped by company and amount
PL.bankOnly=()=>{const k=pkey()+'|'+(HIST?HIST.length:0);if(BC&&BC.k===k)return BC.v;const v=PL.bankOnly0();BC={k,v};return v};
PL.bankOnly0=()=>{let L=[];try{L=RC.all().filter(s=>s.kind==='plan')}catch(e){}const P=PL.plans();return L.filter(s=>!P.some(p=>p.prov===s.prov&&p.items.some(x=>Math.abs(x.amt-s.typ)<=0.01))).map(s=>Object.assign({},s,{cat:PL.catOf({id:s.id,store:''})}))};
PL.owed=()=>r2(PL.plans().reduce((a,p)=>a+p.owed,0));
// the budget a plan counts toward: your choice, or what the store usually is
PL.catOf=g=>{const c=PL.g().cat[g.id];if(c&&(c==='none'||BCATS.some(z=>z[0]===c)))return c==='none'?'':c;if(!g.store||RC.BNPL.test(g.store))return '';const k=B2.catOf({note:g.store});return k&&k!=='oth'?k:'oth'};
// which plan a bank or logged payment belongs to
PL.rk=s=>s.tid||(s.d+'|'+r2(s.amt)+'|'+String(s.note||'').slice(0,20));
PL.isRow=s=>!!s&&s.cat!=='Income'&&s.cat!=='Skip'&&RC.BNPL.test(String(s.note||''));
PL.rowPlan=s=>{if(!s)return null;const m=PL.g().m[PL.rk(s)];if(m)return m;if(!PL.isRow(s))return null;const prov=RC.prov(s.note);
  const P=PL.plans().find(p=>p.prov===prov&&p.items.some(x=>Math.abs(x.amt-r2(s.amt))<=0.01));if(P)return P.id;
  const b=PL.bankOnly().find(x=>x.prov===prov&&Math.abs(x.typ-r2(s.amt))<=0.01);return b?b.id:'pl-'+prov.toLowerCase()};
PL.rowCat=s=>{const id=PL.rowPlan(s);if(!id)return null;const c=PL.g().cat[id];if(c==='none')return '';if(c&&BCATS.some(z=>z[0]===c))return c;const p=PL.plans().find(x=>x.id===id);return p?p.cat:''};
// a bank payment that matches an upcoming installment: that installment is paid, so it isn't set aside again
PL.match=()=>{try{const g=PL.g(),T=realDay(),P=PL.plans(true);let n=0;state.paid=state.paid||{};
    (state.spend||[]).forEach(s=>{if(!PL.isRow(s)||!isDate(s.d))return;const t=pd(s.d);if(T-t>120*DY)return;const k=PL.rk(s);if(g.m[k])return;const prov=RC.prov(s.note);
      let best=null;P.forEach(p=>{if(p.prov!==prov&&p.prov!=='Pay later')return;p.items.forEach(x=>{if(x.used||Math.abs(x.amt-r2(s.amt))>0.01)return;const dd=(x.t-t)/DY;if(dd<-6||dd>14)return;if(!best||Math.abs(dd)<best.dd)best={p,x,dd:Math.abs(dd)}})});
      if(best){best.x.used=1;g.m[k]=best.p.id;const pk=payKey({t:best.x.t,name:best.x.name});if(!state.paid[pk]){state.paid[pk]=true;n++}}});
    return n}catch(e){return 0}};
{const _af=LG.after;LG.after=function(){const r=_af.apply(this,arguments);try{if(PL.match())plan()}catch(e){}return r}}

// a purchase Sprout can't place by its usual rules: your own categories by theme, then the store lists from the transactions screen
{const _co=B2.catOf;B2.catOf=function(s){const k=_co.apply(this,arguments);if(k!=='oth'||!s||s.bc)return k;try{const n=String(s.note||s.m||'').toLowerCase();if(!n)return k;const b=B2.g();
    if(typeof SG!=='undefined'){const own=b.custom.find(c=>{const th=SG.TH.find(t=>t[1].toLowerCase()===String(c.name).toLowerCase()||t[3].test(String(c.name)));return th&&th[3].test(n)});if(own)return own.id}
    if(RC.BNPL.test(n))return k;const tc=TCATS.find(c=>c[4]&&c[4].test(n)),m={groc:'groc',dine:'din',gas:'gas',shop:'shop',subs:'subs'};if(tc&&m[tc[0]]&&BCATS.some(z=>z[0]===m[tc[0]]))return m[tc[0]]}catch(e){}return k}}
// ---------- what you owe includes what's left on each plan ----------
{const _td=totalDebt;totalDebt=function(){return r2(_td.apply(this,arguments)+PL.owed())}}
PL.reset=()=>{PC=null;BC=null};

// ---------- budgets: each payment counts toward what you bought ----------
{const _co=B2.catOf;B2.catOf=function(s){if(s&&!s.bc&&PL.isRow(s)){const c=PL.rowCat(s);if(c)return c}return _co.apply(this,arguments)}}
{const _bi=B2.billIn;B2.billIn=function(s){if(s&&PL.isRow(s)&&s.cat==='Bill'&&!LG.isXfer(s))return !!(s.bc||PL.rowCat(s));return _bi.apply(this,arguments)}}
// moving one payment changes only that payment, and never teaches Sprout that every Klarna payment goes there
{const _as=B2.assign;B2.assign=function(s,id){if(!s||!PL.isRow(s))return _as.apply(this,arguments);const prev=s.bc;s.bc=id;delete s.bs;plan();queueSave();const nm=(BCATS.find(c=>c[0]===id)||[])[1]||'that budget';
  toastAct('This payment now counts toward '+nm,'Undo',()=>{if(prev)s.bc=prev;else delete s.bc;plan();queueSave();if(typeof xRender==='function')xRender()})}}
// with no bank linked, a scheduled payment counts in its month once its date has passed
{const _mt=B2.monthTx;B2.monthTx=function(){const L=_mt.apply(this,arguments);try{if(LG.live()||LG.demo())return L;const mk=fd(realDay()).slice(0,7);
    PL.plans().forEach(p=>{if(!p.cat)return;p.items.forEach(x=>{if(x.t>realDay()||x.d.slice(0,7)!==mk)return;L.push({s:{d:x.d,amt:x.amt,note:x.name,cat:'Bill',virt:1},i:-1,d:x.d,amt:x.amt,cat:p.cat,note:x.name})})})}catch(e){}return L}}
TCATS.push(['pl','Pay-later payments','#c9b8e8','',null]);
{const _tc=LG.tcat;LG.tcat=function(s){if(s&&PL.isRow(s)&&s.cat==='Bill'&&!B2.billIn(s))return 'pl';return _tc.apply(this,arguments)}}

// ---------- the Pay-later page ----------
TITLES.paylater='Pay-later plans';
PL.catSel=(id,cur)=>'<select class="plsel" data-plcat="'+esc(id)+'" aria-label="Budget for this plan"><option value="none"'+(!cur?' selected':'')+'>Not in a budget</option>'+BCATS.map(c=>'<option value="'+esc(c[0])+'"'+(c[0]===cur?' selected':'')+'>'+esc(c[1])+'</option>').join('')+'</select>';
PAGES.paylater=()=>{B2.sync();const P=PL.plans(),act=P.filter(p=>p.left>0),done=P.filter(p=>!p.left),B=PL.bankOnly(),owed=r2(act.reduce((a,p)=>a+p.owed,0)),nx=act.filter(p=>p.next).sort((a,b)=>a.next.t-b.next.t)[0];
  const card=p=>'<div class="xcard plcard"><div class="plh">'+catIcon(p.cat?'b:'+p.cat:'pl','sm')+'<div class="plt"><b>'+esc(p.store)+'</b><small>'+esc(p.prov)+(p.of?' · '+p.of+' payments':'')+'</small></div><div class="pla"><b>'+money(p.owed)+'</b><small>left</small></div></div>'+
    '<div class="xbar"><i style="width:'+Math.max(3,Math.round(p.paidN/Math.max(1,p.total)*100))+'%"></i></div>'+
    '<small class="xhint">'+(p.next?(p.of?p.paidN+' of '+p.total+' paid · ':'')+p.left+' left · next '+money(p.next.amt)+' on '+sdate(p.next.t):'Paid off')+'</small>'+
    '<label class="f plf"><span>Counts toward</span>'+PL.catSel(p.id,p.cat)+'</label>'+
    '<details class="pld"><summary>See every payment</summary>'+p.items.map(x=>'<div class="plrow2"><span>'+sdate(x.t)+(x.k&&x.of?' · '+x.k+' of '+x.of:'')+'</span><b>'+(x.done?'<s>'+money(x.amt)+'</s>':money(x.amt))+'</b></div>').join('')+
    '<button type="button" class="lnk" data-plrm="'+esc(p.id)+'" style="color:var(--bad);margin-top:6px">Remove this plan</button></details></div>';
  return '<div class="xhero"><span class="k">You owe on pay-later plans</span><b>'+money(owed)+'</b><span class="d">'+(act.length?act.length+' plan'+(act.length>1?'s':'')+(nx?' · next '+money(nx.next.amt)+' to '+esc(nx.prov)+' on '+sdate(nx.next.t):''):'No open plans')+'</span></div>'+
    (act.length?act.map(card).join(''):'<div class="xcard"><b>No open plans</b><small class="xhint">Scan the upcoming payments screen in Klarna, Affirm, Afterpay or another pay-later app, and Sprout adds every payment to your plan.</small><div class="svbtns"><button type="button" class="sbtn" data-scan>Scan a screenshot</button></div></div>')+
    (B.length?'<div class="xsec">Seen at your bank</div>'+B.map(b=>'<div class="xcard plcard"><div class="plh">'+catIcon(b.cat?'b:'+b.cat:'pl','sm')+'<div class="plt"><b>'+esc(b.prov)+' · '+money(b.typ)+'</b><small>'+b.n+' payments'+(b.cad?' · '+b.cad:'')+'. Scan the app to see what’s left.</small></div></div><label class="f plf"><span>Counts toward</span>'+PL.catSel(b.id,b.cat)+'</label></div>').join(''):'')+
    (done.length?'<details class="pld"><summary>Paid off ('+done.length+')</summary>'+done.map(card).join('')+'</details>':'')+
    '<p class="xhint">Each payment counts toward its budget in the month you pay it, so a purchase is never counted twice. Changing where a plan counts only moves it between budgets. What you owe, your cash flow and Safe to spend stay the same.</p>'};
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.plcat==null)return;const g=PL.g(),id=t.dataset.plcat,prev=g.cat[id];g.cat[id]=t.value;plan();queueSave();
  const nm=t.value==='none'?'no budget':((BCATS.find(c=>c[0]===t.value)||[])[1]||'that budget');toastAct('Every payment on this plan now counts toward '+nm,'Undo',()=>{if(prev)g.cat[id]=prev;else delete g.cat[id];plan();queueSave();if(typeof xRender==='function')xRender()});if(typeof xRender==='function')xRender()});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-plrm]');if(!b)return;e.preventDefault();if(!b.dataset.arm){b.dataset.arm='1';b.textContent='Tap again to remove its upcoming payments';return}
  const id=b.dataset.plrm,old=(state.sched||[]).slice();state.sched=(state.sched||[]).filter(x=>!(PL.isPL(x)&&PL.idOf(PL.parse(x.name).prov,PL.parse(x.name).store)===id&&pd(x.d)>=realDay()));try{editors()}catch(_){}plan();queueSave();if(typeof xRender==='function')xRender();
  toastAct('Plan removed','Undo',()=>{state.sched=old;try{editors()}catch(_){}plan();queueSave();if(typeof xRender==='function')xRender()})});
// the scan's "upcoming payments" now open this page after they're added
try{if(window.__S)window.__S.PL=PL}catch(e){}
}
