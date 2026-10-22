// ===================== Budgets you can shape, a calmer Settings, and honest "set up first" notes =====================
const B2={PAL:['#5fc98a','#9ad9b4','#7cc6c2','#c3e88d','#4fae7e','#b5dfc8','#f6d98b','#a9c6e3','#e6c3a5','#c9b8e8','#f2b8c6','#9fd3d8']};
B2.BC0=BCATS.map(c=>c.slice());
B2.BASIC=new Set(['groc','gas','oth']);
B2.g=()=>{const g=LG.st();if(!g.bud||typeof g.bud!=='object')g.bud={};const b=g.bud;b.custom=b.custom||[];b.subs=b.subs||{};b.rules=b.rules||{};b.kind=b.kind||{};b.names=b.names||{};b.words=b.words||{};return b};
B2.esc=w=>String(w).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
B2.rx=words=>{const L=String(words||'').split(/[,\n]/).map(x=>x.trim().toLowerCase()).filter(x=>x.length>=2);return L.length?new RegExp(L.map(B2.esc).join('|'),'i'):null};
// the budget categories everyone has, plus the ones you added, in the shape the rest of Sprout already reads
B2.sync=()=>{const b=B2.g();BCATS.length=0;
  B2.BC0.forEach(c=>{const w=B2.rx(b.words[c[0]]),r=c[3]&&w?new RegExp(c[3].source+'|'+w.source,'i'):(c[3]||w);BCATS.push([c[0],b.names[c[0]]||c[1],c[2],r])});
  b.custom.forEach(c=>BCATS.push([c.id,c.name,c.limit||0,B2.rx(c.words)]))};
B2.kindOf=id=>{const b=B2.g();return b.kind[id]||(B2.BASIC.has(id)?'basic':(b.custom.find(c=>c.id===id)||{}).kind||'fun')};
B2.isCustom=id=>B2.g().custom.some(c=>c.id===id);
// which budget a purchase counts toward: your choice on that purchase, a store you taught Sprout, your own categories, then Sprout's guess
B2.catOf=s=>{const b=B2.g(),m=String(s.note||s.m||''),k=mkey(m);
  if(s.bc&&BCATS.some(c=>c[0]===s.bc))return s.bc;
  if(k&&b.rules[k]&&BCATS.some(c=>c[0]===b.rules[k]))return b.rules[k];
  const own=b.custom.find(c=>{const r=B2.rx(c.words);return r&&r.test(m)});if(own)return own.id;
  const hit=BCATS.find(c=>c[3]&&c[3].test(m))||BR.pfdCat(s.pfd);return hit?hit[0]:'oth'};
// bills only count toward a budget when you put them there (or they're a subscription)
B2.billIn=s=>{if(s.cat!=='Bill'||LG.isXfer(s))return false;const b=B2.g(),k=mkey(s.note||'');if(s.bc||(k&&b.rules[k]))return true;
  if(b.custom.some(c=>{const r=B2.rx(c.words);return r&&r.test(s.note||'')}))return true;return !!((BCATS[4][3]&&BCATS[4][3].test(s.note||''))||BR.pfdCat(s.pfd)===BCATS[4])};
