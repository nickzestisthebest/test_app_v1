// ===================== Ledger: one set of money rules, so every number ties out to the bank =====================
// Accounts are checking (cash), savings, credit cards, loans and investments, from the bank or typed in.
// A card purchase counts as spending the day it happens. Paying the card later moves money between your own
// accounts, so it is not counted again. Transfers between your own accounts are never income or spending.
// Refunds lower spending instead of counting as income. Borrowed money is not income.
const LG={V:2,pw:'chk'};
const lgR=x=>Math.round((+x||0)*100)/100;
LG.st=()=>{if(!state.lg||typeof state.lg!=='object')state.lg={};return state.lg};
LG.live=()=>!!(state.link&&state.link.live);
LG.demo=()=>!!(state.demo||(state.link&&state.link.on&&!state.link.live));
LG.accts=()=>LG.live()?(state.link.accts||[]):[];
LG.type=a=>a.kind==='card'?'card':a.kind==='loan'?'loan':a.kind==='invest'?'invest':a.kind==='checking'?(/savings|money market|\bcd\b|hsa/i.test(a.sub||'')?'savings':'cash'):'other';
// "Robinhood Credit Card **7710 ••7710" reads as "Robinhood Credit Card ••7710"
LG.nm=n=>String(n||'').replace(/\s*[*.x#•]{2,}\s*(\d{2,4})\s*••\s*\1\s*$/i,' ••$1');
LG.label=a=>String(a.name||'Account').slice(0,40)+(a.mask?' ••'+a.mask:'');
LG.bal=a=>{const t=LG.type(a),v=(t==='cash'||t==='savings')&&a.avail!=null&&isFinite(+a.avail)?+a.avail:+a.cur;return isFinite(v)?v:0};
LG.of=t=>LG.accts().filter(a=>LG.type(a)===t);
LG.cards=()=>LG.of('card');
LG.short=n=>LG.nm(String(n||'').replace(/\s+\(\d+\)$/,'')).slice(0,26);
LG.cardish=d=>!!(d&&(d.card||/card|visa|master|amex|american express|discover|capital one|chase|citi|credit/i.test(d.name||'')));
// available credit: linked cards from the bank, typed-in cards that have a limit
LG.credit=()=>{let av=0,lim=0,n=0;LG.cards().forEach(a=>{const L=+a.limit,cur=Math.max(0,+a.cur||0);let v=null;if(a.avail!=null&&isFinite(+a.avail))v=+a.avail;else if(L>0)v=L-cur;if(v!=null){av+=Math.max(0,v);if(L>0)lim+=L;n++}});
  (state.debts||[]).forEach(d=>{if(d.acct||!(+d.limit>0))return;av+=Math.max(0,+d.limit-(+d.bal||0));lim+=+d.limit;n++});return{avail:lgR(av),limit:lgR(lim),n}};

// ---------- 1. accounts from the bank become the app's numbers ----------
LG.same=(d,a)=>{const n=String(d.name||'').toLowerCase();if(a.mask&&n.indexOf(String(a.mask))>=0)return true;
  const words=(String(a.inst||'')+' '+String(a.name||'')).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3&&!/^(bank|card|credit|account|visa|mastercard|signature|rewards|world|elite|preferred|financial|services|national|federal|union|checking|savings|platinum|cash|plus|business|personal|loan)$/.test(w));
  return words.some(w=>n.indexOf(w)>=0)};
LG.reconcile=()=>{if(!LG.live())return;const L=state.link,A=L.accts||[];L.debtAcct=L.debtAcct||{};L.liab=L.liab||{};state.debts=state.debts||[];
  // cash on hand: every checking-type account, at the bank's available balance (after pending charges)
  const cash=LG.of('cash');if(cash.length)state.cash=lgR(cash.reduce((s,a)=>s+LG.bal(a),0));
  A.forEach(a=>{const t=LG.type(a);if(t!=='card'&&t!=='loan')return;const owed=Math.max(0,lgR(+a.cur||0)),li=L.liab[a.id]||{};
    let d=state.debts.find(x=>x.acct===a.id)||(L.debtAcct[a.id]?state.debts.find(x=>x.name===L.debtAcct[a.id]&&!x.acct):null);
    if(!d&&owed<=0)return;
    let fresh=false;if(!d){let name=LG.label(a),k=2;while(state.debts.some(x=>x.name===name))name=LG.label(a)+' ('+(k++)+')';d={name,bal:owed,apr:0,min:0,day:1};state.debts.push(d);fresh=true}
    d.acct=a.id;d.bal=owed;if(t==='card')d.card=1;if(+a.limit>0)d.limit=+a.limit;
    if(li.apr!=null&&isFinite(+li.apr))d.apr=lgR(+li.apr);
    if(li.min!=null&&isFinite(+li.min))d.min=lgR(Math.max(0,+li.min));else if(fresh)d.min=Math.min(owed,Math.max(25,Math.round(owed*0.02)));
    if(li.due){const dd=+String(li.due).slice(8,10);if(dd)d.day=dd}
    if(t==='loan'&&/student/i.test(a.sub||''))d.canWait=true;
    L.debtAcct[a.id]=d.name;
    // a debt typed in by hand that looks like this same account: ask once instead of counting it twice
    if(fresh){const tw=state.debts.find(x=>x!==d&&!x.acct&&LG.same(x,a));if(tw){L.twins=(L.twins||[]).filter(z=>z.acct!==a.id);L.twins.push({debt:tw.name,acct:a.id})}}});
  // an account that was disconnected: its debt stays, and is kept up to date by hand from now on
  const ids=new Set(A.map(a=>a.id));state.debts.forEach(d=>{if(d.acct&&!ids.has(d.acct))delete d.acct});
  if(!(+state.startDebt>0))state.startDebt=lgR(totalDebt())};

// ---------- 2. what each bank transaction is ----------
LG.PRIM=['INCOME','TRANSFER_IN','TRANSFER_OUT','LOAN_PAYMENTS','BANK_FEES','ENTERTAINMENT','FOOD_AND_DRINK','GENERAL_MERCHANDISE','HOME_IMPROVEMENT','MEDICAL','PERSONAL_CARE','GENERAL_SERVICES','GOVERNMENT_AND_NON_PROFIT','TRANSPORTATION','TRAVEL','RENT_AND_UTILITIES'];
LG.prim=f=>{f=String(f||'');return LG.PRIM.find(x=>f.indexOf(x+'_')===0)||''};
LG.RX_CP=/(credit\s*c(ar)?d|\bcard\b|\bcrd\b).{0,18}(payment|pymt|pmt|autopay|auto pay|epay|e-payment)|(payment|pymt|autopay|auto pay|epay|e-payment).{0,20}(credit\s*c(ar)?d|\bcrd\b|amex|american express|discover|capital one|citi\b|synchrony|barclay|apple card)|applecard|amex epayment|american express ach|discover e-?payment|capital one (mobile |online )?(pymt|payment)|chase credit crd|citi (card )?autopay|synchrony bank payment|online transfer.{0,40}\bto\b.{0,40}(card|visa|active cash|autograph|reflect|quicksilver|savor|venture|sapphire|freedom)|^apple card\b|goldman sachs bank|\bgs bank\b|crd epay|card pmt|wf credit card/i;
LG.RX_P2P=/venmo|zelle|cash ?app|square cash|paypal|apple cash|google pay|\bp2p\b/i;
// your own money moving: to yourself by name, between your accounts, into wallets, or into investing and trading apps
LG.RX_OWNX=/deposit from .{0,40}(checking|savings|x{3,})|withdrawal to .{0,40}(checking|savings|x{3,})|transfer (to|from) .{0,25}(checking|savings|share|x{3,})|online transfer (to|from) (sav|chk|checking|savings)/i;
LG.RX_WALLET_OUT=/apple cash balance|apple cash.{0,12}add money|add(ed)? (cash|money|funds)\b|cash app.{0,12}(add|top ?up)|venmo.{0,12}(add funds|top ?up)|paypal.{0,12}add funds/i;
LG.RX_WALLET_IN=/^apple cash\b(?!.*sent)|apple cash inst xfer|cash app.{0,20}(cash ?out|instant|transfer)|venmo.{0,20}(cash ?out|cashout|transfer)|paypal.{0,20}transfer/i;
LG.RX_INVEST=/coinbase|kraken|gemini|crypto\.com|kalshi|polym|robinhood(?!.{0,20}card)|rh brokerage|webull|acorns|\bstash\b|betterment|wealthfront|fidelity|schwab|vanguard|e\*?trade|m1 finance|public\.com|sofi invest|draftkings|fanduel/i;
LG.me=()=>{try{const a=(typeof acctMe==='function'?acctMe():null)||{},f=String(a.first||'').toLowerCase().replace(/[^a-z]/g,''),l=String(a.last||'').toLowerCase().replace(/[^a-z]/g,'');return f.length>=2&&l.length>=2?{f:f.slice(0,3),l}:null}catch(e){return null}};
LG.ownName=m=>{const me=LG.me();if(!me)return false;const s=String(m||'').toLowerCase(),w=' '+s.replace(/[^a-z]+/g,' ')+' ',sq=s.replace(/[^a-z]/g,'');
  return (w.indexOf(' '+me.l+' ')>=0&&new RegExp(' '+me.f).test(w))||(sq.indexOf(me.f)>=0&&sq.indexOf(me.l)>=0&&/via|apple cash|cash app|venmo|paypal|zelle/.test(s))};
LG.payroll=(m,f)=>/payroll|salary|direct dep|dir dep|\bpayrl\b/i.test(m||'')||/^INCOME_WAGES/.test(f||'');
LG.RX_PAYIN=/\b(payment|pymt|pmt|autopay|auto pay|thank you)\b/i;
LG.debtLike=m=>(state.debts||[]).some(d=>toks(d.name).some(k=>k.length>2&&normM(m).indexOf(k)>=0));
LG.guess=(res,f)=>{if(!res.guess||!f)return res;
  if(/^(RENT_AND_UTILITIES|LOAN_PAYMENTS|BANK_FEES|GOVERNMENT_AND_NON_PROFIT_TAX)/.test(f)||/GENERAL_SERVICES_INSURANCE/.test(f))return{cat:'Bill'};
  if(/^FOOD_AND_DRINK_GROCERIES|^TRANSPORTATION|^MEDICAL|^PERSONAL_CARE(?!_GYMS)|GENERAL_MERCHANDISE_SUPERSTORES|GENERAL_MERCHANDISE_DISCOUNT_STORES|PET/.test(f))return{cat:'Everyday'};
  return{cat:'Personal'}};
LG.rule=(r,kind,res)=>{const m=String(r.m||''),f=String(r.pfd||''),p=String(r.pfc||'')||LG.prim(f);
  if((state.rules||{})[mkey(m)])return res;   // the person's own choice for this store always wins
  const cp=/^LOAN_PAYMENTS_CREDIT_CARD_PAYMENT/.test(f)||((!p||/^(TRANSFER_OUT|TRANSFER_IN|LOAN_PAYMENTS|GENERAL_SERVICES_OTHER)/.test(p))&&LG.RX_CP.test(m));
  if(!cp&&!LG.payroll(m,f)){
    if(kind!=='card'&&(LG.ownName(m)||LG.RX_OWNX.test(m)))return{cat:'Skip',xf:'own'};
    if(LG.RX_INVEST.test(m))return{cat:'Skip',xf:'invest'};
    if(kind!=='card'&&(+r.a<0?LG.RX_WALLET_OUT:LG.RX_WALLET_IN).test(m))return{cat:'Skip',xf:'wallet'}}
  if(kind==='card'){
    if(+r.a>0){
      if(cp||/^(TRANSFER_IN|LOAN_PAYMENTS)/.test(p)||LG.RX_PAYIN.test(m))return{cat:'Skip',xf:'cpin'};   // a payment the card received
      if(/^INCOME/.test(p)||/cash ?back|reward|statement credit/i.test(m))return{cat:'Income',kindName:'Other'};
      if(!p&&!/refund|return|credit|reversal/i.test(m))return res;
      return{cat:'Income',kindName:'Refund',refund:1}}                                              // money back from a store
    if(cp)return{cat:'Skip',xf:'cpin'};
    if(res.matched)return res;
    if(/^BANK_FEES/.test(p)||/interest charge|late fee|annual fee|finance charge/i.test(m))return{cat:'Bill',xf:'fee'};
    return LG.guess(res,f)}
  if(+r.a<0){
    if(res.matched){if(cp)res.xf='cp';else if(/^LOAN_PAYMENTS/.test(p))res.xf='loan';return res}
    if(cp||(res.cat==='Skip'&&/payment|pmt|autopay|thank you/i.test(m)&&!/loan/i.test(m)&&LG.debtLike(m)))return{cat:'Bill',xf:'cp'};   // paying a card
    if(/^LOAN_PAYMENTS/.test(p)||(res.cat==='Skip'&&/loan/i.test(m)&&LG.debtLike(m)))return{cat:'Bill',xf:'loan'};
    if(/^TRANSFER_OUT_(SAVINGS|INVESTMENT)/.test(f))return{cat:'Skip',xf:'save'};
    if(/^TRANSFER_OUT_WITHDRAWAL/.test(f))return{cat:'Everyday',xf:'atm'};
    if(/^TRANSFER_OUT/.test(p))return LG.RX_P2P.test(m)?(Math.abs(+r.a)>=250?{cat:'Bill',guess:true,xf:'p2p'}:{cat:'Personal',guess:true,xf:'p2p'}):{cat:'Skip',xf:'out'};   // big payments to people are usually rent or bills
    if(res.cat==='Skip')return res;
    return LG.guess(res,f)}
  // money in
  if(res.kindName==='Paycheck'&&!/^TRANSFER_IN/.test(p))return res;
  if(/^INCOME/.test(p))return{cat:'Income',kindName:/WAGES/.test(f)?'Paycheck':'Other'};
  if(/^TRANSFER_IN_CASH_ADVANCES/.test(f))return{cat:'Skip',xf:'borrow'};
  if(/^TRANSFER_IN_(SAVINGS|INVESTMENT)/.test(f))return{cat:'Skip',xf:'in'};
  if(/^TRANSFER_IN/.test(p)){if(LG.RX_P2P.test(m))return{cat:'Income',kindName:'Other',xf:'p2p'};if(/DEPOSIT/.test(f))return{cat:'Income',kindName:'Other'};return{cat:'Skip',xf:'in'}}
  if(/^LOAN_PAYMENTS/.test(p))return{cat:'Skip',xf:'in'};
  if(p&&!/^(INCOME|TRANSFER|LOAN)/.test(p))return{cat:'Income',kindName:'Refund',refund:1};
  return res};
{const _c=categorize;categorize=function(r,acctKind){const res=_c.apply(this,arguments);try{return LG.rule(r,acctKind,res)}catch(e){return res}}}
LG.isXfer=s=>!!(s&&(s.xt||(s.cat==='Bill'&&s.xf==='cp'&&s.xm)));
LG.isRefund=s=>!!(s&&s.cat==='Income'&&(s.refund||s.kind==='Refund'));
LG.EVERY=/^FOOD_AND_DRINK_GROCERIES|^TRANSPORTATION|^MEDICAL|^PERSONAL_CARE|GENERAL_MERCHANDISE_SUPERSTORES|GENERAL_MERCHANDISE_DISCOUNT_STORES|PET/;
LG.refCat=s=>LG.EVERY.test(String(s.pfd||''))||RX_EVERY.test(String(s.note||''))?'Everyday':'Personal';

// fixing transactions brought in under the older rules (runs once, only on bank-synced rows)
LG.kindOfLabel=lab=>{const a=LG.accts().find(a=>LG.label(a)===lab);if(a)return LG.type(a)==='card'?'card':'checking';return (state.accts||{})[lab]==='card'?'card':'checking'};
LG.migrate=()=>{const g=LG.st();if((g.mig||0)>=LG.V||!HIST.length)return 0;g.mig=LG.V;const rules=state.rules||{};const have=new Map();(state.spend||[]).forEach(s=>{if(s.tid)have.set(s.tid,s)});let n=0;
  HIST.forEach(h=>{if((!h.f&&!LG.accts().some(a=>LG.label(a)===h.ac))||rules[mkey(h.m)])return;const kind=LG.kindOfLabel(h.ac),s=have.get(h.k);
    const was=h.c==='Skip'?'Skip':h.c,res=LG.rule({a:+h.a,m:h.m,pfd:h.f||'',pfc:LG.prim(h.f)},kind,{cat:was,kindName:s&&s.kind,matched:!!(s&&s.payKey)});
    if(res.cat===was&&!res.xf&&!res.refund)return;
    if(res.cat==='Skip'){if(was==='Skip'){if(res.xf)h.x=res.xf;return}if(s){if(s.payKey)return;if(s.payDay&&state.gotPay)delete state.gotPay[s.payDay];state.spend.splice(state.spend.indexOf(s),1)}h.c='Skip';h.x=res.xf;n++;return}
    if(!s){if(was!=='Skip')return;const e={d:h.d,amt:lgR(Math.abs(+h.a)),cat:res.cat,note:String(h.m||'').slice(0,60),at:pd(h.d),tid:h.k,acct:h.ac,src:'import',pfd:h.f};
      if(kind==='card')e.card=true;if(res.xf)e.xf=res.xf;if(res.cat==='Income')e.kind=res.kindName||'Other';if(res.refund)e.refund=1;if(h.p)e.pending=true;
      state.spend.push(e);h.c=res.cat;if(res.xf)h.x=res.xf;n++;return}
    if(res.xf)s.xf=res.xf;if(res.refund){s.refund=1;s.kind='Refund'}
    if(res.cat!==s.cat&&!s.payKey){s.cat=res.cat;if(res.cat==='Income')s.kind=res.refund?'Refund':(res.kindName||s.kind||'Other');h.c=res.cat}n++});
  return n};

// a payment out of checking that shows up on a linked card is a transfer, not more spending
LG.match=()=>{const cardL=new Set(LG.cards().map(LG.label)),cr=[];HIST.forEach(h=>{if(cardL.has(h.ac)&&+h.a>0&&h.c==='Skip')cr.push({t:pd(h.d),a:+h.a,u:0})});cr.sort((x,y)=>x.t-y.t);
  const outs=(state.spend||[]).filter(s=>s.xf==='cp'&&!s.card).sort((x,y)=>pd(x.d)-pd(y.d));outs.forEach(s=>{delete s.xm});
  outs.forEach(s=>{const t=pd(s.d),c=cr.find(c=>!c.u&&Math.abs(c.a-s.amt)<=0.01&&c.t>=t-2*MS&&c.t<=t+7*MS);if(c){c.u=1;s.xm=1}});
  // cards kept up to date by hand (purchases logged as "paid with" that card): later payments to it are transfers too
  (state.debts||[]).forEach(d=>{if(d.acct)return;const buys=(state.spend||[]).filter(s=>s.cardDebt===d.name);if(!buys.length)return;const first=buys.reduce((a,s)=>s.d<a?s.d:a,'9999');const tk=toks(d.name).filter(k=>k.length>2);
    outs.forEach(s=>{if(!s.xm&&s.d>=first&&tk.some(k=>normM(s.note||'').indexOf(k)>=0))s.xm=2})})};
LG.XLIKE=/transfer|deposit from|withdrawal to|zelle|xfer|apple cash|cash app|venmo|paypal|payment|autopay|thank you|adjustment|reversal|brokerage/i;
LG.pairOwn=()=>{const A=(HIST||[]).filter(h=>!h.p&&+h.a);A.forEach(h=>{delete h.xm});
  // money sent to a wallet or an investing app went somewhere Sprout can't see, so it never pairs with your other accounts
  const H=A.filter(h=>!/^(invest|wallet)$/.test(h.x||''));
  const like=h=>h.c==='Skip'||/^(own|wallet|invest|save|in|out|cp|cpin|p2p)$/.test(h.x||'')||LG.XLIKE.test(h.m||'')||LG.ownName(h.m)||/^(TRANSFER|LOAN_PAYMENTS)/.test(h.f||'');
  const by={};H.forEach(o=>{if(+o.a<0){const k=Math.round(-o.a*100);(by[k]=by[k]||[]).push(o)}});
  const ins=H.filter(h=>+h.a>0&&!LG.payroll(h.m,h.f)).sort((a,b)=>a.d<b.d?-1:1);
  [2,1].forEach(pass=>ins.forEach(i=>{if(i.xm)return;const L=by[Math.round(i.a*100)];if(!L)return;const li=like(i);let best=null,bd=9;
    L.forEach(o=>{if(o.xm||o.ac===i.ac)return;const lo=like(o);if(pass===2?!(li&&lo):!((li||lo)&&(i.c==='Skip'||o.c==='Skip')))return;const dd=Math.abs(pd(i.d)-pd(o.d))/MS;if(dd<=4&&dd<bd){bd=dd;best=o}});
    if(best){i.xm=1;best.xm=1}}));
  // a deposit that was returned or reversed in the same account cancels out
  H.filter(h=>+h.a<0&&!h.xm&&/adjust|revers|return(ed)? (item|deposit|check)|chargeback/i.test(h.m||'')).forEach(o=>{const i=H.find(h=>!h.xm&&h.ac===o.ac&&Math.abs(+h.a+ +o.a)<0.005&&Math.abs(pd(h.d)-pd(o.d))<=7*MS);if(i){i.xm=1;o.xm=1}});
  const M=new Set(A.filter(h=>h.xm).map(h=>h.k));(state.spend||[]).forEach(s=>{if(s.tid&&M.has(s.tid))s.xt=1;else delete s.xt})};
// money you moved to your own accounts Sprout can't see (wallets, investing apps, an unlinked bank), in a date range
LG.MOVE=/^(own|wallet|invest|save|out|in)$/;
LG.WHO=[[/apple cash/i,'Apple Cash'],[/cash app/i,'Cash App'],[/venmo/i,'Venmo'],[/paypal/i,'PayPal'],[/robinhood|rh brokerage/i,'Robinhood'],[/polym/i,'Polymarket'],[/kalshi/i,'Kalshi'],[/coinbase/i,'Coinbase'],[/kraken/i,'Kraken'],[/draftkings/i,'DraftKings'],[/fanduel/i,'FanDuel'],[/savings/i,'savings'],[/zelle/i,'Zelle to yourself']];
LG.whoName=m=>{const w=LG.WHO.find(x=>x[0].test(m||''));return w?w[1]:LG.short(tidy(String(m||'').replace(/money transfer authorized on [\d/]+/i,''))).replace(/\s+\d.*$/,'')};
LG.moved=(a,b)=>{let out=0,inn=0;const who={};(HIST||[]).forEach(h=>{if(h.p||h.xm||h.c!=='Skip'||!LG.MOVE.test(h.x||''))return;const t=pd(h.d);if(t<a||t>b)return;const v=+h.a||0;if(v<0){out-=v;const k=LG.whoName(h.m);who[k]=(who[k]||0)-v}else inn+=v});
  return{out:lgR(out),inn:lgR(inn),net:lgR(out-inn),who:Object.entries(who).sort((x,y)=>y[1]-x[1]).slice(0,3).map(x=>x[0])}};
LG.after=()=>{try{LG.reconcile();LG.migrate();LG.match();LG.pairOwn();LG.snap()}catch(e){try{console.warn('ledger',e)}catch(_){}}};

// ---------- 3. totals that add up: money in, money out, cash flow ----------
LG.flows=L=>{let inc=0,out=0,ref=0,cp=0,xfer=0,n=0;(L||[]).forEach(s=>{const a=+s.amt||0;if(!s||s.cat==='Skip')return;if(LG.isXfer(s)){xfer+=a;return}
    if(s.cat==='Income'){if(LG.isRefund(s))ref+=a;else inc+=a;return}out+=a;n++;if(s.xf==='cp')cp+=a});
  return{inc:lgR(inc),out:lgR(out-ref),gross:lgR(out),ref:lgR(ref),cp:lgR(cp),xfer:lgR(xfer),net:lgR(inc-(out-ref)),n}};
LG.sumHTML=L=>{const F=LG.flows(L),sg=v=>(v<0?'−':'+')+money(Math.abs(v));let mv={net:0,out:0,inn:0,who:[]};try{const r=txRange();mv=LG.moved(r[0],r[1])}catch(e){}
  const net=lgR(F.net-mv.net);
  let h='<div><span>Money in</span><b class="pos">+'+money(F.inc)+'</b></div><div><span>Money out</span><b>−'+money(Math.max(0,F.out))+'</b></div><div><span>Net</span><b class="'+(net<0?'neg':'pos')+'">'+sg(net)+'</b></div>';
  const notes=[];
  if(Math.abs(mv.net)>0.004)notes.push(mv.net>0?'Net also takes out '+money(mv.net)+' you moved to accounts Sprout can’t see'+(mv.who.length?' ('+esc(mv.who.join(', '))+')':'')+'. That money is still yours, but Sprout can’t see what happened to it. Link those accounts to follow it.':'Net includes '+money(-mv.net)+' that came back from accounts Sprout can’t see.');
  if(F.ref>0.004)notes.push('Refunds of '+money(F.ref)+' lower money out.');
  if(F.cp>0.004)notes.push('Money out includes '+money(F.cp)+' in payments to a card Sprout can’t see. Link that card to see what you actually bought.');
  notes.push('Transfers between your own accounts, including to yourself by Zelle, aren’t counted'+(F.xfer>0.004?' ('+money(F.xfer)+' here)':'')+'.');
  return h+'<p class="lgsumn">'+notes.join(' ')+'</p>'};
{const _rt=renderTx;renderTx=function(){const r=_rt.apply(this,arguments);try{const L=txList(),sum=document.getElementById('tx-sum');if(sum)sum.innerHTML=LG.sumHTML(L);
    // label transfers and refunds in the list, and keep each day's total to what counts
    const box=document.getElementById('tx-list');if(box&&typeof TXV!=='undefined'&&TXV!=='cat'){box.querySelectorAll('.txrow[data-txe]').forEach(b=>{const s=state.spend[+b.dataset.txe];if(!s)return;const sm=b.querySelector('.txt small');if(!sm)return;
        if(s.xt)sm.insertAdjacentHTML('beforeend',' · <span class="lgtag">Between your accounts · not counted</span>');else if(LG.isXfer(s))sm.insertAdjacentHTML('beforeend',' · <span class="lgtag">Card payment · not counted again</span>');
        else if(s.xf==='cp')sm.insertAdjacentHTML('beforeend',' · <span class="lgtag">Card payment</span>');
        else if(LG.isRefund(s))sm.insertAdjacentHTML('beforeend',' · <span class="lgtag">Refund · lowers spending</span>');
        else if(s.paidWith)sm.insertAdjacentHTML('beforeend',' · '+esc(LG.short(s.paidWith)))});
      const days=[];L.forEach(s=>{if(!days.length||days[days.length-1]!==s.d)days.push(s.d)});const hd=box.querySelectorAll('.txday');
      if(hd.length===days.length)hd.forEach((el,i)=>{const sp=el.querySelectorAll('span')[1];if(!sp)return;const F=LG.flows(L.filter(s=>s.d===days[i]));sp.textContent=(F.net<0?'−':'+')+money(Math.abs(F.net))})}}catch(e){}return r}}
// the spending breakdown: refunds come off their category, card payments to linked cards aren't counted twice
TCATS.push(['card','Card payments','#8fb8a4','',null],['p2p','Sent to people','#a9c6e3','',null],['cash','Cash and ATM','#c9d6a3','',null],['loan','Loan payments','#7aa58f','',null],['fees','Fees and interest','#e6a99a','',null]);
LG.TPFD=[[/^FOOD_AND_DRINK_GROCERIES/,'groc'],[/^FOOD_AND_DRINK/,'dine'],[/^TRANSPORTATION/,'gas'],[/^MEDICAL|^PERSONAL_CARE_(?!GYMS)/,'health'],[/ENTERTAINMENT_TV_AND_MOVIES|ENTERTAINMENT_MUSIC|GYMS_AND_FITNESS/,'subs'],[/^ENTERTAINMENT|^TRAVEL/,'fun'],[/^GENERAL_MERCHANDISE/,'shop']];
LG.tcat=s=>{if(s.cat!=='Income'){if(s.xf==='p2p')return'p2p';if(s.xf==='atm')return'cash';if(s.xf==='loan')return'loan';if(s.xf==='fee'||/^BANK_FEES/.test(String(s.pfd||'')))return'fees'}if(s.cat==='Bill')return s.xf==='cp'?'card':'bill';const n=String(s.note||'').toLowerCase(),h=TCATS.find(c=>c[4]&&c[4].test(n));if(h)return h[0];const p=LG.TPFD.find(x=>x[0].test(String(s.pfd||'')));if(p)return p[1];
  if(LG.isRefund(s))return LG.refCat(s)==='Everyday'?'bas':'oth';return s.cat==='Personal'?'oth':'bas'};
renderCats=function(){const all=txList(),box=document.getElementById('tx-list');if(!box)return;
  const L=all.filter(s=>s.cat!=='Income'&&s.cat!=='Skip'&&!LG.isXfer(s)),R=all.filter(LG.isRefund);
  if(!L.length){box.innerHTML='<div class="txempty"><b>No spending in this range</b><p>Try a wider date range above.</p></div>';return}
  const g={};L.forEach(s=>{const k=LG.tcat(s);(g[k]=g[k]||{v:0,n:0,r:0,items:[]});g[k].v+= +s.amt;g[k].n++;g[k].items.push(s)});
  R.forEach(s=>{const k=LG.tcat(s);(g[k]=g[k]||{v:0,n:0,r:0,items:[]});g[k].v-= +s.amt;g[k].r+= +s.amt;g[k].items.push(s)});
  const parts=TCATS.filter(c=>g[c[0]]).map(c=>({k:c[0],name:c[1],c:c[2],v:Math.max(0,lgR(g[c[0]].v)),r:g[c[0]].r,n:g[c[0]].n,items:g[c[0]].items})).filter(p=>p.n>0).sort((a,b)=>b.v-a.v),tot=lgR(parts.reduce((a,p)=>a+p.v,0)),top=parts[0];
  const disc=parts.filter(p=>!/^(bill|card|loan|fees|p2p)$/.test(p.k)),dtop=disc[0],F=LG.flows(all);
  box.innerHTML='<div class="catsum">'+catDonut(parts.filter(p=>p.v>0),Math.max(0.01,tot))+'<div><span>Total spent</span><b>'+money(tot)+'</b><small>'+L.length+' purchase'+(L.length===1?'':'s')+(F.ref>0.004?' · '+money(F.ref)+' refunded':'')+'</small>'+(dtop&&tot>0?'<p>Most went to <b>'+esc(dtop.name.toLowerCase())+'</b>: '+Math.round(dtop.v/tot*100)+'% of the total.</p>':'')+'</div></div>'+
   parts.map(p=>{const open=TXCX===p.k;return '<div class="catr'+(open?' open':'')+'"><button type="button" class="catb" data-txcx="'+p.k+'" aria-expanded="'+open+'"><span class="catic hasico">'+catIcon(p.k==='card'?'bill':p.k)+'</span><span class="catt"><b>'+esc(p.k==='card'?'Payments to cards Sprout can’t see':p.name)+'</b><small>'+p.n+' '+(p.k==='card'?'payment':'purchase')+(p.n===1?'':'s')+(p.r>0.004?' · '+money(p.r)+' refunded':'')+(tot>0?' · '+Math.round(p.v/tot*100)+'%':'')+'</small><i class="catbar"><i style="width:'+(top&&top.v>0?p.v/top.v*100:0).toFixed(1)+'%;background:'+p.c+'"></i></i></span><span class="cata">'+money(p.v)+'</span></button>'+
    (open?'<div class="catlist">'+p.items.sort((a,b)=>b.t-a.t).map(s=>{const rf=LG.isRefund(s);return '<button class="txrow" data-txe="'+s.i+'"><span class="txt"><b>'+esc(s.note||catName(s.cat,s.kind))+'</b><small>'+sdate(s.t)+(s.pending?' · Pending':'')+(rf?' · Refund':'')+'</small></span><span class="txa'+(rf?' pos':'')+'">'+(rf?'+':'−')+money(+s.amt)+'</span></button>'}).join('')+(p.k==='card'?'<p class="lgsumn" style="padding:4px 12px 10px">These are payments from checking to a credit card that isn’t linked. Link the card and Sprout shows what you bought instead.</p>':'')+'</div>':'')+'</div>'}).join('')+
   (F.xfer>0.004?'<p class="lgsumn">Not counted again: '+money(F.xfer)+' in payments to your linked cards. The purchases themselves are counted above.</p>':'')};
// budgets: refunds come off what you spent in that category this month
{const _ms=monthSpend;monthSpend=function(){const out=_ms.apply(this,arguments);try{const mk=fd(realDay()).slice(0,7);
    (state.spend||[]).forEach(s=>{if(!LG.isRefund(s)||String(s.d).slice(0,7)!==mk)return;const hit=BCATS.find(c=>c[3]&&c[3].test(s.note||''))||BR.pfdCat(s.pfd);if(hit&&out[hit[0]]!=null)out[hit[0]]=Math.max(0,out[hit[0]]-(+s.amt||0))})}catch(e){}return out}}
// HIST rows that aren't spending never look like subscriptions (savings transfers, card payments, loans)
subRows=function(){const out=[];(HIST||[]).forEach(h=>{if(+h.a<0&&h.c!=='Skip'&&h.c!=='Income'&&!h.xm&&!/^(cp|loan|save|out|atm|borrow|in|cpin|fee|own|wallet|invest)$/.test(h.x||''))out.push({d:h.d,a:-h.a,m:h.m})});
  (state.spend||[]).forEach(s=>{if(s.tid||s.linked||s.cat==='Income'||s.kind2==='in')return;if(+s.amt>0)out.push({d:s.d,a:+s.amt,m:s.note||''})});
  if(subDemoOn()){const has=new Set();out.forEach(r=>{const k=SUBK.find(z=>z[3].test(r.m));if(k)has.add(k[0])});subDemoRows().forEach(r=>{const k=SUBK.find(z=>z[3].test(r.m));if(k&&!has.has(k[0]))out.push(r)})}return out};
// subscriptions: a known service charged once recently, or the same exact price a month apart, is worth showing
{const _ds=detectSubs;let SUBC2=null;detectSubs=function(){const base=_ds.apply(this,arguments);try{const rows=subRows(),key=rows.length+'|'+base.length+'|'+realDay();if(SUBC2&&SUBC2.k===key)return SUBC2.v;
    const T=realDay(),ids=new Set(base.map(s=>s.id)),G={};rows.forEach(r=>{const kn=SUBK.find(k=>k[3].test(r.m)),id=kn?kn[0]:'m-'+subNorm(r.m).toLowerCase().replace(/[^a-z0-9]+/g,'-');if(!id||id==='m-'||ids.has(id))return;(G[id]=G[id]||{id,kn,raw:r.m,c:[]}).c.push({t:pd(r.d),a:+r.a})});
    const add=[];Object.values(G).forEach(g=>{const c=g.c.sort((x,y)=>x.t-y.t).filter((x,i,a)=>!i||x.t-a[i-1].t>2*MS),last=c[c.length-1];if(!last||T-last.t>40*MS)return;
      if(g.kn&&c.length===1&&last.a<=120){add.push({id:g.id,name:g.kn[1],cat:g.kn[2],price:last.a,cad:'monthly',amt:lgR(last.a),n:1,next:last.t+30*MS,hike:0,known:true,raw:g.raw,last:last.t,once:true});return}
      if(!g.kn&&c.length===2){const gap=(c[1].t-c[0].t)/MS;if(gap>=26&&gap<=35&&Math.abs(c[1].a-c[0].a)<=0.01&&c[1].a<=100&&!/grocer|market|kroger|publix|aldi|walmart|target|costco|shell|chevron|exxon|\bbp\b|gas|fuel|coffee|starbucks|dunkin|restaurant|cafe|pizza|doordash|uber|lyft|amazon|transfer|zelle|venmo|cash app|paypal|atm|withdraw|payment|loan|rent/i.test(g.raw))
        add.push({id:g.id,name:subTitle(subNorm(g.raw)),cat:'Other',price:c[1].a,cad:'monthly',amt:lgR(c[1].a),n:2,next:c[1].t+Math.round(gap)*MS,hike:0,known:false,raw:g.raw,last:c[1].t,maybe:true})}});
    const v=base.concat(add).sort((a,b)=>b.amt-a.amt);SUBC2={k:key,v};return v}catch(e){return base}}}

// ---------- 4. safe to spend: your budget, and what your checking can actually cover ----------
LG.MUST=new Set(['Bill','Affirm','One-time','Debt min']);
LG.cover=(T,A)=>{if(!state.setup||!rows||!rows.length||T!==realToday()||!A||!A.d1)return null;const g=LG.st(),items=rows.items||[],end=A.d1;
  const due=items.filter(x=>(x.t>=T&&x.t<end&&LG.MUST.has(x.g))||(x.reserve&&x.t>=T)).map(x=>({t:x.t,name:x.name,a:+x.a||0,g:x.g})).sort((a,b)=>a.t-b.t);
  let must=due.reduce((s,x)=>s+x.a,0),full=0;
  if(g.payFull)LG.cards().forEach(a=>{const li=((state.link||{}).liab||{})[a.id]||{};if(!li.due||!(+li.stmt>0))return;const t=pd(li.due);if(t<T||t>=end)return;const d=(state.debts||[]).find(x=>x.acct===a.id);
    const mins=due.filter(x=>x.g==='Debt min'&&d&&x.name===d.name).reduce((s,x)=>s+x.a,0);full+=Math.max(0,Math.min(+li.stmt,Math.max(0,+a.cur||0))-mins)});
  must=lgR(must+full);const cash=estCash(),cush=Math.max(0,+((typeof E!=='undefined'&&E&&E.cushion!=null)?E.cushion:state.cushion)||0),cr=LG.credit(),useCr=!!g.useCredit&&cr.avail>0;
  return{cash,must,due,full:lgR(full),cush,credit:cr,useCr,end,days:A.daysLeft,free:lgR(cash-must-cush+(useCr?cr.avail:0))}};
{const _av=availAt;availAt=function(T,sp){const A=_av.apply(this,arguments);try{const C=LG.cover(T,A);if(!C)return A;
    C.todCash=lgR((sp||[]).filter(s=>s.t===T&&(s.cat==='Everyday'||s.cat==='Personal')&&!s.card).reduce((a,s)=>a+ +s.amt,0));
    C.per=Math.max(0,C.free+C.todCash)/C.days;const bud=A.perTotal;A.budget={per:bud,left:A.leftTotal};A.cover=C;
    if(C.per<bud-0.005){['Personal','Everyday'].forEach(c=>{const i=A.info[c],share=bud>0?i.per/bud:0.5;i.per=C.per*share;i.left=i.per-i.tod});A.perTotal=C.per;A.leftTotal=A.info.Personal.left+A.info.Everyday.left;C.capped=true}}catch(e){}
  return A}}
LG.heroSub=A=>{const C=A&&A.cover;if(C&&C.capped)return C.free+C.todCash<=0.004?'Checking can’t cover more before payday · Why?':'Limited by your checking balance · Why?';
  return 'Basics '+money0(Math.max(0,A.info.Everyday.left))+' · Fun '+money0(Math.max(0,A.info.Personal.left))};
TITLES.safe='Safe to spend';
// tapping Safe to spend on Home explains the number (the Budget score beside it keeps its own screen)
document.addEventListener('click',e=>{const h=e.target.closest&&e.target.closest('.ovhero');if(!h||e.target.closest('.ovscore'))return;e.stopImmediatePropagation();e.preventDefault();xOpen('safe')},true);
PAGES.safe=()=>{const sp=(state.spend||[]).map(s=>Object.assign({t:pd(s.d)},s)),T=realToday(),A=availAt(T,sp),C=A.cover,g=LG.st(),np=sdate(A.d1),used=lgR(A.usedToday||0);
  const row=(l,v,cls,sub)=>'<div class="lgr'+(cls?' '+cls:'')+'"><span>'+l+(sub?'<small>'+sub+'</small>':'')+'</span><b>'+v+'</b></div>';
  let h='<div class="xhero"><span class="k">Safe to spend today</span><b class="'+(A.leftTotal<0?'dn':'')+'">'+(A.leftTotal<0?'−'+money(-A.leftTotal):money(Math.max(0,A.leftTotal)))+'</b><span class="d">'+(C&&C.capped?'Your checking balance is the limit today':'Your budget is the limit today')+'</span></div>';
  const B=A.budget||{per:A.perTotal};
  h+='<div class="xcard"><h3>1. Your budget</h3>'+row('Basics and fun for today',money(B.per))+'<small class="xhint">Your monthly budget, spread over the days until '+np+', after what you already spent this pay period.</small></div>';
  if(C){h+='<div class="xcard"><h3>2. What your checking can cover</h3>'+row('Checking right now',money(C.cash),'',state.link&&state.link.live?'From your bank, minus anything you logged since it last synced':'Your latest balance, minus what you logged since')+
      row('Bills and payments due before '+np,'−'+money(C.must-C.full),'',C.due.length?C.due.slice(0,6).map(x=>esc(shortName(x.name))+' '+sdate(x.t)).join(' · ')+(C.due.length>6?' · and '+(C.due.length-6)+' more':''):'Nothing else is due before payday')+
      (C.full>0.004?row('Card balances you pay in full','−'+money(C.full)):'')+row('Safety money you keep','−'+money(C.cush))+
      (C.useCr?row('Card credit you chose to count','+'+money(C.credit.avail),'warn'):'')+
      row('Left to spend until payday',money(C.free+C.todCash),C.free+C.todCash<0?'neg':'')+row('Per day, for '+C.days+' day'+(C.days===1?'':'s'),money(Math.max(0,C.free+C.todCash)/C.days),'tot')+'</div>';
    h+='<div class="xcard"><h3>3. Safe to spend</h3><p class="xhint" style="margin:0 0 8px">The lower of 1 and 2, minus what you spent today.</p>'+row('Lower of the two',money(A.perTotal))+row('Spent today',used>0.004?'−'+money(used):money(0),'',used>0?'Card purchases count too, because they’re money you’ll have to pay back':'')+row('Safe to spend today',A.leftTotal<0?'−'+money(-A.leftTotal):money(A.leftTotal),'tot')+'</div>';
    const cr=C.credit;if(cr.n){h+='<div class="xcard"><h3>Card credit</h3>'+row('Available credit',money(cr.avail),'',cr.limit>0?'Of '+money0(cr.limit)+' in limits':'')+
      '<p class="xhint" style="margin:6px 0 10px">Available credit isn’t your money. Spending it adds to what you owe, and interest can apply if you don’t pay the card in full.</p>'+
      '<label class="srow lgtog"><span class="slab">Count my available credit<small>Off by default. When on, Safe to spend includes card credit you could use.</small></span><input type="checkbox" class="sw" data-lgset="useCredit"'+(g.useCredit?' checked':'')+'></label>'+
      (LG.cards().length?'<label class="srow lgtog"><span class="slab">I pay my cards off in full<small>Sets aside your card statement balance when it’s due before payday.</small></span><input type="checkbox" class="sw" data-lgset="payFull"'+(g.payFull?' checked':'')+'></label>':'')+'</div>'}
    const sv=LG.nw().S;if(sv>0.004)h+='<p class="xhint">Savings ('+money0(sv)+') isn’t counted, so it stays saved. Move money to checking first if you need it.</p>'}
  else h+='<div class="xcard"><p class="xhint" style="margin:0">Finish setup and Sprout checks your budget against your checking balance and the bills due before payday.</p></div>';
  return h+'<div class="row"><button class="btn alt" data-lg="dayplan">See the day-by-day plan</button></div><p class="xhint">Estimates only. Your bank’s numbers are the final word.</p>'};
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.lgset)return;LG.st()[t.dataset.lgset]=!!t.checked;plan();queueSave();if(typeof xRender==='function')xRender();
  toast(t.dataset.lgset==='useCredit'?(t.checked?'Safe to spend now counts your card credit':'Safe to spend uses only your own money'):(t.checked?'Sprout sets aside your card balance before it’s due':'Sprout sets aside your card minimums'))});

