// ===================== Your plan, every account in its place, and Sprout filling in what it can find =====================
const F2={};
{
Object.assign(IC,{card:'M3.5 6.5h17v11h-17zM3.5 10h17M7 14.5h3',mic:'M12 3.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v3.5',sun:'M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4'});
const r2=x=>Math.round((+x||0)*100)/100,DY=MS;
const tag=auto=>'<em class="yptag'+(auto?' auto':'')+'">'+(auto?'From your bank':'Set by you')+'</em>';
const ord=n=>{n=+n;const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0])};

// ---------- 1. every linked account counts, in the right place ----------
// retirement and investments: in net worth, never in what you can spend today
F2.SUB={'401k':'401(k)','403b':'403(b)','457b':'457(b)','ira':'IRA','roth':'Roth IRA','roth 401k':'Roth 401(k)','sep ira':'SEP IRA','simple ira':'SIMPLE IRA','brokerage':'Brokerage','hsa':'HSA','529':'529 plan','crypto exchange':'Crypto','non-taxable brokerage account':'Brokerage','pension':'Pension','keogh':'Keogh','education savings account':'Education savings','mutual fund':'Mutual fund','savings':'Savings','money market':'Money market','cd':'CD','cash management':'Cash management','checking':'Checking','prepaid':'Prepaid','credit card':'Credit card','paypal':'PayPal','student':'Student loan','auto':'Auto loan','mortgage':'Mortgage','personal':'Personal loan','home equity':'Home equity','line of credit':'Line of credit'};
F2.subName=a=>F2.SUB[String(a.sub||'').toLowerCase()]||(a.sub?String(a.sub).replace(/\b\w/g,c=>c.toUpperCase()):'');
F2.retire=a=>/401|403|457|ira|roth|pension|keogh|thrift|retire/i.test(String(a.sub||'')+' '+String(a.name||''));
F2.other=()=>LG.accts().filter(a=>LG.type(a)==='other'&&+a.cur>0);
{const _nw=LG.nw;LG.nw=function(){const n=_nw.apply(this,arguments);try{const o=r2(F2.other().reduce((s,a)=>s+(+a.cur||0),0));if(o>0){n.I=r2((n.I||0)+o);if(n.A!=null)n.A=r2(n.A+o);if(n.own!=null)n.own=r2(n.own+o);if(n.N!=null)n.N=r2(n.N+o)}}catch(e){}return n}}
F2.groups=()=>{const A=LG.accts(),by=t=>A.filter(a=>LG.type(a)===t);const inv=by('invest').concat(F2.other());
  return [['cash','Cash',by('cash'),'Your daily number uses this'],['savings','Savings',by('savings'),'In your net worth, not your daily number'],['invest','Investments and retirement',inv,'In your net worth, never in your daily number'],['card','Credit cards',by('card'),'What you owe'],['loan','Loans',by('loan'),'What you owe']]};
