// ---------- Free vs Plus: a generous free plan, Plus for the done-for-you extras ----------
// Free never locks your own data, safety, reminders or the daily plan. Limits show what's left before you hit them,
// and every wall offers a free way forward too.
// Ask Sprout is a Plus feature (free plans get the on-phone insights and alerts instead)
const FREE={ask:0,scan:10,accts:2};
const TPLUS=()=>plusIs();
const dayKey=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const monKey=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)};
function meter(k){const x=X();x.meter=x.meter||{};const key=k==='ask'?dayKey():monKey();let m=x.meter[k];if(!m||m.p!==key)m=x.meter[k]={p:key,n:0};return m}
const left=k=>Math.max(0,FREE[k]-meter(k).n);
const PCHIP='<span class="pchip">Plus</span>';
function plusGo(ctx){PLUSPEND={x:'plusback'};if($('#sh-x').hidden||!XP.page){closeSheets();setTimeout(()=>xGo('plus',ctx),closeSheetsDelay())}else xGo('plus',ctx)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=plusgo],[data-x=plusback]');if(!b)return;
  if(b.dataset.x==='plusgo'){e.preventDefault();plusGo(b.dataset.v||'')}else{try{xRender()}catch(_){}}});
// paywall wording for each place someone can meet a limit
{const _ctx=plusCtx;plusCtx=arg=>{const k=String(arg||'').split(':')[0];
  if(k==='ask')return {h:'Ask Sprout anything about your money',d:'Instant answers with your own numbers, any time: what you can spend, what’s due, where your money went. Ask Sprout comes with Plus, along with unlimited scans.'};
  if(k==='scan')return {h:'Scan every receipt and payment',d:'Free includes '+FREE.scan+' scans a month. Plus makes scans unlimited and adds Ask Sprout.'};
  if(k==='accts')return {h:'Bring in every account',d:'Free includes '+FREE.accts+' linked accounts. Plus syncs all your banks, cards and loans in one place.'};
  if(k==='score')return {h:'See all 10 signals behind your score',d:'Know exactly what’s helping, what’s holding you back and how many points each change is worth.'};
  if(k==='credit')return {h:'Watch your credit score grow',d:'See it every week, what changed it and what would help most.'};
  return _ctx(arg)}}
// ---- Ask Sprout: 5 questions a day ----
function askMeterHTML(){if(TPLUS())return '';return '<span>Ask Sprout comes with Plus.</span>'}
function askMeterDraw(){const box=$('#cmd-box');if(!box||box===DUMMY)return;let m=document.getElementById('askmeter');if(!m){m=document.createElement('p');m.id='askmeter';box.insertAdjacentElement('afterend',m)}
  m.innerHTML=askMeterHTML()+(TPLUS()?'':' <button type="button" class="lnk" data-x="plusgo" data-v="ask">Try it free for 7 days</button>');m.hidden=TPLUS();askPreview()}
// free plans see what Ask can do before they type
function askPreview(){const out=$('#cmd-out');if(!out||out===DUMMY)return;const old=out.querySelector('.askprev');if(TPLUS()){if(old)old.remove();return}if(old||(typeof chat!=='undefined'&&chat.length))return;
  out.insertAdjacentHTML('afterbegin','<div class="tierwall askprev"><span class="pchip">Plus</span><b>Ask Sprout anything about your money</b><span>Answers use your own numbers and show up instantly.</span><ul class="twlist"><li>“How much can I spend today?”</li><li>“Can I afford $80 on Friday?”</li><li>“Where did my money go this month?”</li></ul><div class="twbtns"><button class="sbtn" data-x="plusgo" data-v="ask">Try Plus free for 7 days</button></div></div>')}
function askWall(){const out=$('#cmd-out');if(!out)return;const pv=out.querySelector('.askprev');if(pv){pv.classList.remove('nudge');void pv.offsetWidth;pv.classList.add('nudge');return}const w='<div class="tierwall"><b>Ask Sprout comes with Plus</b><span>Get instant answers about your own money, any time. Your daily number, bills and budgets on Home stay free.</span><div class="twbtns"><button class="sbtn" data-x="plusgo" data-v="ask">Try Plus free for 7 days</button></div></div>';
  const t=out.querySelector('.thread')||out;t.insertAdjacentHTML('beforeend',w);try{t.lastElementChild.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(_){}}
{const _rc=runCmd;runCmd=function(){const i=$('#cmd-in'),has=i&&String(i.value||'').trim();
  if(has&&!TPLUS()&&left('ask')<=0){askWall();askMeterDraw();return}
  if(has&&!TPLUS()){meter('ask').n++;sv()}
  const r=_rc.apply(this,arguments);askMeterDraw();return r}}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#open-ask,[data-nav=ask]'))setTimeout(askMeterDraw,60)});
// ---- Screenshot scans: 10 a month ----
function scanWall(){const B=$('#sc-body');if(!B||B===DUMMY)return;B.innerHTML='<div class="tierwall big"><b>You’ve used this month’s '+FREE.scan+' free scans</b><span>You can still add purchases by hand any time. Plus makes scans unlimited, so every receipt and payment app screenshot goes straight in.</span><div class="twbtns"><button class="sbtn" data-x="plusgo" data-v="scan">Try Plus free for 7 days</button><button class="sbtn alt" data-close>Not now</button></div></div>'}
{const _sr=scRead;scRead=async function(files){if(!TPLUS()&&files&&files.length){if(left('scan')<=0){scanWall();return}meter('scan').n++;sv()}return _sr.apply(this,arguments)}}
{const _se=scExample;scExample=function(k){if(!TPLUS()){if(left('scan')<=0){scanWall();return}meter('scan').n++;sv()}return _se.apply(this,arguments)}}
{const _scr=scRender;scRender=function(){const r=_scr.apply(this,arguments);try{const B=$('#sc-body');if(B&&B!==DUMMY&&SC&&SC.step==='pick'&&!TPLUS()&&!B.querySelector('.scmeter')){const l=left('scan');B.insertAdjacentHTML('beforeend','<p class="scmeter">'+(l?l+' of '+FREE.scan+' free scans left this month':'No free scans left this month')+' · <button type="button" class="lnk" data-x="plusgo" data-v="scan">Unlimited with Plus</button></p>')}}catch(_){}return r}}
// ---- Linked accounts: 2 on Free (accounts you already linked stay linked) ----
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lk=conn]');if(!b||TPLUS())return;
  const on=Object.keys(LK.sel||{}).filter(k=>LK.sel[k]).length;if(on<FREE.accts||(LK.sel||{})[b.dataset.v])return;
  e.stopImmediatePropagation();e.preventDefault();LK.cap=b.dataset.v;lkCapNote()},true);