// ---------- 5. net worth: what you own minus what you owe, from real balances ----------
LG.nw=()=>{const sav=LG.of('savings'),inv=LG.of('invest');const C=lgR(estCash()),S=sav.length?lgR(sav.reduce((s,a)=>s+LG.bal(a),0)):lgR(Math.max(0,+state.saved||0)),I=lgR(inv.reduce((s,a)=>s+(+a.cur||0),0)),L=lgR(totalDebt()),A=lgR(C+S+I);
  return{C,S,I,A,L,N:lgR(A-L),own:lgR(Math.max(0,C)+Math.max(0,S)+Math.max(0,I))}};
netWorth=function(){return LG.nw()};
LG.snap=()=>{if(!state.setup||LG.demo())return;const g=LG.st(),n=LG.nw(),k=fd(realDay()).slice(0,7);g.nws=g.nws||{};g.nws[k]={c:n.C,s:lgR(n.S+n.I),d:n.L};const ks=Object.keys(g.nws).sort();while(ks.length>36)delete g.nws[ks.shift()]};
LG.mo=d=>({d,m:d.toLocaleDateString('en-US',{timeZone:'UTC',month:'short'}),y:d.getUTCFullYear()});
LG.series=()=>{const n=LG.nw(),now=realDay(),d0=new Date(now),out=[];
  const months=[];for(let i=24;i>=0;i--)months.push(new Date(Date.UTC(d0.getUTCFullYear(),d0.getUTCMonth()-i,1)));
  if(LG.live()){const A=LG.accts(),by={};HIST.forEach(h=>{if(h.p)return;(by[h.ac]=by[h.ac]||[]).push(h)});
    let start=+(state.link.at0||0)||0;A.forEach(a=>{const t=LG.type(a);if(t!=='cash'&&t!=='savings'&&t!=='card')return;const H=by[LG.label(a)];if(H&&H.length){const e=H.reduce((m,h)=>Math.min(m,pd(h.d)),Infinity);start=start?Math.min(start,e):e}});
    let late=-Infinity;A.forEach(a=>{const t=LG.type(a);if(t!=='cash'&&t!=='card')return;const H=by[LG.label(a)];if(H&&H.length)late=Math.max(late,H.reduce((m,h)=>Math.min(m,pd(h.d)),Infinity))});
    const from=isFinite(late)?late:now,manualDebt=(state.debts||[]).filter(d=>!d.acct).reduce((s,d)=>s+(+d.bal||0),0),hasCash=LG.of('cash').length;
    months.forEach((d,i)=>{const last=i===months.length-1,me=Math.min(now,Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0));if(last){out.push(Object.assign(LG.mo(d),{cash:n.C,sav:lgR(n.S+n.I),debt:n.L}));return}
      if(me<from)return;let cash=hasCash?0:n.C,sav=LG.of('savings').length?0:n.S,inv=0,debt=manualDebt;
      A.forEach(a=>{const t=LG.type(a),after=(by[LG.label(a)]||[]).reduce((s,h)=>pd(h.d)>me?s+(+h.a||0):s,0),cur=+a.cur||0;
        if(t==='cash')cash+=cur-after;else if(t==='savings')sav+=cur-after;else if(t==='invest')inv+=cur;else if(t==='card')debt+=Math.max(0,cur+after);else if(t==='loan')debt+=Math.max(0,cur)});
      out.push(Object.assign(LG.mo(d),{cash:lgR(cash),sav:lgR(sav+inv),debt:lgR(debt)}))})}
  else{const g=LG.st(),nws=g.nws||{},k=fd(now).slice(0,7);months.forEach((d,i)=>{const mk=fd(d).slice(0,7),last=i===months.length-1;if(last){out.push(Object.assign(LG.mo(d),{cash:n.C,sav:lgR(n.S+n.I),debt:n.L}));return}const s=nws[mk];if(s&&mk!==k)out.push(Object.assign(LG.mo(d),{cash:s.c,sav:s.s,debt:s.d}))})}
  out.forEach(o=>{o.a=lgR(o.cash+o.sav);o.v=lgR(o.a-o.debt)});return out};
{const _ns=nwSeries;nwSeries=function(){if(LG.demo())return _ns.apply(this,arguments);return LG.series()}}
nwCard=function(){const n=LG.nw(),S=nwSeries(),k=Math.min(12,S.length-1),y=k>0?S[S.length-1].v-S[S.length-1-k].v:0,u='nwc'+(NWN++);let pts=S.slice(-12).map(s=>s.v);if(pts.length<2)pts=[pts[0]||n.N,pts[0]||n.N];
  const mn=Math.min(...pts),mx=Math.max(...pts),rg=Math.max(1,mx-mn),P=pts.map((v,i)=>[i*100/(pts.length-1),30-(v-mn)/rg*26]),own=n.own/Math.max(1,n.own+n.L)*100;
  const pill=k>0?'<em class="nwpill '+(y>=0?'up':'dn')+'">'+(y>=0?'▲ ':'▼ ')+money0(Math.abs(y))+(k>=12?' this year':' since '+S[S.length-1-k].m)+'</em>':'<em class="nwpill">History starts now</em>';
  return '<button class="nwcard" data-x="open" data-v="networth"><div class="nwc1"><div><span class="k">Net worth</span><b class="'+(n.N<0?'dn':'')+'">'+money0(n.N)+'</b>'+pill+'</div>'+
   '<svg viewBox="0 -2 100 36" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent)" stop-opacity=".3"/><stop offset="1" style="stop-color:var(--accent)" stop-opacity="0"/></linearGradient></defs><path d="'+smoothPath(P)+' L100 34 L0 34Z" fill="url(#'+u+')"/><path d="'+smoothPath(P)+'" fill="none" style="stroke:var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg></div>'+
   '<div class="nwbar" aria-hidden="true"><i style="width:'+own.toFixed(1)+'%"></i></div><div class="nwleg"><span><i class="o"></i>Own '+money0(n.own)+'</span><span><i class="w"></i>Owe '+money0(n.L)+'</span><span class="nwgo">See trend ›</span></div></button>'};
{const _nwp=PAGES.networth;PAGES.networth=function(){if(LG.demo())return _nwp.apply(this,arguments);
  const n=LG.nw(),all=nwSeries(),H=all.slice(-(NWR+1)),f=H[0],l=H[H.length-1],has=H.length>=2,live=LG.live();
  const dDebt=has?f.debt-l.debt:0,dCash=has?l.cash-f.cash:0,dSav=has?l.sav-f.sav:0,ch=has?l.v-f.v:0;
  const drv=[['Debt '+(dDebt>=0?'paid down':'added'),dDebt,'#2fae5a'],['Checking',dCash,'#7fcf9c'],['Savings and investing',dSav,'#b5e4c6']].filter(r=>Math.abs(r[1])>=1),mxd=Math.max(1,...drv.map(r=>Math.abs(r[1])));
  const own=[];if(live){LG.of('cash').forEach(a=>own.push([LG.label(a),LG.bal(a),'From your bank']));if(!LG.of('cash').length)own.push(['Checking',n.C,'Your latest balance'])}else own.push(['Checking',n.C,'Your latest balance, minus what you logged since']);
  if(live&&LG.of('cash').length&&Math.abs(n.C-LG.of('cash').reduce((s,a)=>s+LG.bal(a),0))>0.004)own.push(['Logged since your last sync',lgR(n.C-LG.of('cash').reduce((s,a)=>s+LG.bal(a),0)),'Spending you added by hand']);
  if(LG.of('savings').length)LG.of('savings').forEach(a=>own.push([LG.label(a),LG.bal(a),'Savings, from your bank']));else if(n.S>0)own.push(['Savings',n.S,'What you’ve put away']);
  LG.of('invest').forEach(a=>own.push([LG.label(a),+a.cur||0,'Investments, from your bank']));
  const debts=(state.debts||[]).filter(d=>+d.bal>0).slice().sort((a,b)=>b.bal-a.bal),G=Math.max(1,n.own+n.L);
  return '<div class="nwhero"><span class="k">Net worth</span><b class="'+(n.N<0?'dn':'')+'">'+money0(n.N)+'</b>'+
    '<div class="nwhl">'+(has?'<em class="nwpill '+(ch>=0?'up':'dn')+'">'+(ch>=0?'▲ ':'▼ ')+money0(Math.abs(ch))+' since '+f.m+' '+f.y+'</em>':'<em class="nwpill">History starts now</em>')+'<span>You own '+money0(n.A)+' · You owe '+money0(n.L)+'</span></div></div>'+
   (has?nwChart(NWR):'<div class="xcard"><h3>Over time</h3><p class="xhint" style="margin:0">'+(live?'Sprout needs a little more transaction history to show a trend. It fills in as your bank sends it.':'Sprout records your net worth each month from here on. Check back next month to see your first trend.')+'</p></div>')+
   (drv.length?'<div class="xcard"><h3>What moved it</h3><small class="xhint" style="margin-top:-6px">Since '+f.m+' '+f.y+' · '+sgn(ch)+' total</small>'+drv.map(r=>'<div class="nwdrv"><span>'+r[0]+'</span><div class="nwdb"><i class="'+(r[1]<0?'neg':'')+'" style="width:'+Math.max(3,Math.abs(r[1])/mxd*100).toFixed(0)+'%;'+(r[1]<0?'':'background:'+r[2])+'"></i></div><b class="'+(r[1]>=0?'up':'dn')+'">'+sgn(r[1])+'</b></div>').join('')+'</div>':'')+
   '<div class="xcard"><h3>Own vs owe</h3><div class="nwstack" role="img" aria-label="You own '+money0(n.own)+' and owe '+money0(n.L)+'">'+[['own',n.own,'#2fae5a']].concat(debts.map((d,i)=>[d.name,+d.bal,['#e48a7a','#eda394','#f3bdb1','#f7d3ca'][i%4]])).filter(p=>p[1]>0).map(p=>'<i style="flex:'+Math.max(.6,p[1]/G*100).toFixed(2)+';background:'+p[2]+'"></i>').join('')+'</div>'+
    '<div class="nwsplit"><div><span>You own</span><b>'+money0(n.A)+'</b></div><div style="text-align:right"><span>You owe</span><b>'+money0(n.L)+'</b></div></div>'+
    (n.L>0?'<p class="nwtip">'+(n.N<0?'You owe '+money0(n.L-n.A)+' more than you own. Every payment on a debt moves this toward $0.':'You own more than you owe. Paying down debt grows this the same as saving.')+'</p>':'<p class="nwtip">No debt. Everything you own is yours.</p>')+'</div>'+
   '<div class="xcard"><h3>What you own</h3>'+own.map(p=>'<div class="xrow"><span class="xi" style="background:#2fae5a33;color:var(--good)">$</span><div class="xt"><b>'+esc(p[0])+'</b><small>'+p[2]+'</small></div><div class="xr'+(p[1]<0?' dn':'')+'">'+money0(p[1])+'</div></div>').join('')+'</div>'+
   (debts.length?'<div class="xcard"><h3>What you owe</h3>'+debts.map(d=>'<div class="xrow"><span class="xi">'+ini(d.name)+'</span><div class="xt"><b>'+esc(d.name)+'</b><small>'+(d.acct?'From your bank':'Typed in')+(+d.apr>0?' · '+d.apr+'% APR':'')+(+d.limit>0?' · '+money0(Math.max(0,d.limit-d.bal))+' available':'')+'</small></div><div class="xr dn">−'+money0(d.bal)+'</div></div>').join('')+'</div>':'')+
   '<p class="xhint">'+(live?'Today’s balances come from your bank through Plaid'+(state.link.at?', last synced '+agoTxt(state.link.at):'')+'. Past months are worked out from your transactions. Loans and investments show today’s balance for past months.':'Based on the balances you entered. Past months are what Sprout recorded each month.')+' Estimates only. Your statements are the final word.</p>'}}