B2.counts=s=>!!s&&!LG.isXfer(s)&&(s.cat==='Everyday'||s.cat==='Personal'||LG.isRefund(s)||B2.billIn(s));
// this month's spending in each budget: bank, card and what you logged, refunds taken off, transfers left out
B2.monthTx=()=>{const mk=fd(realDay()).slice(0,7);return (state.spend||[]).map((s,i)=>Object.assign({i},s)).filter(s=>String(s.d).slice(0,7)===mk&&B2.counts(s)).map(s=>({s,i:s.i,d:s.d,amt:(LG.isRefund(s)?-1:1)*(+s.amt||0),cat:B2.catOf(s),note:s.note||''}))};
monthSpend=function(){const out={};BCATS.forEach(c=>out[c[0]]=0);B2.monthTx().forEach(t=>{out[t.cat]=(out[t.cat]||0)+t.amt});Object.keys(out).forEach(k=>out[k]=Math.max(0,Math.round(out[k]*100)/100));return out};
B2.subOf=(t,cat)=>{const L=B2.g().subs[cat]||[];if(t.s.bs&&L.some(x=>x.id===t.s.bs))return t.s.bs;const hit=L.find(x=>{const r=B2.rx(x.words);return r&&r.test(t.note)});return hit?hit.id:''};
// your category amounts set the Basics and Fun money behind Safe to spend, and the other way around
B2.sum=kind=>BCATS.reduce((a,c)=>a+(B2.kindOf(c[0])===kind?budLim(c):0),0);
B2.scale=(kind,total)=>{const x=X(),L=BCATS.filter(c=>B2.kindOf(c[0])===kind);const cur=L.reduce((a,c)=>a+budLim(c),0);if(!L.length||!(total>0)||Math.abs(cur-total)<1)return;
  let left=total;L.forEach((c,i)=>{const v=i===L.length-1?Math.max(0,Math.round(left)):Math.max(0,Math.round(budLim(c)*total/Math.max(1,cur)/5)*5);x.bud[c[0]]=v||0;left-=v})};
B2.push=()=>{if(LG.demo())return;const e=Math.round(B2.sum('basic')),f=Math.round(B2.sum('fun'));if(e!==Math.round(+state.everyday||0)||f!==Math.round(+state.discReduced||0)){state.everyday=e;state.discReduced=f;if(!hasBonus(state))state.discTarget=f;plan();queueSave()}};
B2.pull=()=>{if(LG.demo()||!state.setup)return;const b=B2.g();if(!b.init){b.init=1;if(+state.everyday>0)B2.scale('basic',+state.everyday);if(+state.discReduced>0)B2.scale('fun',+state.discReduced);return}
  if(+state.everyday>0&&Math.abs(B2.sum('basic')-state.everyday)>=1)B2.scale('basic',+state.everyday);if(+state.discReduced>0&&Math.abs(B2.sum('fun')-state.discReduced)>=1)B2.scale('fun',+state.discReduced)};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=bud]');if(b)setTimeout(()=>{B2.push();if(typeof xRender==='function')xRender()},0)});

// ---------- what Sprout still needs for its best answers ----------
B2.gaps=()=>{if(LG.demo())return[];const g=[];if(!(+state.everyday>0||+state.discReduced>0))g.push('your budget');if(!(+state.pay>0))g.push('your paycheck');if(!(state.bills||[]).length&&!(state.debts||[]).length)g.push('your bills');return g};
B2.list=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
B2.gapHTML=(cls)=>{const g=B2.gaps();if(!g.length)return '';return '<div class="b2gap'+(cls?' '+cls:'')+'"><b>Sprout can help most once '+B2.list(g)+(g.length>1?' are':' is')+' in.</b><span>Your daily number, “can I afford this?” answers and insights all work from them. It takes a few minutes, and you can change it any time.</span><div class="b2gapb"><button type="button" class="sbtn" data-b2="setup">'+(g.indexOf('your budget')>=0?'Set up my budget':'Add them now')+'</button></div></div>'};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-b2=setup]');if(!b)return;e.preventDefault();const g=B2.gaps();closeSheets();
  setTimeout(()=>{if(g.indexOf('your budget')>=0&&g.length===1)xOpen('budgets');else if(!state.setup)openWizard(false);else{const m=document.querySelector('#menu [data-nav=edit]');if(m)m.click();else xOpen('budgets')}},closeSheetsDelay?closeSheetsDelay()+20:300)});
{const _ba=BR.answer;BR.answer=function(q){const r=_ba.apply(this,arguments);try{const g=B2.gaps();if(r&&r.reply&&g.length&&!/once .* (is|are) in/.test(r.reply))r.reply+='\n\nThis is a rough answer. Sprout can be exact once '+B2.list(g)+(g.length>1?' are':' is')+' in.'}catch(e){}return r}}
{const _os2=openSheet;openSheet=function(id){const r=_os2.apply(this,arguments);try{if(id==='sh-ask'){const box=document.querySelector('#sh-ask .askbody');if(box){const old=box.querySelector('.b2gap');if(old)old.remove();const h=B2.gapHTML('ask');if(h)box.insertAdjacentHTML('afterbegin',h)}}}catch(e){}return r}}
{const _mh=moneyHTML;moneyHTML=function(){return B2.gapHTML()+_mh.apply(this,arguments)}}
{const _ih=insightsHTML;insightsHTML=function(){return B2.gapHTML()+_ih.apply(this,arguments)}}