// a gentle note right in the list, so linking can carry on with the free accounts
function lkCapNote(){if(!LK||!LK.cap||TPLUS())return;const B=$('#lk-body');if(!B||B===DUMMY||B.querySelector('.lkcap'))return;const L=[...B.querySelectorAll('[data-lk=conn]')],last=L[L.length-1];if(!last)return;
  const row=last.closest('.lkrow,.row,li,div')||last;row.insertAdjacentHTML('afterend','<div class="tierwall slim lkcap"><b>Free includes '+FREE.accts+' linked accounts</b><span>Add the rest by hand any time, or link every account with Plus.</span><div class="twbtns"><button type="button" class="sbtn" data-x="plusgo" data-v="accts">Link all with Plus</button></div></div>')}
{const _lr=lkRender;lkRender=function(){const r=_lr.apply(this,arguments);try{lkCapNote()}catch(_){}return r}}
// ---- Budget score: score, areas and biggest boost are free; the 10-signal detail is Plus ----
{const _h=health;health=function(){const r=_h.apply(this,arguments);try{const H=document.getElementById('health');if(H){H.classList.toggle('plock',!TPLUS());
  const old=H.querySelector('.tierwall');if(old)old.remove();
  if(!TPLUS()){const first=H.querySelector('.hpil');if(first)first.insertAdjacentHTML('beforebegin','<div class="tierwall slim"><b>See all 10 signals</b><span>Your areas and biggest boost are free. Plus shows every signal and exactly what moves it.</span><div class="twbtns"><button class="sbtn" data-x="plusgo" data-v="score">Unlock the full breakdown</button></div></div>')}}}catch(_){}return r}}
// ---- Credit score: Plus ----
{const _cr=PAGES.credit;PAGES.credit=a=>TPLUS()?_cr(a):'<div class="tierwall big"><span class="pchip">Plus</span><b>Watch your credit score grow</b><span>See your score every week, what changed it and the one thing that would help most.</span><ul class="twlist"><li>Weekly score updates</li><li>What moved it, in plain words</li><li>Tips ranked by impact</li></ul><div class="twbtns"><button class="sbtn" data-x="plusgo" data-v="credit">Try Plus free for 7 days</button></div></div>'}
// ---- Plus chips on the Finances tools that need Plus ----
{const _pr=pgRender;pgRender=function(){const r=_pr.apply(this,arguments);try{if(!TPLUS())document.querySelectorAll('#pg .xtile[data-v=nego],#pg .xtile[data-v=credit],#pg .xtile[data-v=house]').forEach(t=>{if(!t.querySelector('.pchip'))t.insertAdjacentHTML('beforeend',PCHIP)})}catch(_){}return r}}
// ---- Paywall: compare plans ----
const TCMP=[['Daily plan, budgets, bills and streaks','✓','✓'],['Subscription finder and price alerts','✓','✓'],['Money Pulse','All five scores','All five scores'],['Ask Sprout','','✓'],['Screenshot scans',FREE.scan+' a month','Unlimited'],['Linked accounts',String(FREE.accts),'All'],['Cancel for me and Lower my bills','','✓'],['Credit score','','✓'],['Plan with a partner','','✓'],['Streak rewards','','✓']];
{const _pp=PAGES.plus;PAGES.plus=a=>{const h=_pp(a);if(TPLUS())return h;
  const tb='<details class="plcmp"><summary>Compare Free and Plus</summary><table><thead><tr><th></th><th>Free</th><th>Plus</th></tr></thead><tbody>'+TCMP.map(r=>'<tr><td>'+r[0]+'</td><td>'+(r[1]||'<i aria-label="Not included">–</i>')+'</td><td>'+r[2]+'</td></tr>').join('')+'</tbody></table></details>';
  return h.replace('<div class="pltl"',tb+'<div class="pltl"')}}
// keep the score lock in step with the plan when the breakdown opens
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='m-health'&&e.target.open){try{health()}catch(_){}}},true);