// ---------- 6. a gentle nudge to link the card that tells the real spending story ----------
LG.cardSignal=()=>{const cut=fd(realDay()-45*MS),cp=(state.spend||[]).filter(s=>s.xf==='cp'&&!s.card&&!s.xm&&s.d>=cut).reduce((a,s)=>a+ +s.amt,0),typed=(state.debts||[]).some(d=>!d.acct&&LG.cardish(d));return{cp:lgR(cp),typed}};
LG.CARD='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18M7 15h3"/></svg>';
LG.nudge=()=>{if(!LG.live()||LG.cards().length)return '';const g=LG.st();if(g.noCard||(g.cardSnooze&&Date.now()<g.cardSnooze))return '';const sg=LG.cardSignal();if(!sg.cp&&!sg.typed)return '';
  return '<div class="lgnudge" role="region" aria-label="Link your credit card"><div class="lgn1"><span class="lgnic">'+LG.CARD+'</span><div><b>Add your credit card</b><p>'+(sg.cp?'You paid '+money0(sg.cp)+' to a card in the last 6 weeks, but Sprout can’t see what you bought with it.':'Card purchases aren’t showing up yet.')+' Linking it keeps your spending, Safe to spend and net worth exact.</p></div></div>'+
   '<div class="lgnb"><button type="button" class="sbtn" data-lg="addcard">Link a card</button><button type="button" class="sbtn alt" data-lg="snooze">Not now</button></div><button type="button" class="lnk lgnno" data-lg="nocard">I don’t use a credit card</button></div>'};
{const _lc=leftCard;leftCard=function(){let x='';try{x=LG.nudge()}catch(e){}return x+_lc.apply(this,arguments)}}
// in the first connect flow: ask once about cards before finishing
{const _r=lkRender;lkRender=function(){const out=_r.apply(this,arguments);try{if(LK&&LK.live&&LK.step==='found'&&LK.data&&!(LK.data.accts||[]).some(a=>a.kind==='card')&&!LG.st().noCard){const B=$('#lk-body');if(B&&B!==DUMMY&&!B.querySelector('.lgnudge'))B.insertAdjacentHTML('afterbegin','<div class="lgnudge"><div class="lgn1"><span class="lgnic">'+LG.CARD+'</span><div><b>Do you use a credit card?</b><p>Card spending tells the real story of where money goes. Link it too, and Sprout counts purchases the day you make them and never counts the card payment twice.</p></div></div><div class="lgnb"><button type="button" class="sbtn" data-lg="addcard">Link a card</button><button type="button" class="sbtn alt" data-lg="nocard">I don’t have one</button></div></div>')}}catch(e){}return out}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lg]');if(!b)return;const a=b.dataset.lg,g=LG.st();
  if(a==='addcard'){e.preventDefault();if(liveBank&&liveBank()){if($('#sh-link').hidden){LV.open().then(()=>LV.add())}else LV.add()}else lkOpen()}
  else if(a==='snooze'){g.cardSnooze=Date.now()+14*864e5;queueSave();plan();toast('Okay. Sprout will ask again in two weeks.')}
  else if(a==='nocard'){g.noCard=1;queueSave();const n=b.closest('.lgnudge');if(n)n.remove();plan();toast('Got it. No more card reminders.')}
  else if(a==='dayplan'){closeSheets();setTimeout(()=>openFocus('#t-hero'),closeSheetsDelay?closeSheetsDelay()+20:300)}
  else if(a==='twinyes'||a==='twinno'){const L=state.link||{},tw=(L.twins||[])[+b.dataset.v];if(!tw)return;if(a==='twinyes'){const i=(state.debts||[]).findIndex(d=>d.name===tw.debt&&!d.acct);if(i>=0)state.debts.splice(i,1);toast('Removed the typed-in copy. Your bank keeps it up to date now.')}else toast('Kept both');
    L.twins.splice(+b.dataset.v,1);plan();queueSave();if(typeof xRender==='function')xRender()}});