F2.accRow=a=>{const t=LG.type(a),v=t==='card'||t==='loan'?Math.max(0,+a.cur||0):LG.bal(a);return '<div class="lkrow"><div class="lki">'+catIcon(t==='cash'?'bank':t==='savings'?'piggy':t==='invest'||t==='other'?'chart':t==='card'?'card':'key','sm')+'</div><div class="lkt"><b>'+esc(LG.nm(String(a.name||'Account').replace(new RegExp('\\s*[.•x*#]{2,}\\s*'+(a.mask||'@@')+'\\s*$'),'')+(a.mask?' ••'+a.mask:'')))+'</b><small>'+esc([a.inst,F2.subName(a)].filter(Boolean).join(' · '))+'</small></div><span class="lvbal">'+(t==='card'||t==='loan'?'−':'')+money(v)+'</span></div>'};
TITLES.accounts='Your accounts';
PAGES.accounts=()=>{const G=F2.groups().filter(g=>g[2].length),n=LG.nw(),pl=PL.plans().filter(p=>p.left>0);
  if(!G.length&&!pl.length)return '<div class="xcard"><b>No linked accounts yet</b><small class="xhint">Connect your bank and every account shows up here, from checking to your 401(k).</small><div class="svbtns"><button class="sbtn" data-x="nav" data-v="accts">Connect accounts</button></div></div>';
  return '<div class="xhero"><span class="k">Net worth</span><b>'+money0(n.N)+'</b><span class="d">Own '+money0(n.own!=null?n.own:n.A)+' · Owe '+money0(n.L)+'</span></div>'+
   G.map(g=>{const tot=g[2].reduce((s,a)=>s+(g[0]==='card'||g[0]==='loan'?Math.max(0,+a.cur||0):LG.bal(a)),0);return '<div class="xcard acgrp"><div class="svh"><h3>'+g[1]+'</h3><b>'+(g[0]==='card'||g[0]==='loan'?'−':'')+money(tot)+'</b></div><small class="xhint">'+g[3]+'</small>'+g[2].map(F2.accRow).join('')+'</div>'}).join('')+
   (pl.length?'<button type="button" class="xcard acgrp aclink" data-x="open" data-v="paylater"><div class="svh"><h3>Pay-later plans</h3><b>−'+money(PL.owed())+'</b></div><small class="xhint">'+pl.length+' plan'+(pl.length>1?'s':'')+' · What you owe</small></button>':'')+
   '<p class="xhint">Balances come from your bank each time Sprout syncs.</p>'};
// the Savings screen shows what's at your bank too
{const _sv=SV;SV=function(){const v=_sv.apply(this,arguments);try{const L=LG.of('savings');v.bank=r2(L.reduce((s,a)=>s+LG.bal(a),0));v.bal=r2(v.bal+v.bank)}catch(e){}return v}}
{const _vp=PAGES.vault;PAGES.vault=function(){const h=_vp.apply(this,arguments);const S=LG.of('savings'),I=LG.of('invest').concat(F2.other());if(!S.length&&!I.length)return h;
  const sv=S.reduce((s,a)=>s+LG.bal(a),0),iv=I.reduce((s,a)=>s+(+a.cur||0),0);
  const top=(S.length?'<div class="xcard acgrp"><div class="svh"><h3>Savings at your bank</h3><b>'+money(sv)+'</b></div>'+S.map(F2.accRow).join('')+'</div>':'')+
    (I.length?'<div class="xcard acgrp"><div class="svh"><h3>Investments and retirement</h3><b>'+money(iv)+'</b></div><small class="xhint">Counts in your net worth. It’s never part of your daily number.</small>'+I.map(F2.accRow).join('')+'</div>':'');
  let h2=h;if(iv>0)h2=h2.replace(/<span class="d">Sprout keeps track\. Your money stays at your bank\.<\/span>/,'<span class="d">Plus '+money(iv)+' in investments and retirement. Your money stays at your bank.</span>');const i=h2.indexOf('<div class="xcard"><div class="svh"><h3>Where your savings are</h3>');return i>=0?h2.slice(0,i)+top+h2.slice(i).replace('<h3>Where your savings are</h3>','<h3>Savings you track yourself</h3>'):h2+top}}
TITLES.vault='Savings and investments';