// ---------- the Budgets screen ----------
B2.ICON=id=>catIcon(id==='oth'?'misc':id,'sm');
PAGES.budgets=()=>{B2.sync();B2.pull();const ms=monthSpend(),tot=BCATS.reduce((a,c)=>a+(ms[c[0]]||0),0),lim=BCATS.reduce((a,c)=>a+budLim(c),0),left=Math.max(0,realDayOfMonthLeft()),demo=LG.demo();
  const card=c=>{const l=budLim(c),sp=ms[c[0]]||0,p=l>0?sp/l:(sp>0?2:0),subs=(B2.g().subs[c[0]]||[]).length,k=B2.kindOf(c[0]);
    return '<div class="xcard b2c"><div class="b2h"><button type="button" class="b2open" data-b2cat="'+esc(c[0])+'" aria-label="Open '+esc(c[1])+'"><span class="budh">'+B2.ICON(c[0])+'<b>'+esc(c[1])+'</b></span><small>'+(k==='basic'?'Basics':'Fun')+(subs?' · '+subs+' part'+(subs>1?'s':''):'')+' ›</small></button>'+
      '<button class="sbtn alt b2pm" data-x="bud" data-v="'+esc(c[0])+'" data-w="-25" aria-label="Lower '+esc(c[1])+' budget">−</button><span class="b2amt">'+money0(l)+'</span><button class="sbtn alt b2pm" data-x="bud" data-v="'+esc(c[0])+'" data-w="25" aria-label="Raise '+esc(c[1])+' budget">+</button></div>'+
      '<div class="xbar'+(p>1?' over':p>.85?' near':'')+'"><i style="width:'+Math.min(100,Math.round(p*100))+'%"></i></div><small class="xhint">'+money0(sp)+' spent · '+(sp>l?money0(sp-l)+' over':money0(l-sp)+' left')+'</small></div>'};
  return '<div class="xhero"><span class="k">Spent this month</span><b>'+money0(tot)+'<small style="font-size:16px;font-family:var(--f-body)"> of '+money0(lim)+'</small></b><span class="d">'+Math.round(tot/Math.max(1,lim)*100)+'% of your budget · '+left+' days left</span></div>'+
   B2.gapHTML()+
   (!demo&&state.setup?'<p class="xhint b2lead">Basics '+money0(B2.sum('basic'))+' and Fun '+money0(B2.sum('fun'))+' a month. These set your daily Safe to spend. Every purchase counts, from your bank, your cards or what you log.</p>':'<p class="xhint b2lead">Every purchase counts, from your bank, your cards or what you log. Tap a category to rename it, split it into parts or see what’s in it.</p>')+
   BCATS.map(card).join('')+
   '<button type="button" class="btn alt b2add" data-b2new>+ Add a category</button>'+
   '<p class="xhint">Bills and loan payments aren’t in these budgets, because your plan already sets money aside for them. <button type="button" class="lnk" data-x="open" data-v="rules">Stores Sprout has learned</button></p>'};
TITLES.budcat='Budget';TITLES.budnew='New category';
PAGES.budnew=()=>'<div class="xf b2form"><label class="f">Name<input id="b2-name" type="text" maxlength="28" placeholder="Like Pets, Kids or Car"></label><label class="f">Monthly amount<div class="pre"><span>$</span><input id="b2-amt" type="text" inputmode="decimal" placeholder="0"></div></label>'+
  '<div class="f"><span>What kind of spending is it?</span><div class="wchips" id="b2-kind"><button type="button" class="wchip on" data-b2k="basic">Basics (needs)</button><button type="button" class="wchip" data-b2k="fun">Fun (wants)</button></div></div>'+
  '<label class="f">Stores that belong here<small>Optional. Separate with commas, like petco, chewy. Sprout files them here automatically.</small><input id="b2-words" type="text" placeholder="petco, chewy"></label>'+
  '<button type="button" class="btn" data-b2save="new">Add category</button></div>';
