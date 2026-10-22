// ===================== Ask 3: answers from the same facts as every screen =====================
// Debts, the debt-free date, budgets, safe to spend, bills ahead and interest come from MX, the plan and the
// payoff order you chose, so Ask never disagrees with the app. Facts only: no "you should".
const ASK3={};
{
const r2=MX.r2,B=n=>'**'+money(n)+'**',B0=n=>'**'+money0(n)+'**',say=(reply,x)=>Object.assign({reply,actions:[],local:true},x||{});
const NOTE='This is math from your data, not financial advice.';
const has=(s,rx)=>rx.test(s);
ASK3.list=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
ASK3.freeLine=()=>{const f=F3.free(),p=MX.pref(),first=MX.order(E)[0];if(!MX.debts().length)return 'You have no debts in Sprout.';
  return (f&&!f.none?'On your plan you’re debt-free around **'+F3.mon(f.t)+'**':'On your plan your debts aren’t paid off within 3 years')+(p.extra!==false&&first?', with what’s left after must-pays and budgets going to '+LG.short(first.name)+' first ('+MX.ORD[p.order].toLowerCase()+').':'.')};
ASK3.owe=()=>{const L=MX.debts(),G=MX.byKind(),KN={card:'cards',loan:'loans',paylater:'pay later',borrow:'cash advance',person:'owed to people',other:'other'};
  return say('You owe '+B(MX.owe())+' across '+L.length+' debt'+(L.length===1?'':'s')+'.\n\n'+Object.values(G).sort((a,b)=>b.v-a.v).map(g=>'- '+KN[g.k][0].toUpperCase()+KN[g.k].slice(1)+': '+money0(g.v)).join('\n')+'\n\n'+ASK3.freeLine(),{intent:'debt'})};
ASK3.free=()=>{const L=MX.debts();if(!L.length)return say('You have no debts in Sprout. If you have one, add it in Your plan.',{intent:'debt'});
  let alt='';try{const s2=clone(state);s2.lg=Object.assign({},s2.lg,{b3:Object.assign({},(s2.lg||{}).b3||{},{extra:false})});const E2=eff(s2,s2.whatif);E2.cash=projStart();const R2=simulate(E2),T=realToday();
    const D=L.filter(d=>d.src!=='plan');let t=null;for(const r of R2){if(r.d1<=T)continue;if(D.every(d=>!(d.raw in r.bal)||r.bal[d.raw]<=0.5)){t=r.d1;break}}
    alt=MX.pref().extra!==false?'\n\nWith minimums only: '+(t?'around '+F3.mon(t):'not within 3 years')+'.':''}catch(e){}
  const noRate=L.filter(d=>!d.aprSet&&d.src!=='plan').map(d=>d.name);
  return say(ASK3.freeLine()+alt+(noRate.length?'\n\n'+ASK3.list(noRate)+(noRate.length>1?' have':' has')+' no interest rate set, so interest is left out for '+(noRate.length>1?'those':'it')+'.':'')+'\n\n'+NOTE,{intent:'debt'})};
ASK3.first=()=>{const p=MX.pref(),L=MX.order(E);if(!L.length)return say('No debts get extra payments right now.',{intent:'debt'});if(p.extra===false)return say('Your plan sends nothing extra to debt right now (you turned it off in Debts). Only minimums are paid.',{intent:'debt'});
  return say('Your plan sends extra money to debts in this order ('+MX.ORD[p.order].toLowerCase()+'):\n\n'+L.slice(0,5).map((d,i)=>(i+1)+'. '+LG.nm(String(d.name).replace(/\s*\*\*\d+/,''))+' · '+(+d.apr?d.apr+'%':'no interest set')+' · '+money0(+d.bal)).join('\n')+'\n\nHighest rate first usually means the least interest overall. Smallest balance first clears whole accounts sooner. You can change the order in Debts.\n\n'+NOTE,{intent:'debt'})};
ASK3.interest=()=>{const I=RC.interest(),est=F3.interest();let s='';
  if(I.length){const tot=r2(I.reduce((a,i)=>a+i.mo,0));s+='Your cards charged about '+B(tot)+' in interest a month lately:\n\n'+I.map(i=>'- '+i.name+': about '+money(i.mo)).join('\n')+'\n\n'}
  s+='At today’s balances and rates, all your debts cost about '+B(est)+' a month in interest.';const noRate=MX.debts().filter(d=>!d.aprSet&&d.src!=='plan');if(noRate.length)s+=' That leaves out '+noRate.length+' debt'+(noRate.length>1?'s':'')+' with no rate set.';
  return say(s,{intent:'debt'})};
ASK3.today=()=>{const L=MX.left();if(!L)return null;const A=L.A,d1=sdate(L.d1);
  if(L.today<=0.004)return say('Safe to spend today is '+B(0)+'. '+(L.capped?'Checking can’t cover more spending before payday on '+d1+', after what’s due and your cushion.':'Today’s share of your budget is used up.')+(L.left>0.004?'\n\nFor the rest of this pay period: '+B(L.left)+'.':''),{intent:'today'});
  return say('You can spend '+B(L.today)+' today.\n\nUntil payday on '+d1+': '+B(L.left)+(L.capped?', limited by what checking can cover after bills.':' left in your budget.'),{intent:'today'})};
ASK3.month=()=>{const M=MX.month(),L=B3.cats().filter(x=>x.lim>0||x.sp>0).sort((a,b)=>a.left-b.left);
  return say((M.left>=0?'You have '+B(M.left)+' left in your budgets this month':'You’re '+B(-M.left)+' over your budgets this month')+' ('+money0(M.spent)+' of '+money0(M.bud)+', '+M.daysLeft+' day'+(M.daysLeft===1?'':'s')+' to go).\n\n'+L.slice(0,6).map(x=>'- '+x.name+': '+(x.left>=0?money0(x.left)+' left':money0(-x.left)+' over')).join('\n'),{intent:'track'})};
ASK3.due=(days)=>{const T=realToday(),L=rows.items.filter(x=>x.t>=T&&x.t<T+days*MS&&x.a>0.004).sort((a,b)=>a.t-b.t),tot=r2(L.reduce((a,x)=>a+x.a,0));
  const span=days===1?'before tomorrow':'in the next '+days+' days';if(!L.length){const nx=rows.items.filter(x=>x.t>=T&&x.a>0.004).sort((a,b)=>a.t-b.t)[0];return say('Nothing is due '+span+'.'+(nx?' Next up: '+LG.short(shortName(nx.name))+', '+money(nx.a)+' on '+sdate(nx.t)+'.':''),{intent:'bills'})}
  return say(B(tot)+' is due '+span+':\n\n'+L.map(x=>'- '+sdate(x.t)+': '+LG.short(shortName(x.name))+', '+money(x.a)).join('\n'),{intent:'bills'})};
ASK3.food=()=>{const T=realDay(),mk=fd(T).slice(0,7),L=B2.monthTx().filter(t=>t.cat==='groc'||t.cat==='din'),tot=r2(L.reduce((a,t)=>a+t.amt,0)),g={};L.forEach(t=>{const n=B3.merch(t);g[n]=(g[n]||0)+t.amt});
  const top=Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,4);
  return say('You spent '+B(tot)+' on food (groceries and dining) this month across '+L.length+' purchase'+(L.length===1?'':'s')+'.'+(top.length?'\n\nMost of it went to:\n'+top.map(e=>'- '+e[0]+': '+money0(e[1])).join('\n'):''),{intent:'spent'})};