// the same debt typed in by hand and linked from the bank: ask before counting it twice
TITLES.lgtwin='Same account?';
PAGES.lgtwin=()=>{const L=state.link||{},T=L.twins||[];if(!T.length)return '<div class="xcard"><p class="xhint" style="margin:0">All set. Nothing is counted twice.</p></div>';
  return T.map((tw,i)=>{const d=(state.debts||[]).find(x=>x.name===tw.debt&&!x.acct),a=LG.accts().find(x=>x.id===tw.acct);if(!d||!a)return '';
    return '<div class="xcard"><h3>Is this the same account?</h3><div class="xrow"><div class="xt"><b>'+esc(d.name)+'</b><small>Typed in · '+money0(d.bal)+'</small></div></div><div class="xrow"><div class="xt"><b>'+esc(LG.label(a))+'</b><small>From your bank · '+money0(Math.max(0,+a.cur||0))+'</small></div></div>'+
      '<p class="xhint">If they’re the same, Sprout keeps the bank’s copy so the balance stays current and isn’t counted twice.</p><div class="row"><button class="btn" data-lg="twinyes" data-v="'+i+'">Yes, same account</button><button class="btn alt" data-lg="twinno" data-v="'+i+'">No, they’re different</button></div></div>'}).join('')};
{const _al=alerts;alerts=function(){const A=_al.apply(this,arguments);try{const T=((state.link||{}).twins||[]).filter(tw=>(state.debts||[]).some(d=>d.name===tw.debt&&!d.acct));if(T.length)A.unshift({id:'lgtwin',t:'Is “'+T[0].debt+'” counted twice?',s:'It looks like the same account you just linked. Tap to check.',go:['lgtwin']})}catch(e){}return A}}