// ---------- 2. Your plan: everything Sprout uses, where it came from, and how to fix it ----------
TITLES.yourplan='Your plan';
F2.payAuto=()=>{const a=RC.auto();return !!(a.pay&&!a.pay.manual&&Math.abs((+state.pay||0)-(+a.pay.set||0))<=0.5)};
F2.payLine=()=>{if(!(+state.pay>0))return 'Not set';const f={weekly:'every week',biweekly:'every other week',semimonthly:'twice a month',monthly:'every month'}[state.payFreq]||'';let nx=null;try{nx=payDates(state,realDay()-DY).find(t=>t>=realDay())}catch(e){}return money0(state.pay)+' '+f+(nx?' · next '+sdate(nx):'')};
F2.billLine=b=>money(+b.amt)+' · '+(b.type==='monthly'?'the '+ord(b.day)+' of each month':'every '+b.every+' days');
PAGES.yourplan=()=>{const sug=RC.paySuggest(),nb=RC.newBills(),live=LG.live(),chk=LG.of('cash'),bills=state.bills||[],debts=state.debts||[],pl=PL.plans().filter(p=>p.left>0);
  const row=(ico,label,val,attrs,t)=>'<button type="button" class="srow" '+attrs+'><span class="sico">'+ic(ico)+'</span><span class="slab">'+label+(t||'')+'</span>'+(val?'<span class="sval">'+val+'</span>':'')+'<span class="chev">›</span></button>';
  let h='<p class="xhint ypintro">Everything Sprout uses to work out your daily number. Tap anything to fix it.</p>';
  h+='<section class="sgrp"><h3>Paycheck</h3><div class="sbox">'+(sug?'<div class="ypsug"><b>Found your paycheck</b><span>About '+esc(RC.payWords(sug))+' from '+esc(sug.name)+'. Next payday '+sdate(sug.next)+'.</span><div class="b2gapb"><button type="button" class="sbtn" data-yp="usepay">Use this</button><button type="button" class="sbtn alt" data-x="open" data-v="ypay">Edit</button></div></div>':'')+
    row('money',+state.pay>0?F2.payLine():'Add your paycheck','','data-x="open" data-v="ypay"',+state.pay>0?tag(F2.payAuto()):'')+'</div></section>';
  h+='<section class="sgrp"><h3>Bills</h3><div class="sbox">'+(nb.length?'<button type="button" class="ypsug" data-x="open" data-v="yfound"><b>Sprout found '+nb.length+' more bill'+(nb.length>1?'s':'')+'</b><span>'+esc(nb.slice(0,3).map(s=>s.name+' '+money0(s.typ)).join(', '))+(nb.length>3?' and more':'')+'. Tap to review.</span></button>':'')+
    bills.map((b,i)=>row('doc',esc(b.name),money(+b.amt),'data-x="open" data-v="ybill" data-w="'+i+'"','<small>'+(b.type==='monthly'?'The '+ord(b.day):'Every '+b.every+' days')+'</small>'+tag(!!b.auto))).join('')+
    row('plus','Add a bill','','data-x="open" data-v="ybill" data-w="new"')+'</div></section>';
  h+='<section class="sgrp"><h3>What you owe</h3><div class="sbox">'+debts.map((d,i)=>row('card',esc(LG.nm(d.name)),money0(+d.bal),'data-x="open" data-v="ydebt" data-w="'+i+'"','<small>'+(+d.apr?d.apr+'% · ':'')+'minimum '+money0(+d.min||0)+(d.day?' on the '+ord(d.day):'')+'</small>'+tag(!!d.acct))).join('')+
    (pl.length?row('cal','Pay-later plans',money0(PL.owed()),'data-x="open" data-v="paylater"','<small>'+pl.length+' plan'+(pl.length>1?'s':'')+'</small>'):'')+
    row('plus','Add a card or loan','','data-x="open" data-v="ydebt" data-w="new"')+'</div></section>';
  h+='<section class="sgrp"><h3>Money</h3><div class="sbox">'+(live&&chk.length?'<div class="srow"><span class="sico">'+ic('money')+'</span><span class="slab">Checking<small>Synced '+agoTxt(state.cashAt||(state.link&&state.link.at)||Date.now())+'</small>'+tag(true)+'</span><span class="sval">'+money(+state.cash||0)+'</span></div>':row('money','Checking balance',money(+state.cash||0),'data-x="open" data-v="ycash"',tag(false)))+
    row('shield','Cushion','Keep '+money0(+state.cushion||0),'data-x="open" data-v="ycush"','<small>Sprout never plans to spend this</small>')+
    row('pie','Budgets','','data-x="open" data-v="budgets"')+row('repeat','Subscriptions','','data-x="open" data-v="subs"')+row('vault','Savings and investments','','data-x="open" data-v="vault"')+'</div></section>';
  h+='<button type="button" class="lnk ypfull" data-ypfull>All numbers in one place (advanced)</button>';
  return h};