ASK3.match=s=>{
  if(has(s,/\b(what|which|wat|wich)\b.*\b(pay ?off|pay ?of|pay down|pay)\b.*\b(first|frist|fist|next)\b|\bdebt (order|priority)\b|\bavalanche\b|\bsnowball\b/))return ASK3.first();
  if(has(s,/\binterest\b/)&&has(s,/\b(how much|what|paying|pay|cost|costing|charged?)\b/)&&!has(s,/\brate on\b|\bearn/))return ASK3.interest();
  if(has(s,/\b(debt|debts)[ -]?free\b|\bpay(ed)? off (all )?(my )?(debt|debts|everything)\b|\bwhen (will|do|can) i (be )?(out of|done with|free of) debt\b/))return ASK3.free();
  if(has(s,/\b(owe|due|pay)\b/)&&has(s,/\bbefore (payday|my (next )?paycheck|friday|the \d+)\b|\bby payday\b/))return ASK3.due(Math.max(1,Math.round(((payDates(state,realToday()).find(t=>t>realToday())||realToday()+14*MS)-realToday())/MS)));
  if(has(s,/\bhow much (do|did) i (owe|have in debt)\b|\btotal (debt|owed)\b|\bmy debts?\b$|\bwhat do i owe\b|\bhow much debt\b/))return ASK3.owe();
  if(has(s,/\b(budget|budgets)\b/)&&has(s,/\b(left|remaining|month|over|under|how much)\b/)&&!has(s,/\btoday\b/))return ASK3.month();
  if(has(s,/\b(spend|spending|safe)\b.*\btoday\b|\btoday\b.*\b(spend|safe)\b|\bsafe to spend\b/)&&!has(s,/\bmonth\b/))return ASK3.today();
  if(has(s,/\b(bills?|payments?|due)\b/)&&has(s,/\b(this week|next week|next 7 days|coming up|upcoming|soon|due)\b/)&&!has(s,/\bmonth\b|\bpayday\b/))return ASK3.due(has(s,/next week/)?14:7);
  if(has(s,/\b(food|groceries and (eating out|dining)|eating)\b/)&&has(s,/\b(spend|spent|spending)\b/)&&has(s,/\bmonth\b/))return ASK3.food();
  return null};
{const _ba=BR.answer;BR.answer=function(raw){try{const q=String(raw||'').trim();if(q&&q.length<=400&&!(typeof FZ!=='undefined'&&FZ.force)){const s0=q.toLowerCase().replace(/\s+/g,' ').replace(/[?!.]+$/,''),s=typeof FZ!=='undefined'&&FZ.phr?FZ.phr(s0):s0,f=typeof FZ!=='undefined'&&FZ.fix?String(FZ.fix(q)).toLowerCase().replace(/[?!.]+$/,''):s;
      if(!LG.demo()&&state.setup){const r=ASK3.match(s)||(f!==s?ASK3.match(f):null);if(r)return r}}}catch(e){if(window.__brainDebug)console.error(e)}return _ba.apply(this,arguments)}}
// the older debt sentence used "$1" in a replacement, which garbled amounts starting with $1
if(typeof FZ!=='undefined'){FZ.keep0=FZ.keep;FZ.keep=r=>{try{if(r&&r.reply&&/^You owe \*\*/.test(r.reply)&&!/pay-later/.test(r.reply)){const o=ASK3.owe();r.reply=o.reply}}catch(e){}if(r&&r.html&&r.reply)FZ.H[r.reply]=r.html;return r}}
// advice-like phrasing from older answers is reworded as facts
{const _ba=BR.answer;BR.answer=function(){const r=_ba.apply(this,arguments);try{if(r&&r.reply)r.reply=r.reply.replace(/the safest move is to hold off until tomorrow/g,'today’s spending money is used up').replace(/Paying ([^.]+?) first \(([^)]*)\) saves the most interest\. Keep paying the minimums on the rest\./g,'$1 has the highest rate ($2).').replace(/\byou should\b/gi,'you could')}catch(e){}return r}}
try{if(window.__S)window.__S.ASK3=ASK3}catch(e){}
}