// ---------- 7. paid with: card purchases you log or scan count as spending, not as cash leaving checking ----------
LG.payOpts=()=>{const o=[['chk','Checking or debit']],seen=new Set();
  LG.cards().forEach(a=>{const d=(state.debts||[]).find(x=>x.acct===a.id),nm=d?d.name:LG.label(a);if(seen.has(nm))return;seen.add(nm);o.push(['c:'+nm,LG.short(nm)])});
  (state.debts||[]).forEach(d=>{if(d.acct||seen.has(d.name)||!LG.cardish(d))return;seen.add(d.name);o.push(['c:'+d.name,LG.short(d.name)])});return o};
LG.applyPaid=(e,pw)=>{if(!e||!pw||pw==='chk')return;const nm=pw.slice(2),d=(state.debts||[]).find(x=>x.name===nm);e.card=true;e.paidWith=nm;if(d&&!d.acct){d.bal=lgR((+d.bal||0)+(+e.amt||0));e.cardDebt=nm}};
LG.unpaid=e=>{if(!e||!e.cardDebt)return;const d=(state.debts||[]).find(x=>x.name===e.cardDebt);if(d&&!d.acct)d.bal=lgR(Math.max(0,(+d.bal||0)-(+e.amt||0)))};
LG.pwHTML=(id)=>{const o=LG.payOpts();if(o.length<2)return '';if(!o.some(x=>x[0]===LG.pw))LG.pw='chk';
  return '<div class="lgpaid" id="'+id+'"><span>Paid with</span><div class="wchips">'+o.map(x=>'<button type="button" class="wchip'+(LG.pw===x[0]?' on':'')+'" data-lgpw="'+esc(x[0])+'">'+esc(x[1])+'</button>').join('')+'</div></div>'};