// paycheck
TITLES.ypay='Paycheck';F2.pf=null;
PAGES.ypay=()=>{const f=F2.pf||state.payFreq||'biweekly',sug=RC.pay();let nx='';try{const d=payDates(state,realDay()-DY).find(t=>t>=realDay());if(d)nx=fd(d)}catch(e){}if(!nx&&sug)nx=fd(sug.next);
  return (sug&&!(+state.pay>0)?'<div class="xcard ypsug"><b>From your bank</b><span>About '+esc(RC.payWords(sug))+' from '+esc(sug.name)+'.</span><div class="b2gapb"><button type="button" class="sbtn" data-yp="usepay">Use this</button></div></div>':'')+
   '<div class="xf b2form"><label class="f">Take-home pay (after taxes)<div class="pre"><span>$</span><input id="yp-amt" type="text" inputmode="decimal" value="'+(+state.pay>0?r2(state.pay):sug?sug.amt:'')+'" placeholder="0"></div></label>'+
   '<div class="f"><span>How often</span><div class="wchips" id="yp-f">'+[['weekly','Every week'],['biweekly','Every other week'],['semimonthly','Twice a month'],['monthly','Monthly']].map(o=>'<button type="button" class="wchip'+(o[0]===f?' on':'')+'" data-ypf="'+o[0]+'">'+o[1]+'</button>').join('')+'</div></div>'+
   (f==='semimonthly'?'<div class="row"><label class="f">First payday of the month<input id="yp-d1" type="text" inputmode="numeric" value="'+((state.payDays||[1,15])[0])+'"></label><label class="f">Second<input id="yp-d2" type="text" inputmode="numeric" value="'+((state.payDays||[1,15])[1]||15)+'"></label></div>':'<label class="f">Next payday<input id="yp-next" type="date" value="'+nx+'"></label>')+
   '<button type="button" class="btn" data-yp="savepay">Save</button>'+(+state.pay>0?'<button type="button" class="btn alt" data-yp="nopay">I don’t get a regular paycheck</button>':'')+'</div>'};
// bills
TITLES.ybill='Bill';
PAGES.ybill=w=>{const b=w==='new'?{name:'',amt:'',type:'monthly',day:1}:(state.bills||[])[+w];if(!b)return '<p class="xhint">That bill is gone.</p>';
  return '<div class="xf b2form">'+(b.auto?'<p class="xhint" style="margin:0">Sprout found this in your bank history. Change anything that’s off.</p>':'')+'<label class="f">Name<input id="yb-n" maxlength="40" value="'+esc(b.name)+'" placeholder="Like Rent or Phone"></label><label class="f">Amount<div class="pre"><span>$</span><input id="yb-a" type="text" inputmode="decimal" value="'+(b.amt===''?'':r2(b.amt))+'" placeholder="0"></div></label>'+
   '<div class="f"><span>When</span><div class="wchips" id="yb-t"><button type="button" class="wchip'+(b.type==='monthly'?' on':'')+'" data-ybt="monthly">Same day each month</button><button type="button" class="wchip'+(b.type!=='monthly'?' on':'')+'" data-ybt="every">Every few days</button></div></div>'+
   '<label class="f" id="yb-dw"'+(b.type==='monthly'?'':' hidden')+'>Day of the month<input id="yb-d" type="text" inputmode="numeric" value="'+(+b.day||1)+'"></label>'+
   '<div class="row" id="yb-ew"'+(b.type==='monthly'?' hidden':'')+'><label class="f">Every how many days<input id="yb-e" type="text" inputmode="numeric" value="'+(+b.every||14)+'"></label><label class="f">Next one<input id="yb-f" type="date" value="'+(b.first||fd(realDay()))+'"></label></div>'+
   '<button type="button" class="btn" data-yp="savebill" data-w="'+esc(w)+'">Save</button>'+(w!=='new'?'<button type="button" class="btn x" data-yp="delbill" data-w="'+esc(w)+'">Delete this bill</button>':'')+'</div>'};
