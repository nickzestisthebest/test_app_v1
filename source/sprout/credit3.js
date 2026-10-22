// ===================== Credit, like Rocket Money: a free score snapshot, and weekly updates on Plus =====================
// Free: your score and report details from the free report you upload (AnnualCreditReport.com) or a score you type in.
// Plus: weekly updates through a licensed credit-data partner, once the server has one set up. Sign-up and the identity
// check happen on the partner's page, after you agree to a plain written authorization. Checking is a soft inquiry.
const CRM={};
{
CRM.V='2026-10-22';
CRM.TEXT='I authorize Sprout and its credit-data partner to get my credit report and credit score from one or more consumer reporting agencies, now and about once a week while weekly updates are on, so Sprout can show them to me and use them in my own budget, insights and alerts. This is a soft inquiry that does not affect my credit score. I can turn this off at any time in Credit, and Sprout will stop getting my report. Sprout does not use my credit report for marketing, does not sell it, and does not share it except with the partner that provides it.';
CRM.on=()=>!!(LIVE&&LIVE.on&&LIVE.st&&LIVE.st.setup&&LIVE.st.setup.credit);
CRM.g=()=>{const g=LG.st();g.crm=g.crm||{};return g.crm};
CRM.card=()=>{const g=CRM.g(),plus=typeof plusIs==='function'&&plusIs(),sc=CR.score();
  const snap='<div class="xcard crm"><div class="crmh"><div><span class="k">Your score</span>'+(sc?'<b>'+sc.v+'</b><small>'+esc(sc.model||'Score')+(sc.d?' · '+sdate(pd(sc.d)):'')+'</small>':'<b class="none">Not added yet</b><small>Free: add the score your bank or card app shows.</small>')+'</div><em class="crmfree">Free</em></div>'+
    (plus?'':'<div class="crmadd"><input id="crm-v" type="text" inputmode="numeric" placeholder="Score, like 702" aria-label="Your credit score"><button type="button" class="sbtn" data-crm="add">'+(sc?'Update':'Add')+'</button></div>')+'</div>';
  let mon='';
  if(g.on)mon='<div class="xcard crm"><div class="crmh"><div><span class="k">Weekly credit updates</span><b class="sm">On</b><small>Agreed '+sdate(g.at||Date.now())+'. Soft inquiry, no effect on your score.</small></div><em class="crmplus">Plus</em></div><button type="button" class="lnk" data-crm="stop">Turn off weekly updates</button></div>';
  else if(!CRM.on())mon='<div class="xcard crm off"><div class="crmh"><div><span class="k">Weekly credit updates</span><b class="sm">Coming soon</b><small>Your full report and score, refreshed every week, with alerts when something changes. Part of Plus once Sprout’s credit partner is live.</small></div><em class="crmplus">Plus</em></div></div>';
  else if(!plus)mon='<div class="xcard crm"><div class="crmh"><div><span class="k">Weekly credit updates</span><b class="sm">With Plus</b><small>Your full report and score every week, with alerts when something changes.</small></div><em class="crmplus">Plus</em></div><button type="button" class="sbtn" data-x="open" data-v="plus">See Plus</button></div>';
  else mon='<div class="xcard crm"><div class="crmh"><div><span class="k">Weekly credit updates</span><b class="sm">Ready to turn on</b><small>Soft inquiry, no effect on your score.</small></div><em class="crmplus">Plus</em></div><button type="button" class="sbtn" data-x="open" data-v="crconsent">Turn on</button></div>';
  return snap+mon};
TITLES.crconsent='Weekly credit updates';
PAGES.crconsent=()=>'<div class="xcard"><h3>Before you turn this on</h3><p class="xhint" style="margin:0 0 8px">Please read this authorization. You’ll finish signing up on our credit partner’s secure page, which checks it’s really you. Sprout never sees your Social Security number.</p><div class="crmtext sel">'+esc(CRM.TEXT)+'</div>'+
  '<label class="srow lgtog"><span class="slab">I agree to this authorization</span><input type="checkbox" class="sw" id="crm-ok"></label><button type="button" class="btn" data-crm="start">Agree and continue</button></div>'+
  '<p class="xhint">Sprout isn’t a credit repair company and can’t remove accurate information from your report. You can dispute errors for free with each credit bureau.</p>';
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-crm]');if(!b)return;e.preventDefault();const k=b.dataset.crm,g=CRM.g();
  if(k==='add'){const v=Math.round(+String(($('#crm-v').value||'')).replace(/[^0-9]/g,''));if(!(v>=300&&v<=850)){toast('Scores run from 300 to 850');return}CR.g().scores.push({v,model:'Your score',d:fd(realDay()),src:'hand'});queueSave();xRender();toast('Score saved');return}
  if(k==='stop'){const r=await liveFetch('/api/credit',{op:'stop'});g.on=false;queueSave();xRender();toast(r&&r.ok?'Weekly credit updates are off':'Turned off here. Sprout will stop asking for your report.');return}
  if(k==='start'){if(!(document.getElementById('crm-ok')||{}).checked){toast('Tick “I agree” first');return}b.disabled=true;
    const c=await liveFetch('/api/credit',{op:'consent',v:CRM.V,text:CRM.TEXT});if(!c||!c.ok){b.disabled=false;toast(c&&c.error||'That didn’t go through. Try again.');return}
    const s=await liveFetch('/api/credit',{op:'start'});if(!s||!s.ok||!s.url){b.disabled=false;toast(s&&s.error||'That didn’t go through. Try again.');return}
    g.on=true;g.at=Date.now();g.v=CRM.V;queueSave();try{window.open(s.url,'_blank','noopener')}catch(_){location.href=s.url}xBack()}});
{const _cp=PAGES.credit;PAGES.credit=function(){let h=_cp.apply(this,arguments);try{if(LG.demo()&&!CR.has())return h;h=CRM.card()+h}catch(e){}return h}}
TITLES.credit='Credit';
try{if(window.__S)window.__S.CRM=CRM}catch(e){}
}
