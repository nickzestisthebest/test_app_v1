// ===================== Home 3, Money Pulse scores, and insights you can rate =====================
// Home, in this order: your streak, today's plan, the top insight, safe to spend today, safe to spend this month.
const INS={},PULSE={};
{
const r2=MX.r2;
// ---------- insights you can dismiss and rate; Sprout learns from it ----------
INS.g=()=>{const g=LG.st();g.insfb=g.insfb||{};g.insmute=g.insmute||{};g.inskey=g.inskey||{};return g};
INS.kind=i=>i.k||String(i.id||'').replace(/^br/,'').replace(/[-:].*$/,'')||'x';
// the place an insight is about, so "this was normal" quiets the same thing at the same place
INS.place=i=>{const m=String(i.t||'').match(/\b(?:at|from|on|to)\s+(.+?)\s*$/i);return m?m[1].toLowerCase().replace(/[^a-z0-9 ]/g,'').trim().slice(0,30):''};
INS.key=i=>INS.kind(i)+'|'+INS.place(i);
// what people said about this kind of insight before
INS.stats=k=>{const g=INS.g(),s={useful:0,not:0,wrong:0,normal:0};Object.values(g.insfb).forEach(f=>{if(f.k===k&&s[f.v]!=null)s[f.v]++});return s};
INS.ok=i=>{const g=INS.g(),k=INS.kind(i);if(g.insfb[i.id])return false;if(g.insmute[k])return false;if(g.inskey[INS.key(i)])return false;
  const s=INS.stats(k);if(s.not+s.wrong>=3&&s.useful===0)return false;return true};
// learn from feedback: not useful or wrong pushes a kind down, useful pulls it up
INS.rank=i=>{const s=INS.stats(INS.kind(i));return (s.useful*2)-(s.not+s.wrong*2)};
INS.LBL={useful:'Useful',not:'Not useful',normal:'This was normal',wrong:'This is wrong',hide:'Hide'};
INS.set=(id,v,i)=>{const g=INS.g(),k=i?INS.kind(i):'x';g.insfb[id]={v:v==='hide'?'not':v,k,at:Date.now(),t:i?String(i.t||'').slice(0,80):''};
  if(v==='normal'&&i)g.inskey[INS.key(i)]=Date.now();
  if(v==='wrong'&&i){g.inswrong=(g.inswrong||[]).slice(-30);g.inswrong.push({id,t:String(i.t||'').slice(0,80),s:String(i.s||'').slice(0,120),at:Date.now()})}
  try{X().dis[id]=v!=='useful'?1:X().dis[id]}catch(e){}queueSave()};
INS.undo=id=>{const g=INS.g(),f=g.insfb[id];delete g.insfb[id];try{delete X().dis[id]}catch(e){}if(f)Object.keys(g.inskey).forEach(k=>{if(Math.abs(g.inskey[k]-f.at)<5)delete g.inskey[k]});queueSave()};
INS.all=()=>{let I=[];try{I=SP.top0()}catch(e){}return I.filter(INS.ok).sort((a,b)=>INS.rank(b)-INS.rank(a))};
if(typeof SP!=='undefined'){SP.top0=SP.top;SP.top=()=>INS.all()}
// the little menu on each insight
INS.menu=(i,cls)=>'<div class="insm'+(cls?' '+cls:'')+'" data-insid="'+esc(i.id)+'"><button type="button" class="insb" data-ins="useful" aria-label="Useful">'+ic('check')+'Useful</button><button type="button" class="insb" data-ins="not">Not useful</button>'+
  '<button type="button" class="insb more" data-insmore aria-label="More choices">More</button><span class="insx">'+(/dup|big|odd|fee|new|hike/.test(INS.kind(i))?'<button type="button" class="insb" data-ins="normal">This was normal</button>':'')+'<button type="button" class="insb" data-ins="wrong">This is wrong</button><button type="button" class="insb" data-ins="hide">Hide</button></span></div>';
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-insmore]');if(!b)return;e.preventDefault();e.stopPropagation();const m=b.closest('.insm');if(m)m.classList.add('all')},true);
INS.find=id=>{let I=[];try{I=SP.top0()}catch(e){}return I.find(x=>x.id===id)};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ins]');if(!b)return;const m=b.closest('[data-insid]');if(!m)return;e.preventDefault();e.stopPropagation();
  const id=m.dataset.insid,v=b.dataset.ins,i=INS.find(id)||{id};
  if(v==='useful'){INS.g().insfb[id]={v:'useful',k:INS.kind(i),at:Date.now()};queueSave();m.innerHTML='<span class="insok">Thanks. Sprout will show more like this.</span>';setTimeout(()=>{try{pgRender();overview();if(typeof xRender==='function')xRender();if(typeof txOpen!=='undefined'&&txOpen)renderTx()}catch(_){}},1300);return}
  INS.set(id,v,i);
  const msg={not:'Hidden. Sprout will show fewer like this.',hide:'Hidden.',normal:'Got it. Sprout won’t flag this again.',wrong:'Thanks for flagging it. It’s hidden, and noted so the numbers behind it can be checked.'}[v];
  toastAct(msg,'Undo',()=>{INS.undo(id);try{overview();pgRender();if(typeof xRender==='function')xRender();if(typeof txOpen!=='undefined'&&txOpen)renderTx()}catch(_){}});
  try{overview();pgRender();if(typeof xRender==='function')xRender();if(typeof txOpen!=='undefined'&&txOpen)renderTx()}catch(_){}},true);