TITLES.yfound='Bills Sprout found';
PAGES.yfound=()=>{const L=RC.newBills();if(!L.length)return '<p class="xhint">Nothing new right now. Sprout keeps looking each time your bank syncs.</p>';
  return '<p class="xhint" style="margin:0 0 8px">These repeat in your bank history. Add them and Sprout sets money aside before each one is due.</p><div class="xcard">'+L.map(s=>'<label class="lkc"><input type="checkbox" data-yfb="'+esc(s.id)+'"'+(s.conf>=0.75?' checked':'')+'><span>'+esc(s.name)+(s.conf<0.75?' <em class="lkns">Not sure</em>':'')+'<small>'+(s.per>25&&s.per<40?'Around the '+ord(s.day):s.cad)+(s.vary?' · amount changes':'')+' · '+s.n+' payments found</small></span><b>'+money(s.typ)+'</b></label>').join('')+'</div>'+
   '<div class="row"><button type="button" class="btn" data-yp="addfound">Add to my plan</button><button type="button" class="btn alt" data-yp="nofound">Not bills</button></div>'};
// debts
TITLES.ydebt='Card or loan';
PAGES.ydebt=w=>{const d=w==='new'?{name:'',bal:'',apr:'',min:'',day:1}:(state.debts||[])[+w];if(!d)return '<p class="xhint">That one is gone.</p>';const lk=!!d.acct;
  return '<div class="xf b2form">'+(lk?'<p class="xhint" style="margin:0">Linked to your bank: the balance updates on its own'+(d.apr?', and so do the rate and minimum':'')+'.</p>':'')+
   '<label class="f">Name<input id="yd-n" maxlength="40" value="'+esc(d.name)+'"'+(lk?' disabled':'')+' placeholder="Like Chase card or Car loan"></label>'+
   '<label class="f">Balance<div class="pre"><span>$</span><input id="yd-b" type="text" inputmode="decimal" value="'+(d.bal===''?'':r2(d.bal))+'"'+(lk?' disabled':'')+'></div></label>'+
   '<div class="row"><label class="f">Interest rate (APR %)<input id="yd-r" type="text" inputmode="decimal" value="'+(d.apr===''?'':+d.apr)+'"></label><label class="f">Minimum payment<div class="pre"><span>$</span><input id="yd-m" type="text" inputmode="decimal" value="'+(d.min===''?'':r2(d.min))+'"></div></label></div>'+
   '<label class="f">Due day of the month<input id="yd-d" type="text" inputmode="numeric" value="'+(+d.day||1)+'"></label>'+
   '<button type="button" class="btn" data-yp="savedebt" data-w="'+esc(w)+'">Save</button>'+(w!=='new'&&!lk?'<button type="button" class="btn x" data-yp="deldebt" data-w="'+esc(w)+'">Delete</button>':'')+'</div>'};
