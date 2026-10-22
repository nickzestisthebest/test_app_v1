// ---------- Money health 2.0: ten signals in four weighted areas (100 points) ----------
// Spending 30 · Saving 25 · Debt 30 · Habits 15. Bigger, harder-to-fix problems carry more weight.
const HPAY={weekly:52,biweekly:26,semimonthly:24,twice:24,monthly:12};
const hClamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const hLin=(v,bad,good)=>good===bad?1:hClamp((v-bad)/(good-bad),0,1); // 0 at "bad", 1 at "good"
function hMonthly(){const inc=(+state.pay||0)*(HPAY[state.payFreq]||26)/12;
  const bills=(state.bills||[]).reduce((a,b)=>{const x=+b.amt||0,t=b.type||b.freq||'monthly';return a+(t==='once'?0:t==='weekly'?x*52/12:(t==='2w'||t==='biweekly')?x*26/12:(t==='yearly'||t==='annual')?x/12:+b.every>0?x*30/+b.every:x)},0);
  const mins=(state.debts||[]).reduce((a,d)=>a+(+d.min||0),0);return {inc,bills,mins,basics:+state.everyday||0}}
function health(){
  const rt=realToday(),cush=+E.cushion||0,{low}=lowBeforePay(),sp=(state.spend||[]).map(s=>Object.assign({t:pd(s.d)},s)),A=availAt(rt,sp),r=A.r,M=hMonthly();
  // ---- spending: day-to-day cash flow ----
  const lv=low?low.v:+E.cash;
  const fCover=lv>=cush?1:lv>=0?0.6+0.4*lv/Math.max(1,cush):hClamp(0.6*(1+lv/1000),0,0.6);
  const el=Math.max(1,Math.round((rt-r.d0)/MS)+1),exp=(r.persDay+r.evDay)*el,spent=sp.filter(s=>s.t>=r.d0&&s.t<=rt&&isSpend(s)).reduce((a,s)=>a+ +s.amt,0),logged=sp.some(s=>s.t>=r.d0&&isSpend(s));
  const fPace=!logged?0.5:spent<=exp?1:hClamp(1-(spent-exp)/Math.max(1,exp),0,1);
  const fixedShare=M.inc>0?(M.bills+M.mins)/M.inc:1,fFixed=hLin(fixedShare,1,0.5);
  // ---- saving: a cushion for surprises, and a habit of adding to it ----
  const vault=((state.x2||{}).vault||{}).bal||0,buffer=(+state.saved||0)+(+vault||0)+Math.max(0,(+state.cash||0)-cush),ess=Math.max(1,M.bills+M.mins+M.basics),months=buffer/ess;
  const fEmerg=hLin(months,0,3),rate=M.inc>0?(+state.savings||0)/M.inc:0,fRate=hLin(rate,0,0.10);
  // ---- debt: how heavy it is, how costly, and whether it's shrinking ----
  const debts=(state.debts||[]).filter(d=>+d.bal>0),bal=debts.reduce((a,d)=>a+ +d.bal,0);
  const dti=M.inc>0?M.mins/M.inc:(M.mins>0?1:0),fDti=debts.length?hLin(dti,0.36,0.10):1;
  const hiBal=debts.filter(d=>+d.apr>=15).reduce((a,d)=>a+ +d.bal,0),fHigh=bal>0?1-hiBal/bal:1;
  const base=Math.max(+state.startDebt||0,bal),prog=base>0?hClamp(1-bal/base,0,1):1,fProg=base>0?prog:1;
  // ---- habits: showing up and planning ahead ----
  const log=(state.stk||{}).log||{};let days=0;for(let i=1;i<=30;i++){if(log[fd(rt-i*MS)])days++}
  const streak=+((state.checkin||{}).streak)||0,fCheck=hClamp(Math.max(days,Math.min(streak,30))/30,0,1);
  const goals=(state.goals||[]).filter(g=>+g.amt>0),gTot=goals.reduce((a,g)=>a+ +g.amt,0),fGoals=goals.length?0.3+0.7*hClamp((+state.saved||0)/Math.max(1,gTot),0,1):0;
  const P=[
   ['Spending',[
     ['Covered until payday',12,fCover,lv>=cush?'Your balance stays above your '+money0(cush)+' safety money until payday.':lv>=0?'At the lowest point you dip '+money0(cush-lv)+' under your '+money0(cush)+' safety money. Small cuts this week help.':'You’re on track to be '+money0(-lv)+' short before payday. Closing that gap adds points fast.'],
     ['Spending on pace',10,fPace,!logged?'Nothing logged yet this paycheck, so this is half credit for now. Log purchases to earn the rest.':spent<=exp?'You’ve spent '+money0(spent)+' of the '+money0(exp)+' planned so far. Right on pace.':'You’ve spent '+money0(spent)+' against '+money0(exp)+' planned. Easing off for a few days brings it back.'],
     ['Bills fit your income',8,fFixed,M.inc>0?'Bills and minimum payments take '+Math.round(fixedShare*100)+'% of your income. Under 50% leaves room to breathe.':'Add your income so Sprout can check this.']]],
   ['Saving',[
     ['Emergency cushion',15,fEmerg,'You have about '+(months>=10?Math.round(months):months.toFixed(1))+' month'+(Math.abs(months-1)<.05?'':'s')+' of essentials set aside. Three months is a strong cushion.'],
     ['Saving every month',10,fRate,M.inc>0?'You plan to save '+Math.round(rate*100)+'% of your income. Ten percent or more earns full points.':'Add your income so Sprout can check this.']]],
   ['Debt',[
     ['Debt payments vs income',12,fDti,!debts.length?'No debt payments. Full points.':'Minimum payments take '+Math.round(dti*100)+'% of your income. Under 10% is great, over 36% is heavy.'],
     ['Paying it down',10,fProg,base<=0?'No debts. Full points.':prog>0?money0(base-bal)+' paid off since you started ('+Math.round(prog*100)+'%).':'Just getting started. This grows as your balances drop.'],
     ['High-interest debt',8,fHigh,!bal?'No debt. Full points.':hiBal>0?money0(hiBal)+' is at 15% interest or more. Paying that first saves the most.':'None of your debt is at 15% interest or more.']]],
   ['Habits',[
     ['Checking in',8,fCheck,'You checked in on '+Math.max(days,Math.min(streak,30))+' of the last 30 days. A minute a day keeps every number right.'],
     ['Goals in place',7,fGoals,goals.length?'You’ve saved '+money0(+state.saved||0)+' toward '+goals.length+' goal'+(goals.length>1?'s':'')+' ('+money0(gTot)+').':'Add a savings goal to earn these points.']]]];
  let score=0;P.forEach(p=>p[1].forEach(f=>{f.pts=f[1]*f[2];score+=f.pts}));score=Math.round(score);
  const lab=score>=80?'Strong':score>=60?'Good':score>=40?'Fair':'Needs care';HEALTH={score,lab};
  const all=P.flatMap(p=>p[1]),lever=all.slice().sort((a,b)=>(b[1]-b.pts)-(a[1]-a.pts))[0];
  $('#health').innerHTML='<div class="hscore"><div class="hring" data-pk="health" data-p="'+score+'"><b>'+score+'</b></div><div><b class="hl">'+lab+'</b><span>out of 100</span></div></div>'+
    (lever&&lever[1]-lever.pts>=1?'<p class="hlever"><b>Biggest boost:</b> '+lever[0].toLowerCase()+' (up to +'+Math.round(lever[1]-lever.pts)+' points). '+lever[3]+'</p>':'')+
    P.map(p=>{const got=p[1].reduce((a,f)=>a+f.pts,0),max=p[1].reduce((a,f)=>a+f[1],0);
      return '<div class="hpil"><div class="hpilh"><b>'+p[0]+'</b><span>'+Math.round(got)+' / '+max+'</span></div><div class="sbar hpbar"><i style="width:'+(got/max*100).toFixed(0)+'%"></i></div>'+
        p[1].map(f=>'<div class="hf"><div class="hft"><b>'+f[0]+'</b><span>'+Math.round(f.pts)+' / '+f[1]+'</span></div><div class="sbar"><i style="width:'+(f[2]*100).toFixed(0)+'%"></i></div><p>'+f[3]+'</p></div>').join('')+'</div>'}).join('')+
    '<p class="hnote">How it works: ten signals in four areas, weighted by how much they affect your stability. Spending 30, Saving 25, Debt 30, Habits 15. This is a guide to your own habits, not a credit score.</p>';
  $('#v-health').innerHTML='<span class="hdot '+(score>=60?'g':score>=40?'w':'b')+'"></span>'+score;$('#s-health').textContent=lab+' · tap to see what moves it';
}
// tapping the score on Home opens the full breakdown
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.ovscore')){setTimeout(()=>{const m=document.getElementById('m-health');if(m){m.open=true;try{m.scrollIntoView({behavior:'smooth',block:'start'})}catch(_){}}},380)}});