// "Worth a look" in Spending: each one can be rated or dismissed
{const _h=SP.html;SP.html=function(){let h=_h.apply(this,arguments);try{const I=SP.top().slice(0,4);if(!I.length)return h;const i=h.indexOf('<div class="xsec">Worth a look</div>');if(i<0)return h;const j=h.indexOf('</div></div>',h.indexOf('<div class="spins">',i))+12;
    h=h.slice(0,i)+'<div class="xsec">Worth a look</div><div class="spins">'+I.map(x=>'<div class="spi spi-'+esc(x.k||'x')+'"><b>'+esc(x.t)+'</b><span>'+esc(x.s)+'</span>'+(x.go&&x.go[0]?'<button type="button" class="lnk" data-x="open" data-v="'+esc(x.go[0])+'">Open</button>':'')+INS.menu(x)+'</div>').join('')+'</div>'+h.slice(j)}catch(e){}return h}}
// mute a whole kind from Settings > Notifications' neighbor, Insights
TITLES.insset='Insights';
INS.KINDS=[['dup','Possible double charges'],['big','Bigger than usual purchases'],['fee','Fees'],['pace','Spending ahead of usual'],['pay','Paycheck changes'],['low','Low balance ahead'],['new','New repeating charges']];
PAGES.insset=()=>{const g=INS.g();return '<p class="xhint">Choose what Sprout points out. Hidden insights stay hidden. Rating them teaches Sprout what’s useful to you.</p><div class="xcard">'+INS.KINDS.map(k=>'<label class="srow lgtog"><span class="slab">'+k[1]+'</span><input type="checkbox" class="sw" data-insmute="'+k[0]+'"'+(g.insmute[k[0]]?'':' checked')+'></label>').join('')+'</div>'+
  (Object.keys(g.insfb).length?'<button type="button" class="btn alt" data-insreset>Show hidden insights again ('+Object.keys(g.insfb).length+')</button>':'')};
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.insmute==null)return;const g=INS.g();if(t.checked)delete g.insmute[t.dataset.insmute];else g.insmute[t.dataset.insmute]=1;queueSave()});
document.addEventListener('click',e=>{if(!(e.target.closest&&e.target.closest('[data-insreset]')))return;const g=INS.g();Object.keys(g.insfb).forEach(id=>{try{delete X().dis[id]}catch(_){}});g.insfb={};g.inskey={};queueSave();toast('Hidden insights are back');xRender()});