PAGES.budcat=id=>{B2.sync();const c=BCATS.find(z=>z[0]===id);if(!c)return '<p class="xhint">That category is gone.</p>';const b=B2.g(),custom=B2.isCustom(id),k=B2.kindOf(id),T=B2.monthTx().filter(t=>t.cat===id).sort((a,b)=>a.d<b.d?1:-1),L=b.subs[id]||[];
  const sp=T.reduce((a,t)=>a+t.amt,0),words=custom?((b.custom.find(z=>z.id===id)||{}).words||''):(b.words[id]||'');
  const subSp={};T.forEach(t=>{const s=B2.subOf(t,id)||'_';subSp[s]=(subSp[s]||0)+t.amt});
  return '<div class="xhero"><span class="k">'+esc(c[1])+'</span><b>'+money0(Math.max(0,sp))+'<small style="font-size:16px;font-family:var(--f-body)"> of '+money0(budLim(c))+'</small></b><span class="d">This month · '+T.length+' purchase'+(T.length===1?'':'s')+'</span></div>'+
   '<div class="xcard xf b2form"><label class="f">Name<input id="b2-name" type="text" maxlength="28" value="'+esc(c[1])+'"></label><label class="f">Monthly amount<div class="pre"><span>$</span><input id="b2-amt" type="text" inputmode="decimal" value="'+Math.round(budLim(c))+'"></div></label>'+
   '<div class="f"><span>What kind of spending is it?</span><div class="wchips" id="b2-kind"><button type="button" class="wchip'+(k==='basic'?' on':'')+'" data-b2k="basic">Basics (needs)</button><button type="button" class="wchip'+(k==='fun'?' on':'')+'" data-b2k="fun">Fun (wants)</button></div></div>'+
   '<label class="f">Stores that belong here<small>Optional. Separate with commas. Sprout files them here automatically.</small><input id="b2-words" type="text" value="'+esc(words)+'" placeholder="costco, farmers market"></label>'+
   '<button type="button" class="btn" data-b2save="'+esc(id)+'">Save</button></div>'+
   '<div class="xcard"><h3>Split it up (optional)</h3><p class="xhint" style="margin:0 0 8px">Give parts of this budget their own amount, like Costco and Farmers market inside Groceries. Purchases that don’t match a part still count toward the category.</p>'+
    L.map(x=>{const v=subSp[x.id]||0;return '<div class="b2sub"><div><b>'+esc(x.name)+'</b><small>'+money0(Math.max(0,v))+' of '+money0(x.limit||0)+(x.words?' · '+esc(x.words):'')+'</small><div class="xbar'+(x.limit&&v>x.limit?' over':'')+'"><i style="width:'+Math.min(100,Math.round(v/Math.max(1,x.limit||1)*100))+'%"></i></div></div><button type="button" class="lnk" data-b2subdel="'+esc(id)+'|'+esc(x.id)+'">Remove</button></div>'}).join('')+
    (L.length&&subSp._?'<p class="xhint" style="margin:4px 0 8px">'+money0(Math.max(0,subSp._))+' not in a part</p>':'')+
    '<div class="b2subnew"><input id="b2-sn" type="text" maxlength="24" placeholder="Part name"><div class="pre sm"><span>$</span><input id="b2-sa" type="text" inputmode="decimal" placeholder="0"></div><input id="b2-sw" type="text" placeholder="Stores (optional)"><button type="button" class="sbtn" data-b2subadd="'+esc(id)+'">Add part</button></div></div>'+
   '<div class="xcard"><h3>In this category this month</h3>'+(T.length?T.slice(0,40).map(t=>'<div class="b2tx"><div><b>'+esc(t.note||'Purchase')+'</b><small>'+sdate(pd(t.d))+(t.s.card?' · Card':'')+(L.length&&B2.subOf(t,id)?' · '+esc((L.find(x=>x.id===B2.subOf(t,id))||{}).name||''):'')+'</small></div><select data-b2move="'+t.i+'" aria-label="Move to another category">'+BCATS.map(z=>'<option value="'+esc(z[0])+'"'+(z[0]===id?' selected':'')+'>'+esc(z[1])+'</option>').join('')+'</select><span class="b2ta'+(t.amt<0?' pos':'')+'">'+(t.amt<0?'+':'−')+money(Math.abs(t.amt))+'</span></div>').join(''):'<p class="xhint" style="margin:0">Nothing yet this month.</p>')+'</div>'+
   (custom?'<button type="button" class="btn x" data-b2del="'+esc(id)+'">Delete this category</button>':'')};