TITLES.ycash='Checking balance';
PAGES.ycash=()=>'<div class="xf b2form"><label class="f">What your bank app shows now, after pending charges<div class="pre"><span>$</span><input id="yc-a" type="text" inputmode="decimal" value="'+r2(state.cash)+'"></div></label><button type="button" class="btn" data-yp="savecash">Save</button><p class="xhint">Connect your bank and this updates on its own.</p></div>';
TITLES.ycush='Cushion';
PAGES.ycush=()=>'<div class="xf b2form"><label class="f">Money to always keep in checking<div class="pre"><span>$</span><input id="yk-a" type="text" inputmode="decimal" value="'+r2(state.cushion)+'"></div></label><button type="button" class="btn" data-yp="savecush">Save</button><p class="xhint">Your daily number never counts on this money, so a surprise charge doesn’t overdraw you.</p></div>';
const num=id=>{const el=document.getElementById(id);const v=parseAmt(el?el.value:'');return isFinite(v)?v:NaN};
const done=msg=>{try{editors()}catch(e){}RC.reset();plan();queueSave();xBack();toast(msg)};
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
  const fq=t.closest('[data-ypf]');if(fq){F2.pf=fq.dataset.ypf;const a=document.getElementById('yp-amt'),v=a?a.value:'';xRender();const b=document.getElementById('yp-amt');if(b)b.value=v;return}
  const bt=t.closest('[data-ybt]');if(bt){bt.parentElement.querySelectorAll('.wchip').forEach(x=>x.classList.toggle('on',x===bt));const m=bt.dataset.ybt==='monthly';document.getElementById('yb-dw').hidden=!m;document.getElementById('yb-ew').hidden=m;return}
  if(t.closest('[data-ypfull]')){e.preventDefault();closeSheets();setTimeout(()=>{F2.full=1;openFocus('#m-edit')},closeSheetsDelay()+60);return}
  const b=t.closest('[data-yp]');if(!b)return;e.preventDefault();const a=b.dataset.yp,w=b.dataset.w;
  if(a==='usepay'){const p=RC.pay();if(p){RC.usePay(p);if(typeof xRender==='function')xRender();try{pgRender()}catch(_){}}return}
  if(a==='savepay'){const amt=num('yp-amt'),f=(document.querySelector('#yp-f .wchip.on')||{dataset:{}}).dataset.ypf||'biweekly';if(!(amt>0)){toast('Enter your take-home pay');return}
    state.pay=r2(amt);state.payFreq=f;if(f==='semimonthly'){const d1=Math.min(31,Math.max(1,Math.round(num('yp-d1')||1))),d2=Math.min(31,Math.max(1,Math.round(num('yp-d2')||15)));state.payDays=[Math.min(d1,d2),Math.max(d1,d2)]}else{const v=(document.getElementById('yp-next')||{}).value;if(!isDate(v)){toast('Pick your next payday');return}state.firstPay=v}
    F2.pf=null;done('Paycheck saved');return}
  if(a==='nopay'){state.pay=0;const au=RC.auto();if(au.pay)au.payNo=au.pay.key;delete au.pay;done('Paycheck removed');return}
  if(a==='savebill'){const n=String((document.getElementById('yb-n')||{}).value||'').trim().slice(0,40),amt=num('yb-a'),mo=!!document.querySelector('#yb-t .wchip.on[data-ybt=monthly]');if(!n){toast('Give it a name');return}if(!(amt>0)){toast('Enter the amount');return}
    const o=w==='new'?{}:Object.assign({},state.bills[+w]),nb=Object.assign(o,{name:n,amt:r2(amt)});delete nb.auto;
    if(mo){nb.type='monthly';nb.day=Math.min(31,Math.max(1,Math.round(num('yb-d')||1)));delete nb.every;delete nb.first}else{nb.type='every';nb.every=Math.max(1,Math.round(num('yb-e')||14));nb.first=(document.getElementById('yb-f')||{}).value||fd(realDay());delete nb.day}
    state.bills=state.bills||[];if(w==='new')state.bills.push(nb);else state.bills[+w]=nb;done(w==='new'?'Bill added':'Bill saved');return}
  if(a==='delbill'){if(!b.dataset.arm){b.dataset.arm='1';b.textContent='Tap again to delete';return}const old=state.bills[+w];state.bills.splice(+w,1);if(old&&old.src)RC.dis()[old.src]=1;done('Bill deleted');return}
  if(a==='addfound'){const ids=[...document.querySelectorAll('[data-yfb]')].filter(x=>x.checked).map(x=>x.dataset.yfb),no=[...document.querySelectorAll('[data-yfb]')].filter(x=>!x.checked).map(x=>x.dataset.yfb);no.forEach(id=>RC.dis()[id]=1);if(!ids.length){queueSave();xBack();return}RC.addBills(ids);xBack();return}
  if(a==='nofound'){RC.newBills().forEach(s=>RC.dis()[s.id]=1);queueSave();xBack();toast('Got it. Sprout won’t suggest those again.');return}
  if(a==='savedebt'){const D=state.debts=state.debts||[],o=w==='new'?{}:D[+w];if(!o)return;const lk=!!o.acct,n=lk?o.name:String((document.getElementById('yd-n')||{}).value||'').trim().slice(0,40);if(!n){toast('Give it a name');return}
    if(w==='new'&&D.some(d=>d.name===n)){toast('You already have '+n);return}
    const bal=num('yd-b'),apr=num('yd-r'),mn=num('yd-m'),dy=num('yd-d');const nd=Object.assign(o,{name:n});if(!lk&&isFinite(bal))nd.bal=r2(Math.max(0,bal));if(isFinite(apr))nd.apr=r2(Math.max(0,apr));if(isFinite(mn))nd.min=r2(Math.max(0,mn));if(isFinite(dy))nd.day=Math.min(31,Math.max(1,Math.round(dy)));
    if(w==='new')D.push(nd);done(w==='new'?'Added':'Saved');return}
  if(a==='deldebt'){if(!b.dataset.arm){b.dataset.arm='1';b.textContent='Tap again to delete';return}state.debts.splice(+w,1);done('Deleted');return}
  if(a==='savecash'){const v=num('yc-a');if(!isFinite(v)){toast('Enter your balance');return}state.cash=r2(v);state.cashAt=Date.now();state.asOf=fd(realDay());state.skipped=0;done('Balance updated');return}
  if(a==='savecush'){const v=num('yk-a');if(!isFinite(v)||v<0){toast('Enter an amount');return}state.cushion=r2(v);done('Cushion saved');return}});