LG.pwSync=()=>{const f=document.getElementById('sp-form');if(!f)return;const old=document.getElementById('sp-paid');if(old)old.remove();const h=LG.pwHTML('sp-paid');if(!h)return;const seg=f.querySelector('.seg');if(seg)seg.insertAdjacentHTML('afterend',h);
  const dirIn=f.querySelector('.seg [data-dir="in"].on');const p=document.getElementById('sp-paid');if(p)p.hidden=!!dirIn};
{const _os=openSheet;openSheet=function(id){if(id==='sh-spend'){try{const g=LG.st();LG.pw=g.lastPaid||'chk';LG.pwSync()}catch(e){}}return _os.apply(this,arguments)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lgpw]');if(b){e.preventDefault();LG.pw=b.dataset.lgpw;b.parentElement.querySelectorAll('.wchip').forEach(x=>x.classList.toggle('on',x===b));return}
  const d=e.target.closest&&e.target.closest('#sp-form .seg [data-dir]');if(d)setTimeout(()=>{const p=document.getElementById('sp-paid');if(p)p.hidden=d.dataset.dir==='in'},0)});
{const _ls=logSpend;logSpend=function(cat){const n=(state.spend||[]).length,r=_ls.apply(this,arguments);try{if(state.spend&&state.spend.length>n){const e=state.spend[state.spend.length-1];if(cat!=='Income'&&LG.pw!=='chk'){LG.applyPaid(e,LG.pw);plan();queueSave();if(txOpen)renderTx()}LG.st().lastPaid=LG.pw}}catch(err){}return r}}
document.addEventListener('click',e=>{const dl=e.target.closest&&e.target.closest('[data-txdel]');if(dl&&dl.dataset.arm){LG.unpaid(state.spend[+dl.dataset.txdel])}
  const sv=e.target.closest&&e.target.closest('[data-txsave]');if(sv){const s=state.spend[+sv.dataset.txsave];if(s&&s.cardDebt){const before=+s.amt;setTimeout(()=>{const dlt=lgR((+s.amt||0)-before);if(Math.abs(dlt)>0.004){const d=(state.debts||[]).find(x=>x.name===s.cardDebt&&!x.acct);if(d){d.bal=lgR(Math.max(0,(+d.bal||0)+dlt));plan();queueSave()}}},0)}}},true);