// ---------- Money Pulse: five scores with their own weights, rolled into one ----------
PULSE.W=[['cash','Cash flow',25],['debt','Debt',25],['spend','Spending',20],['save','Saving',20],['nw','Net worth',10]];
PULSE.lin=(v,bad,good)=>good===bad?1:Math.max(0,Math.min(1,(v-bad)/(good-bad)));
PULSE.calc=()=>{const rt=realToday(),cush=+E.cushion||0,{low}=lowBeforePay(),inc=MX.incMo(),n=LG.nw(),D=MX.debts(),owe=MX.owe(),M=MX.month();
  const billsMo=(state.bills||[]).reduce((a,b)=>{const x=+b.amt||0;return a+(b.type==='monthly'?x:x*30.44/Math.max(1,+b.every||30))},0);
  const minsMo=D.filter(d=>d.src!=='plan').reduce((a,d)=>a+d.min,0),plMo=D.filter(d=>d.src==='plan').reduce((a,d)=>a+(d.kind==='borrow'?0:d.min*2.17),0);
  const S={};
  // cash flow: do you stay covered until payday, and how much of income is spoken for
  {const lv=low?low.v:estCash(),cover=lv>=cush?1:lv>=0?0.55+0.45*lv/Math.max(1,cush):Math.max(0,0.55*(1+lv/500)),fixed=inc>0?(billsMo+minsMo+plMo)/inc:1,ff=PULSE.lin(fixed,0.9,0.5);
    S.cash={v:Math.round((cover*0.6+ff*0.4)*100),f:[['Covered until payday',60,cover,lv>=cush?'Checking stays above your '+money0(cush)+' cushion until payday.':lv>=0?'Lowest point before payday: '+money0(lv)+', under your '+money0(cush)+' cushion.':'Checking is on track to go '+money0(-lv)+' below zero before payday.'],
      ['Income left after fixed costs',40,ff,inc>0?'Bills, minimums and pay-later take '+Math.round(fixed*100)+'% of your income. 50% or less scores full.':'Add your paycheck to score this.']]}}
  // debt: payments vs income, card usage, interest cost, and the direction it's going
  {const dti=inc>0?(minsMo+plMo)/inc:(minsMo>0?1:0),fd1=D.length?PULSE.lin(dti,0.4,0.1):1;let lim=0,cb=0;D.forEach(d=>{if(d.kind==='card'&&d.limit>0){lim+=d.limit;cb+=d.bal}});(LG.cards()||[]).forEach(a=>{});
    const use=lim>0?cb/lim:null,fu=use==null?1:PULSE.lin(use,0.9,0.1),hi=D.filter(d=>d.apr>=15).reduce((a,d)=>a+d.bal,0),fh=owe>0?1-hi/owe:1,base=Math.max(+state.startDebt||0,owe),pr=base>0?Math.max(0,Math.min(1,1-owe/base)):1;
    S.debt={v:Math.round((fd1*0.35+fu*0.25+fh*0.2+(base>0?pr:1)*0.2)*100),f:[['Payments vs income',35,fd1,!D.length?'No debt payments.':'Minimums and pay-later take '+Math.round(dti*100)+'% of your income. 10% or less scores full, 40% or more scores zero.'],
      ['Card usage',25,fu,use==null?'No card limits on file.':'Cards are at '+Math.round(use*100)+'% of their limits. 10% or less scores full.'],
      ['Interest cost',20,fh,!owe?'No debt.':hi>0?money0(hi)+' of '+money0(owe)+' is at 15% interest or more.':'None of your debt is at 15% interest or more.'],
      ['Going down',20,base>0?pr:1,base<=0?'No debt.':pr>0?money0(base-owe)+' paid down since you started.':'Not lower than when you started yet.']]}}
  // spending: on pace this pay period and within budget this month
  {const sp=(state.spend||[]).map(s=>Object.assign({t:pd(s.d)},s)),A=availAt(rt,sp),r=A.r,el=Math.max(1,Math.round((rt-r.d0)/MS)+1),exp=(r.persDay+r.evDay)*el,spent=sp.filter(s=>s.t>=r.d0&&s.t<=rt&&isSpend(s)).reduce((a,s)=>a+ +s.amt,0);
    const fp=exp<=0?0.5:spent<=exp?1:Math.max(0,1-(spent-exp)/Math.max(1,exp)),d=new Date(rt),dim=eom(d.getUTCFullYear(),d.getUTCMonth()+1),share=d.getUTCDate()/dim,fm=M.bud>0?(M.spent<=M.bud*share?1:Math.max(0,1-(M.spent-M.bud*share)/Math.max(1,M.bud))):0.5;
    S.spend={v:Math.round((fp*0.5+fm*0.5)*100),f:[['On pace this paycheck',50,fp,exp>0?money0(spent)+' spent of about '+money0(exp)+' planned so far this paycheck.':'Set your budget to score this.'],
      ['Within this month’s budgets',50,fm,M.bud>0?money0(M.spent)+' of '+money0(M.bud)+' with '+Math.round(share*100)+'% of the month gone.':'Set your budgets to score this.']]}}
  // saving: months of essentials you could cover, and money set aside regularly
  {const ess=Math.max(1,billsMo+minsMo+(+state.everyday||0)),buf=Math.max(0,n.S)+(+((state.x2||{}).vault||{}).bal||0),mo=buf/ess,fe=PULSE.lin(mo,0,3),rate=inc>0?(+state.savings||0)/inc:0,fr=PULSE.lin(rate,0,0.1),ret=n.I>0?1:0;
    S.save={v:Math.round((fe*0.6+fr*0.25+ret*0.15)*100),f:[['Emergency cushion',60,fe,'Savings would cover about '+(mo>=10?Math.round(mo):mo.toFixed(1))+' month'+(Math.abs(mo-1)<.05?'':'s')+' of essentials. 3 months scores full.'],
      ['Saving each month',25,fr,inc>0?'Your plan sets aside '+Math.round(rate*100)+'% of income. 10% scores full.':'Add your paycheck to score this.'],['Retirement or investing',15,ret,n.I>0?money0(n.I)+' invested.':'No investment or retirement accounts linked.']]}}
  // net worth: direction over the last six months and what you own vs owe
  {let S6=[];try{S6=LG.series().slice(-7)}catch(e){}const a=S6.length>1?S6[0].v:n.N,ch=n.N-a,ft=S6.length>1?(ch>=0?1:Math.max(0,1+ch/Math.max(1000,Math.abs(a)*0.2))):0.5,ratio=owe>0?n.own/owe:2,fo=PULSE.lin(ratio,0,1.5);
    S.nw={v:Math.round((ft*0.6+fo*0.4)*100),f:[['Direction',60,ft,S6.length>1?(ch>=0?'Up ':'Down ')+money0(Math.abs(ch))+' since '+S6[0].m+'.':'Not enough history yet.'],['Own vs owe',40,fo,owe>0?'You own '+money0(n.own)+' and owe '+money0(owe)+'.':'Nothing owed.']]}}
  let tot=0;PULSE.W.forEach(w=>{tot+=S[w[0]].v*w[2]/100});
  return{score:Math.round(tot),S}};