B2.num=v=>{const n=parseAmt(v);return isFinite(n)&&n>=0?Math.round(n):0};
B2.wk='basic';
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
  const o=t.closest('[data-b2cat]');if(o){e.preventDefault();xGo('budcat',o.dataset.b2cat);return}
  if(t.closest('[data-b2new]')){e.preventDefault();B2.wk='basic';xGo('budnew');return}
  const kc=t.closest('[data-b2k]');if(kc){B2.wk=kc.dataset.b2k;kc.parentElement.querySelectorAll('.wchip').forEach(x=>x.classList.toggle('on',x===kc));return}
  const sv=t.closest('[data-b2save]');if(sv){const b=B2.g(),x=X(),id=sv.dataset.b2save,name=String(($('#b2-name').value||'')).trim().slice(0,28),amt=B2.num($('#b2-amt').value),words=String($('#b2-words').value||'').slice(0,160),kind=(document.querySelector('#b2-kind .wchip.on')||{dataset:{}}).dataset.b2k||B2.wk;
    if(!name){toast('Give it a name');return}
    if(id==='new'){if(BCATS.some(c=>c[1].toLowerCase()===name.toLowerCase())){toast('You already have '+name);return}const nid='c'+Date.now().toString(36);b.custom.push({id:nid,name,limit:amt,kind,words});x.bud[nid]=amt;b.kind[nid]=kind;B2.sync();B2.push();queueSave();xBack();toast('Added '+name);return}
    const cu=b.custom.find(c=>c.id===id);if(cu){cu.name=name;cu.words=words;cu.kind=kind}else{b.names[id]=name;b.words[id]=words}b.kind[id]=kind;x.bud[id]=amt;B2.sync();B2.push();queueSave();xBack();toast('Saved');return}
  const del=t.closest('[data-b2del]');if(del){if(!del.dataset.arm){del.dataset.arm='1';del.textContent='Tap again to delete. Its purchases move to Everything else.';return}const b=B2.g(),id=del.dataset.b2del;b.custom=b.custom.filter(c=>c.id!==id);delete b.subs[id];delete X().bud[id];
    Object.keys(b.rules).forEach(k=>{if(b.rules[k]===id)delete b.rules[k]});(state.spend||[]).forEach(s=>{if(s.bc===id)delete s.bc});B2.sync();B2.push();queueSave();xBack();toast('Deleted');return}
  const sa=t.closest('[data-b2subadd]');if(sa){const id=sa.dataset.b2subadd,n=String($('#b2-sn').value||'').trim().slice(0,24);if(!n){toast('Name the part');return}const b=B2.g();(b.subs[id]=b.subs[id]||[]).push({id:'s'+Date.now().toString(36),name:n,limit:B2.num($('#b2-sa').value),words:String($('#b2-sw').value||'').slice(0,120)});queueSave();xRender();return}
  const sd=t.closest('[data-b2subdel]');if(sd){const [id,sid]=sd.dataset.b2subdel.split('|'),b=B2.g();b.subs[id]=(b.subs[id]||[]).filter(x=>x.id!==sid);(state.spend||[]).forEach(s=>{if(s.bs===sid)delete s.bs});queueSave();xRender();return}});
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.b2move==null)return;const s=state.spend[+t.dataset.b2move];if(!s)return;B2.assign(s,t.value);xRender()});
// putting a purchase in a budget also teaches Sprout that store, with a way to undo
B2.assign=(s,id)=>{const b=B2.g(),k=mkey(s.note||''),prev=k?b.rules[k]:undefined;s.bc=id;delete s.bs;if(k)b.rules[k]=id;plan();queueSave();
  const nm=(BCATS.find(c=>c[0]===id)||[])[1]||'that budget';toastAct('Moved to '+nm+(k?'. Sprout will file '+tidy(s.note)+' there from now on.':''),'Undo',()=>{delete s.bc;if(k){if(prev)b.rules[k]=prev;else delete b.rules[k]}plan();queueSave();if(typeof xRender==='function')xRender()})};