// screenshots and recordings: one "paid with" for the batch
{const _sr=scRender;scRender=function(){const r=_sr.apply(this,arguments);try{if(SC.step==='review'&&SC.items.some(i=>i.st==='new'&&i.cat!=='Income')){const B=$('#sc-body');if(B&&B!==DUMMY&&!B.querySelector('#sc-paid')){const h=LG.pwHTML('sc-paid');if(h){const at=B.querySelector('.sch');if(at)at.insertAdjacentHTML('beforebegin',h);else B.insertAdjacentHTML('afterbegin',h)}}}}catch(e){}return r}}
{const _lol=logOrLink;logOrLink=function(e,info){const r=_lol.apply(this,arguments);try{if(LG.scanPaid&&r&&r.st==='new'&&r.s&&r.s.cat!=='Income')LG.applyPaid(r.s,LG.scanPaid)}catch(err){}return r}}
{const _sc=scCommit;scCommit=function(){LG.scanPaid=document.getElementById('sc-paid')?LG.pw:null;try{return _sc.apply(this,arguments)}finally{if(LG.scanPaid){LG.st().lastPaid=LG.pw;plan();queueSave()}LG.scanPaid=null}}}
{const _sopen=scanOpen;scanOpen=function(){try{LG.pw=LG.st().lastPaid||'chk'}catch(e){}return _sopen.apply(this,arguments)}}

// ---------- 8. screen recordings: pick out still frames, then read them like screenshots ----------
LG.vidFrames=async(file,max)=>{const url=URL.createObjectURL(file),v=document.createElement('video');v.muted=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';v.src=url;
  try{await new Promise((ok,no)=>{v.onloadeddata=ok;v.onerror=()=>no(new Error('video'));setTimeout(()=>no(new Error('timeout')),20000)});try{await v.play();v.pause()}catch(e){}
    const dur=Math.min(+v.duration||0,180);if(!(dur>0)||!v.videoWidth)throw new Error('video');
    const W=Math.min(1080,v.videoWidth),H=Math.round(v.videoHeight*W/v.videoWidth),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
    const s=document.createElement('canvas');s.width=24;s.height=48;const sg=s.getContext('2d',{willReadFrequently:true});
    const seek=t=>new Promise(ok=>{const done=()=>{v.removeEventListener('seeked',done);ok()};v.addEventListener('seeked',done);v.currentTime=t;setTimeout(done,3000)});
    const n=Math.min(40,Math.max(4,Math.ceil(dur/0.7))),got=[];let prev=null;
    for(let i=0;i<n;i++){await seek(Math.min(dur-0.05,(i+0.5)*dur/n));g.drawImage(v,0,0,W,H);sg.drawImage(c,0,0,24,48);const px=sg.getImageData(0,0,24,48).data,sig=new Uint8Array(24*48);for(let k=0;k<sig.length;k++)sig[k]=(px[k*4]+px[k*4+1]+px[k*4+2])/3;
      let diff=1;if(prev){let t=0;for(let k=0;k<sig.length;k++)t+=Math.abs(sig[k]-prev[k]);diff=t/sig.length/255}
      if(diff>=0.045){prev=sig;got.push(await new Promise(r=>c.toBlob(b=>r(b),'image/jpeg',0.85)))}}
    const keep=got.filter(Boolean);if(keep.length<=max)return keep;const out=[];for(let i=0;i<max;i++)out.push(keep[Math.round(i*(keep.length-1)/(max-1))]);return out}
  finally{try{URL.revokeObjectURL(url)}catch(e){}}};
