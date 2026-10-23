// ===================== Home 4: a Safe to spend card that fills the space and shifts color as the day is used =====================
// Big amount, a ring for today's share, what's spent, what's left until payday, the reason when checking is the limit,
// and a one-tap Log. Matcha green with plenty left, warm amber near the end, soft clay red at or over.
const H4={};
{
const r2=MX.r2;
// the rolling number can go below zero (spend more than today's share and the next days catch up)
{const _av=availAt;availAt=function(T,sp){const A=_av.apply(this,arguments);try{if(T!==realToday()||!A.roll)return A;const R=A.roll,C=A.cover;let left=R.left,capped=false,cover=null;
    if(C){cover=Math.max(0,r2(C.free+(C.todCash||0)));if((left>0&&cover<left-0.004)||cover<=0.004){left=Math.min(Math.max(left,0),cover);capped=true}C.capped=capped}A.leftTotal=r2(left);A.capped=capped;A.coverLeft=cover;A.perTotal=r2(left>0?left+(R.todaySp||0):Math.max(0,R.today))}catch(e){}return A}}
H4.hue=f=>{f=Math.max(0,Math.min(1.2,f));const h=f<=0.6?150-(f/0.6)*105:f<=1?45-((f-0.6)/0.4)*33:12-Math.min(1,(f-1)/0.2)*4;return Math.round(h)};
H4.hero=()=>{const T=realToday(),sp=(state.spend||[]).map((s,i)=>Object.assign({i,t:pd(s.d)},s)),A=availAt(T,sp),R=A.roll||P4.rollTotal(T),ml=MX.left(),left=A.leftTotal,share=r2(R.today+Math.max(0,R.built-R.today-R.spent+R.todaySp)),spent=R.todaySp;
  // how much of today's amount is used: spent today against spent plus what's left (so a carried-over cushion counts too)
  const avail=Math.max(0.01,spent+Math.max(0,left)),f=left<0?1+Math.min(0.2,-left/Math.max(1,avail)):spent/avail,hue=H4.hue(f),pct=Math.round(Math.min(100,f*100));
  const np=ml&&ml.d1?sdate(ml.d1):'',until=ml?ml.left:null,sub=A.capped?(A.coverLeft<=0.004?'Checking can’t cover more before payday'+(np?' on '+np:''):'Limited by what checking can cover until payday'+(np?' on '+np:'')):(left<0?(()=>{const over=R.cats.filter(x=>x.left<0),bk=Math.max(1,...over.map(x=>x.back));return (over.length>1?over.length+' categories are':esc((over[0]||{}).name||'A category')+' is')+' over. '+(bk<R.daysLeft?'Back on track in '+bk+' day'+(bk===1?'':'s')+'.':'The rest of the month covers it.')})():'Today’s share is '+money(R.today)+'. Unspent money builds up for the next days.');
  return '<button class="ovhero solo h4hero" data-goto="#t-hero" style="--hue:'+hue+';--p:'+pct+'"><div class="h4top"><div class="ovh1"><span class="k">Safe to spend today</span><b class="'+(left<0?'neg':'')+'">'+(left<0?'−'+money(-left):money(Math.max(0,left)))+'</b><span class="s">'+esc(sub)+(A.capped?' <u>Why?</u>':'')+'</span></div>'+
    '<span class="h4ring" aria-label="'+pct+' percent of today used"><svg viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="27"/><circle class="f" cx="32" cy="32" r="27" pathLength="100" style="stroke-dasharray:'+Math.max(0.5,Math.min(100,pct))+' 100"/></svg><b>'+pct+'%</b><small>used</small></span></div>'+
    '<div class="h4row"><span><small>Spent today</small><b>'+money(spent)+'</b></span><span><small>Until payday'+(np?' '+np:'')+'</small><b>'+(until!=null?money(until):'–')+'</b></span><span><small>This month</small><b>'+money0(R.monthLeft)+' left</b></span></div>'+
    '<span class="h4log" data-h4log>+ Log a spend</span></button>'};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-h4log]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const o=document.getElementById('open-spend');if(o)o.click()},true);
{const _ov=overview;overview=function(){const r=_ov.apply(this,arguments);try{const o=document.getElementById('ov');if(!o)return r;const old=o.querySelector('.ovhero');if(old){old.insertAdjacentHTML('afterend',H4.hero());old.remove()}
    const el=o.querySelector('.h4hero .ovh1 b');if(el&&typeof tween==='function'){const v=parseFloat(el.textContent.replace(/[^0-9.−-]/g,'').replace('−','-'))||0;tween(el,'h4',v,money)}}catch(e){try{console.warn('home4',e)}catch(_){}}return r}}
try{if(window.__S)window.__S.H4=H4}catch(e){}
}