// the transaction editor gets a budget picker too
{const _rt2=renderTx;renderTx=function(){const r=_rt2.apply(this,arguments);try{if(txEdit==null)return r;const s=state.spend[txEdit];const ed=document.querySelector('#tx-list .txr.open .txed');if(!s||!ed||ed.querySelector('[data-b2pick]')||s.cat==='Income'||s.cat==='Skip')return r;const cur=B2.counts(s)?B2.catOf(s):'';
    const row=ed.querySelector('.row:last-child')||ed.lastElementChild;row.insertAdjacentHTML('beforebegin','<label class="f">Budget<select data-b2pick="'+txEdit+'">'+(cur?'':'<option value="">Not in a budget</option>')+BCATS.map(c=>'<option value="'+esc(c[0])+'"'+(c[0]===cur?' selected':'')+'>'+esc(c[1])+'</option>').join('')+'</select></label>')}catch(e){}return r}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.b2pick==null||!t.value)return;const s=state.spend[+t.dataset.b2pick];if(s)B2.assign(s,t.value)});
// Ask's spending answers use the same budget for each purchase
{const _tx=BR.tx;BR.tx=function(){const L=_tx.apply(this,arguments);try{const by=new Map();(state.spend||[]).forEach(s=>by.set(s.d+'|'+(+s.amt)+'|'+String(s.note||''),s));L.forEach(t=>{const s=by.get(t.d+'|'+Math.abs(t.amt)+'|'+t.m);if(s&&(s.bc||B2.g().rules[mkey(s.note||'')]))t.bk=B2.catOf(s)})}catch(e){}return L}}

// ---------- the By category view groups spending the same way the budgets do ----------
LG.tcat=s=>{if(s.cat==='Bill'&&!B2.billIn(s)){if(s.xf==='cp')return 'card';if(s.xf==='loan')return 'loan';if(s.xf==='fee'||/^BANK_FEES/.test(String(s.pfd||'')))return 'fees';return 'bill'}return 'b:'+B2.catOf(s)};
{const _rc=renderCats;renderCats=function(){B2.sync();const add=BCATS.map((c,i)=>['b:'+c[0],c[1],B2.PAL[i%B2.PAL.length],'',null]);const n0=TCATS.length;TCATS.unshift(...add);try{return _rc.apply(this,arguments)}finally{TCATS.splice(0,add.length)}}}
{const _ci=catIcon;catIcon=function(k,cls){return _ci.call(this,String(k||'').indexOf('b:')===0?(k.slice(2)==='oth'?'misc':k.slice(2)):k,cls)}}