PULSE.lab=v=>v>=80?'Strong':v>=60?'Steady':v>=40?'Fair':'Tight';
PULSE.cls=v=>v>=60?'ok':v>=40?'mid':'low';
PULSE.ring=(v,sz)=>'<span class="pring '+PULSE.cls(v)+'" style="--s:'+(sz||56)+'px"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="t" cx="32" cy="32" r="27"/><circle class="f" cx="32" cy="32" r="27" pathLength="100" style="stroke-dasharray:'+Math.max(1,Math.min(100,v))+' 100"/></svg><b>'+v+'</b></span>';
PULSE.card=()=>{if(!state.setup)return '';let P;try{P=PULSE.calc()}catch(e){return ''}
  return '<button type="button" class="ovcard wide pcard3" data-x="open" data-v="pulse"><div class="och"><span>Money Pulse</span><em>›</em></div><div class="pc3">'+PULSE.ring(P.score,64)+'<div class="pc3l">'+PULSE.W.map(w=>'<span><i class="'+PULSE.cls(P.S[w[0]].v)+'"></i>'+w[1]+'<b>'+P.S[w[0]].v+'</b></span>').join('')+'</div></div></button>'};
TITLES.pulse='Money Pulse';
PAGES.pulse=()=>{const P=PULSE.calc();
  return '<div class="b3hero">'+PULSE.ring(P.score,76)+'<div><span class="k">Money Pulse</span><b>'+PULSE.lab(P.score)+'</b><span class="d">Five scores, weighted into one, from your own accounts</span></div></div>'+
   PULSE.W.map(w=>{const s=P.S[w[0]];return '<div class="xcard pul"><div class="pulh">'+PULSE.ring(s.v,44)+'<div><b>'+w[1]+'</b><small>'+w[2]+'% of your Money Pulse · '+PULSE.lab(s.v)+'</small></div></div>'+
     s.f.map(f=>'<div class="pulf"><div class="pulft"><span>'+f[0]+'</span><small>'+f[1]+'% of '+w[1].toLowerCase()+'</small></div><div class="b3bar '+(f[2]>=0.6?'ok':f[2]>=0.4?'near':'over')+'"><i style="width:'+Math.max(2,Math.round(f[2]*100))+'%"></i></div><p>'+f[3]+'</p></div>').join('')+'</div>'}).join('')+
   '<p class="xhint">Money Pulse describes your own numbers so you can see where things stand. It isn’t a credit score and isn’t financial advice. Each score is 0 to 100. The weights are Cash flow 25%, Debt 25%, Spending 20%, Saving 20% and Net worth 10%.</p>'};

