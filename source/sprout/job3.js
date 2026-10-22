// ===================== Job changes and more than one paycheck =====================
// Sprout notices when the usual paycheck stops, changes or a new one starts, and asks instead of guessing.
// If you're between jobs, the plan stops counting on a paycheck and shows how long your money lasts.
// Other regular income (a second job, side work) can be added and is planned like a paycheck.
const JOB={};
{
const r2=MX.r2,DY=MS;
JOB.g=()=>{const g=LG.st();g.job=g.job||{};g.job.inc2=g.job.inc2||[];return g.job};
// expected paydays in the last 6 weeks with no deposit from the usual payer
JOB.missed=()=>{const a=RC.auto();if(!a.pay||!(+state.pay>0)||!LG.live())return [];const T=realDay();const exp=payDates(state,T-45*DY).filter(t=>t<T-3*DY);
  return exp.filter(t=>!(state.gotPay||{})[fd(t)]&&!RC.rows().some(r=>r.a>0&&RC.key(r)===a.pay.key&&Math.abs(r.t-t)<=4*DY))};
// a payroll deposit from someone new
JOB.newPayer=()=>{const a=RC.auto();let P=[];try{P=RC.pays()}catch(e){}const T=realDay();return P.find(p=>p.conf>=0.6&&(!a.pay||p.key!==a.pay.key)&&T-p.last<=21*DY&&!JOB.g().inc2.some(x=>x.key===p.key)&&JOB.g().no!==p.key)||null};
JOB.state=()=>{const j=JOB.g();if(j.mode==='between')return{k:'between'};if((j.snooze||0)>Date.now())return null;const m=JOB.missed(),np=JOB.newPayer();
  if(m.length>=2)return{k:'stopped',m,np};if(np&&m.length)return{k:'switched',m,np};if(np)return{k:'second',np};return null};
// extra income events for the plan
JOB.addInc=(ev,st,asOf)=>{try{const j=(st.lg&&st.lg.job)||{};(j.inc2||[]).forEach(x=>{if(!(+x.amt>0))return;const s2={pay:+x.amt,payFreq:x.freq||'monthly',firstPay:x.first,payDays:x.days};payDates(s2,asOf).forEach(t=>{const e=ev.find(z=>z.t===t);if(e){e.inc+=+x.amt}else ev.push({t,inc:+x.amt,lab:'Paycheck'})})})}catch(e){}};
// how long money lasts with no paycheck: checking plus savings against must-pays and your budgets
JOB.runway=()=>{const n=LG.nw(),have=Math.max(0,n.C)+Math.max(0,n.S),bills=(state.bills||[]).reduce((a,b)=>a+(b.type==='monthly'?+b.amt:+b.amt*30.44/Math.max(1,+b.every||30)),0),mins=MX.debts().reduce((a,d)=>a+(d.src==='plan'?0:d.min),0),pl=MX.debts().filter(d=>d.src==='plan').reduce((a,d)=>a+d.bal,0)/3,bud=(+state.everyday||0)+(+state.discReduced||0);
  const mo=r2(bills+mins+pl+bud),bare=r2(bills+mins+pl+(+state.everyday||0));return{have:r2(have),mo,bare,days:mo>0?Math.floor(have/mo*30.44):999,daysBare:bare>0?Math.floor(have/bare*30.44):999}};
JOB.card=()=>{const s=JOB.state();if(!s)return '';const a=RC.auto(),nm=(a.pay&&a.pay.name)||'your usual employer';
  if(s.k==='between'){const r=JOB.runway();return '<div class="b2gap jobc"><b>Making your money last</b><span>No paycheck in your plan right now. With '+money0(r.have)+' in checking and savings, your bills, minimums and budgets are covered for about '+r.days+' days ('+money0(r.mo)+' a month). Basics only: about '+r.daysBare+' days.</span><div class="b2gapb"><button type="button" class="sbtn" data-job="newjob">I have a new paycheck</button><button type="button" class="sbtn alt" data-x="open" data-v="budgets">Adjust budgets</button></div></div>'}
  if(s.k==='stopped')return '<div class="b2gap jobc"><b>Did your job change?</b><span>Paychecks from '+esc(nm)+' usually land '+esc(RC.FREQ[state.payFreq]||'')+', and the last '+s.m.length+' didn’t show up'+(s.np?'. A new one from '+esc(s.np.name)+' started':'')+'.</span><div class="b2gapb">'+(s.np?'<button type="button" class="sbtn" data-job="use">Use '+esc(s.np.name)+'</button>':'<button type="button" class="sbtn" data-job="newjob">New job</button>')+'<button type="button" class="sbtn alt" data-job="between">Between jobs</button><button type="button" class="sbtn alt" data-job="late">Just late</button></div></div>';
  if(s.k==='switched')return '<div class="b2gap jobc"><b>New paycheck from '+esc(s.np.name)+'?</b><span>About '+esc(RC.payWords(s.np))+'. One from '+esc(nm)+' didn’t arrive. Switch your plan to the new one?</span><div class="b2gapb"><button type="button" class="sbtn" data-job="use">Switch</button><button type="button" class="sbtn alt" data-job="add2">Keep both</button><button type="button" class="sbtn alt" data-job="no">Not now</button></div></div>';
  if(s.k==='second')return '<div class="b2gap jobc"><b>Another paycheck: '+esc(s.np.name)+'</b><span>About '+esc(RC.payWords(s.np))+'. Add it to your plan as more income?</span><div class="b2gapb"><button type="button" class="sbtn" data-job="add2">Add it</button><button type="button" class="sbtn alt" data-job="no">Not now</button></div></div>';
  return ''};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-job]');if(!b)return;e.preventDefault();e.stopPropagation();const j=JOB.g(),k=b.dataset.job,s=JOB.state()||{},before=JSON.stringify({pay:state.pay,payFreq:state.payFreq,firstPay:state.firstPay,job:j});
  const undo=()=>{const o=JSON.parse(before);state.pay=o.pay;state.payFreq=o.payFreq;state.firstPay=o.firstPay;LG.st().job=o.job;plan();queueSave();try{overview();pgRender();xRender()}catch(_){}};
  if(k==='late'){j.snooze=Date.now()+7*864e5;toast('Okay. Sprout will check again in a week.')}
  else if(k==='no'){if(s.np)j.no=s.np.key;toast('Okay')}
  else if(k==='between'){j.mode='between';j.prev={pay:state.pay,freq:state.payFreq,first:state.firstPay,at:Date.now()};state.pay=0;plan();toastAct('Your plan no longer counts on a paycheck','Undo',undo)}
  else if(k==='use'&&s.np){delete j.mode;RC.usePay(s.np)}
  else if(k==='newjob'){delete j.mode;closeSheets();setTimeout(()=>xOpen('ypay'),closeSheetsDelay()+30)}
  else if(k==='add2'&&s.np){j.inc2.push({key:s.np.key,name:s.np.name,amt:s.np.amt,freq:s.np.freq,first:fd(s.np.next),days:s.np.days});plan();toastAct('Added '+s.np.name+' to your plan','Undo',undo)}
  queueSave();try{overview();pgRender();if(typeof xRender==='function')xRender()}catch(_){}},true);