document.addEventListener('change',async e=>{const t=e.target;if(!t||t.id!=='sc-file')return;const fs=[...(t.files||[])],vid=fs.find(f=>/^video\//.test(f.type));if(!vid)return;e.stopImmediatePropagation();t.value='';
  SC.imgs=[];SC.step='read';SC.vid=true;scRender();let frames=[];try{frames=await LG.vidFrames(vid,8)}catch(err){frames=[]}
  if(!frames.length){SC.step='review';SC.items=[];SC.note='Sprout couldn’t read that recording. Try screenshots instead, or a shorter recording.';SC.vid=false;scRender();return}
  const imgs=fs.filter(f=>/^image\//.test(f.type));await scRead(frames.concat(imgs).slice(0,8));SC.vid=false},true);
// a recording shows the same row in several frames: keep each transaction once
{const _li=scLoadItems;scLoadItems=function(items,note){try{if(Array.isArray(items)&&items.length>1){const seen=new Set();items=items.filter(i=>{const k=i.d+'|'+(+i.amt).toFixed(2)+'|'+i.dir+'|'+String(i.name||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,16);if(seen.has(k))return false;seen.add(k);return true})}}catch(e){}return _li.call(this,items,note)}}

// ---------- 8b. several screenshots: each one is read on its own, so a long list never gets cut off, then they're merged ----------
scRead=async function(files){if(!files.length)return;SC.imgs=files.slice(0,8).map(f=>({f,url:URL.createObjectURL(f)}));SC.step='read';scRender();
  if(!scanAI()){await new Promise(r=>setTimeout(r,900));scLoadItems([],'Reading real screenshots needs Sprout’s AI, which isn’t available in this view. Try one of the examples.');return}
  const batch=Math.random().toString(36).slice(2,10)+Date.now().toString(36),out=[],notes=[],n=SC.imgs.length;let bad=0,lim='',done=0,k=0;
  const one=async i=>{try{const blob=await shrink(SC.imgs[i].f);const res=await sampleFn.json(SCAN_PROMPT+'\n\ntodayRealDate: '+fd(realDay()),{modelTier:'default',cache:false,images:[blob],batch,part:i});
      (Array.isArray(res&&res.items)?res.items:[]).forEach(x=>out.push(x));if(res&&res.note)notes.push(String(res.note))}
    catch(e){bad++;const m=String(e&&e.message||'');if(/limit|Plus|resting|access code/i.test(m))lim=m}
    finally{done++;const r=document.querySelector('#sc-body .scread small');if(r&&n>1)r.textContent='Read '+done+' of '+n+' screenshots'}};
  const run=async()=>{while(k<n){const i=k++;await one(i)}};await Promise.all([run(),run(),run()]);
  if(!out.length&&bad){SC.step='review';SC.items=[];SC.note=lim||'That didn’t go through. Try again in a moment.';scRender();return}
  const its=out.filter(i=>i&&isNum(+i.amount)&&+i.amount>0).slice(0,80).map(i=>({d:isDate(i.date)?i.date:fd(realDay()),amt:Math.round(+i.amount*100)/100,dir:i.direction==='in'?'in':'out',name:String(i.name||'Purchase').slice(0,48),via:WNAME[i.app]?i.app:null,kind:i.app==='receipt'?'receipt':(WNAME[i.app]?'p2p':''),who:WNAME[i.app]?String(i.name||''):'',memo:String(i.memo||'').slice(0,40),status:i.status,type:i.type,prov:String(i.provider||'').slice(0,24),plan:String(i.plan||'').slice(0,12)}));
  scLoadItems(its,(bad?bad+' of '+n+' screenshots couldn’t be read, so try those again. ':'')+(its.length?'':notes[0]||''))};
// upcoming payments (pay-later installments, autopays due later) go into the plan, not into spending
LG.isPlanItem=it=>!!(it&&!it.skip&&it.dir!=='in'&&(it.type==='scheduled'||(isDate(it.d)&&pd(it.d)>realDay())));
{const _scc=scClassify;scClassify=function(){const r=_scc.apply(this,arguments);try{SC.items.forEach(it=>{if(!LG.isPlanItem(it))return;const p=it.prov||'';it.pname=((p&&String(it.name).toLowerCase().indexOf(p.toLowerCase())<0?p+' · ':'')+it.name).slice(0,48);
    it.st=(state.sched||[]).some(s=>s.d===it.d&&Math.abs(+s.amt-it.amt)<=0.01)?'planned':'plan'})}catch(e){}return r}}
{const _sr2=scRender;scRender=function(){const r=_sr2.apply(this,arguments);try{if(SC.step!=='review')return r;const B=$('#sc-body');if(!B||B===DUMMY)return r;
    const P=SC.items.map((it,k)=>[it,k]).filter(x=>x[0].st==='plan'),Q=SC.items.filter(it=>it.st==='planned');if(!P.length&&!Q.length)return r;
    const empty=B.querySelector('.scread');if(empty&&!SC.items.some(i=>i.st==='new'||i.st==='link'))empty.remove();
    const h='<div class="lgplan"><h4 class="sch">Upcoming payments</h4><p class="note" style="margin:0 0 6px">These haven’t happened yet, so Sprout adds them to your plan instead of your spending, and sets the money aside before each due date.</p>'+
      P.map(([it,k])=>'<div class="scrow'+(it.off?' off':'')+'"><span class="scico">'+esc(String(it.pname||it.name).slice(0,1).toUpperCase())+'</span><div class="sct"><b>'+esc(it.pname||it.name)+'</b><small>Due '+sdate(pd(it.d))+(it.plan?' · Payment '+esc(it.plan):'')+'</small></div><div class="sca">−'+money(it.amt)+'<button type="button" class="scx" data-scoff="'+k+'" aria-label="'+(it.off?'Include':'Leave out')+' '+esc(it.pname||it.name)+'">'+(it.off?'Undo':'×')+'</button></div></div>').join('')+
      (Q.length?'<p class="note" style="margin:6px 0 0">'+Q.length+' already in your plan, so '+(Q.length===1?'it isn’t':'they aren’t')+' added again.</p>':'')+'</div>';
    const row=B.querySelector('.row [data-scgo]');if(row)row.closest('.row').insertAdjacentHTML('beforebegin',h);else B.insertAdjacentHTML('beforeend',h);
    const go=B.querySelector('[data-scgo]'),nN=SC.items.filter(i=>i.st==='new'&&!i.off).length,nP=P.filter(x=>!x[0].off).length;
    if(go&&nP)go.textContent=nN?'Add '+nN+' transaction'+(nN>1?'s':'')+' and '+nP+' upcoming':'Add '+nP+' upcoming payment'+(nP>1?'s':'')+' to your plan'}catch(e){}return r}}
{const _sc2=scCommit;scCommit=function(){const P=SC.items.filter(it=>it.st==='plan'&&!it.off),r=_sc2.apply(this,arguments);try{if(P.length){state.sched=state.sched||[];
    const added=P.map(it=>({d:it.d,name:(it.pname||it.name)+(it.plan?' ('+it.plan+')':''),group:'Affirm',amt:it.amt,reserve:false}));added.forEach(x=>state.sched.push(x));editors();plan();queueSave();
    const nN=SC.items.filter(i=>i.st==='new'&&!i.off).length;toastAct(nN?nN+' transaction'+(nN>1?'s':'')+' and '+P.length+' payment'+(P.length>1?'s':'')+' added':P.length+' payment'+(P.length>1?'s':'')+' added to your plan','Undo',()=>{state.sched=state.sched.filter(x=>added.indexOf(x)<0);editors();plan();queueSave();toast('Undone')})}}catch(e){}return r}}

// ---------- 9. messages are off: posts and comments stay, private messages are gone ----------
dmUnread=function(){return 0};
PAGES.inbox=()=>'<div class="xcard"><h3>Messages are off</h3><p class="xhint" style="margin:0">Private messages aren’t part of Sprout. You can still post, comment and cheer in Community.</p></div>';
PAGES.chat=PAGES.inbox;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x="dm"],[data-x="dmnew"],[data-x="inbox"]');if(b){e.stopImmediatePropagation();e.preventDefault();toast('Private messages aren’t part of Sprout')}},true);

// ---------- 10. your plan backed up on your server, so a new phone or a fresh sign-in keeps your streak ----------
LG.dev=()=>{try{let d=localStorage.getItem('sprout-dev');if(!d){d=Math.random().toString(36).slice(2,12);localStorage.setItem('sprout-dev',d)}return d}catch(e){return 'x'}};
LG.acctKey=async()=>{const a=(typeof acctMe==='function'?acctMe():null)||{},em=String(a.email||'').trim().toLowerCase();if(!em)return '';const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('sprout-backup:'+em));return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32)};
LG.pack=async()=>{const raw=new TextEncoder().encode(JSON.stringify({v:1,at:Date.now(),s:state,h:HIST}));if(typeof CompressionStream!=='undefined'){try{const buf=await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();return 'G:'+b64e(new Uint8Array(buf))}catch(e){}}return 'J:'+b64e(raw)};
LG.unpack=async t=>{t=String(t||'');if(t.indexOf('G:')===0){const buf=await new Response(new Blob([b64d(t.slice(2))]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();return JSON.parse(new TextDecoder().decode(buf))}if(t.indexOf('J:')===0)return JSON.parse(new TextDecoder().decode(b64d(t.slice(2))));return null};
LG.bk={t:null,busy:false,pulled:false};
LG.push=async()=>{if(!LIVE.on||!liveOK()||!state.setup||LG.st().bkOff||LG.bk.busy||!LG.bk.pulled)return;LG.bk.busy=true;try{const acct=await LG.acctKey();if(!acct)return;const data=await LG.pack();if(data.length>880000)return;const s=SK();
    const j=await liveFetch('/api/state',{op:'put',acct,data,at:Date.now(),dev:LG.dev(),stk:{run:s.run,best:s.best,last:s.last}},{timeout:20000});if(j&&j.ok)LG.st().bkAt=Date.now()}catch(e){}finally{LG.bk.busy=false}};
LG.queue=()=>{clearTimeout(LG.bk.t);LG.bk.t=setTimeout(()=>{LG.push()},12000)};
{const _q=queueSave;queueSave=function(){const r=_q.apply(this,arguments);try{if(LIVE.on)LG.queue()}catch(e){}return r}}
if(LIVE.on)document.addEventListener('visibilitychange',()=>{if(document.hidden&&LG.bk.t){clearTimeout(LG.bk.t);LG.bk.t=null;LG.push()}});
LG.pull=async()=>{if(LG.bk.pulled||!LIVE.on||!liveOK())return;try{const acct=await LG.acctKey();if(!acct)return;const j=await liveFetch('/api/state',{op:'get',acct},{timeout:20000});if(!j||!j.ok)return;LG.bk.pulled=true;if(j.none||!j.data)return LG.queue();
    const d=await LG.unpack(j.data);if(!d||!d.s)return;
    if(!state.setup&&d.s.setup){state=merge(d.s);if(Array.isArray(d.h)){HIST=d.h;histSave()}editors();plan();queueSave();toast('Welcome back. Your plan and streak are restored.');return}
    // keep the better streak: the same streak that has moved further, or one that was lost on this phone
    const rs=d.s.stk,ls=state.stk;if(rs&&typeof rs==='object'&&(!ls||((rs.last||'')>=(ls.last||'')&&(+rs.run||0)>(+ls.run||0))||(+rs.best||0)>(+(ls&&ls.best)||0))){
      const keep=ls&&(+ls.run||0)>=(+rs.run||0)&&(ls.last||'')>=(rs.last||'');if(!keep){state.stk=rs;if(d.s.checkin)state.checkin=d.s.checkin}else state.stk.best=Math.max(+ls.best||0,+rs.best||0);plan();queueSave();if(!keep)toast('Your streak is back')}
    else LG.queue()}catch(e){LG.bk.pulled=true}};
{let n=0;const tick=async()=>{if(!(document.body&&document.body.classList.contains('ready'))||typeof acctMe!=='function'||!acctMe()){if(++n<240)setTimeout(tick,500);return}await LIVE.ready;if(liveOK())LG.pull();else LG.bk.pulled=true};if(LIVE.on)setTimeout(tick,1500)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=acctdelgo]');if(!b||!LIVE.on||!liveOK())return;LG.acctKey().then(acct=>{if(acct)liveFetch('/api/state',{op:'delete',acct})}).catch(()=>{})},true);
{const _ps=PAGES.server;PAGES.server=function(){const h=_ps.apply(this,arguments);if(!liveOK())return h;const g=LG.st();
  return h+'<div class="xcard"><h3>Backup</h3><label class="srow lgtog"><span class="slab">Back up my plan to my server<small>'+(g.bkOff?'Off. Your plan lives only on this phone.':'Encrypted. Keeps your plan, history and streak if you sign in on a new phone.'+(g.bkAt?' Last backup '+agoTxt(g.bkAt)+'.':''))+'</small></span><input type="checkbox" class="sw" data-lgbk'+(g.bkOff?'':' checked')+'></label></div>'}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.hasAttribute||!t.hasAttribute('data-lgbk'))return;const g=LG.st();g.bkOff=!t.checked;queueSave();
  if(g.bkOff){LG.acctKey().then(acct=>{if(acct)liveFetch('/api/state',{op:'delete',acct})});toast('Backup off. The copy on your server was deleted.')}else{LG.bk.pulled=true;LG.push();toast('Backup on')}if(typeof xRender==='function')xRender()});

// keep ledger facts current whenever the plan is recalculated
{const _pl=plan;plan=function(){const r=_pl.apply(this,arguments);try{LG.snap()}catch(e){}return r}}
try{if(window.__S)window.__S.LG=LG}catch(e){}