// "Edit numbers" is now Your plan: the menu, Settings and every "add it" link go there
document.addEventListener('click',e=>{const m=e.target.closest&&e.target.closest('[data-nav=edit]');if(!m||F2.full)return;e.stopImmediatePropagation();e.preventDefault();try{closeMenu()}catch(_){}setTimeout(()=>xOpen('yourplan'),closeSheetsDelay()+30)},true);
document.addEventListener('click',()=>{if(F2.full)setTimeout(()=>{F2.full=0},400)});

// ---------- 3. the "set up first" note says exactly what's missing, or offers what Sprout found ----------
B2.gapHTML=cls=>{const g=B2.gaps();if(!g.length)return '';const sug=g.indexOf('your paycheck')>=0?RC.paySuggest():null,one=g.length===1;
  if(sug&&(one||g.indexOf('your budget')<0))return '<div class="b2gap'+(cls?' '+cls:'')+'"><b>Found your paycheck</b><span>About '+esc(RC.payWords(sug))+' from '+esc(sug.name)+'. Next payday '+sdate(sug.next)+'. Use it for your daily number?</span><div class="b2gapb"><button type="button" class="sbtn" data-yp="usepay">Use this</button><button type="button" class="sbtn alt" data-x="open" data-v="ypay">Edit</button></div></div>';
  const W={'your budget':['Set up your budget','for the most accurate insights'],'your paycheck':['Add your paycheck','to get your daily number'],'your bills':['Add your bills','so Sprout can set money aside for them']};
  const title=one?W[g[0]][0]+' '+W[g[0]][1]:'Add '+B2.list(g.map(x=>x.replace('your ','your ')))+' for exact answers';
  const body=one?(g[0]==='your paycheck'?'Your daily number, “can I afford this?” answers and insights all start from it. It takes a minute, and you can change it any time.':g[0]==='your bills'?'Then your daily number leaves room for them before each one is due.':'Then insights compare what you spend with what you planned.'):'Your daily number, “can I afford this?” answers and insights all use them. It takes a few minutes, and you can change them any time.';
  const btn=one?(g[0]==='your budget'?'Set up my budget':g[0]==='your paycheck'?'Add my paycheck':'Add my bills'):'Add them now';
  return '<div class="b2gap'+(cls?' '+cls:'')+'"><b>'+title+'</b><span>'+body+'</span><div class="b2gapb"><button type="button" class="sbtn" data-b2="setup">'+btn+'</button></div></div>'};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-b2=setup]');if(!b)return;const g=B2.gaps();if(g.length===1&&g[0]==='your budget')return;e.stopImmediatePropagation();e.preventDefault();closeSheets();
  setTimeout(()=>{if(!state.setup)openWizard(false);else if(g.length===1&&g[0]==='your paycheck')xOpen('ypay');else xOpen('yourplan')},closeSheetsDelay()+20)},true);
{const _ba=BR.answer;BR.answer=function(q){const r=_ba.apply(this,arguments);try{if(r&&r.reply)r.reply=r.reply.replace(/\n\nThis is a rough answer\. Sprout can be exact once (.*?) (is|are) in\.$/,(m,w)=>'\n\nFor an exact answer, add '+w+'.')}catch(e){}return r}}