// on Home, under the greeting; in Your plan, at the top of Paycheck
{const _ov=overview;overview=function(){const r=_ov.apply(this,arguments);try{const o=document.getElementById('ov'),h=JOB.card();if(o&&h&&!o.querySelector('.jobc')){const at=o.querySelector('.syncchip')||o.querySelector('.ovhello');if(at)at.insertAdjacentHTML('afterend',h)}}catch(e){}return r}}
{const _yp=PAGES.yourplan;PAGES.yourplan=function(){let h=_yp.apply(this,arguments);try{const j=JOB.g(),c=JOB.card(),i=h.indexOf('<section class="sgrp"><h3>Paycheck</h3>');
    const other='<section class="sgrp"><h3>Other income</h3><div class="sbox">'+j.inc2.map((x,n)=>'<div class="srow"><span class="sico">'+ic('money')+'</span><span class="slab">'+esc(x.name)+'<small>'+money0(x.amt)+' '+esc(RC.FREQ[x.freq]||'')+'</small></span><button type="button" class="sbtn alt" data-jobdel="'+n+'">Remove</button></div>').join('')+
      '<button type="button" class="srow" data-x="open" data-v="inc2"><span class="sico">'+ic('plus')+'</span><span class="slab">Add other income<small>A second job, side work, child support</small></span><span class="chev">›</span></button></div></section>';
    if(i>=0){const j2=h.indexOf('</section>',i)+10;h=h.slice(0,i)+c+h.slice(i,j2)+other+h.slice(j2)}}catch(e){}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-jobdel]');if(!b)return;const j=JOB.g();j.inc2.splice(+b.dataset.jobdel,1);plan();queueSave();xRender()});
TITLES.inc2='Other income';
PAGES.inc2=()=>'<div class="xf b2form"><label class="f">Where it comes from<input id="i2-n" type="text" maxlength="40" placeholder="Like DoorDash or a second job"></label><label class="f">Amount each time<div class="pre"><span>$</span><input id="i2-a" type="text" inputmode="decimal" placeholder="0"></div></label>'+
  '<label class="f">How often<select id="i2-f"><option value="weekly">Every week</option><option value="biweekly">Every other week</option><option value="semimonthly">Twice a month</option><option value="monthly" selected>Every month</option></select></label><label class="f">Next one<input id="i2-d" type="date"></label>'+
  '<p class="xhint" style="margin:0">If it changes a lot, use a low, typical amount so your plan doesn’t count on money that may not come.</p><button type="button" class="btn" data-i2save>Add</button></div>';
document.addEventListener('click',e=>{if(!(e.target.closest&&e.target.closest('[data-i2save]')))return;const n=String($('#i2-n').value||'').trim().slice(0,40),a=parseAmt($('#i2-a').value),f=$('#i2-f').value,d=$('#i2-d').value;
  if(!n){toast('Name it');return}if(!(a>0)){toast('Add the amount');return}if(!isDate(d)){toast('Pick the next date');return}JOB.g().inc2.push({name:n,amt:r2(a),freq:f,first:d,days:f==='semimonthly'?[1,15]:undefined});plan();queueSave();xBack();toast('Added '+n)});
// "between jobs" ends on its own when a paycheck shows up again
{const _af=LG.after;LG.after=function(){const r=_af.apply(this,arguments);try{const j=JOB.g();if(j.mode==='between'){const p=RC.pay();if(p&&realDay()-p.last<=10*DY&&p.last>(j.prev&&j.prev.at||0)){j.mode='';j.found=p.key}}}catch(e){}return r}}
try{if(window.__S)window.__S.JOB=JOB}catch(e){}
}