// ---------- Home ----------
// safe to spend this month: what's left in your budgets, the same number as Budgets
PULSE.monthCard=()=>{if(!state.setup)return '';const M=MX.month(),L=B3.cats(),dl=M.daysLeft,p=M.bud>0?M.spent/M.bud:0,top=L.slice().sort((a,b)=>a.left/Math.max(1,a.lim)-b.left/Math.max(1,b.lim)).slice(0,3);
  return '<button type="button" class="ovcard wide safem" data-x="open" data-v="budgets"><div class="och"><span>Safe to spend this month</span><em>›</em></div><div class="smr"><b class="mid'+(M.left<0?' neg':'')+'">'+(M.left<0?'−'+money0(-M.left):money0(M.left))+'</b><small>'+(M.left<0?'over your budgets':'left of '+money0(M.bud)+' · '+dl+' day'+(dl===1?'':'s')+(M.left>0&&dl>0?' · about '+money0(M.left/dl)+' a day':''))+'</small></div>'+B3.bar(p)+
    '<div class="smc">'+top.map(x=>'<span>'+B2.ICON(x.id)+'<em>'+esc(x.name)+'</em><b class="'+(x.left<0?'neg':'')+'">'+(x.left<0?'−'+money0(-x.left):money0(x.left))+'</b></span>').join('')+'</div></button>'};
PULSE.insCard=()=>{let I=[],sg=null;try{sg=typeof SG!=='undefined'?SG.next():null}catch(e){}try{I=SP.top()}catch(e){}const i=I[0];
  if(sg)return '<div class="ovcard wide inscard"><div class="och"><span>Top insight</span></div><button type="button" class="insgo" data-spins><b>'+esc(sg.short)+'</b><em>›</em></button></div>';
  if(!i)return '<div class="ovcard wide inscard quiet"><div class="och"><span>Top insight</span></div><small>Nothing stands out right now. Sprout keeps watching.</small></div>';
  return '<div class="ovcard wide inscard"><div class="och"><span>Top insight</span>'+(I.length>1?'<button type="button" class="lnk" data-spins>'+I.length+' to look at ›</button>':'')+'</div><button type="button" class="insgo" '+(i.go&&i.go[0]?'data-x="open" data-v="'+esc(i.go[0])+'"':'data-spins')+'><b>'+esc(i.t)+'</b><span>'+esc(i.s)+'</span><em>›</em></button>'+INS.menu(i,'home')+'</div>'};
{const _ov=overview;overview=function(){const r=_ov.apply(this,arguments);try{const o=document.getElementById('ov');if(!o)return r;
    const q=s=>o.querySelector(s),take=el=>{if(el)el.remove();return el};
    const head=[q('.ovhello'),q('.syncchip'),q('.xalert'),q('.fidcard'),q('.jobc')].concat([...o.querySelectorAll(':scope>.lgnudge,:scope>.b2gap,:scope>.lgtwin,:scope>.lpcard')]).filter(Boolean),stick=take(q('section.stick')),planC=take(q('.ovcard.wide.row[data-goto="#guide"]')),hero=take(q('.ovhero')),shortA=take(q('.ovalert')),plusC=take(q('.plcard'));
    // the score moves to its own card; the hero is just Safe to spend today
    if(hero){const sc=hero.querySelector('.ovscore');if(sc)sc.remove();hero.classList.add('solo')}
    const keep=new Set(head);[...o.children].forEach(c=>{if(!keep.has(c))c.remove()});
    const add=x=>{if(!x)return;if(typeof x==='string')o.insertAdjacentHTML('beforeend',x);else o.appendChild(x)};
    add(stick);add(planC);add(PULSE.insCard());add(hero);add(shortA);add(PULSE.monthCard());add(PULSE.card());add(plusC)}catch(e){try{console.warn('home',e)}catch(_){}}return r}}
try{if(window.__S){window.__S.INS=INS;window.__S.PULSE=PULSE}}catch(e){}
}
{const _nf=PAGES.notifs;if(_nf)PAGES.notifs=function(){return _nf.apply(this,arguments)+'<button type="button" class="btn alt" data-x="open" data-v="insset">What insights Sprout points out ›</button>'}}