// ---------- 4. bills Sprout found: a quiet card on Finances, never a popup ----------
{const _mh=moneyHTML;moneyHTML=function(){let h=_mh.apply(this,arguments);try{const nb=RC.newBills(),g=LG.st();
    const accts=LG.live()?'<button type="button" class="ovcard wide acc2" data-x="open" data-v="accounts"><div class="och"><span>Accounts</span><em>›</em></div>'+F2.groups().filter(x=>x[2].length).map(x=>{const tot=x[2].reduce((s,a)=>s+(x[0]==='card'||x[0]==='loan'?Math.max(0,+a.cur||0):LG.bal(a)),0);return '<div class="acc2r"><span>'+x[1]+'</span><b>'+(x[0]==='card'||x[0]==='loan'?'−':'')+money0(tot)+'</b></div>'}).join('')+(PL.owed()>0?'<div class="acc2r"><span>Pay-later plans</span><b>−'+money0(PL.owed())+'</b></div>':'')+'</button>':'';
    const card=nb.length&&!(g.nbSeen&&g.nbSeen===nb.map(s=>s.id).join('|'))?'<div class="b2gap fbills"><b>Sprout found '+nb.length+' bill'+(nb.length>1?'s':'')+' in your history</b><span>'+esc(nb.slice(0,3).map(s=>s.name+' about '+money0(s.typ)+'/mo').join(', '))+'. Add '+(nb.length>1?'them':'it')+' so your daily number leaves room before each one is due.</span><div class="b2gapb"><button type="button" class="sbtn" data-x="open" data-v="yfound">Review</button><button type="button" class="sbtn alt" data-nbno>Not now</button></div></div>':'';
    h=h.replace('<div class="pgh">',card+'<div class="pgh">');
    // the old "Update my numbers" button is now Your plan; linked accounts get their own card
    h=h.replace(/<button class="nwupd" data-x="nav" data-v="edit"><span class="nwut">Update my numbers<small>Balance, paycheck, bills and debts<\/small><\/span><span>›<\/span><\/button>/,accts+'<button class="nwupd" data-x="open" data-v="yourplan"><span class="nwut">Your plan<small>Paycheck, bills, debts and balances</small></span><span>›</span></button>');
    // a tile for each: savings and investments, and a real credit page instead of an example
    const sv=SV(),inv=LG.of('invest').concat(F2.other()).reduce((s,a)=>s+(+a.cur||0),0),tot=sv.bal+inv;
    h=h.replace(/<b>Savings<\/b><small>[^<]*<\/small>/,'<b>Savings and investing</b><small>'+(tot>0?money0(tot)+' across your accounts':'Track your savings')+'</small>')}catch(e){}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-nbno]');if(!b)return;const g=LG.st();g.nbSeen=RC.newBills().map(s=>s.id).join('|');queueSave();try{pgRender()}catch(_){}});

// ---------- 5. small things that read better ----------
// net worth going down draws its line in the "down" color
{const _nc=nwCard;nwCard=function(){const h=_nc.apply(this,arguments);if(h.indexOf('nwpill dn')<0)return h;const i=h.indexOf('<svg'),j=h.indexOf('</svg>',i);return i<0?h:h.slice(0,i)+h.slice(i,j).replace(/var\(--accent\)/g,'var(--bad)')+h.slice(j)}}
// the net worth page draws a falling line in the "down" color too
{const _np=PAGES.networth;PAGES.networth=function(){const h=_np.apply(this,arguments);try{const top=h.slice(0,1200);if(top.indexOf('▼')<0)return h;return h.replace(/<svg[\s\S]*?<\/svg>/g,m=>m.replace(/var\(--accent\)|#2fae5a/g,'var(--bad)'))}catch(e){return h}}}
// the checking card says where its number comes from
F2.chkLabel=()=>LG.live()&&LG.of('cash').length?'From your bank · synced '+agoTxt(state.cashAt||(state.link&&state.link.at)||Date.now()):null;
try{if(window.__S)window.__S.F2=F2}catch(e){}
}