// ---------- Settings: fewer, clearer groups ----------
PAGES.settings=()=>{const p=P(),x=X(),a=acctMe()||{},plus=plusIs(),L=LANGS.find(z=>z[0]===p.lang)||LANGS[0],live=LIVE.on,lk=state.link&&state.link.on,nm=state.name||((a.first||'')+' '+(a.last||'')).trim();
  const g=B2.gaps();
  return '<button type="button" class="sprof s2prof" data-x="open" data-v="acctinfo">'+avt(nm||'You')+'<div class="xt"><b>'+esc(nm||'Your account')+'</b><small>'+esc(a.email||'')+'</small><small>'+(plus?'Sprout Plus':'Free plan')+'</small></div><span class="schev">›</span></button>'+
   (typeof plusSetCard==='function'?plusSetCard():'')+
   sgroup('Your money',[srow('pie','Budget and categories',g.indexOf('your budget')>=0?'Set up':'','data-x="open" data-v="budgets"'),srow('doc','Paycheck, bills and balances',g.length&&g.indexOf('your budget')<0?'Add':'','data-x="nav" data-v="edit"'),
     srow('link','Connected accounts',lk?(state.link.live?((state.link.items||[]).length+' linked'):'Demo'):'','data-x="nav" data-v="accts"'),srow('money','How Safe to spend works','','data-x="open" data-v="safe"')].concat(lk&&state.link.live?[]:[srow('upload','Import a statement','','data-x="nav" data-v="import"')]))+
   (typeof modOK==='function'&&modOK()?sgroup('Moderation',[srow('info','Review reports',(SR().reports.filter(r=>r.status==='open').length||'')+'','data-x="open" data-v="modq"')]):'')+
   sgroup('App',[srow('moon','Appearance',themeName(p.theme),'data-x="open" data-v="appearance"'),srow('bell','Notifications','','data-x="open" data-v="notifs"'),srow('lock','Passcode and Face ID',p.lock?'On':'','data-x="open" data-v="security"'),srow('globe','Language','<span class="notr">'+L[1]+'</span>','data-x="open" data-v="language"'),stog('eye','Hide balances','Show $••• instead of amounts','hidebal',p.hidebal),stog('spark','Celebrations','Confetti when you hit a goal','conf',!p.noconf)])+
   sgroup('Privacy and data',[(live?srow('cloud','Bank sync, AI and backup',liveOK()?({owner:'Plus',plus:'Plus',free:'Free'})[LIVE.st.tier]:'Set up','data-x="open" data-v="server"'):''),srow('save','Move to a new phone','','data-x="nav" data-v="backup"'),srow('shield','Privacy and terms','','data-x="open" data-v="legal"')].filter(Boolean))+
   sgroup('Help',[srow('info','How Sprout works','','data-x="nav" data-v="how"'),srow('mail','Contact support','','data-x="open" data-v="support"')])+
   (!live||LG.demo()?sgroup('Try it out',[srow('spark','Example data','','data-x="open" data-v="examples"'),srow('users','Partner',x.house&&x.house.st==='on'?'Alex':'','data-x="open" data-v="house"')]):'')+
   '<button type="button" class="btn alt" data-x="signout">Sign out</button><p class="xhint" style="text-align:center">'+esc((document.getElementById('save')||{}).textContent||'')+(window.SPROUT_BUILD?' · Version '+esc(window.SPROUT_BUILD):'')+'</p>'};
TITLES.settings='Settings';
// your account: details, password and deleting it, all in one place
{const _ai=PAGES.acctinfo;PAGES.acctinfo=function(){const a=acctMe()||{};return _ai.apply(this,arguments)+sgroup('Sign-in and account',[srow('lock',a.pwh?'Change password':'Add a password','','data-x="open" data-v="pwchange"'),srow('users','Name and bio','','data-x="open" data-v="profile"'),srow('star','Sprout Plus',plusIs()?'On':'','data-x="open" data-v="plus"'),srow('trash','Delete account','','data-x="open" data-v="acctdel"')])}}
// a copy of your data stays available where people look for it: your privacy rights, and records for taxes or switching apps
{const _lg=PAGES.legal;PAGES.legal=function(){return _lg.apply(this,arguments)+sgroup('Your data',[srow('down','Download a copy of my data','Spreadsheet','data-x="export"')])+'<p class="xhint">A spreadsheet of every transaction Sprout has, for your records, your taxes or another app. Privacy laws give you the right to a copy, and this is the quickest way to get one.</p>'}}
{const _pl2=plan;plan=function(){try{B2.sync();B2.pull()}catch(e){}return _pl2.apply(this,arguments)}}
try{if(window.__S)window.__S.B2=B2}catch(e){}
